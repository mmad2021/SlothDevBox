# 🦥 SlothDevBox

> A self-hosted command center for running dev tasks on your Mac from anywhere - iPad, iPhone, or any device with a browser.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Control your development workflow from your couch.** SlothDevBox turns your Mac into a remote dev automation server with a mobile-friendly web interface. Create tasks, watch live logs, and manage your projects - all from your iPad.

## ✨ Features

- 📱 **Mobile-First UI** - Beautiful, responsive interface built with shadcn/ui
- 🎨 **Dark Mode** - Easy on the eyes, day or night
- 🔄 **Live Streaming Logs** - Watch task execution in real-time via WebSocket
- 🎯 **Recipe System** - Create custom automation workflows with a visual builder
- 🤖 **GitHub Copilot Integration** - AI-powered code assistance (optional)
- 🚀 **Preview URLs** - Instant dev server access from mobile
- 📊 **Task History** - Track all executions with artifacts and logs
- 🔒 **Secure** - Token-based auth, no arbitrary command execution
- 🌐 **Remote Access** - ngrok, Tailscale, or Cloudflare Tunnel support

## 📸 Screenshots

<details>
<summary>Dashboard</summary>

- View all tasks with status badges
- Dark/light mode toggle
- Quick access to projects, recipes, and new tasks

</details>

<details>
<summary>Recipe Manager</summary>

- Visual recipe builder with step-by-step configuration
- Create, view, and delete automation recipes
- Support for multiple step types (commands, git, copilot)

</details>

<details>
<summary>Task Detail</summary>

- Live streaming logs
- Task status and metadata
- Artifacts (preview URLs, diffs, notes)

</details>

## 🚀 Quick Start

### Prerequisites

- **Bun** (v1.0.0+) - [Install Bun](https://bun.sh)
- **Mac** - Primary dev machine (where tasks run)
- **GitHub Copilot CLI** (optional) - For AI features

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/SlothDevBox.git
cd SlothDevBox
```

2. **Install dependencies**

```bash
bun install
```

3. **Configure environment**

```bash
cp .env.example .env
```

Edit `.env` and set your secure token:

```env
CONTROL_PLANE_TOKEN=your-secure-token-here
PORT=8787
DB_PATH=./data/devcenter.db
```

4. **Setup database**

```bash
bun run db:setup
```

5. **Start the services**

```bash
bun run dev
```

This starts:
- 🔌 API server on `http://localhost:8787`
- 🎨 UI dev server on `http://localhost:5173`
- ⚙️ Worker process (polls for tasks)

6. **Open the UI**

Navigate to `http://localhost:5173` and login with your token.

## 📱 Remote Access Setup

### Option 1: ngrok (Easiest)

1. Create `~/ngrok.yml`:

```yaml
version: "2"
authtoken: YOUR_NGROK_AUTHTOKEN

tunnels:
  ui:
    proto: http
    addr: 5173
  api:
    proto: http
    addr: 8787
```

2. Start both tunnels:

```bash
ngrok start --all --config ~/ngrok.yml
```

3. Update `.env` with your API tunnel URL:

```env
VITE_API_BASE_URL=https://your-api-url.ngrok-free.app
```

4. Restart dev servers and access UI from iPad using the UI tunnel URL.

### Option 2: Tailscale (Recommended for persistent access)

1. Install [Tailscale](https://tailscale.com) on your Mac
2. Get your Tailscale IP: `tailscale ip -4`
3. Access from any device: `http://YOUR_TAILSCALE_IP:5173`

### Option 3: Cloudflare Tunnel

```bash
cloudflared tunnel --url http://localhost:5173
```

## 🎯 Usage

### 1. Add Your Projects

Via UI:
- Go to **Projects** page
- Click **New Project**
- Enter name, path, and default dev port

Via seed file (`apps/api/src/db/seed.ts`):

```typescript
export const seedProjects = [
  {
    id: 'my-app',
    name: 'My App',
    path: '/Users/you/projects/my-app',
    defaultDevPort: 5173,
  },
];
```

Then run: `bun run db:setup`

### 2. Create Recipes

Via UI:
- Go to **Recipes** page
- Click **New Recipe**
- Configure steps with the visual builder

Example recipe (Run Tests):

```json
{
  "id": "run-tests",
  "name": "Run Tests",
  "description": "Execute test suite",
  "steps": [
    { "type": "check_path" },
    { 
      "type": "command",
      "command": "bun",
      "args": ["test"]
    }
  ]
}
```

### 3. Run Tasks

1. Click **New Task** from Dashboard
2. Select a project and recipe
3. Enter any required inputs (e.g., goal for Copilot recipes)
4. Click **Create Task**
5. Watch live logs stream in real-time! 🔥

## 🎨 Recipe Step Types

| Step Type | Description | Use Case |
|-----------|-------------|----------|
| `check_path` | Validates project directory exists | Safety check |
| `command` | Run allowed commands (bun, npm, git) | Build, test, lint |
| `start_preview` | Launch dev server with preview URL | Remote development |
| `git` | Git operations (diff, branch, etc.) | Version control |
| `copilot` | GitHub Copilot CLI integration | AI assistance |

## 🏗️ Project Structure

```
SlothDevBox/
├── apps/
│   ├── api/          # Express backend (REST + WebSocket)
│   ├── ui/           # Vite + React frontend
│   └── worker/       # Task executor daemon
├── packages/
│   └── shared/       # Shared types & schemas
├── data/
│   └── devcenter.db  # SQLite database
└── .env              # Environment config
```

## 🔒 Security

- ✅ No arbitrary shell command execution
- ✅ Predefined recipe steps only
- ✅ Command allowlist: `git`, `bun`, `npm`, `node`, `gh`, `copilot`
- ✅ Blocks dangerous patterns: `sudo`, `rm -rf`, etc.
- ✅ Bearer token authentication on all routes
- ✅ CORS enabled for remote access

## 🛠️ Built-In Recipes

SlothDevBox includes these recipes out of the box:

1. **Start Preview (Vite)** - Launch dev server with public URL
2. **Run Tests** - Execute your test suite
3. **Copilot: Explain Code** - Ask AI about code concepts
4. **Copilot: Fix Bug** - Get AI help debugging
5. **Copilot: Implement Feature** - AI implementation guidance
6. **Copilot: Review Changes** - AI code review
7. **Create Branch + Diff** - Git workflow automation

## 📦 Production Deployment

```bash
# Build all apps
bun run build

# Start production server
NODE_ENV=production bun run start
```

The API server will serve the built frontend at `http://localhost:8787`.

## 🐛 Troubleshooting

<details>
<summary><b>Tasks not appearing</b></summary>

- Check worker is running (should see "Polling for tasks..." in terminal)
- Verify database path in `.env`
- Check API server logs for errors

</details>

<details>
<summary><b>Live logs not streaming</b></summary>

- Verify WebSocket connection (check browser console)
- If using ngrok, ensure API tunnel URL is set correctly
- Check firewall settings

</details>

<details>
<summary><b>Copilot recipes failing</b></summary>

```bash
# Install GitHub Copilot CLI
npm install -g @github/copilot

# Verify it works
copilot "explain how promises work"
```

</details>

<details>
<summary><b>Can't access from iPad via ngrok</b></summary>

- Ensure both UI and API tunnels are running
- Set `VITE_API_BASE_URL` in `.env` to your API ngrok URL
- Restart dev servers after changing `.env`

</details>

## 🎯 Tech Stack

- **Runtime**: Bun
- **Backend**: Express, TypeScript, bun:sqlite, ws
- **Frontend**: Vite, React, TypeScript, TailwindCSS, shadcn/ui
- **Icons**: lucide-react
- **Database**: SQLite with WAL mode
- **Monorepo**: Bun workspaces

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Icons by [Lucide](https://lucide.dev/)
- Inspired by the need to code from the couch 🛋️

---

<div align="center">
Made with ❤️ for lazy developers who love their iPads
</div>
