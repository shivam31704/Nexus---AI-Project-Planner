import { z } from 'zod';

// Base Node for every artifact in Nexus
export const BaseNodeSchema = z.object({
  nodeId: z.string().uuid(),
  version: z.number().int().default(1),
  parentVersion: z.number().int().nullable().default(null),
  nodeType: z.enum(['DbSchema', 'FolderStructure', 'Timeline', 'Sprint', 'TeamAssignment', 'Task', 'ApiDoc']),
});

export type BaseNode = z.infer<typeof BaseNodeSchema>;

// 1. Database Schemas
export const DbSchemaNodeSchema = BaseNodeSchema.extend({
  nodeType: z.literal('DbSchema'),
  collectionName: z.string(),
  fields: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
      relation: z.string().optional(),
    })
  ),
  indexes: z.array(z.string()).optional(),
});
export type DbSchemaNode = z.infer<typeof DbSchemaNodeSchema>;

// 2. Folder Structures
export const FolderStructureNodeSchema = BaseNodeSchema.extend({
  nodeType: z.literal('FolderStructure'),
  type: z.enum(['file', 'folder']),
  path: z.string(),
  purpose: z.string(),
});
export type FolderStructureNode = z.infer<typeof FolderStructureNodeSchema>;

// 3. Timelines
export const TimelineNodeSchema = BaseNodeSchema.extend({
  nodeType: z.literal('Timeline'),
  phase: z.string(),
  milestones: z.array(z.string()),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});
export type TimelineNode = z.infer<typeof TimelineNodeSchema>;

// 4. Sprints
export const SprintNodeSchema = BaseNodeSchema.extend({
  nodeType: z.literal('Sprint'),
  sprintNumber: z.number().int(),
  goals: z.array(z.string()),
  linkedTaskIds: z.array(z.string().uuid()),
});
export type SprintNode = z.infer<typeof SprintNodeSchema>;

// 5. Team Assignments
export const TeamAssignmentNodeSchema = BaseNodeSchema.extend({
  nodeType: z.literal('TeamAssignment'),
  role: z.string(),
  allocatedTaskIds: z.array(z.string().uuid()),
  workloadPercentage: z.number().min(0).max(100),
});
export type TeamAssignmentNode = z.infer<typeof TeamAssignmentNodeSchema>;

// 6. Tasks
export const TaskNodeSchema = BaseNodeSchema.extend({
  nodeType: z.literal('Task'),
  title: z.string(),
  description: z.string(),
  status: z.enum(['todo', 'in-progress', 'done', 'blocked']),
  assigneeRole: z.string().optional(),
  estimateHours: z.number().int(),
  dependencyTaskIds: z.array(z.string().uuid()).optional(),
});
export type TaskNode = z.infer<typeof TaskNodeSchema>;

// 7. API Docs
export const ApiDocNodeSchema = BaseNodeSchema.extend({
  nodeType: z.literal('ApiDoc'),
  endpoint: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  requestSchema: z.record(z.string(), z.any()).optional(),
  responseSchema: z.record(z.string(), z.any()),
  authRequired: z.boolean(),
});
export type ApiDocNode = z.infer<typeof ApiDocNodeSchema>;

// Union type of all Artifacts
export const ProjectArtifactSchema = z.discriminatedUnion('nodeType', [
  DbSchemaNodeSchema,
  FolderStructureNodeSchema,
  TimelineNodeSchema,
  SprintNodeSchema,
  TeamAssignmentNodeSchema,
  TaskNodeSchema,
  ApiDocNodeSchema,
]);

export type ProjectArtifact = z.infer<typeof ProjectArtifactSchema>;
