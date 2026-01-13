import type { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = process.env.CONTROL_PLANE_TOKEN;
  
  if (!token) {
    return res.status(500).json({ error: 'Server misconfigured: CONTROL_PLANE_TOKEN not set' });
  }
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
  }
  
  const providedToken = authHeader.substring(7);
  
  if (providedToken !== token) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
  
  next();
}
