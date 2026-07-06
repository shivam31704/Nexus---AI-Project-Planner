import { Body, Controller, Param, Patch } from '@nestjs/common';
import { PatchService } from '../services/patch.service';
import { PatchNodeDto } from '../dto/patch-node.dto';

/**
 * PATCH /api/nodes/:nodeId
 * The "Interactive Chat Self-Healing" endpoint — surgically updates ONE
 * node (identified by its stable nodeId) without regenerating the project.
 */
@Controller('nodes')
export class NodesController {
  constructor(private readonly patchService: PatchService) {}

  @Patch(':nodeId')
  async patchNode(@Param('nodeId') nodeId: string, @Body() dto: PatchNodeDto) {
    return this.patchService.applySurgicalPatch({ nodeId, ...dto });
  }
}
