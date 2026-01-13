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
    // Fetch README from GitHub or local
    const fetchDocs = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/mmad2021/SlothDevBox/master/README.md');
        const text = await response.text();
        setMarkdown(text);
      } catch (error) {
        console.error('Failed to load documentation:', error);
        setMarkdown('# Documentation\n\nFailed to load documentation. Please visit the [GitHub repository](https://github.com/mmad2021/SlothDevBox) to view the README.');
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
            href="https://github.com/mmad2021/SlothDevBox" 
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
                    // Custom styling for markdown elements
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
