import { Database } from 'bun:sqlite';
import path from 'path';
import { mkdirSync } from 'fs';

const DB_PATH = process.env.DB_PATH || '/Users/aungsithu/playground/SlothDevBox/data/devcenter.db';

export function getDatabase() {
  const dbDir = path.dirname(DB_PATH);
  
  // Ensure directory exists
  mkdirSync(dbDir, { recursive: true });
  
  const db = new Database(DB_PATH, { create: true });
  db.exec('PRAGMA journal_mode = WAL;');
  return db;
}

export const db = getDatabase();
