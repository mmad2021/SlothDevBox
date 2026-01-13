import { Router } from 'express';
import { db } from '../db/database';
import type { Recipe, RecipeStep } from '@devcenter/shared';

const router = Router();

router.get('/recipes', (req, res) => {
  const recipes = db.query('SELECT * FROM recipes ORDER BY name ASC').all() as Recipe[];
  res.json(recipes);
});

router.get('/recipes/:id', (req, res) => {
  const recipe = db.query('SELECT * FROM recipes WHERE id = ?').get(req.params.id) as Recipe | undefined;
  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found' });
  }
  res.json(recipe);
});

router.post('/recipes', (req, res) => {
  const { id, name, description, steps } = req.body;
  
  if (!id || !name || !description || !steps) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const stepsJson = JSON.stringify(steps);
    const createdAt = new Date().toISOString();
    
    db.query(
      'INSERT INTO recipes (id, name, description, stepsJson, createdAt) VALUES (?, ?, ?, ?, ?)'
    ).run(id, name, description, stepsJson, createdAt);
    
    res.json({ id, name, description, stepsJson, createdAt });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/recipes/:id', (req, res) => {
  const { name, description, steps } = req.body;
  
  if (!name || !description || !steps) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const stepsJson = JSON.stringify(steps);
    
    const result = db.query(
      'UPDATE recipes SET name = ?, description = ?, stepsJson = ? WHERE id = ?'
    ).run(name, description, stepsJson, req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    const recipe = db.query('SELECT * FROM recipes WHERE id = ?').get(req.params.id);
    res.json(recipe);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/recipes/:id', (req, res) => {
  try {
    const result = db.query('DELETE FROM recipes WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
