import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectArtifact, ProjectArtifactDocument } from '../schemas/project-artifact.schema';
import { AiProviderService } from '../ai-provider.service';
import { ProjectGateway } from '../gateway/project.gateway';

export interface PatchRequest {
  nodeId: string;
  nodeType: string;
  currentNodeContent: any;
  instruction: string;
  siblingContext?: any;
}

export interface PatchResponse {
  nodeId: string;
  updatedContent: any;
  changeSummary: string;
  version: number;
}

/**
 * The "Interactive Chat Self-Healing" engine.
 * Previously: hardcoded mock content, TaskNode-only, no gateway broadcast.
 * Now: real AI call, works for ALL 7 artifact types (generic ProjectArtifact
 * model), and actually broadcasts `node:patched` over the WebSocket gateway
 * so every connected client updates just that one node in-place.
 */
@Injectable()
export class PatchService {
  private readonly logger = new Logger(PatchService.name);

  constructor(
    @InjectModel(ProjectArtifact.name)
    private readonly artifactModel: Model<ProjectArtifactDocument>,
    private readonly aiProvider: AiProviderService,
    private readonly gateway: ProjectGateway
  ) {}

  async applySurgicalPatch(request: PatchRequest): Promise<PatchResponse> {
    this.logger.log(`Patch request for node ${request.nodeId} (${request.nodeType})`);

    const { updatedContent, changeSummary } = await this.aiProvider.generatePatch({
      nodeType: request.nodeType,
      currentNodeContent: request.currentNodeContent,
      instruction: request.instruction,
      siblingContext: request.siblingContext,
    });

    const updatedDoc = await this.artifactModel.findOneAndUpdate(
      { nodeId: request.nodeId },
      { $set: { content: updatedContent }, $inc: { version: 1 } },
      { new: true }
    );

    if (!updatedDoc) {
      throw new NotFoundException(`No artifact found with nodeId ${request.nodeId}`);
    }

    const response: PatchResponse = {
      nodeId: request.nodeId,
      updatedContent: updatedDoc.content,
      changeSummary,
      version: updatedDoc.version,
    };

    // Broadcast to every connected client in this project's room so the
    // "surgical, localized update" is visible live to collaborators too.
    this.gateway.broadcastNodePatch(updatedDoc.projectId, response);

    return response;
  }
}
