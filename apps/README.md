# GodJira API - Backend Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker Desktop (for database)
- PostgreSQL 15+ (or use Docker Compose)

### 1. Install Dependencies

```powershell
# From the root directory
pnpm install
```

### 2. Start Database

```powershell
# Start PostgreSQL with Docker Compose
docker-compose up -d postgres

# Verify database is running
docker ps
```

### 3. Configure Environment

```powershell
# Copy environment template
cd apps/api
copy .env.example .env

# Edit .env with your configuration
```

### 4. Initialize Database

```powershell
# Generate Prisma Client
pnpm prisma:generate

# Create database tables
pnpm prisma:migrate

# (Optional) Seed with sample data
pnpm prisma:seed
```

### 5. Start Development Server

```powershell
# Start API in development mode
pnpm dev
```

The API will be available at:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs

## 📁 Project Structure

```
apps/api/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── auth/                  # Authentication module
│   │   ├── decorators/        # Custom decorators
│   │   ├── dto/               # Data transfer objects
│   │   ├── guards/            # Auth guards
│   │   └── strategies/        # Passport strategies
│   ├── users/                 # User management
│   ├── projects/              # Project management
│   ├── prisma/                # Prisma service
│   ├── app.module.ts          # Root module
│   └── main.ts                # Application entry
├── .env                       # Environment variables
├── Dockerfile                 # Docker configuration
└── package.json               # Dependencies
```

## 🔐 Authentication

### Register User
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "jobTitle": "Software Engineer",
  "department": "Engineering"
}
```

### Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Protected Endpoints
Include the access token in the Authorization header:
```
Authorization: Bearer <accessToken>
```

## 📊 Database Management

### Prisma Studio
```powershell
pnpm prisma:studio
```
Access at: http://localhost:5555

### Migrations
```powershell
# Create a new migration
pnpm prisma migrate dev --name <migration-name>

# Apply migrations in production
pnpm prisma migrate deploy

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset
```

### Database Seeding
```powershell
pnpm prisma:seed
```

## 🐳 Docker

### Build Image
```powershell
docker build -f apps/api/Dockerfile -t godjira-api:latest .
```

### Run Container
```powershell
docker run -p 3000:3000 --env-file apps/api/.env godjira-api:latest
```

### Docker Compose (Full Stack)
```powershell
docker-compose up -d
```

## 🧪 Testing

```powershell
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov

# E2E tests
pnpm test:e2e
```

## 📝 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/profile` - Get current user profile

### Users
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/me` - Get current user
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/me` - Update current user profile
- `PATCH /api/v1/users/me/password` - Change password
- `PATCH /api/v1/users/:id` - Update user (Admin only)
- `DELETE /api/v1/users/:id/deactivate` - Deactivate user (Admin only)
- `PATCH /api/v1/users/:id/reactivate` - Reactivate user (Admin only)

### Projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects` - Get all projects
- `GET /api/v1/projects/:id` - Get project by ID
- `GET /api/v1/projects/key/:key` - Get project by key
- `GET /api/v1/projects/:id/statistics` - Get project statistics
- `PATCH /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/database"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="30m"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="7d"

# Application
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"

# Security
BCRYPT_ROUNDS=12
PASSWORD_MIN_LENGTH=8
PASSWORD_HISTORY_SIZE=5
MAX_LOGIN_ATTEMPTS=5
LOCK_DURATION_MINUTES=15

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/gif,image/webp"

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

## 🔒 Security Features

- ✅ NIST-compliant password hashing (bcrypt, 12 rounds)
- ✅ JWT authentication with refresh tokens
- ✅ Role-Based Access Control (RBAC)
- ✅ Rate limiting (100 requests/minute)
- ✅ Helmet security headers
- ✅ CORS protection
- ✅ Account lockout after failed attempts
- ✅ Password history tracking
- ✅ Base64 avatar storage (no file paths)
- ✅ Input validation with class-validator
- ✅ SQL injection protection via Prisma

## 📚 API Documentation

Access Swagger/OpenAPI documentation:
```
http://localhost:3000/api/docs
```

## 🚨 Troubleshooting

### Database Connection Issues
```powershell
# Check if PostgreSQL is running
docker ps

# View PostgreSQL logs
docker logs godjira-postgres

# Restart database
docker-compose restart postgres
```

### Prisma Issues
```powershell
# Regenerate Prisma Client
pnpm prisma:generate

# Reset database
pnpm prisma migrate reset
```

### Port Already in Use
```powershell
# Windows: Find process using port 3000
netstat -ano | findstr :3000

# Kill process by PID
taskkill /PID <PID> /F
```

## 📦 Available Scripts

```powershell
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Lint code
pnpm format           # Format code with Prettier
pnpm test             # Run tests
pnpm prisma:generate  # Generate Prisma Client
pnpm prisma:migrate   # Run database migrations
pnpm prisma:studio    # Open Prisma Studio
pnpm prisma:seed      # Seed database
```

## 🎯 Next Steps

1. ✅ Authentication module
2. ✅ User management
3. ✅ Project management
4. 🔄 Sprint management (next)
5. 🔄 Issue/ticket management
6. 🔄 Comments and work logs
7. 🔄 Real-time updates with WebSockets

## 📞 Support

For issues or questions, please create an issue in the GitHub repository.

---

Built with ❤️ using NestJS, Prisma, and PostgreSQL
