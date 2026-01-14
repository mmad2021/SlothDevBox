import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2, Folder } from 'lucide-react';
import { FolderBrowser } from '@/components/FolderBrowser';
import type { Project } from '@devcenter/shared';

export function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showFolderBrowser, setShowFolderBrowser] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    path: '',
    defaultDevPort: 5174,
  });
  const [submitting, setSubmitting] = useState(false);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleFolderSelect = (path: string) => {
    setFormData({ ...formData, path });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.createProject(formData);
      setFormData({ name: '', path: '', defaultDevPort: 5174 });
      setShowForm(false);
      await loadProjects();
    } catch (error: any) {
      alert(`Failed to create project: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Projects</h1>
          </div>
          <Button size="sm" className="h-8 px-2" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="px-6 py-4">

        {showForm && (
          <Card className="mb-4">
            <CardHeader className="py-3">
              <CardTitle className="text-base">Add New Project</CardTitle>
            <CardDescription>
              Add a project to run tasks against. Use absolute paths.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Web App"
                  required
                />
              </div>

              <div>
                <Label htmlFor="path">Project Path</Label>
                <div className="flex gap-2">
                  <Input
                    id="path"
                    value={formData.path}
                    onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                    placeholder="/Users/username/projects/my-app"
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowFolderBrowser(true)}
                    title="Browse folders"
                  >
                    <Folder className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Absolute path to the project directory
                </p>
              </div>

              <div>
                <Label htmlFor="port">Default Dev Port</Label>
                <Input
                  id="port"
                  type="number"
                  value={formData.defaultDevPort}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultDevPort: parseInt(e.target.value) })
                  }
                  min="1024"
                  max="65535"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Port for Vite dev server (usually 5173-5175)
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Project'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: '', path: '', defaultDevPort: 5174 });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : projects.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No projects yet</CardTitle>
            <CardDescription>Add your first project to get started</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle>{project.name}</CardTitle>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Path:</span> {project.path}
                      </div>
                      <div>
                        <span className="font-medium">Dev Port:</span> {project.defaultDevPort}
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">Created:</span>{' '}
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {/* Future: Add delete functionality if needed
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  */}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <FolderBrowser
        isOpen={showFolderBrowser}
        onClose={() => setShowFolderBrowser(false)}
        onSelect={handleFolderSelect}
        initialPath={formData.path || undefined}
      />
      </main>
    </div>
  );
}
