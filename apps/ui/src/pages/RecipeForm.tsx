import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RecipeForm() {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<any[]>([
    { type: 'check_path' }
  ]);
  const [submitting, setSubmitting] = useState(false);

  const stepTypes = [
    'check_path',
    'command',
    'start_preview',
    'git',
    'copilot',
  ];

  const addStep = () => {
    setSteps([...steps, { type: 'command' }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: string, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !name || !description) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await api.createRecipe({ id, name, description, steps });
      navigate('/recipes');
    } catch (error: any) {
      alert(`Failed to create recipe: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center gap-2 px-4 py-2">
          <Link to="/recipes">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">New Recipe</h1>
        </div>
      </header>
      <main className="px-6 py-4">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl mx-auto">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">Recipe Configuration</CardTitle>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="id">Recipe ID *</Label>
                <Input
                  id="id"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="e.g., run-lint"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Unique identifier (lowercase, hyphens only)
                </p>
              </div>
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Run Linter"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this recipe does"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Steps</CardTitle>
                  <CardDescription>Define the sequence of actions</CardDescription>
                </div>
                <Button type="button" onClick={addStep} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.map((step, index) => (
                <Card key={index} className="border-2">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm">Step {index + 1}</CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStep(index)}
                        disabled={steps.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Step Type</Label>
                      <select
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        value={step.type}
                        onChange={(e) => updateStep(index, 'type', e.target.value)}
                      >
                        {stepTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {(step.type === 'command' || step.type === 'start_preview') && (
                      <>
                        <div>
                          <Label>Command</Label>
                          <Input
                            value={step.command || ''}
                            onChange={(e) => updateStep(index, 'command', e.target.value)}
                            placeholder="e.g., bun, npm, git"
                          />
                        </div>
                        <div>
                          <Label>Arguments (comma-separated)</Label>
                          <Input
                            value={step.args ? step.args.join(', ') : ''}
                            onChange={(e) => updateStep(index, 'args', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            placeholder="e.g., run, test"
                          />
                        </div>
                      </>
                    )}

                    {step.type === 'start_preview' && (
                      <>
                        <div>
                          <Label>Detect Ready Pattern</Label>
                          <Input
                            value={step.detectReady || ''}
                            onChange={(e) => updateStep(index, 'detectReady', e.target.value)}
                            placeholder="e.g., Local:"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={step.keepAlive || false}
                            onChange={(e) => updateStep(index, 'keepAlive', e.target.checked)}
                          />
                          <Label>Keep Alive</Label>
                        </div>
                      </>
                    )}

                    {step.type === 'copilot' && (
                      <div>
                        <Label>Copilot Mode</Label>
                        <Input
                          value={step.mode || ''}
                          onChange={(e) => updateStep(index, 'mode', e.target.value)}
                          placeholder="e.g., explain, fix, implement"
                        />
                      </div>
                    )}

                    {step.type === 'git' && (
                      <>
                        <div>
                          <Label>Git Subcommand</Label>
                          <Input
                            value={step.subcommand || ''}
                            onChange={(e) => updateStep(index, 'subcommand', e.target.value)}
                            placeholder="e.g., diff, checkout, branch"
                          />
                        </div>
                        <div>
                          <Label>Arguments (comma-separated)</Label>
                          <Input
                            value={step.args ? step.args.join(', ') : ''}
                            onChange={(e) => updateStep(index, 'args', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            placeholder="e.g., --stat"
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Recipe'}
            </Button>
            <Link to="/recipes">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
