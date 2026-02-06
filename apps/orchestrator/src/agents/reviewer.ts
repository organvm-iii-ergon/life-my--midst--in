import type { Agent, AgentExecutor, AgentResult, AgentTask } from '../agents';

interface ReviewerPayload {
  code?: string;
  diff?: string;
  testResults?: string;
  context?: string;
}

interface Issue {
  severity: 'error' | 'warning' | 'info';
  line?: number;
  message: string;
  rule?: string;
}

interface ReviewerOutput {
  issues: Issue[];
  riskLevel: string;
  suggestions: string[];
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

const ISSUE_SEVERITIES = new Set<Issue['severity']>(['error', 'warning', 'info']);

const parseIssues = (value: unknown): Issue[] => {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((item) => ({
    severity: ISSUE_SEVERITIES.has(item['severity'] as Issue['severity'])
      ? (item['severity'] as Issue['severity'])
      : 'info',
    line: typeof item['line'] === 'number' ? item['line'] : undefined,
    message: typeof item['message'] === 'string' ? item['message'] : 'Unknown issue',
    rule: typeof item['rule'] === 'string' ? item['rule'] : undefined,
  }));
};

/**
 * ReviewerAgent - Analyzes code or diffs for quality, security, and best practices.
 *
 * When an LLM executor is available, sends the code/diff to the model for
 * detailed analysis. Without an executor, performs basic static pattern
 * matching to catch common issues.
 */
export class ReviewerAgent implements Agent {
  role = 'reviewer' as const;
  private executor?: AgentExecutor;

  constructor(executor?: AgentExecutor) {
    this.executor = executor;
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    const payload = task.payload;
    const code = typeof payload['code'] === 'string' ? payload['code'] : undefined;
    const diff = typeof payload['diff'] === 'string' ? payload['diff'] : undefined;
    const testResults =
      typeof payload['testResults'] === 'string' ? payload['testResults'] : undefined;
    const context = typeof payload['context'] === 'string' ? payload['context'] : undefined;

    if (!code && !diff) {
      return { taskId: task.id, status: 'failed', notes: 'missing_code_or_diff' };
    }

    if (this.executor) {
      return this.reviewWithLLM(task, { code, diff, testResults, context });
    }

    return this.reviewFallback(task, { code, diff });
  }

  private async reviewWithLLM(task: AgentTask, payload: ReviewerPayload): Promise<AgentResult> {
    try {
      const result = await this.executor!.invoke({
        id: `review-${task.id}`,
        role: 'reviewer',
        description: 'Review code for quality, security, and best practices',
        payload: {
          context: {
            summary: 'Analyze the provided code or diff for issues and improvements.',
            notes: [
              payload.code ? `Code length: ${payload.code.length} chars` : '',
              payload.diff ? `Diff length: ${payload.diff.length} chars` : '',
              payload.testResults ? 'Test results provided.' : '',
              payload.context ? `Additional context: ${payload.context}` : '',
              'Return JSON with keys: issues (array of {severity, line?, message, rule?}), riskLevel (string), suggestions (string[]).',
            ].filter(Boolean),
            constraints: ['Return valid JSON only.'],
          },
          ...(payload.code ? { code: payload.code.slice(0, 6000) } : {}),
          ...(payload.diff ? { diff: payload.diff.slice(0, 6000) } : {}),
          ...(payload.testResults ? { testResults: payload.testResults.slice(0, 2000) } : {}),
        },
      });

      if (result.status !== 'completed') {
        return { taskId: task.id, status: 'failed', notes: result.notes ?? 'llm_review_failed' };
      }

      const parsed = result.output ?? (result.notes ? extractJson(result.notes) : null);
      if (isRecord(parsed)) {
        const output: ReviewerOutput = {
          issues: parseIssues(parsed['issues']),
          riskLevel: typeof parsed['riskLevel'] === 'string' ? parsed['riskLevel'] : 'unknown',
          suggestions: toStringArray(parsed['suggestions']),
        };
        return {
          taskId: task.id,
          status: 'completed',
          notes: `Review complete: ${output.issues.length} issues found, risk level: ${output.riskLevel}.`,
          output: output as unknown as Record<string, unknown>,
        };
      }

      return {
        taskId: task.id,
        status: 'completed',
        notes: result.notes ?? 'Review completed.',
        output: { issues: [], riskLevel: 'unknown', suggestions: [] },
      };
    } catch (err) {
      return { taskId: task.id, status: 'failed', notes: `reviewer_error: ${String(err)}` };
    }
  }

  private reviewFallback(
    task: AgentTask,
    payload: Pick<ReviewerPayload, 'code' | 'diff'>,
  ): Promise<AgentResult> {
    const source = payload.code ?? payload.diff ?? '';
    const issues: Issue[] = [];

    // Basic static checks
    if (/console\.log/.test(source)) {
      issues.push({
        severity: 'warning',
        message: 'console.log statement found',
        rule: 'no-console',
      });
    }
    if (/TODO|FIXME|HACK/i.test(source)) {
      issues.push({ severity: 'info', message: 'TODO/FIXME/HACK comment found', rule: 'no-todo' });
    }
    if (/password|secret|api_key|apikey/i.test(source)) {
      issues.push({
        severity: 'error',
        message: 'Possible hardcoded secret detected',
        rule: 'no-secrets',
      });
    }
    if (/eval\(/.test(source)) {
      issues.push({ severity: 'error', message: 'eval() usage detected', rule: 'no-eval' });
    }
    if (source.split('\n').some((line) => line.length > 200)) {
      issues.push({
        severity: 'warning',
        message: 'Line exceeds 200 characters',
        rule: 'max-line-length',
      });
    }

    const riskLevel = issues.some((i) => i.severity === 'error')
      ? 'high'
      : issues.some((i) => i.severity === 'warning')
        ? 'medium'
        : 'low';

    const output: ReviewerOutput = {
      issues,
      riskLevel,
      suggestions: [
        'Connect an LLM executor for deeper semantic analysis.',
        'Consider running ESLint and TypeScript strict mode for comprehensive checks.',
      ],
    };

    return Promise.resolve({
      taskId: task.id,
      status: 'completed',
      notes: `Static review: ${issues.length} issues found, risk level: ${riskLevel}.`,
      output: output as unknown as Record<string, unknown>,
    });
  }
}
