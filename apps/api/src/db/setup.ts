import { db } from './database';
import { schema } from './schema';
import { seedProjects, seedRecipes } from './seed';

console.log('Setting up database...');

// Create tables
db.exec(schema);
console.log('✓ Tables created');

// Seed projects
const existingProjects = db.query('SELECT COUNT(*) as count FROM projects').get() as { count: number };
if (existingProjects.count === 0) {
  const insertProject = db.prepare(
    'INSERT INTO projects (id, name, path, defaultDevPort, createdAt) VALUES (?, ?, ?, ?, ?)'
  );
  
  for (const project of seedProjects) {
    insertProject.run(
      project.id,
      project.name,
      project.path,
      project.defaultDevPort,
      new Date().toISOString()
    );
  }
  console.log(`✓ Seeded ${seedProjects.length} projects`);
} else {
  console.log('✓ Projects already exist, skipping seed');
}

// Seed recipes
const existingRecipes = db.query('SELECT COUNT(*) as count FROM recipes').get() as { count: number };
if (existingRecipes.count === 0) {
  const insertRecipe = db.prepare(
    'INSERT INTO recipes (id, name, description, stepsJson, createdAt) VALUES (?, ?, ?, ?, ?)'
  );
  
  for (const recipe of seedRecipes) {
    insertRecipe.run(
      recipe.id,
      recipe.name,
      recipe.description,
      JSON.stringify(recipe.steps),
      new Date().toISOString()
    );
  }
  console.log(`✓ Seeded ${seedRecipes.length} recipes`);
} else {
  console.log('✓ Recipes already exist, skipping seed');
}

console.log('✓ Database setup complete!');
process.exit(0);
