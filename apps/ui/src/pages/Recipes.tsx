import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Pencil, Trash2, Code } from 'lucide-react';
import type { Recipe } from '@devcenter/shared';

export function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const loadRecipes = async () => {
    try {
      const data = await api.getRecipes();
      setRecipes(data);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    
    try {
      await api.deleteRecipe(id);
      await loadRecipes();
    } catch (error: any) {
      alert(`Failed to delete: ${error.message}`);
    }
  };

  const parseSteps = (recipe: Recipe) => {
    try {
      return JSON.parse(recipe.stepsJson);
    } catch {
      return [];
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Recipes</h1>
          </div>
          <Link to="/recipes/new">
            <Button size="sm" className="h-8 px-2">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>
      <main className="px-6 py-4">
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              {recipes.map((recipe) => (
                <Card 
                  key={recipe.id}
                  className={`cursor-pointer transition-colors ${
                    selectedRecipe?.id === recipe.id ? 'border-primary' : 'hover:bg-accent'
                  }`}
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{recipe.name}</CardTitle>
                        <CardDescription className="mt-1">{recipe.description}</CardDescription>
                        <div className="mt-2">
                          <Badge variant="outline">
                            {parseSteps(recipe).length} steps
                          </Badge>
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
                            handleDelete(recipe.id);
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
              {selectedRecipe ? (
                <Card className="sticky top-4">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      <CardTitle>Recipe Details</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm font-semibold mb-1">Name</div>
                      <div className="text-sm text-muted-foreground">{selectedRecipe.name}</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-1">Description</div>
                      <div className="text-sm text-muted-foreground">{selectedRecipe.description}</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-1">ID</div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{selectedRecipe.id}</code>
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-2">Steps</div>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        {JSON.stringify(parseSteps(selectedRecipe), null, 2)}
                      </pre>
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-1">Created</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(selectedRecipe.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Select a recipe to view details
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
