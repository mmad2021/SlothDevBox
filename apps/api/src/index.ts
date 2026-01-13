import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import path from 'path';
import { authMiddleware } from './middleware/auth';
import healthRoutes from './routes/health';
import projectsRoutes from './routes/projects';
import recipesRoutes from './routes/recipes';
import stepTemplatesRoutes from './routes/step-templates';
import tasksRoutes from './routes/tasks';
import { setupWebSocket } from './websocket/server';

const app = express();
const server = createServer(app);

// Enable CORS for development/remote access
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: true, // Allow all origins in dev
    credentials: true,
  }));
}

app.use(express.json());

// Health check (no auth)
app.use('/api', healthRoutes);

// Protected API routes
app.use('/api', authMiddleware);
app.use('/api', projectsRoutes);
app.use('/api', recipesRoutes);
app.use('/api', stepTemplatesRoutes);
app.use('/api', tasksRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const uiPath = path.join(import.meta.dir, '../../ui/dist');
  app.use(express.static(uiPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(uiPath, 'index.html'));
  });
}

// Setup WebSocket
setupWebSocket(server);

const PORT = process.env.PORT || 8787;

server.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket available at ws://localhost:${PORT}/ws`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Frontend served from /`);
  }
});
