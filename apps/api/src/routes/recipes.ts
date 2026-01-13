import { Router } from 'express';
import { db } from '../db/database';
import type { Recipe } from '@devcenter/shared';

const router = Router();

router.get('/recipes', (req, res) => {
  const recipes = db.query('SELECT * FROM recipes ORDER BY name ASC').all() as Recipe[];
  res.json(recipes);
});

export default router;
