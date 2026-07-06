import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NodeType =
  | 'DbSchema'
  | 'FolderStructure'
  | 'Timeline'
  | 'Sprint'
  | 'TeamAssignment'
  | 'Task'
  | 'ApiDoc';

/**
 * Generic, single-collection representation of every project artifact type.
 * Replaces the old Task-only `task.schema.ts` (kept in the repo for reference,
 * no longer used) so that ALL 7 artifact types from the shared-types Zod
 * schemas can actually be persisted, addressed by nodeId, and surgically
 * patched — not just Tasks.
 *
 * `content` holds the domain-specific shape (validated against the matching
 * Zod schema in libs/shared-types at the API boundary, not at the DB layer).
 */
@Schema({ timestamps: true, collection: 'project_artifacts' })
export class ProjectArtifact {
  @Prop({ required: true, type: String })
  projectId!: string;

  @Prop({ required: true, unique: true, type: String })
  nodeId!: string;

  @Prop({
    required: true,
    type: String,
    enum: [
      'DbSchema',
      'FolderStructure',
      'Timeline',
      'Sprint',
      'TeamAssignment',
      'Task',
      'ApiDoc',
    ],
  })
  nodeType!: NodeType;

  @Prop({ required: true, default: 1, type: Number })
  version!: number;

  @Prop({ type: Number, default: null })
  parentVersion!: number | null;

  @Prop({ type: Object, required: true })
  content!: Record<string, any>;
}

export type ProjectArtifactDocument = ProjectArtifact & Document;
export const ProjectArtifactSchema = SchemaFactory.createForClass(ProjectArtifact);

ProjectArtifactSchema.index({ nodeId: 1 }, { unique: true });
ProjectArtifactSchema.index({ projectId: 1, nodeType: 1 });
