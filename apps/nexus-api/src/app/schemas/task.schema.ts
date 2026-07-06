import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// Base Node properties
export class BaseNode {
  @Prop({ required: true, unique: true, type: String })
  nodeId: string;

  @Prop({ required: true, default: 1, type: Number })
  version: number;

  @Prop({ type: Number, default: null })
  parentVersion: number | null;

  @Prop({ required: true, type: String, enum: ['DbSchema', 'FolderStructure', 'Timeline', 'Sprint', 'TeamAssignment', 'Task', 'ApiDoc'] })
  nodeType: string;
}

// 1. Task Node
@Schema({ timestamps: true })
export class TaskNode extends BaseNode {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, type: String, enum: ['todo', 'in-progress', 'done', 'blocked'] })
  status: string;

  @Prop({ type: String })
  assigneeRole?: string;

  @Prop({ required: true, type: Number })
  estimateHours: number;

  @Prop({ type: [String] })
  dependencyTaskIds?: string[];
}

export type TaskNodeDocument = TaskNode & Document;
export const TaskNodeSchema = SchemaFactory.createForClass(TaskNode);

// Create indexes for efficient querying and addressing via nodeId
TaskNodeSchema.index({ nodeId: 1 });
