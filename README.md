# SlothDevBox

A self-hosted command center for running dev tasks on a Mac mini from iPad/mobile with **GitHub Copilot integration**.

## Features

- 📱 **Mobile-friendly web UI** - Control from iPad/iPhone
- 🤖 **GitHub Copilot CLI Integration** - Ask AI to fix bugs, implement features, review code
- 🔄 **Live streaming logs via WebSocket** - Watch tasks execute in real-time
- 🚀 **Preview URLs for Vite apps** - Get instant preview links
- 🔒 **Bearer token authentication** - Secure remote access
- 📊 **Task history with artifacts** - Track all executions and outputs
- 🎯 **Predefined safe recipes** - No arbitrary shell commands

## Stack

- **Runtime**: Bun
- **Backend**: Express + TypeScript
- **Frontend**: Vite + React + TypeScript + shadcn/ui
- **Database**: SQLite (bun:sqlite)
- **Realtime**: WebSocket (ws)

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and set CONTROL_PLANE_TOKEN to a secure value
```

### 3. Setup Database

```bash
bun run db:setup
```

### 4. Start Development

```bash
bun run dev
```

This starts:
- API server on http://localhost:8787
- UI dev server on http://localhost:5173
- Worker process polling for tasks

### 5. Open UI

Navigate to http://localhost:5173 in your browser.

## 🎯 Available Recipes

The system includes **7 predefined recipes** for common dev workflows:

### 🤖 GitHub Copilot Recipes

**Prerequisites**: Install GitHub Copilot CLI
```bash
npm install -g @github/copilot
```

#### 1. **Copilot: Explain Code**
Ask Copilot to explain code concepts or patterns.
- **Use case**: Understanding unfamiliar code
- **Input**: Question or code snippet in "goal" field
- **Example**: "Explain how React hooks work"

#### 2. **Copilot: Fix Bug** 🐛
Get AI assistance to debug and fix issues.
- **Use case**: Troubleshooting bugs
- **Input**: Describe the bug in "goal" field
- **Example**: "TypeError: Cannot read property 'map' of undefined in UserList component"
- **Output**: Copilot's suggested fixes stored as artifact

#### 3. **Copilot: Implement Feature** ✨
Get implementation guidance for new features.
- **Use case**: Building new functionality
- **Input**: Feature description in "goal" field
- **Example**: "Add dark mode toggle to the navbar"
- **Output**: Step-by-step implementation plan

#### 4. **Copilot: Review Changes** 👀
AI-powered code review of uncommitted changes.
- **Use case**: Pre-commit code review
- **Steps**: 
  1. Runs `git diff` to capture changes
  2. Asks Copilot to review and suggest improvements
- **Output**: Review feedback as artifact

### 🚀 Development Recipes

#### 5. **Start Preview (Vite)**
Launch dev server with live preview URL.
- **Use case**: Quick preview from mobile
- **Steps**:
  1. Validates project path exists
  2. Starts `bun run dev` on configured port
  3. Detects "ready" signal
- **Output**: 
  - Preview URL artifact (e.g., `http://100.x.x.x:5174`)
  - Process kept alive for access
  - Live logs of server output

#### 6. **Run Tests** 🧪
Execute project test suite.
- **Use case**: CI/CD validation
- **Command**: `bun test`
- **Output**: Test results in logs + command transcript

#### 7. **Create Branch + Diff Summary** 🌿
Create git branch and show changes.
- **Use case**: Starting new feature work
- **Input**: Branch slug (e.g., "fix-auth-bug")
- **Steps**:
  1. Creates branch: `task/{branchSlug}`
  2. Shows `git diff --stat`
- **Output**: Diff summary as artifact

## 📱 Using Recipes from iPad/Mobile

### Typical Workflow

1. **Open UI** on your iPad: `http://your-mac-mini-ip:8787`
2. **Click "New Task"**
3. **Select Project** (e.g., "My Web App")
4. **Select Recipe** based on what you need:
   - Need help? → **Copilot: Explain Code**
   - Found a bug? → **Copilot: Fix Bug**
   - New feature? → **Copilot: Implement Feature**
   - Want review? → **Copilot: Review Changes**
   - Need preview? → **Start Preview (Vite)**
   - Run tests? → **Run Tests**
5. **Enter details** in the "Goal/Prompt" field
6. **Click "Create Task"**
7. **Watch live logs** stream in real-time! 🔥
8. **View artifacts** (Copilot responses, preview URLs, diffs)

### Example: Fix Bug with Copilot

```
Project: My Web App
Recipe: Copilot: Fix Bug
Goal: "Users can't submit form - button stays disabled even when form is valid"

Result:
✅ Copilot analyzes the issue
✅ Suggests checking form validation state
✅ Recommends checking useEffect dependencies
✅ All stored as artifact for later reference
```

### Example: Get Preview URL

```
Project: My Web App  
Recipe: Start Preview (Vite)
(no goal needed)

Result:
✅ Vite server starts
✅ Preview URL: http://100.64.5.123:5174
✅ Click URL from iPad to see live app!
```

## 🎨 Customizing Recipes

Recipes are defined in `apps/api/src/db/seed.ts`. Each recipe is a sequence of **safe, predefined steps**:

### Step Types

1. **check_path** - Validates project directory exists
2. **command** - Runs allowed command (bun, npm, etc.)
3. **git** - Git operations (checkout, diff, etc.)
4. **copilot** - GitHub Copilot CLI queries
5. **start_preview** - Launches dev server with keepAlive

### Example: Custom Recipe

```typescript
{
  id: 'lint-and-fix',
  name: 'Lint & Auto-Fix',
  description: 'Run ESLint with auto-fix',
  steps: [
    { type: 'check_path' },
    { 
      type: 'command',
      command: 'npm',
      args: ['run', 'lint', '--', '--fix']
    },
  ],
}
```

After adding a recipe:
```bash
# Delete old recipes and reseed
sqlite3 data/devcenter.db "DELETE FROM recipes;"
bun run db:setup
```

## Production Deployment

```bash
bun run build
bun run start
```

The API serves the built frontend at http://localhost:8787

## Remote Access

### Via Tailscale (Recommended)

1. Install Tailscale on your Mac mini
2. Get your Tailscale IP: `tailscale ip -4`
3. Set in `.env`: `PUBLIC_HOST=100.x.x.x`
4. Access from any device on your tailnet: `http://100.x.x.x:8787`

### Via Cloudflare Tunnel (Alternative)

```bash
cloudflared tunnel --url http://localhost:8787
```

## API Authentication

All API requests require a Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8787/api/health
```

WebSocket connection:
```javascript
const ws = new WebSocket('ws://localhost:8787/ws?token=YOUR_TOKEN');
```

## Adding Projects

Edit `apps/api/src/db/seed.ts`:

```typescript
export const seedProjects = [
  {
    id: 'my-project',
    name: 'My Project',
    path: '/Users/you/projects/my-project',
    defaultDevPort: 5174,
  },
];
```

Then:
```bash
bun run db:setup
```

Or use the API:
```bash
curl -X POST http://localhost:8787/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "path": "/path/to/project",
    "defaultDevPort": 5174
  }'
```

## Project Structure

```
apps/
  api/        Express backend
  ui/         Vite React frontend
  worker/     Task executor
packages/
  shared/     Shared types & schemas
data/
  devcenter.db  SQLite database
```

## Security

- Never executes arbitrary shell commands from users
- Predefined recipe steps only
- Bearer token authentication
- Allowed commands: git, bun, gh, node, npm, copilot
- Blocks dangerous patterns (sudo, rm -rf)

## 💡 Pro Tips

1. **Use Copilot recipes liberally** - They don't modify code, just provide guidance
2. **Keep preview servers running** - Use "Start Preview" and access from anywhere
3. **Review before implementing** - Use "Copilot: Explain Code" first, then "Implement Feature"
4. **Chain tasks** - Review changes with Copilot, then create branch
5. **Check artifacts** - All Copilot responses are saved for later reference

## 🐛 Troubleshooting

### Copilot not working
```bash
# Check if installed
which copilot

# Install if missing
npm install -g @github/copilot

# Verify it works
copilot "how do I create a React component"
```

### Preview URL not accessible
- Check `PUBLIC_HOST` in `.env` is set to your Mac mini's IP
- Verify firewall allows port 8787
- Use Tailscale for reliable remote access

### Worker not picking up tasks
- Check worker is running in terminal
- Verify database path is correct
- Check for errors in worker logs

## License

MIT
