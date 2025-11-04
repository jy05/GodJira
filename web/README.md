# GodJira Frontend

React + TypeScript + Vite frontend for GodJira project management system.

## Quick Start

```powershell
# Install dependencies (from project root)
pnpm install

# Start development server
cd web
pnpm dev

# Access application
# http://localhost:5173
```

## Prerequisites

- Backend API running on `http://localhost:3000`
- Node.js 18+ and pnpm installed
- PostgreSQL database initialized

## Available Scripts

- `pnpm dev` - Start Vite dev server (port 5173)
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## Tech Stack

- **React 18.2** - UI library
- **TypeScript 5.3** - Type safety
- **Vite 5.0** - Build tool & dev server
- **React Router 6** - Client-side routing (hash mode)
- **TanStack Query 5** - Server state management
- **Tailwind CSS 3.3** - Styling
- **React Hook Form 7** - Form validation
- **Axios 1.6** - HTTP client
- **Socket.io Client 4.8** - WebSockets (ready for Phase 5+)

## Project Structure

```
web/
├── src/
│   ├── main.tsx              # App entry point
│   ├── App.tsx               # Main component with routing
│   ├── config/
│   │   └── constants.ts      # API URLs, NIST rules
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   ├── lib/
│   │   └── api-client.ts     # Axios instance with interceptors
│   ├── services/
│   │   └── auth.service.ts   # Auth API methods
│   ├── contexts/
│   │   └── AuthContext.tsx   # Global auth state
│   ├── components/
│   │   ├── ProtectedRoute.tsx
│   │   └── PublicRoute.tsx
│   └── pages/
│       ├── auth/             # Login, Register, etc.
│       ├── DashboardPage.tsx
│       └── NotFoundPage.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## Environment Variables

Create `.env.local` for custom configuration:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

## Features (Phase 1)

✅ **Authentication**
- JWT-based login/register
- Token refresh (30min access, 7d refresh)
- Account lockout (5 attempts, 15min)
- NIST password validation
- Email verification
- Password reset flow

✅ **Routing**
- Protected routes (require auth)
- Public routes (redirect if auth)
- Hash routing for SPA
- 404 page

✅ **Dashboard**
- User profile display
- Role-based UI (ADMIN/MANAGER/USER)
- Sign out functionality

## Development

### Backend Proxy

Vite dev server proxies `/api` requests to `http://localhost:3000`:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost:3000',
  },
},
```

### Path Aliases

Use `@/` for clean imports:

```typescript
import { API_URL } from '@/config/constants';
import { User } from '@/types';
```

### Tailwind Utilities

Custom utility classes available:

```html
<button class="btn btn-primary">Button</button>
<input class="input" />
<label class="label">Label</label>
<div class="card">Card content</div>
```

## Testing Phase 1

See `PHASE1_TEST_CHECKLIST.md` for comprehensive testing guide.

### Quick Test

1. Start backend: `cd apps && pnpm start:dev`
2. Start frontend: `cd web && pnpm dev`
3. Navigate to http://localhost:5173
4. Register new account with strong password
5. Login and verify dashboard

## API Endpoints Used

Phase 1 requires these backend endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/profile`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-email`

## Troubleshooting

### Port Already in Use

```powershell
# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Clear Browser Cache

```javascript
// Browser console
localStorage.clear();
location.reload();
```

### TypeScript Errors

```powershell
# Restart TypeScript server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

## Next Phase

**Phase 2: Users & Profile**
- User list with search
- User profile page
- Avatar upload (Base64, 10MB max)
- Profile editing

See `FRONTEND.md` for details.

## Contributing

1. Follow existing code style
2. Use TypeScript strict mode
3. Add types for all API responses
4. Use React Hook Form for forms
5. Follow Tailwind utility-first approach

## License

Proprietary - GodJira Project
