import type { Agent, AgentExecutor, AgentResult, AgentTask } from '../agents';

// Payload shape: { profileData, maskId, template?, timeline? }

interface NarratorOutput {
  narrative: string;
  tone: string;
  wordCount: number;
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

const countWords = (text: string): number => text.split(/\s+/).filter(Boolean).length;

/**
 * NarratorAgent - Transforms profile data into mask-aligned narratives.
 *
 * When an LLM executor is available, sends profile data with mask context
 * to generate a compelling, mask-aligned narrative. Without an executor,
 * returns a placeholder narrative derived from the profile data.
 */
export class NarratorAgent implements Agent {
  role = 'narrator' as const;
  private executor?: AgentExecutor;

  constructor(executor?: AgentExecutor) {
    this.executor = executor;
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    const payload = task.payload;
    const profileData = isRecord(payload['profileData']) ? payload['profileData'] : undefined;
    const maskId = typeof payload['maskId'] === 'string' ? payload['maskId'] : undefined;

    if (!profileData || !maskId) {
      return {
        taskId: task.id,
        status: 'failed',
        notes: 'missing_profile_data_or_mask_id',
      };
    }

    const template = typeof payload['template'] === 'string' ? payload['template'] : undefined;
    const timeline = Array.isArray(payload['timeline']) ? payload['timeline'] : undefined;

    if (this.executor) {
      return this.generateWithLLM(task, profileData, maskId, template, timeline);
    }

    return this.generateFallback(task, profileData, maskId);
  }

  private async generateWithLLM(
    task: AgentTask,
    profileData: Record<string, unknown>,
    maskId: string,
    template?: string,
    timeline?: unknown[],
  ): Promise<AgentResult> {
    try {
      const result = await this.executor!.invoke({
        id: `narrative-${task.id}`,
        role: 'narrator',
        description: `Generate mask-aligned narrative for mask ${maskId}`,
        payload: {
          context: {
            summary: 'Generate a professional narrative aligned with the given identity mask.',
            notes: [
              `Mask ID: ${maskId}`,
              template ? `Template: ${template}` : '',
              timeline ? `Timeline entries: ${timeline.length}` : '',
              'Return JSON with keys: narrative, tone, wordCount.',
            ].filter(Boolean),
            constraints: [
              'Return valid JSON only.',
              'The narrative should be formatted in Markdown.',
              'Keep the tone consistent with the mask identity.',
            ],
          },
          profileData,
          ...(timeline ? { timeline } : {}),
        },
      });

      if (result.status !== 'completed') {
        return {
          taskId: task.id,
          status: 'failed',
          notes: result.notes ?? 'llm_invocation_failed',
        };
      }

      const parsed = result.output ?? (result.notes ? extractJson(result.notes) : null);
      if (isRecord(parsed) && typeof parsed['narrative'] === 'string') {
        const output: NarratorOutput = {
          narrative: parsed['narrative'],
          tone: typeof parsed['tone'] === 'string' ? parsed['tone'] : maskId,
          wordCount: countWords(parsed['narrative']),
        };
        return {
          taskId: task.id,
          status: 'completed',
          notes: `Generated ${output.wordCount}-word narrative for mask ${maskId}.`,
          output: output as unknown as Record<string, unknown>,
        };
      }

      // LLM returned plain text rather than JSON
      const narrative = result.notes ?? '';
      const output: NarratorOutput = {
        narrative,
        tone: maskId,
        wordCount: countWords(narrative),
      };
      return {
        taskId: task.id,
        status: 'completed',
        notes: `Generated ${output.wordCount}-word narrative for mask ${maskId}.`,
        output: output as unknown as Record<string, unknown>,
      };
    } catch (err) {
      return { taskId: task.id, status: 'failed', notes: `narrator_error: ${String(err)}` };
    }
  }

  private generateFallback(
    task: AgentTask,
    profileData: Record<string, unknown>,
    maskId: string,
  ): Promise<AgentResult> {
    const name = typeof profileData['name'] === 'string' ? profileData['name'] : 'Professional';
    const summary = typeof profileData['summary'] === 'string' ? profileData['summary'] : '';
    const narrative = [
      `# Professional Narrative (${maskId})`,
      '',
      summary || `${name} brings a breadth of experience across multiple domains.`,
      '',
      'This narrative was generated without an LLM executor. Connect an LLM to produce richer, mask-aligned content.',
    ].join('\n');

    const output: NarratorOutput = {
      narrative,
      tone: maskId,
      wordCount: countWords(narrative),
    };

    return Promise.resolve({
      taskId: task.id,
      status: 'completed',
      notes: `Stub narrative (${output.wordCount} words) for mask ${maskId}.`,
      output: output as unknown as Record<string, unknown>,
    });
  }
}
