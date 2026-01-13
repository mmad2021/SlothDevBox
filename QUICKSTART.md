# SlothDevBox - Quick Start

## ✅ Prerequisites
- Bun installed (https://bun.sh)
- Node.js installed (for some dependencies)
- Git, GitHub Copilot CLI (`npm install -g @github/copilot`)

## 🚀 Get Started (5 minutes)

### 1. Install Dependencies
```bash
bun install
```

### 2. Environment Setup
The `.env` file is already created with default token `dev-token-change-me`.

**For production**: Change the token!
```bash
nano .env
# Change: CONTROL_PLANE_TOKEN=your-secure-token-here
```

### 3. Initialize Database
```bash
bun run db:setup
```

You should see:
```
✓ Tables created
✓ Seeded 1 projects
✓ Seeded 7 recipes
✓ Database setup complete!
```

### 4. Start Everything
```bash
bun run dev
```

This starts:
- **API Server**: http://localhost:8787
- **UI Dev Server**: http://localhost:5173
- **Worker**: Background process polling for tasks

### 5. Open & Login
1. Open http://localhost:5173
2. Login with token: `dev-token-change-me`
3. You're in! 🎉

## 📁 Add Your Projects

### From the Web UI (Recommended!)

1. Click **"Projects"** button in the dashboard
2. Click **"Add Project"**
3. Fill in:
   - **Project Name**: e.g., "My Web App"
   - **Project Path**: Full absolute path like `/Users/you/projects/my-app`
   - **Default Dev Port**: Port for Vite (e.g., 5174)
4. Click **"Add Project"**
5. Done! Your project is now available for tasks 🎉

### Alternative: Edit Seed File (Old Way)

If you prefer, edit `apps/api/src/db/seed.ts`:
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

Then re-run: `bun run db:setup`

## 📱 First Task

1. Click **"New Task"**
2. Select your project
3. Select recipe "Copilot: Implement Feature"
4. Enter goal: "create a simple hello world HTML file"
5. Click **"Create Task"**
6. Watch live logs stream in real-time! 🔥

## 🌐 Access from iPad/Mobile

### Option A: Tailscale (Recommended)
```bash
# Install Tailscale
brew install tailscale
tailscale up

# Get your IP
tailscale ip -4
# Example output: 100.101.102.103

# Update .env
echo "PUBLIC_HOST=100.101.102.103" >> .env

# Restart
bun run dev
```

Now access from any device on your tailnet:
```
http://100.101.102.103:8787
```

### Option B: Local Network
```bash
# Get your local IP
ipconfig getifaddr en0
# Example: 192.168.1.100

# Update .env
echo "PUBLIC_HOST=192.168.1.100" >> .env

# Restart
bun run dev
```

Access from devices on same WiFi:
```
http://192.168.1.100:8787
```

## ��️ Production Build

```bash
# Build
bun run build

# Start (serves UI + API on one port)
NODE_ENV=production bun run start

# Access at http://localhost:8787
```

## 📋 Available Recipes

1. **Copilot: Explain Code** - Ask questions about code
2. **Copilot: Fix Bug** - Get debugging help
3. **Copilot: Implement Feature** - Build new features
4. **Copilot: Review Changes** - AI code review
5. **Start Preview (Vite)** - Launch dev server with preview URL
6. **Run Tests** - Execute test suite
7. **Create Branch + Diff** - Git workflow

## 🔧 Managing Multiple Projects

The system now supports **multiple projects via the web UI**!

1. Go to **Dashboard** → **Projects**
2. Add as many projects as you need
3. Each project can have its own:
   - Name
   - Path
   - Dev port
4. Switch between projects when creating tasks

**Example Setup:**
- **Frontend App** → `/Users/you/projects/my-frontend` (port 5173)
- **Backend API** → `/Users/you/projects/my-backend` (port 3000)
- **Mobile App** → `/Users/you/projects/my-mobile` (port 8081)

Then create tasks for any project from your iPad! 🚀

## ❗ Troubleshooting

### "Unauthorized" error
- Check token matches in `.env` and UI login
- Token stored in browser localStorage

### Preview URL doesn't work
- Check project path exists
- Verify port not in use
- Check `PUBLIC_HOST` in `.env`

### Worker not picking up tasks
- Check worker is running (`bun run dev` starts it)
- Check terminal for worker output
- Database may be locked (restart all processes)

### Can't connect from iPad
- Check firewall allows port 8787
- Check devices on same network
- Try Tailscale for reliable access

### Copilot not working
```bash
# Check if installed
which copilot

# Install if missing
npm install -g @github/copilot

# Test it
copilot -p "hello world"
```

## 📚 Next Steps

- Read `README.md` for full documentation
- See `SETUP.md` for detailed setup guide
- Check `SUMMARY.md` for architecture details
- Add your projects via the **Projects** page!

## 🎯 Key Features

✅ **Multi-project support** - Add projects via web UI  
✅ **GitHub Copilot integration** - AI-powered coding assistant  
✅ **Live log streaming** - Watch tasks execute in real-time  
✅ **Preview URLs** - Access running dev servers from mobile  
✅ **Mobile-friendly** - Perfect for iPad/iPhone  
✅ **Secure** - Bearer token authentication  

---

Built with ❤️ using Bun, Express, React, Vite, shadcn/ui, and SQLite.
