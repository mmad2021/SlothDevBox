# 🦥 SlothDevBox

> A self-hosted dev task automation platform - Control your development machine from anywhere with AI-powered assistance.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Code from anywhere, anytime.** SlothDevBox turns your development machine into a remote automation server with a mobile-friendly web interface. Create tasks, watch live logs, leverage AI coding assistants, and manage your entire dev workflow - all from any device with a browser.

## ✨ Features

- 📱 **Mobile-First UI** - Beautiful, responsive interface built with shadcn/ui
- 🎨 **Dark Mode** - Easy on the eyes, day or night
- 🔄 **Live Streaming Logs** - Watch task execution in real-time via WebSocket
- 🧩 **Step Templates System** - Create reusable step configurations with JSON Schema
- 🎯 **Visual Recipe Builder** - Build automation workflows with drag-and-drop simplicity
- 🤖 **GitHub Copilot Integration** - AI-powered code assistance (optional)
- 🚀 **Preview URLs** - Instant dev server access from mobile
- 📊 **Task History** - Track all executions with artifacts and logs
- 🔒 **Secure** - Token-based auth, no arbitrary command execution
- 🌐 **Remote Access** - ngrok, Tailscale, or Cloudflare Tunnel support

## 🎯 Use Cases

- **Remote Development** - Work on your powerful dev machine from a tablet or phone
- **AI-Assisted Coding** - Let GitHub Copilot review code, fix bugs, and suggest implementations
- **Mobile Preview Testing** - Start dev servers and test on mobile devices instantly
- **Automated Workflows** - Run tests, builds, and deployments with a tap
- **Team Collaboration** - Share your dev environment securely with teammates

## 📸 Screenshots

<details>
<summary>Dashboard</summary>

- View all tasks with status badges
- Dark/light mode toggle
- Quick access to projects, recipes, and step templates

</details>

<details>
<summary>Step Templates Manager</summary>

- Create reusable step configurations
- JSON Schema validation
- Built-in templates for common operations

</details>

<details>
<summary>Recipe Builder</summary>

- Visual recipe builder with step-by-step configuration
- Create, view, and delete automation recipes
- Support for multiple step types

</details>

<details>
<summary>Task Detail</summary>

- Live streaming logs with intelligent auto-scroll
- Task status and metadata
- Artifacts (preview URLs, diffs, notes)

</details>

## 🚀 Quick Start

### Prerequisites

- **Bun** (v1.0.0+) - [Install Bun](https://bun.sh)
- **A development machine** - Where your code lives and tasks run
- **GitHub Copilot CLI** (optional) - For AI features

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/mmad2021/SlothDevBox.git
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

This creates the database and seeds:
- 5 default step templates (check_path, command, start_preview, git, copilot)
- Example project
- Built-in recipes

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

4. Restart dev servers and access UI from any device using the UI tunnel URL.

### Option 2: Tailscale (Recommended for persistent access)

1. Install [Tailscale](https://tailscale.com) on your dev machine
2. Get your Tailscale IP: `tailscale ip -4`
3. Access from any device on your tailnet: `http://YOUR_TAILSCALE_IP:5173`

### Option 3: Cloudflare Tunnel

```bash
cloudflared tunnel --url http://localhost:5173
```

## 🎯 Usage Guide

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
    path: '/path/to/your/project',
    defaultDevPort: 5173,
  },
];
```

Then run: `bun run db:setup`

### 2. Create Step Templates (Optional)

Step templates are reusable step configurations that ensure consistency across recipes.

Via UI:
1. Go to **Recipes** → **Step Templates**
2. Click **New Template**
3. Define the step type and JSON Schema for configuration

Example template:

```json
{
  "id": "run-npm-build",
  "name": "Run NPM Build",
  "description": "Execute npm build command",
  "type": "command",
  "configSchema": {
    "type": "object",
    "properties": {
      "command": { "type": "string" },
      "args": { "type": "array", "items": { "type": "string" } }
    },
    "required": ["command"]
  }
}
```

**5 Default Templates Included:**
- `check_path` - Validates project directory exists
- `command` - Run shell commands (bun, npm, git)
- `start_preview` - Launch dev servers with preview URLs
- `git` - Git operations (diff, branch, checkout)
- `copilot` - GitHub Copilot CLI integration

### 3. Create Recipes

Via UI:
1. Go to **Recipes** page
2. Click **New Recipe**
3. Configure steps using available step templates

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

### 4. Run Tasks

1. Click **New Task** from Dashboard
2. Select a project and recipe
3. Enter any required inputs (e.g., goal for Copilot recipes)
4. Click **Create Task**
5. Watch live logs stream in real-time! 🔥

## 🧩 Step Templates System

Step templates provide a type-safe, reusable way to define step configurations.

### Benefits

- ✅ **Consistency** - Standardized step configurations across recipes
- ✅ **Validation** - JSON Schema ensures correct configuration
- ✅ **Reusability** - Create once, use in multiple recipes
- ✅ **Documentation** - Self-documenting with descriptions and schemas
- ✅ **Extensibility** - Easy to add new step types

### Step Type Reference

| Step Type | Description | Use Case |
|-----------|-------------|----------|
| `check_path` | Validates project directory exists | Safety check before operations |
| `command` | Run allowed commands (bun, npm, git) | Build, test, lint |
| `start_preview` | Launch dev server with preview URL | Remote development |
| `git` | Git operations (diff, branch, etc.) | Version control |
| `copilot` | GitHub Copilot CLI integration | AI assistance |

### Creating Custom Step Types

1. Define a new step template with a unique type
2. Create JSON Schema for required configuration
3. Update the worker executor to handle the new type
4. Use in recipes!

## 🤖 GitHub Copilot Integration

SlothDevBox includes built-in recipes for AI-assisted development.

### Prerequisites

```bash
# Install GitHub Copilot CLI
npm install -g @github/copilot

# Verify installation
copilot "explain how promises work"
```

### Built-In Copilot Recipes

1. **Copilot: Explain Code** - Ask AI about code concepts
2. **Copilot: Fix Bug** - Get AI help debugging issues
3. **Copilot: Implement Feature** - AI implementation guidance
4. **Copilot: Review Changes** - AI code review of uncommitted changes

### Example Usage

```
Recipe: Copilot: Fix Bug
Goal: "API returns 500 error when user submits empty form"

Result:
✅ Copilot analyzes the issue
✅ Suggests adding form validation
✅ Recommends error handling improvements
✅ Response saved as artifact for reference
```

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
- ✅ JSON Schema validation for step configurations

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
<summary><b>Can't access from remote device via ngrok</b></summary>

- Ensure both UI and API tunnels are running
- Set `VITE_API_BASE_URL` in `.env` to your API ngrok URL
- Restart dev servers after changing `.env`

</details>

<details>
<summary><b>Step templates not appearing</b></summary>

Run database setup to seed default templates:

```bash
bun run db:setup
```

</details>

## 🎯 Tech Stack

- **Runtime**: Bun
- **Backend**: Express, TypeScript, bun:sqlite, ws
- **Frontend**: Vite, React, TypeScript, TailwindCSS, shadcn/ui
- **Icons**: lucide-react
- **Database**: SQLite with WAL mode
- **Monorepo**: Bun workspaces

## 🗺️ Roadmap

- [ ] Recipe templates marketplace
- [ ] Multi-user support with roles
- [ ] Scheduled tasks (cron-like)
- [ ] Integration with more AI coding assistants
- [ ] Docker deployment support
- [ ] Plugin system for custom step types

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

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
- Inspired by the need to code from anywhere 🌍

---

<div align="center">
Made with ❤️ for developers who value flexibility
</div>
