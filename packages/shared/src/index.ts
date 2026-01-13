import { z } from 'zod';

// Task status enum
export const TaskStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export type TaskStatusType = typeof TaskStatus[keyof typeof TaskStatus];

// Database types
export interface Project {
  id: string;
  name: string;
  path: string;
  defaultDevPort: number;
  createdAt: string;
}

export interface StepTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  configSchema: string; // JSON schema for validation
  createdAt: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  stepsJson: string;
  createdAt: string;
}

export interface RecipeStep {
  type: 'command' | 'start_preview' | 'git' | 'copilot' | 'check_path';
  command?: string;
  args?: string[];
  cwd?: string;
  detectReady?: string;
  keepAlive?: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  recipeId: string;
  status: TaskStatusType;
  inputJson: string;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  cancelRequested: number;
  error: string | null;
}

export interface TaskInput {
  goal?: string;
  branchSlug?: string;
  [key: string]: any;
}

export interface TaskLog {
  id: string;
  taskId: string;
  ts: string;
  stream: 'stdout' | 'stderr' | 'system';
  line: string;
}

export interface TaskArtifact {
  id: string;
  taskId: string;
  type: 'preview_url' | 'diff_summary' | 'notes' | 'command_transcript';
  value: string;
  createdAt: string;
}

// API request/response schemas
export const createProjectSchema = z.object({
  name: z.string().min(1),
  path: z.string().min(1),
  defaultDevPort: z.number().int().min(1).max(65535),
});

export const createTaskSchema = z.object({
  projectId: z.string().min(1),
  recipeId: z.string().min(1),
  input: z.object({
    goal: z.string().optional(),
    branchSlug: z.string().optional(),
  }).passthrough(),
});

export const postLogSchema = z.object({
  ts: z.string(),
  stream: z.enum(['stdout', 'stderr', 'system']),
  line: z.string(),
});

export const postArtifactSchema = z.object({
  type: z.enum(['preview_url', 'diff_summary', 'notes', 'command_transcript']),
  value: z.string(),
});

// WebSocket message types
export interface WSSubscribeMessage {
  type: 'subscribe';
  taskId: string;
}

export interface WSLogMessage {
  type: 'log';
  taskId: string;
  ts: string;
  stream: 'stdout' | 'stderr' | 'system';
  line: string;
}

export type WSClientMessage = WSSubscribeMessage;
export type WSServerMessage = WSLogMessage;

// API response types
export interface TaskDetailResponse extends Task {
  project: Project;
  recipe: Recipe;
  artifacts: TaskArtifact[];
  logs?: TaskLog[];
}
