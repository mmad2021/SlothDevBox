import type { RecipeStep } from '@devcenter/shared';

export const seedProjects = [
  {
    id: 'sloth-dev-sample',
    name: 'Sloth Dev Sample',
    path: '/Users/aungsithu/playground/copilot-cli-lnd',
    defaultDevPort: 5174,
  },
];

export const seedRecipes: Array<{
  id: string;
  name: string;
  description: string;
  steps: RecipeStep[];
}> = [
  {
    id: 'start-preview-vite',
    name: 'Start Preview (Vite)',
    description: 'Start Vite dev server with preview URL',
    steps: [
      {
        type: 'check_path',
      },
      {
        type: 'start_preview',
        command: 'bun',
        args: ['run', 'dev', '--', '--host', '0.0.0.0', '--port', '{{defaultDevPort}}'],
        detectReady: 'Local:',
        keepAlive: true,
      },
    ],
  },
  {
    id: 'run-tests',
    name: 'Run Tests',
    description: 'Execute test suite',
    steps: [
      {
        type: 'check_path',
      },
      {
        type: 'command',
        command: 'bun',
        args: ['test'],
      },
    ],
  },
  {
    id: 'copilot-explain-code',
    name: 'Copilot: Explain Code',
    description: 'Ask Copilot to explain code or concepts',
    steps: [
      {
        type: 'check_path',
      },
      {
        type: 'copilot',
        command: 'copilot',
        args: ['-p', '{{goal}}', '--allow-all-tools'],
      },
    ],
  },
  {
    id: 'copilot-fix-bug',
    name: 'Copilot: Fix Bug',
    description: 'Ask Copilot to help fix a bug (describe the bug in goal)',
    steps: [
      {
        type: 'check_path',
      },
      {
        type: 'copilot',
        command: 'copilot',
        args: ['-p', 'How do I fix this bug: {{goal}}', '--allow-all-tools'],
      },
    ],
  },
  {
    id: 'copilot-implement-feature',
    name: 'Copilot: Implement Feature',
    description: 'Ask Copilot to help implement a new feature',
    steps: [
      {
        type: 'check_path',
      },
      {
        type: 'copilot',
        command: 'copilot',
        args: ['-p', 'Help me implement: {{goal}}', '--allow-all-tools'],
      },
    ],
  },
  {
    id: 'copilot-review-changes',
    name: 'Copilot: Review Changes',
    description: 'Ask Copilot to review uncommitted changes',
    steps: [
      {
        type: 'check_path',
      },
      {
        type: 'git',
        command: 'git',
        args: ['diff'],
      },
      {
        type: 'copilot',
        command: 'copilot',
        args: ['-p', 'Review the git diff above and suggest improvements', '--allow-all-tools'],
      },
    ],
  },
  {
    id: 'create-branch-diff',
    name: 'Create Branch + Diff Summary',
    description: 'Create a new branch and show diff',
    steps: [
      {
        type: 'check_path',
      },
      {
        type: 'git',
        command: 'git',
        args: ['checkout', '-b', 'task/{{branchSlug}}'],
      },
      {
        type: 'git',
        command: 'git',
        args: ['diff', '--stat'],
      },
    ],
  },
];
  {
    id: 'scaffold-vite-react',
    name: 'Scaffold: Vite + React + TypeScript',
    description: 'Create a new Vite React TypeScript project from scratch',
    steps: [
      {
        type: 'create_directory',
        path: '{{projectPath}}',
      },
      {
        type: 'command',
        command: 'bun',
        args: ['create', 'vite', '.', '--template', 'react-ts'],
        cwd: '{{projectPath}}',
      },
      {
        type: 'command',
        command: 'bun',
        args: ['install'],
        cwd: '{{projectPath}}',
      },
      {
        type: 'git',
        subcommand: 'init',
        args: [],
      },
      {
        type: 'write_file',
        path: '.gitignore',
        content: `node_modules
dist
.env.local
.env.*.local
*.log
.DS_Store`,
      },
      {
        type: 'git',
        subcommand: 'add',
        args: ['.'],
      },
      {
        type: 'git',
        subcommand: 'commit',
        args: ['-m', 'Initial commit: Vite + React + TypeScript'],
      },
    ],
  },
  {
    id: 'scaffold-bun-app',
    name: 'Scaffold: Bun Application',
    description: 'Create a new Bun application with TypeScript',
    steps: [
      {
        type: 'create_directory',
        path: '{{projectPath}}',
      },
      {
        type: 'command',
        command: 'bun',
        args: ['init', '-y'],
        cwd: '{{projectPath}}',
      },
      {
        type: 'write_file',
        path: 'src/index.ts',
        content: `console.log("Hello from {{projectName}}!");

export function greet(name: string) {
  return \`Hello, \${name}!\`;
}`,
      },
      {
        type: 'git',
        subcommand: 'init',
        args: [],
      },
      {
        type: 'write_file',
        path: '.gitignore',
        content: `node_modules
*.log
.env
dist
build`,
      },
      {
        type: 'git',
        subcommand: 'add',
        args: ['.'],
      },
      {
        type: 'git',
        subcommand: 'commit',
        args: ['-m', 'Initial commit: Bun application'],
      },
    ],
  },
  {
    id: 'scaffold-next-app',
    name: 'Scaffold: Next.js + TypeScript',
    description: 'Create a new Next.js application with TypeScript',
    steps: [
      {
        type: 'create_directory',
        path: '{{projectPath}}',
      },
      {
        type: 'command',
        command: 'bunx',
        args: ['create-next-app@latest', '.', '--typescript', '--tailwind', '--app', '--no-src-dir', '--import-alias', '@/*'],
        cwd: '{{projectPath}}',
      },
      {
        type: 'git',
        subcommand: 'init',
        args: [],
      },
      {
        type: 'git',
        subcommand: 'add',
        args: ['.'],
      },
      {
        type: 'git',
        subcommand: 'commit',
        args: ['-m', 'Initial commit: Next.js + TypeScript'],
      },
    ],
  },
];
