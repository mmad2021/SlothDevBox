import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import type { Project, Recipe } from '@devcenter/shared';

export function NewTask() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [projectId, setProjectId] = useState('');
  const [recipeId, setRecipeId] = useState('');
  const [goal, setGoal] = useState('');
  const [branchSlug, setBranchSlug] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.getProjects(), api.getRecipes()]).then(([p, r]) => {
      setProjects(p);
      setRecipes(r);
      if (p.length > 0) setProjectId(p[0].id);
      if (r.length > 0) setRecipeId(r[0].id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const task = await api.createTask({
        projectId,
        recipeId,
        input: { goal, branchSlug },
      });
      navigate(`/tasks/${task.id}`);
    } catch (error: any) {
      alert(`Failed to create task: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Task</CardTitle>
          <CardDescription>Configure and submit a development task</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="project">Project</Label>
              <select
                id="project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="recipe">Recipe</Label>
              <select
                id="recipe"
                value={recipeId}
                onChange={(e) => setRecipeId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              {recipes.find((r) => r.id === recipeId) && (
                <p className="text-sm text-muted-foreground mt-1">
                  {recipes.find((r) => r.id === recipeId)!.description}
                </p>
              )}
            </div>

            {/* Show selected project info for scaffold recipes */}
            {recipeId.startsWith('scaffold-') && projects.find((p) => p.id === projectId) && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium">Project will be scaffolded at:</p>
                <p className="text-sm font-mono text-muted-foreground">
                  {projects.find((p) => p.id === projectId)!.path}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ This directory should be empty or the scaffold may fail.
                </p>
              </div>
            )}

            {/* Show goal/branch fields for non-scaffold recipes */}
            {!recipeId.startsWith('scaffold-') && (
              <>
                <div>
                  <Label htmlFor="goal">Goal / Prompt (optional)</Label>
                  <Textarea
                    id="goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="Describe what you want to achieve..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="branch">Branch Slug (optional)</Label>
                  <Input
                    id="branch"
                    value={branchSlug}
                    onChange={(e) => setBranchSlug(e.target.value)}
                    placeholder="feature-name"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Task'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
