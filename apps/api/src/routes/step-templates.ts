import { Router } from 'express';
import { db } from '../db/database';
import type { StepTemplate } from '@devcenter/shared';

const router = Router();

router.get('/step-templates', (req, res) => {
  const templates = db.query('SELECT * FROM step_templates ORDER BY name ASC').all() as StepTemplate[];
  res.json(templates);
});

router.get('/step-templates/:id', (req, res) => {
  const template = db.query('SELECT * FROM step_templates WHERE id = ?').get(req.params.id) as StepTemplate | undefined;
  if (!template) {
    return res.status(404).json({ error: 'Step template not found' });
  }
  res.json(template);
});

router.post('/step-templates', (req, res) => {
  const { id, name, description, type, configSchema } = req.body;
  
  if (!id || !name || !description || !type || !configSchema) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Validate that configSchema is valid JSON
    JSON.parse(configSchema);
    
    const createdAt = new Date().toISOString();
    
    db.query(
      'INSERT INTO step_templates (id, name, description, type, configSchema, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, name, description, type, configSchema, createdAt);
    
    res.json({ id, name, description, type, configSchema, createdAt });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/step-templates/:id', (req, res) => {
  const { name, description, type, configSchema } = req.body;
  
  if (!name || !description || !type || !configSchema) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Validate that configSchema is valid JSON
    JSON.parse(configSchema);
    
    const result = db.query(
      'UPDATE step_templates SET name = ?, description = ?, type = ?, configSchema = ? WHERE id = ?'
    ).run(name, description, type, configSchema, req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Step template not found' });
    }
    
    const template = db.query('SELECT * FROM step_templates WHERE id = ?').get(req.params.id);
    res.json(template);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/step-templates/:id', (req, res) => {
  try {
    const result = db.query('DELETE FROM step_templates WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Step template not found' });
    }
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
