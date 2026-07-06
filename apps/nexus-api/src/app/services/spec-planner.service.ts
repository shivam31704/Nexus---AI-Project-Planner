import { Injectable, Logger } from '@nestjs/common';
import { AiProviderService } from '../ai-provider.service';
import { NodeType } from '../schemas/project-artifact.schema';

export interface GeneratedArtifact {
  nodeId: string;
  nodeType: NodeType;
  version: number;
  parentVersion: null;
  content: any;
}

/**
 * Fires AI calls per domain with LIMITED CONCURRENCY (2 at a time, not all
 * 6 at once) — Gemini's free tier has a low requests-per-minute cap, and
 * firing every domain simultaneously tripped a 429 rate limit almost
 * immediately. Still streams each artifact to the caller as soon as it's
 * ready, just staggered instead of all-at-once.
 *
 * If one domain's AI call fails, it's logged and skipped rather than
 * failing the whole generation run.
 */
@Injectable()
export class SpecPlannerService {
  private readonly logger = new Logger(SpecPlannerService.name);
  private readonly maxConcurrent = 4; // safe again now that keys are rotated per domain

  constructor(private readonly aiProvider: AiProviderService) {}

  async *generateDomainSpecs(
    prompt: string,
    domains: NodeType[]
  ): AsyncGenerator<GeneratedArtifact, void, unknown> {
    const queue = [...domains];
    const inFlight = new Map<Promise<GeneratedArtifact>, NodeType>();

    const startNext = () => {
      const domain = queue.shift();
      if (!domain) return;
      inFlight.set(this.generateOne(prompt, domain), domain);
    };

    // Kick off the first batch (up to maxConcurrent)
    for (let i = 0; i < this.maxConcurrent && queue.length > 0; i++) {
      startNext();
    }

    while (inFlight.size > 0) {
      const settled = await Promise.race(
        Array.from(inFlight.keys()).map((p) =>
          p.then((result) => ({ status: 'ok' as const, p, result }))
           .catch((error) => ({ status: 'error' as const, p, error }))
        )
      );

      const finishedDomain = inFlight.get(settled.p);
      inFlight.delete(settled.p);

      // As soon as one finishes, start the next queued domain (keeps
      // concurrency at maxConcurrent until the queue is empty).
      startNext();

      if (settled.status === 'error') {
        this.logger.error(
          `Domain "${finishedDomain}" failed: ${settled.error?.message ?? settled.error}`
        );
        continue;
      }

      yield settled.result;
    }
  }

  private async generateOne(prompt: string, domain: NodeType): Promise<GeneratedArtifact> {
    const content = await this.aiProvider.generateDomainContent({ prompt, domain: domain as string });
    return {
      nodeId: crypto.randomUUID(),
      nodeType: domain,
      version: 1,
      parentVersion: null,
      content,
    };
  }
}
