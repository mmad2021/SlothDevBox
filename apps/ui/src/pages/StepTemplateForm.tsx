import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

export function StepTemplateForm() {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('command');
  const [configSchema, setConfigSchema] = useState(JSON.stringify({
    type: 'object',
    properties: {},
    required: []
  }, null, 2));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !name || !description || !type || !configSchema) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate JSON schema
    try {
      JSON.parse(configSchema);
    } catch (error) {
      alert('Invalid JSON in Config Schema');
      return;
    }

    setSubmitting(true);
    try {
      await api.createStepTemplate({ id, name, description, type, configSchema });
      navigate('/step-templates');
    } catch (error: any) {
      alert(`Failed to create step template: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const templateExamples: Record<string, any> = {
    command: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Command to execute' },
        args: { type: 'array', items: { type: 'string' }, description: 'Arguments' }
      },
      required: ['command']
    },
    start_preview: {
      type: 'object',
      properties: {
        command: { type: 'string' },
        args: { type: 'array', items: { type: 'string' } },
        detectReady: { type: 'string', description: 'Ready pattern' },
        keepAlive: { type: 'boolean' }
      },
      required: ['command', 'detectReady']
    },
    git: {
      type: 'object',
      properties: {
        subcommand: { type: 'string', description: 'Git subcommand' },
        args: { type: 'array', items: { type: 'string' } }
      },
      required: ['subcommand']
    },
    check_path: {
      type: 'object',
      properties: {},
      required: []
    },
    copilot: {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['explain', 'fix', 'implement', 'review'] }
      },
      required: ['mode']
    }
  };

  const loadExample = () => {
    setConfigSchema(JSON.stringify(templateExamples[type] || templateExamples.command, null, 2));
  };

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center gap-2 px-4 py-2">
          <Link to="/step-templates">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">New Step Template</h1>
        </div>
      </header>
      <main className="px-6 py-4">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl mx-auto">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">Step Template Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="id">Template ID *</Label>
                <Input
                  id="id"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="e.g., run-npm-build"
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
                  placeholder="e.g., Run NPM Build"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this step does"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type *</Label>
                <select
                  id="type"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="command">command</option>
                  <option value="start_preview">start_preview</option>
                  <option value="git">git</option>
                  <option value="copilot">copilot</option>
                  <option value="check_path">check_path</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Config Schema (JSON Schema)</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={loadExample}>
                  Load Example
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={configSchema}
                onChange={(e) => setConfigSchema(e.target.value)}
                placeholder="JSON Schema definition"
                className="font-mono text-xs"
                rows={15}
                required
              />
              <p className="text-xs text-muted-foreground">
                Define the configuration fields this step type requires (JSON Schema format)
              </p>
            </CardContent>
          </Card>
          
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Template'}
            </Button>
            <Link to="/step-templates">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
