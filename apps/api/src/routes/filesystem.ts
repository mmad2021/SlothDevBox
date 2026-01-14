import { Router } from 'express';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import os from 'os';

const router = Router();

interface DirectoryEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

// Get list of directories in a path
router.get('/filesystem/browse', (req, res) => {
  const requestedPath = (req.query.path as string) || os.homedir();
  
  try {
    const entries: DirectoryEntry[] = [];
    const items = readdirSync(requestedPath);
    
    for (const item of items) {
      // Skip hidden files/folders (starting with .)
      if (item.startsWith('.')) continue;
      
      try {
        const fullPath = join(requestedPath, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          entries.push({
            name: item,
            path: fullPath,
            isDirectory: true,
          });
        }
      } catch {
        // Skip files/folders we can't access
        continue;
      }
    }
    
    // Sort directories alphabetically
    entries.sort((a, b) => a.name.localeCompare(b.name));
    
    res.json({
      currentPath: requestedPath,
      parentPath: requestedPath === '/' ? null : join(requestedPath, '..'),
      entries,
    });
  } catch (error: any) {
    res.status(400).json({ 
      error: `Cannot access path: ${error.message}`,
      currentPath: requestedPath,
      parentPath: null,
      entries: [],
    });
  }
});

// Get common starting paths (home, common dev directories)
router.get('/filesystem/roots', (req, res) => {
  const homeDir = os.homedir();
  const roots = [
    { name: 'Home', path: homeDir },
    { name: 'Root', path: '/' },
  ];
  
  // Add common dev directories if they exist
  const commonPaths = [
    join(homeDir, 'projects'),
    join(homeDir, 'Projects'),
    join(homeDir, 'dev'),
    join(homeDir, 'Development'),
    join(homeDir, 'code'),
    join(homeDir, 'Code'),
    join(homeDir, 'workspace'),
    join(homeDir, 'Workspace'),
    join(homeDir, 'repos'),
    join(homeDir, 'playground'),
  ];
  
  for (const p of commonPaths) {
    try {
      const stat = statSync(p);
      if (stat.isDirectory()) {
        roots.push({ name: p.split('/').pop() || p, path: p });
      }
    } catch {
      // Path doesn't exist, skip
    }
  }
  
  res.json(roots);
});

export default router;
