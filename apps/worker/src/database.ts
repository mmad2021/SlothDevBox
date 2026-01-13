import { Database } from 'bun:sqlite';
import type { Task, Project, Recipe } from '@devcenter/shared';

const DB_PATH = process.env.DB_PATH || '/Users/aungsithu/playground/SlothDevBox/data/devcenter.db';

export function getDatabase() {
  return new Database(DB_PATH);
}

export const db = getDatabase();

export function getNextPendingTask(): (Task & { project: Project; recipe: Recipe }) | null {
  const task = db.query(`
    SELECT t.*, p.path as projectPath, p.defaultDevPort, r.stepsJson
    FROM tasks t
    JOIN projects p ON t.projectId = p.id
    JOIN recipes r ON t.recipeId = r.id
    WHERE t.status = 'pending'
    ORDER BY t.createdAt ASC
    LIMIT 1
  `).get() as any;
  
  if (!task) return null;
  
  const project = db.query('SELECT * FROM projects WHERE id = ?').get(task.projectId) as Project;
  const recipe = db.query('SELECT * FROM recipes WHERE id = ?').get(task.recipeId) as Recipe;
  
  return {
    id: task.id,
    projectId: task.projectId,
    recipeId: task.recipeId,
    status: task.status,
    inputJson: task.inputJson,
    createdAt: task.createdAt,
    startedAt: task.startedAt,
    endedAt: task.endedAt,
    cancelRequested: task.cancelRequested,
    error: task.error,
    project,
    recipe,
  };
}

export function isProjectBusy(projectId: string): boolean {
  const count = db.query(
    "SELECT COUNT(*) as count FROM tasks WHERE projectId = ? AND status = 'running'"
  ).get(projectId) as { count: number };
  
  return count.count > 0;
}

export function updateTaskStatus(
  taskId: string,
  status: string,
  error?: string
) {
  const now = new Date().toISOString();
  
  if (status === 'running') {
    db.prepare('UPDATE tasks SET status = ?, startedAt = ? WHERE id = ?')
      .run(status, now, taskId);
  } else if (status === 'success' || status === 'failed' || status === 'cancelled') {
    if (error) {
      db.prepare('UPDATE tasks SET status = ?, endedAt = ?, error = ? WHERE id = ?')
        .run(status, now, error, taskId);
    } else {
      db.prepare('UPDATE tasks SET status = ?, endedAt = ? WHERE id = ?')
        .run(status, now, taskId);
    }
  }
}

export function isCancelRequested(taskId: string): boolean {
  const task = db.query('SELECT cancelRequested FROM tasks WHERE id = ?').get(taskId) as { cancelRequested: number };
  return task?.cancelRequested === 1;
}
