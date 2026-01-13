# SlothDevBox - Complete File Tree

```
SlothDevBox/
├── .env                           # Environment configuration
├── .env.example                   # Example environment variables
├── .gitignore                     # Git ignore patterns
├── README.md                      # Main documentation
├── SETUP.md                       # Setup instructions
├── FILETREE.md                    # This file
├── package.json                   # Root workspace config
│
├── data/
│   └── devcenter.db              # SQLite database (created on setup)
│
├── packages/
│   └── shared/                   # Shared types & schemas
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── index.ts          # Zod schemas, TypeScript types
│
├── apps/
│   ├── api/                      # Express backend
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts          # Main server file
│   │       ├── middleware/
│   │       │   └── auth.ts       # Bearer token auth
│   │       ├── routes/
│   │       │   ├── health.ts     # Health check endpoint
│   │       │   ├── projects.ts   # Projects CRUD
│   │       │   ├── recipes.ts    # Recipes list
│   │       │   └── tasks.ts      # Tasks CRUD + logs + artifacts
│   │       ├── websocket/
│   │       │   └── server.ts     # WebSocket log streaming
│   │       └── db/
│   │           ├── database.ts   # SQLite connection
│   │           ├── schema.ts     # Database schema DDL
│   │           ├── seed.ts       # Seed data (projects & recipes)
│   │           └── setup.ts      # Database initialization script
│   │
│   ├── worker/                   # Task executor
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts          # Main worker loop
│   │       ├── database.ts       # DB queries for worker
│   │       ├── api-client.ts     # Posts logs/artifacts to API
│   │       └── executor.ts       # Recipe step executor
│   │
│   └── ui/                       # Vite React frontend
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsconfig.node.json
│       ├── vite.config.ts        # Vite config with API proxy
│       ├── tailwind.config.js    # Tailwind CSS config
│       ├── postcss.config.js     # PostCSS config
│       ├── index.html            # HTML entry point
│       └── src/
│           ├── main.tsx          # React entry point
│           ├── App.tsx           # Main app with routing
│           ├── index.css         # Global styles + Tailwind
│           ├── lib/
│           │   ├── utils.ts      # cn() utility
│           │   └── api.ts        # API client + auth
│           ├── components/
│           │   └── ui/           # shadcn UI components
│           │       ├── button.tsx
│           │       ├── card.tsx
│           │       ├── badge.tsx
│           │       ├── input.tsx
│           │       ├── textarea.tsx
│           │       └── label.tsx
│           └── pages/
│               ├── Login.tsx     # Login with token
│               ├── Dashboard.tsx # Task list
│               ├── NewTask.tsx   # Create task form
│               └── TaskDetail.tsx # Task detail + live logs
```

## Key Files

### Configuration
- `.env` - Environment variables (token, ports, paths)
- `package.json` - Bun workspace config with scripts
- `vite.config.ts` - Dev proxy for /api and /ws

### Backend
- `apps/api/src/index.ts` - Express server with WebSocket
- `apps/api/src/routes/tasks.ts` - Main API logic
- `apps/api/src/db/seed.ts` - **Edit this to add projects**

### Worker
- `apps/worker/src/executor.ts` - Recipe execution logic
- `apps/worker/src/index.ts` - Polling loop

### Frontend
- `apps/ui/src/App.tsx` - React Router setup
- `apps/ui/src/pages/TaskDetail.tsx` - Live log streaming

## Total Files: ~40 source files
