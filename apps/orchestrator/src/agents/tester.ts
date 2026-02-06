import type { Agent, AgentExecutor, AgentResult, AgentTask } from '../agents';

interface TesterPayload {
  code: string;
  schema?: string;
  testPlan?: string;
}

interface TesterOutput {
  tests: string[];
  coverage?: Record<string, unknown>;
  edgeCases: string[];
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

/**
 * TesterAgent - Generates test cases and performs edge case analysis.
 *
 * When an LLM executor is available, sends code (and optional schema/test plan)
 * to the model for comprehensive test generation. Without an executor, returns
 * a placeholder test outline based on basic code inspection.
 */
export class TesterAgent implements Agent {
  role = 'tester' as const;
  private executor?: AgentExecutor;

  constructor(executor?: AgentExecutor) {
    this.executor = executor;
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    const payload = task.payload;
    const code = typeof payload['code'] === 'string' ? payload['code'] : undefined;

    if (!code) {
      return { taskId: task.id, status: 'failed', notes: 'missing_code' };
    }

    const schema = typeof payload['schema'] === 'string' ? payload['schema'] : undefined;
    const testPlan = typeof payload['testPlan'] === 'string' ? payload['testPlan'] : undefined;

    if (this.executor) {
      return this.generateWithLLM(task, { code, schema, testPlan });
    }

    return this.generateFallback(task, code);
  }

  private async generateWithLLM(task: AgentTask, payload: TesterPayload): Promise<AgentResult> {
    try {
      const result = await this.executor!.invoke({
        id: `tester-${task.id}`,
        role: 'tester',
        description: 'Generate test cases and edge case analysis',
        payload: {
          context: {
            summary: 'Analyze the code and generate comprehensive test cases.',
            notes: [
              `Code length: ${payload.code.length} chars`,
              payload.schema ? `Schema provided (${payload.schema.length} chars).` : '',
              payload.testPlan ? `Test plan provided.` : '',
              'Return JSON with keys: tests (string[]), coverage? (object), edgeCases (string[]).',
            ].filter(Boolean),
            constraints: [
              'Return valid JSON only.',
              'Each test should be a complete test case description.',
              'Edge cases should identify boundary conditions and failure modes.',
            ],
          },
          code: payload.code.slice(0, 6000),
          ...(payload.schema ? { schema: payload.schema.slice(0, 2000) } : {}),
          ...(payload.testPlan ? { testPlan: payload.testPlan.slice(0, 2000) } : {}),
        },
      });

      if (result.status !== 'completed') {
        return { taskId: task.id, status: 'failed', notes: result.notes ?? 'llm_tester_failed' };
      }

      const parsed = result.output ?? (result.notes ? extractJson(result.notes) : null);
      if (isRecord(parsed)) {
        const output: TesterOutput = {
          tests: toStringArray(parsed['tests']),
          coverage: isRecord(parsed['coverage']) ? parsed['coverage'] : undefined,
          edgeCases: toStringArray(parsed['edgeCases']),
        };
        return {
          taskId: task.id,
          status: 'completed',
          notes: `Generated ${output.tests.length} tests and ${output.edgeCases.length} edge cases.`,
          output: output as unknown as Record<string, unknown>,
        };
      }

      return {
        taskId: task.id,
        status: 'completed',
        notes: result.notes ?? 'Test generation completed.',
        output: { tests: [], coverage: undefined, edgeCases: [] },
      };
    } catch (err) {
      return { taskId: task.id, status: 'failed', notes: `tester_error: ${String(err)}` };
    }
  }

  private generateFallback(task: AgentTask, code: string): Promise<AgentResult> {
    const tests: string[] = [];
    const edgeCases: string[] = [];

    // Detect exported functions/classes for basic test outlines
    const functionMatches = code.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/g) ?? [];
    const classMatches = code.match(/(?:export\s+)?class\s+(\w+)/g) ?? [];

    for (const fn of functionMatches) {
      const name = fn.replace(/(?:export\s+)?(?:async\s+)?function\s+/, '');
      tests.push(
        `it("should handle valid input for ${name}")`,
        `it("should throw on invalid input for ${name}")`,
      );
      edgeCases.push(`${name}: null/undefined input`, `${name}: empty string input`);
    }

    for (const cls of classMatches) {
      const name = cls.replace(/(?:export\s+)?class\s+/, '');
      tests.push(
        `describe("${name}") - should construct without errors`,
        `describe("${name}") - should handle edge cases`,
      );
      edgeCases.push(`${name}: constructor with missing arguments`);
    }

    if (tests.length === 0) {
      tests.push("it('should execute the module without errors')");
      edgeCases.push('Empty or missing input', 'Unexpected data types');
    }

    const output: TesterOutput = { tests, edgeCases };

    return Promise.resolve({
      taskId: task.id,
      status: 'completed',
      notes: `Stub test outline: ${tests.length} tests, ${edgeCases.length} edge cases.`,
      output: output as unknown as Record<string, unknown>,
    });
  }
}
