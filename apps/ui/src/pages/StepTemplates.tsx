import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Pencil, Trash2, Code } from 'lucide-react';
import type { StepTemplate } from '@devcenter/shared';

export function StepTemplates() {
  const [templates, setTemplates] = useState<StepTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<StepTemplate | null>(null);

  const loadTemplates = async () => {
    try {
      const data = await api.getStepTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load step templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this step template?')) return;
    
    try {
      await api.deleteStepTemplate(id);
      await loadTemplates();
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
      }
    } catch (error: any) {
      alert(`Failed to delete: ${error.message}`);
    }
  };

  const parseConfigSchema = (template: StepTemplate) => {
    try {
      return JSON.parse(template.configSchema);
    } catch {
      return {};
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link to="/recipes">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Step Templates</h1>
              <p className="text-muted-foreground">Manage reusable step configurations</p>
            </div>
          </div>
          <Link to="/step-templates/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              {templates.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id ? 'border-primary' : 'hover:bg-accent'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">{template.description}</CardDescription>
                        <div className="mt-2">
                          <Badge variant="secondary">{template.type}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          disabled
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(template.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div>
              {selectedTemplate ? (
                <Card className="sticky top-4">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      <CardTitle>Template Details</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm font-semibold mb-1">Name</div>
                      <div className="text-sm text-muted-foreground">{selectedTemplate.name}</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-1">Description</div>
                      <div className="text-sm text-muted-foreground">{selectedTemplate.description}</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-1">Type</div>
                      <Badge variant="secondary">{selectedTemplate.type}</Badge>
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-1">ID</div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{selectedTemplate.id}</code>
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-2">Config Schema</div>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        {JSON.stringify(parseConfigSchema(selectedTemplate), null, 2)}
                      </pre>
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-1">Created</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(selectedTemplate.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Select a template to view details
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
