export const seedStepTemplates = [
  {
    id: 'check_path',
    name: 'Check Path',
    description: 'Validates that the project directory exists',
    type: 'check_path',
    configSchema: JSON.stringify({
      type: 'object',
      properties: {},
      required: []
    }),
  },
  {
    id: 'create_directory',
    name: 'Create Directory',
    description: 'Create a new directory for the project',
    type: 'create_directory',
    configSchema: JSON.stringify({
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Directory path to create (can use {{projectPath}} variable)' }
      },
      required: ['path']
    }),
  },
  {
    id: 'command',
    name: 'Run Command',
    description: 'Execute a shell command',
    type: 'command',
    configSchema: JSON.stringify({
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Command to execute (e.g., bun, npm, git)' },
        args: { type: 'array', items: { type: 'string' }, description: 'Command arguments' },
        cwd: { type: 'string', description: 'Working directory (optional, uses projectPath by default)' }
      },
      required: ['command']
    }),
  },
  {
    id: 'start_preview',
    name: 'Start Preview Server',
    description: 'Launch a dev server and get preview URL',
    type: 'start_preview',
    configSchema: JSON.stringify({
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Command to execute (e.g., bun, npm)' },
        args: { type: 'array', items: { type: 'string' }, description: 'Command arguments' },
        detectReady: { type: 'string', description: 'Pattern to detect when server is ready' },
        keepAlive: { type: 'boolean', description: 'Keep process running after detection' }
      },
      required: ['command', 'detectReady']
    }),
  },
  {
    id: 'git',
    name: 'Git Command',
    description: 'Execute git operations',
    type: 'git',
    configSchema: JSON.stringify({
      type: 'object',
      properties: {
        subcommand: { type: 'string', description: 'Git subcommand (e.g., diff, branch, checkout, init)' },
        args: { type: 'array', items: { type: 'string' }, description: 'Subcommand arguments' }
      },
      required: ['subcommand']
    }),
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    description: 'Run GitHub Copilot CLI for AI assistance',
    type: 'copilot',
    configSchema: JSON.stringify({
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['explain', 'fix', 'implement', 'review'], description: 'Copilot mode' }
      },
      required: ['mode']
    }),
  },
  {
    id: 'write_file',
    name: 'Write File',
    description: 'Create or overwrite a file with content',
    type: 'write_file',
    configSchema: JSON.stringify({
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path (relative to project directory)' },
        content: { type: 'string', description: 'File content (supports variables: {{projectName}}, {{goal}})' }
      },
      required: ['path', 'content']
    }),
  },
];
