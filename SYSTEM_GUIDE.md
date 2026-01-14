# SlothDevBox - Complete System Guide

## Overview

SlothDevBox is a **self-hosted task automation system** that lets you remotely execute development workflows on your Mac mini from mobile/iPad. Think of it as a way to run predefined automation "recipes" (like running tests, starting dev servers, using GitHub Copilot CLI) without SSH-ing into your machine.

---

## Core Concepts: The 4 Building Blocks

### 1. **Projects** 
A project represents a **codebase on your system** that you want to automate tasks for.

**Structure:**
```typescript
{
  id: "sloth-dev-sample",
  name: "Sloth Dev Sample",
  path: "/Users/aungsithu/playground/copilot-cli-lnd",
  defaultDevPort: 5174
}
```

**What it stores:**
- `path`: Absolute path to the project directory (where commands will run)
- `defaultDevPort`: Port for dev servers (used as a variable in recipes)

### 2. **Step Templates** (Building Blocks for Recipes)
Step templates define **types of actions** you can perform. They're like blueprints.

**Built-in step types:**

- **`check_path`**: Validates project directory exists
- **`command`**: Run any whitelisted command (bun, npm, git, etc.)
- **`start_preview`**: Launch dev server and detect when ready
- **`git`**: Git operations (diff, checkout, branch, etc.)
- **`copilot`**: Run GitHub Copilot CLI with prompts

Each template has a **JSON schema** (`configSchema`) that defines what properties each step type accepts.

### 3. **Recipes** (Workflows)
A recipe is a **sequence of steps** that defines a complete automation workflow.

**Example Recipe:** "Start Preview (Vite)"
```typescript
{
  id: "start-preview-vite",
  name: "Start Preview (Vite)",
  description: "Start Vite dev server with preview URL",
  steps: [
    {
      type: "check_path"  // Step 1: Verify project exists
    },
    {
      type: "start_preview",  // Step 2: Start dev server
      command: "bun",
      args: ["run", "dev", "--", "--host", "0.0.0.0", "--port", "{{defaultDevPort}}"],
      detectReady: "Local:",  // Wait for this string in output
      keepAlive: true  // Keep process running
    }
  ]
}
```

**Variable Interpolation:** Notice `{{defaultDevPort}}` - this gets replaced at runtime with values from:
- Project metadata (`defaultDevPort`, `path`)
- Task input (`goal`, `branchSlug`, custom fields)

### 4. **Tasks** (Execution Instances)
A task is a **single execution** of a recipe for a specific project with specific inputs.

**Flow:**
```
User creates Task → Worker picks it up → Executes recipe steps → Logs stream to UI
```

**Task states:**
- `pending` → `running` → `success`/`failed`/`cancelled`

---

## How Execution Works: The 3-Service Architecture

### Service 1: **API Server** (`apps/api/`)
- **Port:** 8787
- **Role:** Central coordinator - handles CRUD operations and WebSocket broadcasting
- **Key Routes:**
  - `POST /api/tasks` - Create new task (sets status to `pending`)
  - `GET /api/tasks/:id` - Get task details with logs/artifacts
  - `POST /api/tasks/:id/logs` - Worker posts logs here (triggers WebSocket broadcast)
  - Full CRUD for projects, recipes, step templates

### Service 2: **Worker** (`apps/worker/`)
- **Role:** Background process that executes tasks
- **How it works:**
  1. **Polls SQLite every 2 seconds** for tasks with status `pending`
  2. Checks if project is already busy (only 1 task per project at a time)
  3. Updates status to `running`
  4. Executes recipe steps sequentially
  5. Streams stdout/stderr to API via `POST /api/tasks/:id/logs`
  6. Saves artifacts (preview URLs, git diffs, etc.)
  7. Updates final status to `success`/`failed`/`cancelled`

**Command Whitelist:**
```typescript
const allowed = ['git', 'bun', 'gh', 'node', 'npm', 'pnpm', 'yarn', 'copilot'];
```
Only these commands are allowed for security.

**Dangerous Pattern Blocking:**
```typescript
if (fullCommand.includes('rm -rf') || fullCommand.includes('sudo')) {
  throw new Error(`Dangerous command blocked`);
}
```

### Service 3: **UI** (`apps/ui/`)
- **Port:** 5173 (dev), served from API in production
- **Tech:** React + Vite + shadcn/ui components
- **Key Pages:**
  - Dashboard - List all tasks
  - NewTask - Create task (select project + recipe + input)
  - TaskDetail - Live log streaming via WebSocket
  - RecipeForm - Create/edit recipes

---

## Real-World Example: GitHub Copilot Recipe

Let's trace how the "Copilot: Fix Bug" recipe works:

**1. Recipe Definition:**
```typescript
{
  id: "copilot-fix-bug",
  name: "Copilot: Fix Bug",
  steps: [
    { type: "check_path" },
    { 
      type: "copilot",
      command: "copilot",
      args: ["-p", "How do I fix this bug: {{goal}}", "--allow-all-tools"]
    }
  ]
}
```

**2. User creates task via UI:**
- Select project: "Sloth Dev Sample"
- Select recipe: "Copilot: Fix Bug"
- Input `goal`: "Login form not submitting"
- Click "Create Task"

**3. API creates task:**
```json
{
  "id": "task-1737743628-abc123",
  "projectId": "sloth-dev-sample",
  "recipeId": "copilot-fix-bug",
  "status": "pending",
  "inputJson": "{\"goal\": \"Login form not submitting\"}",
  "createdAt": "2026-01-14T10:30:00Z"
}
```

**4. Worker picks up task:**
- Polls database, finds `pending` task
- Updates status to `running`
- Resolves variables:
  ```typescript
  {
    goal: "Login form not submitting",
    defaultDevPort: 5174  // from project
  }
  ```

**5. Worker executes steps:**

**Step 1:** `check_path`
```
✓ Project path exists: /Users/aungsithu/playground/copilot-cli-lnd
```

**Step 2:** `copilot` command
- Interpolates: `copilot -p "How do I fix this bug: Login form not submitting" --allow-all-tools`
- Spawns process in project directory
- Streams output to API → WebSocket → UI in real-time
- Saves Copilot's response as artifact (type: `notes`)

**6. Task completes:**
- Status updated to `success`
- Artifacts saved (command transcript, Copilot notes)
- User sees results in UI

---

## How to Customize: Adding Your Own Commands/Recipes

### **Option 1: Create Recipe via UI** (Easy)

1. Navigate to `/recipes` → "Create Recipe"
2. Fill in the form:
   - **ID:** `my-custom-recipe`
   - **Name:** "My Custom Recipe"
   - **Description:** What it does
3. Add steps:
   - Choose type from dropdown (`command`, `copilot`, `git`, etc.)
   - Configure step-specific fields (command, args, etc.)
4. Use `{{variableName}}` for dynamic values
5. Click "Create Recipe"

**Example:** Run custom lint command
```json
{
  "id": "run-custom-lint",
  "name": "Run Custom Lint",
  "steps": [
    { "type": "check_path" },
    { 
      "type": "command",
      "command": "bun",
      "args": ["run", "lint", "--fix"]
    }
  ]
}
```

### **Option 2: Add to Seed Data** (For default recipes)

Edit `apps/api/src/db/seed.ts` and add to `seedRecipes` array:

```typescript
{
  id: 'my-python-tests',
  name: 'Run Python Tests',
  description: 'Execute pytest with coverage',
  steps: [
    { type: 'check_path' },
    {
      type: 'command',
      command: 'python',  // ⚠️ Must add to whitelist first!
      args: ['-m', 'pytest', '--cov={{coverageDir}}']
    }
  ]
}
```

**⚠️ Important:** If using a new command like `python`, add it to the whitelist in `apps/worker/src/executor.ts`:

```typescript
const allowed = ['git', 'bun', 'gh', 'node', 'npm', 'copilot', 'python']; // Add here
```

Then reset database: `rm data/devcenter.db && bun run db:setup`

### **Option 3: Add Custom Step Template** (Advanced)

If you want a reusable step type with specific validation, add to `apps/api/src/db/seed-step-templates.ts`:

```typescript
{
  id: 'docker_compose',
  name: 'Docker Compose',
  description: 'Run docker-compose commands',
  type: 'docker_compose',
  configSchema: JSON.stringify({
    type: 'object',
    properties: {
      action: { 
        type: 'string', 
        enum: ['up', 'down', 'logs'],
        description: 'Docker compose action' 
      },
      service: { type: 'string', description: 'Service name' }
    },
    required: ['action']
  }),
}
```

Then handle it in `apps/worker/src/executor.ts`:

```typescript
else if (step.type === 'docker_compose') {
  const result = await executeCommand(taskId, {
    ...step,
    command: 'docker-compose',
    args: [step.action, step.service]
  }, cwd, variables);
}
```

---

## Customizing System Prompts (Copilot Integration)

The GitHub Copilot CLI integration uses the **prompt pattern** from recipe steps. Here's how to customize:

### **1. Simple Prompt Customization**

Modify the copilot args in your recipe:

```typescript
{
  id: 'copilot-with-context',
  name: 'Copilot: Code Review',
  steps: [
    { type: 'check_path' },
    {
      type: 'copilot',
      command: 'copilot',
      args: [
        '-p', 
        'Act as a senior engineer. Review this code for: {{goal}}. Focus on security and performance.',
        '--allow-all-tools'
      ]
    }
  ]
}
```

### **2. Multi-Step Context Building**

Build context before Copilot:

```typescript
{
  id: 'copilot-review-with-diff',
  name: 'Copilot: Review Changes',
  steps: [
    { type: 'check_path' },
    { 
      type: 'git',
      command: 'git',
      args: ['diff']  // Shows changes
    },
    {
      type: 'copilot',
      command: 'copilot',
      args: [
        '-p', 
        'Review the git diff above. {{goal}}',
        '--allow-all-tools'
      ]
    }
  ]
}
```

The git diff output will be in the terminal context when Copilot runs.

### **3. Custom Variables in Prompts**

Pass custom instructions via task input:

**Recipe:**
```typescript
{
  type: 'copilot',
  args: ['-p', 'Style: {{codeStyle}}. Task: {{goal}}']
}
```

**Task Input:**
```json
{
  "goal": "Refactor user service",
  "codeStyle": "functional programming with TypeScript"
}
```

---

## Key Features & Patterns

### **1. Variable System**
Any `{{variableName}}` in recipe steps gets replaced with values from:
- Task `inputJson` (user-provided values like `goal`, `branchSlug`)
- Project metadata (`defaultDevPort`, `path`)
- Custom fields you add

### **2. Keep-Alive Processes**
Dev servers stay running:
```typescript
{
  type: 'start_preview',
  keepAlive: true,
  detectReady: 'Local:'  // Waits for this string, then returns
}
```

The process keeps running. Cancelling the task kills it.

### **3. Task Artifacts**
Special outputs saved for UI display:
- `preview_url`: Dev server URLs
- `diff_summary`: Git diff output
- `notes`: Copilot responses
- `command_transcript`: All commands run

### **4. Real-Time Logging**
Every stdout/stderr line flows:
```
Worker → POST /api/tasks/:id/logs → WebSocket broadcast → UI updates
```

### **5. Security Boundaries**
- Command whitelist
- No shell injection (uses `spawn()` with `shell: false`)
- Bearer token auth on API
- Dangerous pattern blocking (`rm -rf`, `sudo`)

---

## Database Schema

All state stored in SQLite:

```
projects → recipes → tasks → task_logs
                       ↓        task_artifacts
                  step_templates (optional, for UI hints)
```

**No in-memory state** - Worker and API communicate only via DB. This means you can restart services independently.

---

## Common Workflows

### **Start Dev Server Remotely:**
1. Create task with "Start Preview (Vite)" recipe
2. Worker starts `bun run dev` on Mac mini
3. UI displays preview URL: `http://mac-mini.local:5174`
4. Open on iPad, start coding

### **Run Tests on Push:**
1. Recipe: "Run Tests" (runs `bun test`)
2. Create task after pushing code
3. Watch test output stream in real-time
4. See pass/fail in task detail

### **Ask Copilot for Help:**
1. Recipe: "Copilot: Explain Code"
2. Input goal: "How does authentication work?"
3. Copilot analyzes project context
4. Response saved as artifact, displayed in UI

---

## File Navigation Reference

- **Add API endpoint**: `apps/api/src/routes/`
- **Modify task execution logic**: `apps/worker/src/executor.ts`
- **Change database schema**: `apps/api/src/db/schema.ts` + `setup.ts`
- **UI pages**: `apps/ui/src/pages/`
- **Type definitions**: `packages/shared/src/index.ts`
- **Seed recipes**: `apps/api/src/db/seed.ts`
- **Step templates**: `apps/api/src/db/seed-step-templates.ts`

---

## Environment Variables

```bash
CONTROL_PLANE_TOKEN=dev-token-change-me   # Bearer token for API auth
PORT=8787                                  # API server port (optional)
NODE_ENV=production                        # Serves UI from API in prod mode
VITE_API_BASE_URL=                         # UI proxy target (empty = use Vite proxy)
```

---

## Summary

**SlothDevBox = Remote task automation for dev workflows**

- **Projects:** Your codebases
- **Step Templates:** Types of actions (command, git, copilot, etc.)
- **Recipes:** Sequences of steps (like "start server" or "run tests")
- **Tasks:** Executions of recipes with specific inputs

**To customize:**
1. **Add recipes** via UI or seed data
2. **Use variables** (`{{goal}}`, `{{defaultDevPort}}`) for dynamic values
3. **Add commands** to whitelist in executor
4. **Customize Copilot prompts** in recipe step args

The system is designed to be **safe** (command whitelist), **flexible** (variable interpolation), and **real-time** (WebSocket logs). You control your Mac mini from mobile without SSH!
