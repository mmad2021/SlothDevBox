# 📖 SlothDevBox - Documentation Index

Welcome! This is your complete guide to the SlothDevBox.

## 🚦 Start Here

**Brand new?** Read in this order:

1. **[QUICKSTART.md](QUICKSTART.md)** ⚡ - Get running in 5 minutes
2. **[SUMMARY.md](SUMMARY.md)** 📊 - Complete implementation overview
3. **[README.md](README.md)** 📚 - Main documentation & features

## 📚 All Documentation

### Getting Started
- **[QUICKSTART.md](QUICKSTART.md)** - Fastest path to running system
  - Install dependencies
  - Configure environment
  - Start development
  - Create first task

- **[SETUP.md](SETUP.md)** - Detailed setup & configuration
  - Remote access via Tailscale
  - Cloudflare Tunnel alternative
  - Adding projects
  - Troubleshooting

### Understanding the System
- **[SUMMARY.md](SUMMARY.md)** - Complete implementation overview
  - Architecture diagram
  - API endpoints
  - Recipe details
  - Database schema
  - Commands reference

- **[DELIVERABLE.md](DELIVERABLE.md)** - What's been built
  - Feature checklist
  - Known limitations
  - Future enhancements
  - Testing checklist

- **[FILETREE.md](FILETREE.md)** - Code structure
  - Directory layout
  - Key files
  - File count

### Main Documentation
- **[README.md](README.md)** - Project overview
  - Features
  - Stack
  - Quick start
  - API authentication
  - Security notes

## 🎯 Quick Reference

### Essential Commands
```bash
bun install              # Install dependencies
bun run db:setup        # Initialize database
bun run dev             # Start everything
bun run build           # Production build
```

### Essential Files to Edit
```
apps/api/src/db/seed.ts    # Add your projects here
.env                        # Configure token & host
```

### Essential URLs
```
http://localhost:5173      # UI (dev mode)
http://localhost:8787      # API (always)
ws://localhost:8787/ws     # WebSocket (always)
```

## 🗺️ File Structure Overview

```
SlothDevBox/
├── README.md              ← Start here for overview
├── QUICKSTART.md          ← 5-minute setup guide
├── SUMMARY.md             ← Complete implementation details
├── SETUP.md               ← Detailed setup & remote access
├── DELIVERABLE.md         ← What's built & limitations
├── FILETREE.md            ← Code structure
├── INDEX.md               ← This file
│
├── .env                   ← Configure token & settings
├── .env.example           ← Template
├── package.json           ← Root workspace config
│
├── apps/
│   ├── api/              ← Express backend
│   ├── ui/               ← React frontend
│   └── worker/           ← Task executor
│
├── packages/
│   └── shared/           ← Shared types
│
└── data/
    └── devcenter.db      ← SQLite database
```

## 📋 Common Tasks

### First Time Setup
1. Read [QUICKSTART.md](QUICKSTART.md)
2. Run `bun install`
3. Edit `apps/api/src/db/seed.ts` with your project path
4. Run `bun run db:setup`
5. Run `bun run dev`
6. Open http://localhost:5173

### Adding a New Project
See [SETUP.md](SETUP.md#adding-more-projects) - Option 1 or 2

### Accessing from iPad
See [QUICKSTART.md](QUICKSTART.md#-access-from-ipadmobile) - Tailscale recommended

### Troubleshooting
See [SETUP.md](SETUP.md#troubleshooting) or [QUICKSTART.md](QUICKSTART.md#-troubleshooting)

### Understanding the Code
See [FILETREE.md](FILETREE.md) for structure, [SUMMARY.md](SUMMARY.md) for architecture

### Checking What's Implemented
See [DELIVERABLE.md](DELIVERABLE.md) for complete feature list

## 🎓 Learning Path

### Level 1: User
- Read [QUICKSTART.md](QUICKSTART.md)
- Create tasks via UI
- Watch live logs
- Access previews

### Level 2: Administrator
- Read [SETUP.md](SETUP.md)
- Add projects
- Configure remote access
- Manage database

### Level 3: Developer
- Read [SUMMARY.md](SUMMARY.md)
- Understand architecture
- Read [FILETREE.md](FILETREE.md)
- Explore source code
- Add custom recipes

## 💡 Pro Tips

1. **Use separate terminals** for API, Worker, and UI in dev mode for better log visibility
2. **Set PUBLIC_HOST** in `.env` for remote access preview URLs
3. **Use Tailscale** for secure, reliable remote access from anywhere
4. **Check terminal logs** when something goes wrong - worker logs are very helpful
5. **Reset database** if you modify seed data: `rm data/devcenter.db* && bun run db:setup`

## 🆘 Need Help?

**Problem: Can't get started**
→ Read [QUICKSTART.md](QUICKSTART.md) step by step

**Problem: Something doesn't work**
→ Check [SETUP.md](SETUP.md#troubleshooting)

**Problem: Want to understand how it works**
→ Read [SUMMARY.md](SUMMARY.md) for architecture

**Problem: Need to customize**
→ Check [FILETREE.md](FILETREE.md) to find the right file

**Problem: Want to know what's possible**
→ See [DELIVERABLE.md](DELIVERABLE.md) for features & limitations

## 🎯 Next Steps

1. **First time?** Go to [QUICKSTART.md](QUICKSTART.md) now!
2. **Already running?** Check [SUMMARY.md](SUMMARY.md) for advanced usage
3. **Want remote access?** See [SETUP.md](SETUP.md#via-tailscale-recommended)
4. **Ready for production?** Read [SUMMARY.md](SUMMARY.md#production)

## 📊 Documentation Stats

- **Total docs**: 6 markdown files
- **Total pages**: ~50 pages
- **Estimated reading time**: 30 minutes (all docs)
- **Quick start time**: 5 minutes

---

**Status**: ✅ Complete & ready to use!

Start with [QUICKSTART.md](QUICKSTART.md) → Run `bun run dev` → Open http://localhost:5173 → 🚀
