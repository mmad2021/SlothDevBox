import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, clearApiToken } from '@/lib/api';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, FolderOpen, Moon, Sun, LogOut, BookOpen } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import type { Task } from '@devcenter/shared';

const statusColors = {
  pending: 'bg-yellow-500',
  running: 'bg-blue-500',
  success: 'bg-green-500',
  failed: 'bg-red-500',
  cancelled: 'bg-gray-500',
};

export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearApiToken();
    navigate('/login');
  };

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
      // Don't show error if redirecting to login (401)
      if (!error.message?.includes('Unauthorized')) {
        // Could show a toast notification here
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">SlothDevBox</h1>
          <p className="text-muted-foreground">Manage your development tasks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={toggleTheme} title="Toggle theme">
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
          <Link to="/recipes">
            <Button variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              Recipes
            </Button>
          </Link>
          <Link to="/projects">
            <Button variant="outline">
              <FolderOpen className="h-4 w-4 mr-2" />
              Projects
            </Button>
          </Link>
          <Button variant="outline" size="icon" onClick={loadTasks}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link to="/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No tasks yet</CardTitle>
            <CardDescription>Create your first task to get started</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Link key={task.id} to={`/tasks/${task.id}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={statusColors[task.status as keyof typeof statusColors]}>
                          {task.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{task.id}</span>
                      </div>
                      <CardTitle className="text-lg">Task #{task.id.slice(-8)}</CardTitle>
                      <CardDescription>
                        Created {new Date(task.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
