# Exact Commands to Run

## ✅ Already Completed

```bash
cd /Users/aungsithu/playground/SlothDevBox
bun install      # ✅ Done - Dependencies installed
bun run db:setup # ✅ Done - Database initialized
```

## 🎯 Next Steps (You Need To Do)

### 1. Update Project Path

```bash
nano apps/api/src/db/seed.ts
```

**Change line 5** from:
```typescript
path: '/Users/aungsithu/projects/example-vite-app',
```

To your actual project path:
```typescript
path: '/path/to/your/actual/project',
```

Save and exit (Ctrl+O, Enter, Ctrl+X)

### 2. Re-initialize Database

```bash
bun run db:setup
```

Expected output:
```
✓ Tables created
✓ Seeded 1 projects
✓ Seeded 4 recipes
✓ Database setup complete!
```

### 3. Start Development Server

```bash
bun run dev
```

This starts:
- API server on http://localhost:8787
- UI dev server on http://localhost:5173
- Worker process in background

Expected output:
```
🚀 API server running on http://localhost:8787
📡 WebSocket available at ws://localhost:8787/ws
🤖 Worker started, polling for tasks...
VITE ... ready in ... ms
➜  Local:   http://localhost:5173/
```

### 4. Open Browser

```bash
open http://localhost:5173
```

Or manually navigate to: **http://localhost:5173**

### 5. Login

**Token**: `dev-token-change-me`

(This is the default token from `.env` file)

### 6. Create Your First Task!

1. Click "New Task" button
2. Select your project
3. Select a recipe (try "Run Tests")
4. Click "Create Task"
5. Watch live logs stream! 🎉

---

## 📱 Optional: Setup Remote Access (iPad/Mobile)

### Via Tailscale (Recommended)

```bash
# Install Tailscale
brew install tailscale

# Start Tailscale
tailscale up

# Get your Tailscale IP
tailscale ip -4
```

You'll see something like: `100.101.102.103`

```bash
# Update .env file
echo "PUBLIC_HOST=100.101.102.103" >> .env

# Restart the dev server
# Press Ctrl+C to stop, then:
bun run dev
```

**Access from iPad/iPhone/any device on your tailnet:**
```
http://100.101.102.103:8787
```

---

## 🏗️ Production Deployment

### Build

```bash
bun run build
```

This compiles the UI and prepares everything for production.

### Start Production Server

```bash
NODE_ENV=production bun run start
```

Access at: **http://localhost:8787**

(In production, API serves the built frontend)

---

## 🔧 Useful Commands

### Reset Database

```bash
rm data/devcenter.db*
bun run db:setup
```

### Check Database

```bash
sqlite3 data/devcenter.db "SELECT * FROM tasks;"
sqlite3 data/devcenter.db "SELECT * FROM projects;"
sqlite3 data/devcenter.db "SELECT * FROM recipes;"
```

### Run in Separate Terminals (Better for Debugging)

**Terminal 1 - API:**
```bash
cd apps/api
bun run dev
```

**Terminal 2 - Worker:**
```bash
cd apps/worker
bun run dev
```

**Terminal 3 - UI:**
```bash
cd apps/ui
bun run dev
```

### Update Token

```bash
nano .env
# Change CONTROL_PLANE_TOKEN to your secure token
# Save and restart
```

### Add More Projects

```bash
nano apps/api/src/db/seed.ts
# Add to seedProjects array
bun run db:setup
```

---

## 🐛 Troubleshooting Commands

### Check if ports are in use

```bash
lsof -i :8787  # API port
lsof -i :5173  # UI port
```

### View logs in real-time

```bash
# Already visible in terminal where bun run dev is running
# Look for worker output like:
# 🤖 Worker started, polling for tasks...
# Processing task: task-xxx
```

### Check database file

```bash
ls -lh data/
# Should see: devcenter.db, devcenter.db-shm, devcenter.db-wal
```

### Test API directly

```bash
# Health check (no auth)
curl http://localhost:8787/api/health

# Get projects (with auth)
curl -H "Authorization: Bearer dev-token-change-me" \
     http://localhost:8787/api/projects

# Get recipes
curl -H "Authorization: Bearer dev-token-change-me" \
     http://localhost:8787/api/recipes
```

---

## 📍 Quick Reference

| What               | Command                | URL                        |
|--------------------|------------------------|----------------------------|
| Install            | `bun install`          | -                          |
| Setup DB           | `bun run db:setup`     | -                          |
| Dev mode           | `bun run dev`          | http://localhost:5173      |
| Production         | `bun run start`        | http://localhost:8787      |
| Build              | `bun run build`        | -                          |
| API (dev)          | -                      | http://localhost:8787      |
| WebSocket          | -                      | ws://localhost:8787/ws     |
| Reset DB           | `rm data/*.db*`        | -                          |

---

## 🎯 Summary: Minimum Commands to Get Running

```bash
# 1. Go to project
cd /Users/aungsithu/playground/SlothDevBox

# 2. Update project path in seed file
nano apps/api/src/db/seed.ts
# (Change line 5, save, exit)

# 3. Setup database
bun run db:setup

# 4. Start everything
bun run dev

# 5. Open browser
open http://localhost:5173

# 6. Login with: dev-token-change-me

# 7. Create task and watch logs! 🚀
```

That's it! You're ready to automate! 🎉
