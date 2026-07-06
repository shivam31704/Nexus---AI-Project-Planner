import { Injectable } from '@nestjs/common';
import { AiProviderService } from '../ai-provider.service';
import { NodeType } from '../schemas/project-artifact.schema';

@Injectable()
export class PromptParserService {
  constructor(private readonly aiProvider: AiProviderService) {}

  /**
   * Parses the raw user prompt into domains required for the project.
   */
  async parseDomains(prompt: string): Promise<NodeType[]> {
    // Progressive architecture dictates we return domains quickly to kick off parallel tasks
    return ['DbSchema', 'FolderStructure', 'Timeline', 'TeamAssignment', 'Task', 'ApiDoc'];
  }
}
