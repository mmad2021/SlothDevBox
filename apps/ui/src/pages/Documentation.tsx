import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function Documentation() {
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch README from multiple sources with fallback
    const fetchDocs = async () => {
      try {
        // Try to fetch from local public folder first
        let response = await fetch('/README.md');
        
        // If not found locally, try GitHub
        if (!response.ok) {
          // Update this URL to your actual GitHub repository
          response = await fetch('https://raw.githubusercontent.com/yourusername/SlothDevBox/master/README.md');
        }
        
        if (!response.ok) {
          throw new Error('Documentation not found');
        }
        
        const text = await response.text();
        setMarkdown(text);
      } catch (error) {
        console.error('Failed to load documentation:', error);
        // Provide embedded documentation as fallback
        setMarkdown(`# 🦥 SlothDevBox

> A self-hosted dev task automation platform

## Quick Start

SlothDevBox is a remote development automation server with a mobile-friendly web interface.

### Features

- 📱 Mobile-First UI with dark mode
- 🔄 Live streaming logs via WebSocket
- 🧩 Step Templates system for reusable configurations
- 🎯 Visual Recipe Builder
- 🤖 GitHub Copilot integration
- 🔒 Secure token-based authentication

### Getting Started

1. **Setup Database**
   \`\`\`bash
   bun run db:setup
   \`\`\`

2. **Start Services**
   \`\`\`bash
   bun run dev
   \`\`\`

3. **Access UI**
   Open http://localhost:5173

### Usage

1. **Add Projects** - Define your development projects
2. **Create Step Templates** - Build reusable step configurations
3. **Build Recipes** - Combine steps into automation workflows
4. **Run Tasks** - Execute recipes with live log streaming

### Step Templates

Step templates define reusable configurations:
- \`check_path\` - Validates project directory
- \`command\` - Run shell commands
- \`start_preview\` - Launch dev servers
- \`git\` - Git operations
- \`copilot\` - GitHub Copilot integration

### Remote Access

Use ngrok, Tailscale, or Cloudflare Tunnel for remote access.

### Documentation

For complete documentation, visit the [GitHub repository](https://github.com/yourusername/SlothDevBox).

### Tech Stack

- Runtime: Bun
- Backend: Express + TypeScript
- Frontend: Vite + React + shadcn/ui
- Database: SQLite

---

*Note: Full documentation failed to load. Please check your internet connection or visit the GitHub repository.*
`);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Documentation</h1>
              <p className="text-muted-foreground">Complete guide to SlothDevBox</p>
            </div>
          </div>
          <a 
            href="https://github.com/yourusername/SlothDevBox" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              View on GitHub
            </Button>
          </a>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading documentation...</div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <CardTitle>README.md</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
                    h4: ({node, ...props}) => <h4 className="text-lg font-semibold mt-3 mb-2" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 leading-7" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                    li: ({node, ...props}) => <li className="leading-7" {...props} />,
                    code: ({node, inline, ...props}: any) => 
                      inline ? (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                      ) : (
                        <code className="block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono" {...props} />
                      ),
                    pre: ({node, ...props}) => <pre className="mb-4 overflow-hidden" {...props} />,
                    a: ({node, ...props}) => (
                      <a 
                        className="text-primary hover:underline" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        {...props} 
                      />
                    ),
                    table: ({node, ...props}) => (
                      <div className="overflow-x-auto mb-4">
                        <table className="min-w-full border border-border" {...props} />
                      </div>
                    ),
                    th: ({node, ...props}) => (
                      <th className="border border-border px-4 py-2 bg-muted font-semibold text-left" {...props} />
                    ),
                    td: ({node, ...props}) => (
                      <td className="border border-border px-4 py-2" {...props} />
                    ),
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic my-4" {...props} />
                    ),
                    hr: ({node, ...props}) => <hr className="my-8 border-border" {...props} />,
                  }}
                >
                  {markdown}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
