import type { Agent, AgentExecutor, AgentResult, AgentTask } from '../agents';

interface MaintainerPayload {
  alerts?: string[];
  metrics?: Record<string, unknown>;
  runbooks?: string[];
  incidents?: string[];
}

interface Action {
  type: 'investigate' | 'remediate' | 'escalate' | 'monitor';
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface MaintainerOutput {
  diagnosis: string;
  actions: Action[];
  runbook?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const extractJson = (value: string): unknown => {
  const fenced = value.match(/```json\s*([\s\S]*?)```/i) ?? value.match(/```([\s\S]*?)```/);
  const candidate = fenced?.[1] ?? value;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  return [];
};

const ACTION_TYPES = new Set<Action['type']>(['investigate', 'remediate', 'escalate', 'monitor']);
const ACTION_PRIORITIES = new Set<Action['priority']>(['critical', 'high', 'medium', 'low']);

const parseActions = (value: unknown): Action[] => {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((item) => ({
    type: ACTION_TYPES.has(item['type'] as Action['type'])
      ? (item['type'] as Action['type'])
      : 'investigate',
    description: typeof item['description'] === 'string' ? item['description'] : 'Action required',
    priority: ACTION_PRIORITIES.has(item['priority'] as Action['priority'])
      ? (item['priority'] as Action['priority'])
      : 'medium',
  }));
};

/**
 * MaintainerAgent - Performs operational diagnostics and recommends remediation.
 *
 * When an LLM executor is available, sends alerts, metrics, and incident data
 * to the model for diagnosis and action recommendations. Without an executor,
 * returns a basic diagnostic template.
 */
export class MaintainerAgent implements Agent {
  role = 'maintainer' as const;
  private executor?: AgentExecutor;

  constructor(executor?: AgentExecutor) {
    this.executor = executor;
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    const payload = task.payload;
    const alerts = toStringArray(payload['alerts']);
    const metrics = isRecord(payload['metrics']) ? payload['metrics'] : undefined;
    const runbooks = toStringArray(payload['runbooks']);
    const incidents = toStringArray(payload['incidents']);

    if (alerts.length === 0 && !metrics && incidents.length === 0) {
      return { taskId: task.id, status: 'failed', notes: 'missing_alerts_metrics_or_incidents' };
    }

    if (this.executor) {
      return this.diagnoseWithLLM(task, { alerts, metrics, runbooks, incidents });
    }

    return this.diagnoseFallback(task, { alerts, metrics, incidents });
  }

  private async diagnoseWithLLM(task: AgentTask, payload: MaintainerPayload): Promise<AgentResult> {
    try {
      const result = await this.executor!.invoke({
        id: `maintain-${task.id}`,
        role: 'maintainer',
        description: 'Diagnose operational issues and recommend remediation',
        payload: {
          context: {
            summary:
              'Analyze alerts, metrics, and incidents to produce a diagnosis and action plan.',
            notes: [
              payload.alerts?.length ? `Alerts: ${payload.alerts.join('; ')}` : '',
              payload.metrics ? `Metrics keys: ${Object.keys(payload.metrics).join(', ')}` : '',
              payload.incidents?.length ? `Incidents: ${payload.incidents.join('; ')}` : '',
              payload.runbooks?.length ? `Runbooks available: ${payload.runbooks.length}` : '',
              'Return JSON with keys: diagnosis (string), actions (array of {type, description, priority}), runbook? (string).',
            ].filter(Boolean),
            constraints: ['Return valid JSON only.'],
          },
          ...(payload.alerts?.length ? { alerts: payload.alerts } : {}),
          ...(payload.metrics ? { metrics: payload.metrics } : {}),
          ...(payload.incidents?.length ? { incidents: payload.incidents } : {}),
        },
      });

      if (result.status !== 'completed') {
        return {
          taskId: task.id,
          status: 'failed',
          notes: result.notes ?? 'llm_maintainer_failed',
        };
      }

      const parsed = result.output ?? (result.notes ? extractJson(result.notes) : null);
      if (isRecord(parsed)) {
        const output: MaintainerOutput = {
          diagnosis:
            typeof parsed['diagnosis'] === 'string' ? parsed['diagnosis'] : (result.notes ?? ''),
          actions: parseActions(parsed['actions']),
          runbook: typeof parsed['runbook'] === 'string' ? parsed['runbook'] : undefined,
        };
        return {
          taskId: task.id,
          status: 'completed',
          notes: `Diagnosis complete with ${output.actions.length} recommended actions.`,
          output: output as unknown as Record<string, unknown>,
        };
      }

      return {
        taskId: task.id,
        status: 'completed',
        notes: result.notes ?? 'Diagnosis completed.',
        output: { diagnosis: result.notes ?? '', actions: [], runbook: undefined },
      };
    } catch (err) {
      return { taskId: task.id, status: 'failed', notes: `maintainer_error: ${String(err)}` };
    }
  }

  private diagnoseFallback(
    task: AgentTask,
    payload: Pick<MaintainerPayload, 'alerts' | 'metrics' | 'incidents'>,
  ): Promise<AgentResult> {
    const alerts = payload.alerts ?? [];
    const incidents = payload.incidents ?? [];
    const sections: string[] = [];

    if (alerts.length > 0) {
      sections.push(`Active alerts (${alerts.length}): ${alerts.slice(0, 5).join('; ')}`);
    }
    if (incidents.length > 0) {
      sections.push(`Open incidents (${incidents.length}): ${incidents.slice(0, 5).join('; ')}`);
    }
    if (payload.metrics) {
      sections.push(`Metrics observed: ${Object.keys(payload.metrics).join(', ')}`);
    }

    const diagnosis =
      sections.length > 0 ? sections.join('\n') : 'No specific signals to diagnose.';

    const actions: Action[] = [];
    if (alerts.length > 0) {
      actions.push({
        type: 'investigate',
        description: `Review ${alerts.length} active alert(s) for root cause.`,
        priority: alerts.length > 3 ? 'high' : 'medium',
      });
    }
    if (incidents.length > 0) {
      actions.push({
        type: 'escalate',
        description: `Triage ${incidents.length} open incident(s).`,
        priority: 'high',
      });
    }
    actions.push({
      type: 'monitor',
      description: 'Connect an LLM executor for deeper operational analysis.',
      priority: 'low',
    });

    const output: MaintainerOutput = { diagnosis, actions };

    return Promise.resolve({
      taskId: task.id,
      status: 'completed',
      notes: `Basic diagnosis: ${actions.length} actions recommended.`,
      output: output as unknown as Record<string, unknown>,
    });
  }
}
