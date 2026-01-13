# SlothDevBox - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment

The `.env` file has been created with defaults. **Important**: Change the token for production!

```bash
# Edit .env and set a secure CONTROL_PLANE_TOKEN
nano .env
```

### 3. Setup Database

```bash
bun run db:setup
```

This creates the SQLite database and seeds:
- Example project (update path in `apps/api/src/db/seed.ts`)
- 4 recipes (Start Preview, Run Tests, Copilot Suggest, Create Branch)

### 4. Update Project Path

Edit `apps/api/src/db/seed.ts` and change the example project path to a real project:

```typescript
export const seedProjects = [
  {
    id: 'example-vite-app',
    name: 'Example Vite App',
    path: '/Users/YOUR_USERNAME/projects/YOUR_PROJECT', // <-- Change this
    defaultDevPort: 5174,
  },
];
```

Then re-run: `bun run db:setup`

### 5. Start Development

```bash
bun run dev
```

This starts:
- **API**: http://localhost:8787
- **UI**: http://localhost:5173 (proxies API requests)
- **Worker**: Polling for tasks in background

### 6. Open UI & Login

1. Navigate to http://localhost:5173
2. Login with token: `dev-token-change-me` (or whatever you set in `.env`)
3. Create a task and watch live logs!

## Production Deployment

### Build

```bash
bun run build
```

### Start Production Server

```bash
NODE_ENV=production bun run start
```

The API serves the built frontend at http://localhost:8787

## Remote Access

### Via Tailscale (Recommended)

1. Install Tailscale on your Mac mini: https://tailscale.com/download
2. Get your Tailscale IP:
   ```bash
   tailscale ip -4
   ```
3. Update `.env`:
   ```
   PUBLIC_HOST=100.x.x.x
   ```
4. Access from any device on your tailnet: `http://100.x.x.x:8787`

### Via Cloudflare Tunnel (Alternative)

```bash
# Install cloudflared
brew install cloudflared

# Start tunnel
cloudflared tunnel --url http://localhost:8787
```

## Adding More Projects

### Option 1: Edit Seed File

Edit `apps/api/src/db/seed.ts` and add to `seedProjects`:

```typescript
{
  id: 'my-project',
  name: 'My Project',
  path: '/path/to/project',
  defaultDevPort: 5175,
}
```

Then: `bun run db:setup`

### Option 2: Via API

```bash
curl -X POST http://localhost:8787/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "path": "/path/to/project",
    "defaultDevPort": 5175
  }'
```

## Troubleshooting

### Database locked error
- Stop all processes (`pkill -f devcenter`)
- Delete `data/devcenter.db-*` files
- Restart

### WebSocket not connecting
- Check token in localStorage
- Check browser console for errors
- Verify API is running on correct port

### Preview URL not working
- Check project path exists
- Verify port is not already in use
- Check `PUBLIC_HOST` is set correctly

### Worker not picking up tasks
- Check worker is running (`bun run dev` starts it)
- Check database for pending tasks
- Check worker logs for errors

## Architecture

```
┌─────────────┐
│   Browser   │ (React + WebSocket)
└──────┬──────┘
       │ HTTP + WS
       ▼
┌─────────────┐
│  API Server │ (Express + SQLite)
└──────┬──────┘
       │ DB polling
       ▼
┌─────────────┐
│   Worker    │ (Task executor)
└─────────────┘
```

## Security Notes

- Change `CONTROL_PLANE_TOKEN` in production
- Never expose token in commits
- Use Tailscale or VPN for remote access
- Worker blocks dangerous commands (sudo, rm -rf)
- Only predefined recipe steps are executed

## License

MIT
