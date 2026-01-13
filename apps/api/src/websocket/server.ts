import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { WSClientMessage, WSServerMessage } from '@devcenter/shared';

const clients = new Map<WebSocket, Set<string>>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ noServer: true });
  
  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url!, `http://${request.headers.host}`);
    
    if (url.pathname === '/ws') {
      const token = url.searchParams.get('token');
      const expectedToken = process.env.CONTROL_PLANE_TOKEN;
      
      if (!expectedToken || token !== expectedToken) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }
      
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });
  
  wss.on('connection', (ws) => {
    clients.set(ws, new Set());
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString()) as WSClientMessage;
        
        if (message.type === 'subscribe') {
          const taskIds = clients.get(ws);
          if (taskIds) {
            taskIds.add(message.taskId);
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      clients.delete(ws);
    });
  });
  
  return wss;
}

export function broadcastLog(message: WSServerMessage) {
  const data = JSON.stringify(message);
  
  for (const [ws, taskIds] of clients.entries()) {
    if (taskIds.has(message.taskId)) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    }
  }
}
