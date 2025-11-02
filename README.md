# GodJira - Enterprise JIRA Clone

> A full-stack, enterprise-grade project management system built with modern technologies and deployed on Kubernetes.

## ⚡ Project Status: **98% Backend Complete**

### ✅ Completed Features
- Full authentication system with JWT & refresh tokens
- User management with admin panel
- Project & Sprint management
- Issue tracking with sub-tasks & bulk operations
- Comments system with @mentions
- Work logs & time tracking
- Audit logging & activity feeds
- Issue linking & watchers
- Team management & assignments
- **Real-time notifications via WebSockets** �
- Kubernetes deployment ready
- Prometheus metrics & health checks

### 🚧 In Progress
- Reporting & Analytics (sprint reports, burndown charts)
- File upload with virus scanning
- CSV/Excel export functionality

## �🚀 Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **Prisma** - Type-safe ORM with PostgreSQL
- **Socket.io** - Real-time WebSocket communication
- **JWT** - Authentication with refresh tokens
- **Swagger** - Interactive API documentation
- **Nodemailer** - Email notifications
- **Prometheus** - Metrics & monitoring

### Frontend (Coming Soon)
- **React 18+** with TypeScript
- **Vite** - Lightning-fast build tool
- **TanStack Query** - Server state management
- **Socket.io Client** - Real-time updates
- **Tailwind CSS** - Utility-first styling

### Infrastructure
- **Docker** - Multi-stage containerization
- **Kubernetes** - Production orchestration
- **Helm** - Kubernetes package management
- **Cloudflare Tunnel** - Zero-trust access
- **pnpm** - Fast, efficient package manager
- **Turborepo** - High-performance monorepo build system

## 📋 Prerequisites

- Node.js 20+
- pnpm 9+
- Docker Desktop
- PostgreSQL 15+ (or use Docker Compose)

## 🛠️ Quick Start

### 1. Install Dependencies

```powershell
# Install pnpm globally (if not installed)
npm install -g pnpm

# Install all workspace dependencies
pnpm install
```

### 2. Start Database

```powershell
# Start PostgreSQL with Docker Compose
docker-compose up -d postgres

# Check database is running
docker ps
```

### 3. Setup Database Schema

```powershell
# Navigate to API directory
cd apps/api

# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate

# (Optional) Seed database with sample data
pnpm prisma:seed

# (Optional) Open Prisma Studio
pnpm prisma:studio
```

### 4. Start Backend API

```powershell
# Development mode with hot reload
cd apps/api
pnpm dev

# The API will be available at:
# - API: http://localhost:3000
# - Swagger Docs: http://localhost:3000/api/docs
```

## 📁 Project Structure

```
GodJira/
├── apps/
│   ├── api/                      # NestJS Backend API
│   │   ├── src/
│   │   │   ├── auth/            # ✅ JWT authentication & strategies
│   │   │   ├── users/           # ✅ User management with admin features
│   │   │   ├── projects/        # ✅ Project CRUD & statistics
│   │   │   ├── sprints/         # ✅ Sprint lifecycle management
│   │   │   ├── issues/          # ✅ Issue tracking with sub-tasks
│   │   │   ├── comments/        # ✅ Comments with @mentions
│   │   │   ├── worklogs/        # ✅ Time tracking
│   │   │   ├── audit/           # ✅ Audit logs & activity feeds
│   │   │   ├── issue-links/     # ✅ Issue relationships
│   │   │   ├── watchers/        # ✅ Issue watchers
│   │   │   ├── teams/           # ✅ Team management
│   │   │   ├── notifications/   # ✅ Real-time WebSocket notifications
│   │   │   ├── email/           # ✅ Email service
│   │   │   ├── health/          # ✅ Health checks
│   │   │   ├── metrics/         # ✅ Prometheus metrics
│   │   │   ├── prisma/          # ✅ Database service
│   │   │   └── main.ts          # Application entry
│   │   └── prisma/
│   │       └── schema.prisma    # Complete database schema
│   └── web/                      # React Frontend (Coming Soon)
├── packages/                     # Shared libraries
├── helm/                         # ✅ Kubernetes Helm charts
├── k8s/                          # ✅ Kubernetes manifests
├── monitoring/                   # ✅ Prometheus configuration
├── docker-compose.yml            # ✅ Local development services
├── pnpm-workspace.yaml           # Workspace configuration
└── turbo.json                    # Turborepo configuration
```

## 🗄️ Database Schema

### Core Models
- **User** - Authentication, roles, avatars, admin features
- **Project** - Project management with unique keys & statistics
- **Sprint** - Agile sprint lifecycle (PLANNED → ACTIVE → COMPLETED)
- **Issue** - Full ticket system with status workflow & sub-tasks
- **Comment** - Comments with @mentions support
- **WorkLog** - Time tracking per issue
- **AuditLog** - Complete audit trail
- **IssueLink** - Issue relationships (blocks, relates, duplicates)
- **Watcher** - Users watching issues for notifications
- **Team** - Team management with members & projects
- **Notification** - Real-time notifications (9 types)
- **Task** - Legacy task support

### Notification Types
- `ISSUE_ASSIGNED` - Issue assignment notifications
- `ISSUE_UPDATED` - Issue update notifications
- `ISSUE_COMMENTED` - New comment notifications
- `ISSUE_MENTIONED` - @mention notifications
- `ISSUE_STATUS_CHANGED` - Status change notifications
- `SPRINT_STARTED` - Sprint start notifications
- `SPRINT_COMPLETED` - Sprint completion notifications
- `TEAM_ADDED` - Team membership notifications
- `WATCHER_ADDED` - Watcher confirmation notifications

## 🔐 Security Features

- ✅ NIST-compliant password hashing (bcrypt, 12 rounds)
- ✅ JWT authentication with refresh tokens (30m + 7d expiry)
- ✅ Role-Based Access Control (RBAC) - USER, ADMIN, SUPER_ADMIN
- ✅ Rate limiting (100 req/min via Throttler)
- ✅ Helmet security headers
- ✅ Account lockout after failed login attempts
- ✅ Password history tracking (prevent reuse)
- ✅ Base64 avatar storage (secure, no file paths)
- ✅ WebSocket JWT authentication
- ✅ Email verification system
- ✅ Password reset with secure tokens
- ✅ Comprehensive audit logging

## 📚 API Documentation

Access interactive Swagger documentation at: `http://localhost:3000/api/docs`

### API Modules (98 endpoints total)

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Reset password with token
- `POST /api/v1/auth/verify-email` - Verify email address
- `GET /api/v1/auth/profile` - Get user profile

#### Users
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/me` - Get current user
- `PATCH /api/v1/users/me` - Update profile
- `PATCH /api/v1/users/me/password` - Change password
- Admin endpoints for user management

#### Projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects` - List projects
- `GET /api/v1/projects/:id` - Get project details
- `GET /api/v1/projects/:id/statistics` - Project statistics
- `PATCH /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

#### Sprints
- `POST /api/v1/sprints` - Create sprint
- `GET /api/v1/sprints` - List sprints
- `PATCH /api/v1/sprints/:id/start` - Start sprint
- `PATCH /api/v1/sprints/:id/complete` - Complete sprint
- `GET /api/v1/sprints/:id/statistics` - Sprint statistics

#### Issues
- `POST /api/v1/issues` - Create issue
- `GET /api/v1/issues` - List issues with filters
- `GET /api/v1/issues/:id` - Get issue details
- `PATCH /api/v1/issues/:id` - Update issue
- `PATCH /api/v1/issues/:id/assign` - Assign issue
- `PATCH /api/v1/issues/:id/status` - Update status
- `POST /api/v1/issues/bulk-update` - Bulk operations
- Sub-task management endpoints

#### Comments
- `POST /api/v1/comments` - Create comment
- `GET /api/v1/comments/issue/:issueId` - Get comments
- `PATCH /api/v1/comments/:id` - Update comment
- `DELETE /api/v1/comments/:id` - Delete comment

#### Work Logs
- `POST /api/v1/work-logs` - Log time
- `GET /api/v1/work-logs/issue/:issueId` - Get issue logs
- `GET /api/v1/work-logs/user/:userId/stats` - User time stats

#### Watchers
- `POST /api/v1/watchers/issue/:issueId` - Watch issue
- `DELETE /api/v1/watchers/issue/:issueId` - Unwatch issue
- `GET /api/v1/watchers/my-watched-issues` - Get watched issues

#### Teams
- `POST /api/v1/teams` - Create team
- `GET /api/v1/teams/my-teams` - Get user's teams
- `POST /api/v1/teams/:teamId/members` - Add team member
- `PATCH /api/v1/teams/:teamId/members/:userId/role` - Update member role

#### Notifications
- `GET /api/v1/notifications` - Get notifications
- `GET /api/v1/notifications/unread-count` - Unread count
- `PATCH /api/v1/notifications/:id/read` - Mark as read
- `PATCH /api/v1/notifications/read-all` - Mark all as read
- WebSocket connection at `/notifications` namespace

#### Monitoring
- `GET /api/v1/health` - Health check
- `GET /api/v1/metrics` - Prometheus metrics
- `GET /api/v1/audit/logs` - Audit logs
- `GET /api/v1/audit/activity-feed` - Activity feed

## 🧪 Testing

```powershell
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:cov
```

## 🐳 Docker

### Development
```powershell
docker-compose up -d
```

### Production Build
```powershell
# Build backend image
docker build -f apps/api/Dockerfile -t godjira-api:latest .

# Run container
docker run -p 3000:3000 --env-file apps/api/.env godjira-api:latest
```

## 📊 Database Management

### PgAdmin (Web UI)
Access at: `http://localhost:5050`
- Email: `admin@godjira.local`
- Password: `admin123`

### Prisma Studio
```powershell
cd apps/api
pnpm prisma:studio
```

## 🚀 Deployment

### Kubernetes
(Documentation coming soon)

### Cloudflare Tunnel
(Documentation coming soon)

## 📝 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/godjira"
JWT_SECRET="your-secret-key"
PORT=3000
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning and commercial purposes.

## 🎯 Roadmap

### ✅ Completed (Backend - 98%)
- [x] Monorepo setup with Turborepo
- [x] Complete database schema (15+ models)
- [x] Prisma ORM configuration & migrations
- [x] Authentication module (JWT + refresh tokens)
- [x] User management with admin panel
- [x] Project CRUD with statistics
- [x] Sprint lifecycle management
- [x] Issue tracking with sub-tasks
- [x] Comments system with @mentions
- [x] Work logs & time tracking
- [x] Audit logging & activity feeds
- [x] Issue linking & relationships
- [x] Watchers feature
- [x] Team management
- [x] **Real-time WebSocket notifications** 🎉
- [x] Email notifications
- [x] Kubernetes deployment manifests
- [x] Helm charts
- [x] Prometheus metrics
- [x] Health checks
- [x] Docker containerization

### 🚧 In Progress
- [ ] Reporting & Analytics
  - Sprint reports
  - Burndown charts
  - Velocity tracking
  - Issue aging
  - Team capacity
- [ ] File Upload System
  - File attachments
  - Virus scanning
  - Thumbnail generation
- [ ] Export Functionality
  - CSV/Excel export
  - Report exports

### 📅 Planned
- [ ] React Frontend
  - Dashboard
  - Issue board (Kanban)
  - Sprint board
  - Real-time updates (WebSocket integration)
- [ ] Advanced Features
  - Custom workflows
  - Advanced search/JQL
  - Release management
  - Roadmaps
- [ ] CI/CD Pipeline
  - GitHub Actions
  - Automated testing
  - Automated deployments

## 🌟 Key Features

### Real-Time Notifications 🔥
Connect to WebSocket at `ws://localhost:3000/notifications`:
```javascript
import io from 'socket.io-client';

const socket = io('ws://localhost:3000/notifications', {
  auth: { token: 'your-jwt-token' }
});

socket.on('connected', (data) => {
  console.log('Connected:', data.userId);
});

socket.on('notification', (notification) => {
  console.log('New notification:', notification);
});
```

### Multi-Device Support
Users can be online on multiple devices simultaneously. Notifications are delivered to all active connections.

### Comprehensive Issue Management
- Create issues with rich metadata
- Sub-task hierarchies
- Bulk operations
- Status workflows
- Issue linking (blocks, relates, duplicates)
- @mentions in comments
- Time tracking
- Watchers

### Team Collaboration
- Create teams with members
- Assign teams to projects
- Role-based permissions (LEAD, MEMBER)
- Team-based notifications

---

Built with ❤️ for the developer community | **Backend: 98% Complete** ⚡
