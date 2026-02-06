import type { Agent, AgentExecutor, AgentResult, AgentTask } from '../agents';

interface ArchitectPayload {
  requirements: string;
  constraints?: string[];
  existingArchitecture?: string;
}

interface Component {
  name: string;
  type: string;
  description: string;
  dependencies?: string[];
}

interface ArchitectOutput {
  plan: string;
  components: Component[];
  tradeoffs: string[];
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

const parseComponents = (value: unknown): Component[] => {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((item) => ({
    name: typeof item['name'] === 'string' ? item['name'] : 'Component',
    type: typeof item['type'] === 'string' ? item['type'] : 'module',
    description: typeof item['description'] === 'string' ? item['description'] : '',
    dependencies: toStringArray(item['dependencies']),
  }));
};

/**
 * ArchitectAgent - Designs system architecture from requirements.
 *
 * When an LLM executor is available, sends requirements to the model
 * for architecture design including component breakdowns and tradeoff
 * analysis. Without an executor, returns a template architecture outline.
 */
export class ArchitectAgent implements Agent {
  role = 'architect' as const;
  private executor?: AgentExecutor;

  constructor(executor?: AgentExecutor) {
    this.executor = executor;
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    const payload = task.payload;
    const requirements =
      typeof payload['requirements'] === 'string' ? payload['requirements'] : task.description;

    if (!requirements) {
      return { taskId: task.id, status: 'failed', notes: 'missing_requirements' };
    }

    const constraints = Array.isArray(payload['constraints'])
      ? payload['constraints'].filter((c): c is string => typeof c === 'string')
      : undefined;
    const existingArchitecture =
      typeof payload['existingArchitecture'] === 'string'
        ? payload['existingArchitecture']
        : undefined;

    if (this.executor) {
      return this.designWithLLM(task, { requirements, constraints, existingArchitecture });
    }

    return this.designFallback(task, requirements);
  }

  private async designWithLLM(task: AgentTask, payload: ArchitectPayload): Promise<AgentResult> {
    try {
      const result = await this.executor!.invoke({
        id: `architect-${task.id}`,
        role: 'architect',
        description: 'Design system architecture from requirements',
        payload: {
          context: {
            summary: 'Analyze requirements and produce a system architecture plan.',
            notes: [
              `Requirements: ${payload.requirements.slice(0, 2000)}`,
              payload.constraints?.length ? `Constraints: ${payload.constraints.join(', ')}` : '',
              payload.existingArchitecture
                ? `Existing architecture provided (${payload.existingArchitecture.length} chars).`
                : '',
              'Return JSON with keys: plan (string), components (array of {name, type, description, dependencies?}), tradeoffs (string[]).',
            ].filter(Boolean),
            constraints: ['Return valid JSON only.'],
          },
          requirements: payload.requirements.slice(0, 4000),
          ...(payload.existingArchitecture
            ? { existingArchitecture: payload.existingArchitecture.slice(0, 4000) }
            : {}),
        },
      });

      if (result.status !== 'completed') {
        return { taskId: task.id, status: 'failed', notes: result.notes ?? 'llm_architect_failed' };
      }

      const parsed = result.output ?? (result.notes ? extractJson(result.notes) : null);
      if (isRecord(parsed)) {
        const output: ArchitectOutput = {
          plan: typeof parsed['plan'] === 'string' ? parsed['plan'] : (result.notes ?? ''),
          components: parseComponents(parsed['components']),
          tradeoffs: toStringArray(parsed['tradeoffs']),
        };
        return {
          taskId: task.id,
          status: 'completed',
          notes: `Architecture plan with ${output.components.length} components and ${output.tradeoffs.length} tradeoffs.`,
          output: output as unknown as Record<string, unknown>,
        };
      }

      return {
        taskId: task.id,
        status: 'completed',
        notes: result.notes ?? 'Architecture plan generated.',
        output: { plan: result.notes ?? '', components: [], tradeoffs: [] },
      };
    } catch (err) {
      return { taskId: task.id, status: 'failed', notes: `architect_error: ${String(err)}` };
    }
  }

  private designFallback(task: AgentTask, requirements: string): Promise<AgentResult> {
    const plan = [
      '# Architecture Plan (Template)',
      '',
      '## Overview',
      `Requirements: ${requirements.slice(0, 300)}`,
      '',
      '## Proposed Components',
      '1. **API Layer** - REST/GraphQL gateway',
      '2. **Service Layer** - Business logic',
      '3. **Data Layer** - Persistence and caching',
      '4. **Infrastructure** - Deployment and monitoring',
      '',
      '## Next Steps',
      'Connect an LLM executor for a detailed, requirements-specific architecture plan.',
    ].join('\n');

    const output: ArchitectOutput = {
      plan,
      components: [
        { name: 'API Layer', type: 'service', description: 'REST/GraphQL gateway' },
        { name: 'Service Layer', type: 'module', description: 'Core business logic' },
        { name: 'Data Layer', type: 'module', description: 'Persistence and caching' },
        {
          name: 'Infrastructure',
          type: 'infrastructure',
          description: 'Deployment and monitoring',
        },
      ],
      tradeoffs: [
        'Template architecture; connect an LLM for requirements-specific design.',
        'Component boundaries may need refinement based on actual domain model.',
      ],
    };

    return Promise.resolve({
      taskId: task.id,
      status: 'completed',
      notes: `Template architecture with ${output.components.length} components.`,
      output: output as unknown as Record<string, unknown>,
    });
  }
}
