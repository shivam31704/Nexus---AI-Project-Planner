import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PromptParserService } from './prompt-parser.service';
import { SpecPlannerService, GeneratedArtifact } from './spec-planner.service';
import { ProjectArtifact, ProjectArtifactDocument } from '../schemas/project-artifact.schema';

/**
 * Orchestrates the full generation pipeline AND persists every artifact to
 * MongoDB as it's produced (previously: no persistence at all — artifacts
 * were only ever yielded, never saved).
 */
@Injectable()
export class ProjectAssemblerService {
  private readonly logger = new Logger(ProjectAssemblerService.name);

  constructor(
    private readonly promptParser: PromptParserService,
    private readonly specPlanner: SpecPlannerService,
    @InjectModel(ProjectArtifact.name)
    private readonly artifactModel: Model<ProjectArtifactDocument>
  ) {}

  async *assembleProject(
    prompt: string
  ): AsyncGenerator<GeneratedArtifact & { projectId: string }, void, unknown> {
    const projectId = crypto.randomUUID();
    const domains = await this.promptParser.parseDomains(prompt);

    for await (const artifact of this.specPlanner.generateDomainSpecs(prompt, domains)) {
      try {
        await this.artifactModel.create({ ...artifact, projectId });
      } catch (err: any) {
        this.logger.error(`Failed to persist artifact ${artifact.nodeId}: ${err.message}`);
      }
      yield { ...artifact, projectId };
    }
  }
}
