# SlothDevBox - AI Copilot Instructions

## Project Overview
SlothDevBox is a **self-hosted task automation system** for running dev tasks on a Mac mini, controlled via mobile/iPad. It enables remote execution of predefined recipes (like GitHub Copilot CLI commands, Vite previews, tests) with live log streaming over WebSocket.

**Tech Stack**: Bun runtime, Express API, React + Vite UI, SQLite (bun:sqlite), WebSocket, TypeScript monorepo

## Architecture - Three Decoupled Services

```
Browser ←→ API Server (Express + WebSocket) ←→ Worker (Polling + Execution)
                      ↓
                  SQLite DB (shared state)
```

### 1. **API Service** (`apps/api/`)
- Express server on port 8787
- REST endpoints for CRUD operations on projects, recipes, tasks
- WebSocket server at `/ws` for live log broadcasting
- Bearer token auth via `CONTROL_PLANE_TOKEN` env var
- Routes follow pattern: `/api/{resource}` (e.g., `/api/tasks`)

### 2. **Worker Service** (`apps/worker/`)
- Polls SQLite every 2s for `pending` tasks
- Executes recipes as child processes using `spawn()`
- Streams stdout/stderr to API via HTTP POST to `/api/tasks/:id/logs`
- Handles `keepAlive` processes (e.g., dev servers) and cancellation
- Enforces command whitelist: `['git', 'bun', 'gh', 'node', 'npm', 'copilot']`

### 3. **UI Service** (`apps/ui/`)
- Vite + React SPA with shadcn/ui components
- Routes: `/login`, `/` (dashboard), `/new`, `/tasks/:id`
- WebSocket client subscribes to task logs via `{type: "subscribe", taskId}`
- API calls use Bearer token from localStorage

## Critical Patterns

### Recipe Step Execution
Recipes are JSON arrays of `RecipeStep` objects with types:
- `check_path`: Validates project directory exists
- `command`: Runs whitelisted commands (see [executor.ts](apps/worker/src/executor.ts#L19))
- `start_preview`: Launches dev server with `keepAlive: true` and `detectReady` pattern
- `copilot`: Executes GitHub Copilot CLI with prompt interpolation
- `git`: Git operations (diff, status, etc.)

**Variable Interpolation**: Use `{{variableName}}` in step args (e.g., `{{defaultDevPort}}`). Resolved from task input + project metadata. See [executor.ts](apps/worker/src/executor.ts#L10).

### State Management via SQLite
- No in-memory state shared between services
- Worker updates task status → API reads for REST responses
- WebSocket broadcast triggered by API endpoint `/api/tasks/:id/logs` (not from DB polling)
- Database schema in [schema.ts](apps/api/src/db/schema.ts) - note `cancelRequested` flag pattern

### WebSocket Flow
1. Worker posts log → `POST /api/tasks/:id/logs`
2. API saves to DB + calls `broadcastLog()`
3. Connected clients subscribed to `taskId` receive message
4. Message format: `{type: "log", taskId, ts, stream, line}`

### Security Constraints
- **Command Whitelist**: Only predefined commands allowed ([executor.ts](apps/worker/src/executor.ts#L19))
- **Dangerous Pattern Blocking**: Rejects `rm -rf`, `sudo` in command strings
- **Bearer Token Auth**: All API routes except `/api/health` require valid token
- **No Arbitrary Shell**: Uses `spawn()` with `shell: false`

## Development Workflows

### Running Locally
```bash
bun install                # Install all workspace dependencies
bun run db:setup           # Initialize SQLite with seed data
bun run dev                # Starts API + UI + Worker concurrently
```
Ports: API 8787, UI 5173, Worker runs headless.

### Adding New Recipes
1. Add to [seed.ts](apps/api/src/db/seed.ts) `seedRecipes` array
2. Define steps with proper types (see existing recipes for patterns)
3. Run `bun run db:setup` to reset database
4. If adding new command type, update `isCommandAllowed()` in [executor.ts](apps/worker/src/executor.ts#L19)

### Database Operations
- **Schema**: [apps/api/src/db/schema.ts](apps/api/src/db/schema.ts)
- **Access**: Uses `bun:sqlite` directly (not an ORM)
- **WAL Mode**: Enabled for concurrent reads during writes
- **Reset**: `rm data/devcenter.db && bun run db:setup`

### UI Component Patterns
- Uses shadcn/ui components (Tailwind-based)
- Dark theme via `ThemeProvider.tsx` (uses `localStorage`)
- API calls abstracted in [lib/api.ts](apps/ui/src/lib/api.ts)
- WebSocket hook in pages that need live updates ([TaskDetail.tsx](apps/ui/src/pages/TaskDetail.tsx))

## Common Gotchas

1. **Monorepo Filters**: Use `--filter '@devcenter/{api|ui|worker}'` for targeted commands
2. **Shared Types**: Import from `@devcenter/shared` package, not relative paths between apps
3. **Process Cleanup**: For `keepAlive` tasks, store process in `runningProcesses` Map and kill on cancel
4. **Port Conflicts**: Default ports hardcoded (8787, 5173). Change via env vars if needed.
5. **Bun-Specific**: Uses `import.meta.dir` for paths, `bun:sqlite` for DB (not `better-sqlite3`)

## File Navigation Quick Reference
- **Add API endpoint**: [apps/api/src/routes/](apps/api/src/routes/)
- **Modify task execution logic**: [apps/worker/src/executor.ts](apps/worker/src/executor.ts)
- **Change database schema**: [apps/api/src/db/schema.ts](apps/api/src/db/schema.ts) + [setup.ts](apps/api/src/db/setup.ts)
- **UI pages**: [apps/ui/src/pages/](apps/ui/src/pages/)
- **Type definitions**: [packages/shared/src/index.ts](packages/shared/src/index.ts)

## Environment Variables
```bash
CONTROL_PLANE_TOKEN=dev-token-change-me   # Bearer token for API auth
PORT=8787                                  # API server port (optional)
NODE_ENV=production                        # Serves UI from API in prod mode
VITE_API_BASE_URL=                         # UI proxy target (empty = use Vite proxy)
```

## Testing Strategy
Currently no automated tests. Manual testing via:
1. Create task through UI
2. Watch logs in browser via WebSocket
3. Check artifacts in task detail view
4. Verify database state with `bun sqlite data/devcenter.db`
