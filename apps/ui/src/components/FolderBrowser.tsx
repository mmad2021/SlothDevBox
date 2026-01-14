import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, FolderOpen, ChevronUp, Home, X, Check } from 'lucide-react';

interface DirectoryEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

interface BrowseResponse {
  currentPath: string;
  parentPath: string | null;
  entries: DirectoryEntry[];
}

interface RootEntry {
  name: string;
  path: string;
}

interface FolderBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  initialPath?: string;
}

export function FolderBrowser({ isOpen, onClose, onSelect, initialPath }: FolderBrowserProps) {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [parentPath, setParentPath] = useState<string | null>(null);
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [roots, setRoots] = useState<RootEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRoots();
      browsePath(initialPath || undefined);
    }
  }, [isOpen, initialPath]);

  const loadRoots = async () => {
    try {
      const data = await api.getFilesystemRoots();
      setRoots(data);
    } catch (err) {
      console.error('Failed to load roots:', err);
    }
  };

  const browsePath = async (path?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data: BrowseResponse = await api.browseFilesystem(path);
      setCurrentPath(data.currentPath);
      setParentPath(data.parentPath);
      setEntries(data.entries);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    onSelect(currentPath);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Select Project Folder
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Quick access roots */}
          <div className="flex flex-wrap gap-2">
            {roots.map((root) => (
              <Button
                key={root.path}
                variant="outline"
                size="sm"
                onClick={() => browsePath(root.path)}
                className="text-xs"
              >
                <Home className="h-3 w-3 mr-1" />
                {root.name}
              </Button>
            ))}
          </div>

          {/* Current path display */}
          <div className="bg-muted p-2 rounded-md flex items-center gap-2">
            <span className="text-sm font-mono flex-1 truncate">{currentPath}</span>
            {parentPath && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => browsePath(parentPath)}
                title="Go to parent folder"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Error display */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}

          {/* Directory listing */}
          <div className="flex-1 overflow-y-auto border rounded-md">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : entries.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No subdirectories found
              </div>
            ) : (
              <div className="divide-y">
                {entries.map((entry) => (
                  <button
                    key={entry.path}
                    className="w-full px-3 py-2 flex items-center gap-2 hover:bg-muted text-left transition-colors"
                    onClick={() => browsePath(entry.path)}
                  >
                    <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{entry.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center gap-2 pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Navigate to your project folder, then click "Select This Folder"
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSelect}>
                <Check className="h-4 w-4 mr-2" />
                Select This Folder
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
