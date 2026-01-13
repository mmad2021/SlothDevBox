import { Router } from 'express';
import { db } from '../db/database';
import { createTaskSchema, postLogSchema, postArtifactSchema, TaskStatus } from '@devcenter/shared';
import type { Task, Project, Recipe, TaskArtifact, TaskLog, TaskDetailResponse } from '@devcenter/shared';
import { broadcastLog } from '../websocket/server';

const router = Router();

router.get('/tasks', (req, res) => {
  const tasks = db.query('SELECT * FROM tasks ORDER BY createdAt DESC').all() as Task[];
  res.json(tasks);
});

router.get('/tasks/:id', (req, res) => {
  const { id } = req.params;
  
  const task = db.query('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined;
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const project = db.query('SELECT * FROM projects WHERE id = ?').get(task.projectId) as Project;
  const recipe = db.query('SELECT * FROM recipes WHERE id = ?').get(task.recipeId) as Recipe;
  const artifacts = db.query('SELECT * FROM task_artifacts WHERE taskId = ?').all(id) as TaskArtifact[];
  const logs = db.query('SELECT * FROM task_logs WHERE taskId = ? ORDER BY ts ASC').all(id) as TaskLog[];
  
  const response: TaskDetailResponse = {
    ...task,
    project,
    recipe,
    artifacts,
    logs,
  };
  
  res.json(response);
});

router.post('/tasks', (req, res) => {
  try {
    const data = createTaskSchema.parse(req.body);
    
    const id = `task-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const createdAt = new Date().toISOString();
    
    db.prepare(
      'INSERT INTO tasks (id, projectId, recipeId, status, inputJson, createdAt, startedAt, endedAt, cancelRequested, error) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      id,
      data.projectId,
      data.recipeId,
      TaskStatus.PENDING,
      JSON.stringify(data.input),
      createdAt,
      null,
      null,
      0,
      null
    );
    
    const task = db.query('SELECT * FROM tasks WHERE id = ?').get(id) as Task;
    res.status(201).json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/tasks/:id/cancel', (req, res) => {
  const { id } = req.params;
  
  const task = db.query('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined;
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  if (task.status !== TaskStatus.RUNNING && task.status !== TaskStatus.PENDING) {
    return res.status(400).json({ error: 'Task is not running or pending' });
  }
  
  db.prepare('UPDATE tasks SET cancelRequested = 1 WHERE id = ?').run(id);
  
  res.json({ success: true });
});

router.post('/tasks/:id/logs', (req, res) => {
  const { id } = req.params;
  
  try {
    const data = postLogSchema.parse(req.body);
    
    const logId = `log-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    db.prepare(
      'INSERT INTO task_logs (id, taskId, ts, stream, line) VALUES (?, ?, ?, ?, ?)'
    ).run(logId, id, data.ts, data.stream, data.line);
    
    // Broadcast via WebSocket
    broadcastLog({
      type: 'log',
      taskId: id,
      ts: data.ts,
      stream: data.stream,
      line: data.line,
    });
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/tasks/:id/artifacts', (req, res) => {
  const { id } = req.params;
  
  try {
    const data = postArtifactSchema.parse(req.body);
    
    const artifactId = `artifact-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const createdAt = new Date().toISOString();
    
    db.prepare(
      'INSERT INTO task_artifacts (id, taskId, type, value, createdAt) VALUES (?, ?, ?, ?, ?)'
    ).run(artifactId, id, data.type, data.value, createdAt);
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
