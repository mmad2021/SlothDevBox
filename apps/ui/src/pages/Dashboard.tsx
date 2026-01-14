import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, clearApiToken } from '@/lib/api';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, RefreshCw, FolderOpen, Moon, Sun, LogOut, BookOpen, Book, User } from 'lucide-react';
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
    <div className="min-h-screen">
      {/* Compact header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-2">
          <h1 className="text-lg font-semibold">SlothDevBox</h1>
          
          <nav className="flex items-center gap-1">
            <Link to="/new">
              <Button variant="ghost" size="sm" className="h-8 px-2" title="New Task">
                <Plus className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/projects">
              <Button variant="ghost" size="sm" className="h-8 px-2" title="Projects">
                <FolderOpen className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/recipes">
              <Button variant="ghost" size="sm" className="h-8 px-2" title="Recipes">
                <BookOpen className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button variant="ghost" size="sm" className="h-8 px-2" title="Documentation">
                <Book className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={loadTasks} title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === 'light' ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      {/* Main content - full width */}
      <main className="px-6 py-4">

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : tasks.length === 0 ? (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>No tasks yet</CardTitle>
              <CardDescription>Create your first task to get started</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Link key={task.id} to={`/tasks/${task.id}`}>
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardHeader className="py-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={statusColors[task.status as keyof typeof statusColors]}>
                            {task.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{task.id}</span>
                        </div>
                        <CardTitle className="text-base">Task #{task.id.slice(-8)}</CardTitle>
                        <CardDescription className="text-xs">
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
      </main>
    </div>
  );
}
