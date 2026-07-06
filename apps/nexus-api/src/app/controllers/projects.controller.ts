import { BadRequestException, Controller, Sse, Query, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ProjectAssemblerService } from '../services/project-assembler.service';

/**
 * GET /api/projects/generate?prompt=...
 *
 * Uses Server-Sent Events (native browser EventSource) rather than a plain
 * POST + JSON response, because the whole point of the generation pipeline
 * (ProjectAssemblerService -> SpecPlannerService) is to stream each artifact
 * to the client the moment it's ready instead of waiting for all 6-7 AI
 * calls to finish. EventSource only supports GET, hence the query param
 * instead of a request body.
 */
@Controller('projects')
export class ProjectsController {
  constructor(private readonly assembler: ProjectAssemblerService) {}

  @Sse('generate')
  generate(@Query('prompt') prompt: string): Observable<MessageEvent> {
    if (!prompt || prompt.trim().length < 3) {
      throw new BadRequestException('Query param "prompt" is required (min 3 characters).');
    }

    return new Observable<MessageEvent>((subscriber) => {
      let cancelled = false;

      (async () => {
        try {
          for await (const artifact of this.assembler.assembleProject(prompt)) {
            if (cancelled) return;
            subscriber.next({ data: artifact });
          }
          if (!cancelled) {
            subscriber.next({ data: { done: true } });
            subscriber.complete();
          }
        } catch (err: any) {
          if (!cancelled) subscriber.error(err);
        }
      })();

      return () => {
        cancelled = true;
      };
    });
  }
}
