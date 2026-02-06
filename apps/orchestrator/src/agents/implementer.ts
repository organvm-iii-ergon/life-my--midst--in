import type { Agent, AgentExecutor, AgentResult, AgentTask } from '../agents';

interface ImplementerPayload {
  plan: string;
  task?: string;
  schemas?: string;
  existingCode?: string;
}

interface FileChange {
  path: string;
  action: 'create' | 'modify' | 'delete';
  content?: string;
}

interface ImplementerOutput {
  code: string;
  files: FileChange[];
  migrations?: string[];
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

const FILE_ACTIONS = new Set<FileChange['action']>(['create', 'modify', 'delete']);

const parseFileChanges = (value: unknown): FileChange[] => {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((item) => ({
    path: typeof item['path'] === 'string' ? item['path'] : 'unknown',
    action: FILE_ACTIONS.has(item['action'] as FileChange['action'])
      ? (item['action'] as FileChange['action'])
      : 'create',
    content: typeof item['content'] === 'string' ? item['content'] : undefined,
  }));
};

/**
 * ImplementerAgent - Generates production code from architecture plans.
 *
 * When an LLM executor is available, sends the plan (and optional schemas
 * or existing code) to the model for code generation. Without an executor,
 * returns a code stub/template based on the plan description.
 */
export class ImplementerAgent implements Agent {
  role = 'implementer' as const;
  private executor?: AgentExecutor;

  constructor(executor?: AgentExecutor) {
    this.executor = executor;
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    const payload = task.payload;
    const plan = typeof payload['plan'] === 'string' ? payload['plan'] : undefined;

    if (!plan) {
      return { taskId: task.id, status: 'failed', notes: 'missing_plan' };
    }

    const taskDescription = typeof payload['task'] === 'string' ? payload['task'] : undefined;
    const schemas = typeof payload['schemas'] === 'string' ? payload['schemas'] : undefined;
    const existingCode =
      typeof payload['existingCode'] === 'string' ? payload['existingCode'] : undefined;

    if (this.executor) {
      return this.implementWithLLM(task, { plan, task: taskDescription, schemas, existingCode });
    }

    return this.implementFallback(task, plan);
  }

  private async implementWithLLM(
    task: AgentTask,
    payload: ImplementerPayload,
  ): Promise<AgentResult> {
    try {
      const result = await this.executor!.invoke({
        id: `impl-${task.id}`,
        role: 'implementer',
        description: 'Generate production code from plan',
        payload: {
          context: {
            summary: 'Implement the plan as production-quality TypeScript code.',
            notes: [
              `Plan: ${payload.plan.slice(0, 2000)}`,
              payload.task ? `Task: ${payload.task}` : '',
              payload.schemas ? `Schemas provided (${payload.schemas.length} chars).` : '',
              payload.existingCode
                ? `Existing code provided (${payload.existingCode.length} chars).`
                : '',
              'Return JSON with keys: code (string), files (array of {path, action, content?}), migrations? (string[]).',
            ].filter(Boolean),
            constraints: [
              'Return valid JSON only.',
              'Use TypeScript strict mode conventions.',
              'Follow single-responsibility principle.',
            ],
          },
          plan: payload.plan.slice(0, 4000),
          ...(payload.schemas ? { schemas: payload.schemas.slice(0, 3000) } : {}),
          ...(payload.existingCode ? { existingCode: payload.existingCode.slice(0, 4000) } : {}),
        },
      });

      if (result.status !== 'completed') {
        return {
          taskId: task.id,
          status: 'failed',
          notes: result.notes ?? 'llm_implementer_failed',
        };
      }

      const parsed = result.output ?? (result.notes ? extractJson(result.notes) : null);
      if (isRecord(parsed)) {
        const output: ImplementerOutput = {
          code: typeof parsed['code'] === 'string' ? parsed['code'] : (result.notes ?? ''),
          files: parseFileChanges(parsed['files']),
          migrations: toStringArray(parsed['migrations']) || undefined,
        };
        return {
          taskId: task.id,
          status: 'completed',
          notes: `Generated ${output.files.length} file changes.`,
          output: output as unknown as Record<string, unknown>,
        };
      }

      // LLM returned code as plain text
      return {
        taskId: task.id,
        status: 'completed',
        notes: result.notes ?? 'Implementation generated.',
        output: { code: result.notes ?? '', files: [], migrations: [] },
      };
    } catch (err) {
      return { taskId: task.id, status: 'failed', notes: `implementer_error: ${String(err)}` };
    }
  }

  private implementFallback(task: AgentTask, plan: string): Promise<AgentResult> {
    const stub = [
      '// Auto-generated stub from plan',
      `// Plan: ${plan.slice(0, 100)}...`,
      '',
      'export function main(): void {',
      '  // TODO: Implement according to plan',
      "  throw new Error('Not implemented');",
      '}',
    ].join('\n');

    const output: ImplementerOutput = {
      code: stub,
      files: [{ path: 'src/main.ts', action: 'create', content: stub }],
      migrations: [],
    };

    return Promise.resolve({
      taskId: task.id,
      status: 'completed',
      notes: 'Stub implementation generated. Connect an LLM for full code generation.',
      output: output as unknown as Record<string, unknown>,
    });
  }
}
