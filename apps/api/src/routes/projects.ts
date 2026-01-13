import { Router } from 'express';
import { db } from '../db/database';
import { createProjectSchema } from '@devcenter/shared';
import type { Project } from '@devcenter/shared';

const router = Router();

router.get('/projects', (req, res) => {
  const projects = db.query('SELECT * FROM projects ORDER BY createdAt DESC').all() as Project[];
  res.json(projects);
});

router.post('/projects', (req, res) => {
  try {
    const data = createProjectSchema.parse(req.body);
    
    const id = `project-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const createdAt = new Date().toISOString();
    
    db.prepare(
      'INSERT INTO projects (id, name, path, defaultDevPort, createdAt) VALUES (?, ?, ?, ?, ?)'
    ).run(id, data.name, data.path, data.defaultDevPort, createdAt);
    
    const project = db.query('SELECT * FROM projects WHERE id = ?').get(id) as Project;
    res.status(201).json(project);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
