export const schema = `
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  defaultDevPort INTEGER NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  stepsJson TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  recipeId TEXT NOT NULL,
  status TEXT NOT NULL,
  inputJson TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  startedAt TEXT,
  endedAt TEXT,
  cancelRequested INTEGER DEFAULT 0,
  error TEXT,
  FOREIGN KEY (projectId) REFERENCES projects(id),
  FOREIGN KEY (recipeId) REFERENCES recipes(id)
);

CREATE TABLE IF NOT EXISTS task_logs (
  id TEXT PRIMARY KEY,
  taskId TEXT NOT NULL,
  ts TEXT NOT NULL,
  stream TEXT NOT NULL,
  line TEXT NOT NULL,
  FOREIGN KEY (taskId) REFERENCES tasks(id)
);

CREATE TABLE IF NOT EXISTS task_artifacts (
  id TEXT PRIMARY KEY,
  taskId TEXT NOT NULL,
  type TEXT NOT NULL,
  value TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (taskId) REFERENCES tasks(id)
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(createdAt);
CREATE INDEX IF NOT EXISTS idx_task_logs_task ON task_logs(taskId);
CREATE INDEX IF NOT EXISTS idx_task_artifacts_task ON task_artifacts(taskId);
`;
