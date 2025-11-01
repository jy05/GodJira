# GodJira - Enterprise JIRA Clone

> A full-stack, enterprise-grade project management system built with modern technologies and deployed on Kubernetes.

## 🚀 Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Production database
- **JWT** - Authentication
- **Swagger** - API documentation

### Frontend (Coming Soon)
- **React 18+** with TypeScript
- **Vite** - Build tool
- **TanStack Query** - Server state
- **Tailwind CSS** - Styling

### Infrastructure
- **Docker** - Containerization
- **Kubernetes** - Orchestration
- **Cloudflare Tunnel** - Zero-trust access
- **pnpm** - Package manager
- **Turborepo** - Monorepo build system

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
│   ├── api/                  # NestJS Backend API
│   │   ├── src/
│   │   │   ├── auth/        # Authentication module
│   │   │   ├── users/       # User management
│   │   │   ├── projects/    # Project management
│   │   │   ├── sprints/     # Sprint management
│   │   │   ├── issues/      # Issue/ticket management
│   │   │   ├── comments/    # Comments
│   │   │   ├── worklogs/    # Work logs
│   │   │   ├── prisma/      # Prisma service
│   │   │   └── main.ts      # Application entry
│   │   └── prisma/
│   │       └── schema.prisma # Database schema
│   └── web/                  # React Frontend (Coming Soon)
├── packages/                 # Shared libraries
├── docker-compose.yml        # Local development services
├── pnpm-workspace.yaml       # Workspace configuration
└── turbo.json               # Turborepo configuration
```

## 🗄️ Database Schema

### Core Models
- **User** - Authentication, roles, avatars (base64)
- **Project** - Project management with unique keys
- **Sprint** - Agile sprint management
- **Issue** - Tickets with status workflow
- **Comment** - Issue/task comments
- **WorkLog** - Time tracking
- **Task** - Legacy task support

## 🔐 Security Features

- ✅ NIST-compliant password hashing (bcrypt, 12 rounds)
- ✅ JWT authentication with refresh tokens
- ✅ Role-Based Access Control (RBAC)
- ✅ Rate limiting (100 req/min)
- ✅ Helmet security headers
- ✅ Account lockout after failed attempts
- ✅ Password history tracking
- ✅ Base64 avatar storage (no file paths)

## 📚 API Documentation

Access Swagger documentation at: `http://localhost:3000/api/docs`

### Main Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/projects` - List projects
- `POST /api/v1/issues` - Create issue
- `GET /api/v1/sprints` - List sprints

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

- [x] Monorepo setup
- [x] Database schema
- [x] Prisma configuration
- [ ] Authentication module
- [ ] User management
- [ ] Project CRUD
- [ ] Sprint management
- [ ] Issue tracking
- [ ] React frontend
- [ ] WebSocket real-time updates
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline

---

Built with ❤️ for the developer community
