import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface GenerateDomainRequest {
  prompt: string;
  domain: string;
}

export interface PatchAiRequest {
  nodeType: string;
  currentNodeContent: any;
  instruction: string;
  siblingContext?: any;
}

export interface PatchAiResponse {
  updatedContent: any;
  changeSummary: string;
}

/**
 * Google Gemini integration with MULTI-KEY ROTATION.
 *
 * Set GEMINI_API_KEYS in .env as a comma-separated list (one key per
 * Google Cloud PROJECT — each project gets its own independent free-tier
 * quota). Each domain is deterministically routed to one key, so 6-7
 * domains generating in parallel don't all fight over one key's rate
 * limit. Falls back to a single GEMINI_API_KEY if only one is provided.
 */
@Injectable()
export class AiProviderService {
  private readonly logger = new Logger(AiProviderService.name);
  private readonly model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  private readonly apiKeys: string[] = (
    process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || ''
  )
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  /** Same domain always maps to the same key (stable across retries). */
  private keyForDomain(domain: string): string {
    if (this.apiKeys.length === 0) {
      throw new Error(
        'No Gemini API key configured. Set GEMINI_API_KEY or GEMINI_API_KEYS in your .env file.'
      );
    }
    let hash = 0;
    for (let i = 0; i < domain.length; i++) hash = (hash * 31 + domain.charCodeAt(i)) >>> 0;
    return this.apiKeys[hash % this.apiKeys.length];
  }

  private async callGemini(
    systemPrompt: string,
    userPrompt: string,
    routingKey = 'default',
    attempt = 1
  ): Promise<any> {
    const apiKey = this.keyForDomain(routingKey);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`;

    try {
      const response = await axios.post(
        url,
        {
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.4,
          },
        },
        {
          headers: { 'content-type': 'application/json' },
          timeout: 30000,
        }
      );

      const rawText: string =
        response.data?.candidates?.[0]?.content?.parts
          ?.map((p: any) => p.text)
          .join('\n') ?? '';

      return this.parseJsonSafely(rawText);
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 429 && attempt <= 5) {
        const details = err?.response?.data?.error?.details ?? [];
        const retryInfo = details.find((d: any) => d['@type']?.includes('RetryInfo'));
        const suggestedSeconds = retryInfo?.retryDelay
          ? parseInt(retryInfo.retryDelay.replace('s', ''), 10)
          : attempt * 10;

        const waitMs = suggestedSeconds * 1000;
        this.logger.warn(
          `[key for "${routingKey}"] Gemini rate-limited (429). Retrying in ${waitMs}ms (attempt ${attempt}/5, Google suggested: ${!!retryInfo})...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        return this.callGemini(systemPrompt, userPrompt, routingKey, attempt + 1);
      }

      throw err;
    }
  }

  private parseJsonSafely(text: string): any {
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (err) {
      this.logger.error(`AI response was not valid JSON: ${cleaned.slice(0, 300)}`);
      throw new Error('AI response was not valid JSON. Try rephrasing the prompt.');
    }
  }

  async generateDomainContent(request: GenerateDomainRequest): Promise<any> {
    const systemPrompt =
      `You are a senior software architect. Respond ONLY with valid JSON — ` +
      `no markdown fences, no commentary, no explanation text before or after.`;
    const userPrompt =
      `Project idea: "${request.prompt}"\n\n` +
      `Generate a realistic, concrete "${request.domain}" artifact for this project as a JSON object. ` +
      `Use real field names and real, specific content (real folder paths, real task titles, real schema fields) — ` +
      `not generic placeholders like "field1" or "TODO".`;

    // Route by domain name so each domain sticks to its own key.
    return this.callGemini(systemPrompt, userPrompt, request.domain);
  }

  async generatePatch(request: PatchAiRequest): Promise<PatchAiResponse> {
    const systemPrompt =
      `You are a precise, surgical JSON editor. You will receive the current content of a single ` +
      `"${request.nodeType}" node plus an instruction. Respond ONLY with JSON of the exact shape ` +
      `{"updatedContent": <the fully updated node object>, "changeSummary": "<one sentence>"}. ` +
      `Only change what the instruction asks for — leave every other field untouched.`;
    const userPrompt =
      `Current node content:\n${JSON.stringify(request.currentNodeContent)}\n\n` +
      `Sibling context (reference only, do not modify):\n${JSON.stringify(request.siblingContext ?? {})}\n\n` +
      `Instruction: "${request.instruction}"`;

    return this.callGemini(systemPrompt, userPrompt, request.nodeType);
  }
}
