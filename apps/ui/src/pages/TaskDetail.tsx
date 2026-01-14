import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, getApiToken } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, XCircle, ExternalLink } from 'lucide-react';
import type { TaskDetailResponse, WSServerMessage } from '@devcenter/shared';

const statusColors = {
  pending: 'bg-yellow-500',
  running: 'bg-blue-500',
  success: 'bg-green-500',
  failed: 'bg-red-500',
  cancelled: 'bg-gray-500',
};

export function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskDetailResponse | null>(null);
  const [logs, setLogs] = useState<Array<{ ts: string; stream: string; line: string }>>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const [cancelling, setCancelling] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadTask = async () => {
      try {
        const data = await api.getTask(id);
        setTask(data);
        // Only load logs on initial load, not on refresh (WebSocket handles updates)
        if (logs.length === 0 && data.logs) {
          setLogs(data.logs.map((l: { ts: string; stream: string; line: string }) => ({ ts: l.ts, stream: l.stream, line: l.line })));
        }
      } catch (error) {
        console.error('Failed to load task:', error);
      }
    };

    loadTask();

    // Determine WebSocket URL
    const token = getApiToken();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
    let wsUrl: string;
    
    if (API_BASE_URL) {
      // Use explicit API base URL
      const apiUrl = new URL(API_BASE_URL);
      const wsProtocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${wsProtocol}//${apiUrl.host}/ws?token=${token}`;
    } else {
      // Use relative path (local dev with Vite proxy)
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.host;
      wsUrl = `${wsProtocol}//${wsHost}/ws?token=${token}`;
    }
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', taskId: id }));
    };

    ws.onmessage = (event) => {
      const message: WSServerMessage = JSON.parse(event.data);
      if (message.type === 'log' && message.taskId === id) {
        setLogs((prev) => [...prev, { ts: message.ts, stream: message.stream, line: message.line }]);
      } else if (message.type === 'status' && message.taskId === id) {
        // Update task status immediately
        setTask((prev) => prev ? { ...prev, status: message.status } : null);
      }
    };

    wsRef.current = ws;

    const interval = setInterval(loadTask, 5000);

    return () => {
      ws.close();
      clearInterval(interval);
    };
  }, [id]);

  useEffect(() => {
    if (autoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleScroll = () => {
    if (!logsContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold
    
    setAutoScroll(isAtBottom);
  };

  const handleCancel = async () => {
    if (!id || !task) return;
    setCancelling(true);
    try {
      await api.cancelTask(id);
    } catch (error: any) {
      alert(`Failed to cancel: ${error.message}`);
    } finally {
      setCancelling(false);
    }
  };

  if (!task) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  const previewUrl = task.artifacts.find(a => a.type === 'preview_url')?.value;
  const diffSummary = task.artifacts.find(a => a.type === 'diff_summary')?.value;
  const notes = task.artifacts.find(a => a.type === 'notes')?.value;
  const transcript = task.artifacts.find(a => a.type === 'command_transcript')?.value;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={statusColors[task.status as keyof typeof statusColors]}>
                    {task.status}
                  </Badge>
                </div>
                <CardTitle>Task #{task.id.slice(-8)}</CardTitle>
                <CardDescription>
                  {task.project.name} • {task.recipe.name}
                </CardDescription>
              </div>
              {(task.status === 'running' || task.status === 'pending') && (
                <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>{' '}
                {new Date(task.createdAt).toLocaleString()}
              </div>
              {task.startedAt && (
                <div>
                  <span className="text-muted-foreground">Started:</span>{' '}
                  {new Date(task.startedAt).toLocaleString()}
                </div>
              )}
              {task.endedAt && (
                <div>
                  <span className="text-muted-foreground">Ended:</span>{' '}
                  {new Date(task.endedAt).toLocaleString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {task.artifacts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Artifacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {previewUrl && (
                <div>
                  <Label className="text-sm font-semibold">Preview URL</Label>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-500 hover:underline"
                  >
                    {previewUrl}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
              {diffSummary && (
                <div>
                  <Label className="text-sm font-semibold">Diff Summary</Label>
                  <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">{diffSummary}</pre>
                </div>
              )}
              {notes && (
                <div>
                  <Label className="text-sm font-semibold">Notes</Label>
                  <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto whitespace-pre-wrap">{notes}</pre>
                </div>
              )}
              {transcript && (
                <div>
                  <Label className="text-sm font-semibold">Command Transcript</Label>
                  <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">{transcript}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Live Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={logsContainerRef}
              onScroll={handleScroll}
              className="bg-black text-green-400 p-4 rounded font-mono text-xs overflow-y-auto max-h-96"
            >
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={log.stream === 'stderr' ? 'text-red-400' : ''}>
                    {log.line}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={className} {...props} />;
}
