import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

export function Documentation() {
  const [markdown, setMarkdown] = useState('');
  const [guideMarkdown, setGuideMarkdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeDoc, setActiveDoc] = useState<'readme' | 'guide'>('guide');

  useEffect(() => {
    // Fetch documentation from multiple sources
    const fetchDocs = async () => {
      try {
        // Fetch System Guide
        let guideResponse = await fetch('/SYSTEM_GUIDE.md');
        if (!guideResponse.ok) {
          guideResponse = await fetch('https://raw.githubusercontent.com/mmad2021/SlothDevBox/master/SYSTEM_GUIDE.md');
        }
        if (guideResponse.ok) {
          const guideText = await guideResponse.text();
          setGuideMarkdown(guideText);
        }

        // Fetch README
        let readmeResponse = await fetch('/README.md');
        if (!readmeResponse.ok) {
          readmeResponse = await fetch('https://raw.githubusercontent.com/mmad2021/SlothDevBox/master/README.md');
        }
        
        if (!readmeResponse.ok && !guideResponse.ok) {
          throw new Error('Documentation not found');
        }
        
        if (readmeResponse.ok) {
          const readmeText = await readmeResponse.text();
          setMarkdown(readmeText);
        }
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

For complete documentation, visit the [GitHub repository](https://github.com/mmad2021/SlothDevBox).

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
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={activeDoc === 'guide' ? 'default' : 'outline'}
            onClick={() => setActiveDoc('guide')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            System Guide
          </Button>
          <Button
            variant={activeDoc === 'readme' ? 'default' : 'outline'}
            onClick={() => setActiveDoc('readme')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            README
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading documentation...</div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <CardTitle>
                  {activeDoc === 'guide' ? 'Complete System Guide' : 'README.md'}
                </CardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {activeDoc === 'guide' 
                  ? 'Detailed explanation of how projects, recipes, steps, and tasks work together'
                  : 'Quick start and overview documentation'
                }
              </p>
            </CardHeader>
            <CardContent>
              <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-pre:bg-muted prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-4xl font-bold mt-8 mb-4 border-b pb-2" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-3xl font-bold mt-8 mb-4 border-b pb-2" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-2xl font-bold mt-6 mb-3" {...props} />,
                    h4: ({node, ...props}) => <h4 className="text-xl font-semibold mt-4 mb-2" {...props} />,
                    h5: ({node, ...props}) => <h5 className="text-lg font-semibold mt-3 mb-2" {...props} />,
                    h6: ({node, ...props}) => <h6 className="text-base font-semibold mt-2 mb-1" {...props} />,
                    p: ({node, ...props}) => <p className="my-4 leading-7 text-base" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 my-4 space-y-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-4 space-y-2" {...props} />,
                    li: ({node, ...props}) => <li className="leading-7" {...props} />,
                    code: ({node, inline, className, children, ...props}: any) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return inline ? (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground before:content-none after:content-none" {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className={`block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono ${match ? `language-${match[1]}` : ''}`} {...props}>
                          {children}
                        </code>
                      );
                    },
                    pre: ({node, ...props}) => <pre className="my-4 overflow-hidden rounded-lg" {...props} />,
                    a: ({node, ...props}) => (
                      <a 
                        className="text-primary font-medium hover:underline" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        {...props} 
                      />
                    ),
                    table: ({node, ...props}) => (
                      <div className="overflow-x-auto my-6">
                        <table className="min-w-full divide-y divide-border border border-border" {...props} />
                      </div>
                    ),
                    thead: ({node, ...props}) => <thead className="bg-muted" {...props} />,
                    th: ({node, ...props}) => (
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" {...props} />
                    ),
                    td: ({node, ...props}) => (
                      <td className="px-6 py-4 whitespace-normal text-sm" {...props} />
                    ),
                    tr: ({node, ...props}) => <tr className="border-b border-border" {...props} />,
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic my-6 text-muted-foreground" {...props} />
                    ),
                    hr: ({node, ...props}) => <hr className="my-8 border-t-2 border-border" {...props} />,
                    img: ({node, ...props}) => (
                      <img className="rounded-lg shadow-lg my-6 max-w-full h-auto" {...props} />
                    ),
                    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                    em: ({node, ...props}) => <em className="italic" {...props} />,
                    details: ({node, ...props}) => (
                      <details className="my-4 border border-border rounded-lg p-4" {...props} />
                    ),
                    summary: ({node, ...props}) => (
                      <summary className="font-semibold cursor-pointer hover:text-primary" {...props} />
                    ),
                  }}
                >
                  {activeDoc === 'guide' ? guideMarkdown : markdown}
                </ReactMarkdown>
              </article>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

