# GodJira# GodJira# GodJira# GodJira# GodJira# GodJira - Enterprise JIRA Clone



A full-featured project management system inspired by Atlassian JIRA, built with NestJS, Prisma, PostgreSQL, and React.



---An enterprise-grade project management system inspired by Atlassian JIRA. Built with NestJS, Prisma, PostgreSQL, and React.



## Prerequisites



- **Node.js** 20+**Features:** Issue tracking, sprint management, team collaboration, real-time notifications, time tracking, file attachments, and analytics.An enterprise-grade project management system built with modern technologies. Provides comprehensive issue tracking, sprint management, team collaboration, and real-time notifications.

- **pnpm** 8+

- **PostgreSQL** 15+

- **Docker** (optional)

## Prerequisites

---



## Quick Start with Docker

- Node.js 20+## Table of ContentsGodJira is an enterprise-grade project management system built with modern technologies. It provides comprehensive issue tracking, sprint management, team collaboration, and real-time notifications.

```bash

# Clone repository- pnpm 8+

git clone https://github.com/yourusername/GodJira.git

cd GodJira- PostgreSQL 15+



# Install dependencies- Docker (optional)

pnpm install

1. [Overview](#overview)

# Start all services

docker-compose -f docker-compose.dev.yml up -d## Quick Start with Docker

```

2. [Features](#features)

**Access:**

- Frontend: http://localhost:5173```bash

- Backend API: http://localhost:3000

- API Docs: http://localhost:3000/api/docs# Clone repository3. [Technology Stack](#technology-stack)## Table of ContentsGodJira is an enterprise-grade project management system built with modern technologies. It provides comprehensive issue tracking, sprint management, team collaboration, and real-time notifications.> A full-stack, enterprise-grade project management system built with modern technologies and ready for Kubernetes deployment.

- Mailhog: http://localhost:8025

- pgAdmin: http://localhost:5050 (admin@godjira.local / admin)git clone https://github.com/yourusername/GodJira.git



---cd GodJira4. [Prerequisites](#prerequisites)



## Manual Setup



### Linux (Ubuntu/Debian)# Install dependencies5. [Installation](#installation)



**1. Install Node.js:**pnpm install

```bash

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -6. [Configuration](#configuration)

sudo apt-get install -y nodejs

```# Start all services



**2. Install PostgreSQL:**docker-compose -f docker-compose.dev.yml up -d7. [Running the Application](#running-the-application)1. [Overview](#overview)

```bash

sudo apt install postgresql postgresql-contrib```

sudo systemctl start postgresql

sudo systemctl enable postgresql8. [API Documentation](#api-documentation)

```

**Access:**

**3. Setup Database:**

```bash- Frontend: http://localhost:51739. [Testing](#testing)2. [Features](#features)

sudo -u postgres psql

```- Backend API: http://localhost:3000



```sql- API Docs: http://localhost:3000/api/docs10. [Deployment](#deployment)

CREATE USER godjira WITH PASSWORD 'your_password';

CREATE DATABASE godjira_dev OWNER godjira;- Mailhog: http://localhost:8025

\q

```- pgAdmin: http://localhost:5050 (admin@godjira.local / admin)11. [Project Structure](#project-structure)3. [Technology Stack](#technology-stack)## Table of Contents**Last Updated**: November 2, 2025  



**4. Install pnpm & Clone:**

```bash

npm install -g pnpm## Manual Setup12. [Contributing](#contributing)

git clone https://github.com/yourusername/GodJira.git

cd GodJira

pnpm install

```### 1. Install Dependencies13. [License](#license)4. [Prerequisites](#prerequisites)



**5. Configure Environment:**

```bash

cp apps/.env.example apps/.env**Linux (Ubuntu/Debian):**

cp web/.env.example web/.env

``````bash



Edit `apps/.env`:# Node.js## Overview5. [Dependencies](#dependencies)

```env

DATABASE_URL="postgresql://godjira:your_password@localhost:5432/godjira_dev"curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

JWT_SECRET="your-secret-key-minimum-32-characters"

JWT_REFRESH_SECRET="your-refresh-secret-minimum-32-characters"sudo apt-get install -y nodejs

```



**6. Run Migrations:**

```bash# PostgreSQLGodJira is a full-featured project management system inspired by Atlassian JIRA. Built with NestJS, Prisma, PostgreSQL, and React, it provides teams with powerful tools to plan, track, and manage software development projects.6. [Installation](#installation)1. [Overview](#overview)

cd apps

pnpm prisma migrate deploysudo apt install postgresql postgresql-contrib

pnpm prisma generate

```sudo systemctl start postgresql



---```



### macOS**Current Status:**   - [Linux](#linux)



**1. Install Homebrew:****macOS:**

```bash

/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"```bash- Backend: Complete with 113 REST API endpoints across 16 modules

```

# Homebrew

**2. Install Node.js & PostgreSQL:**

```bash/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"- Frontend: In development with React and TypeScript   - [macOS](#macos)2. [Features](#features)---

brew install node@20 postgresql@15

brew services start postgresql@15

```

# Node.js and PostgreSQL- Database: PostgreSQL with 16 models

**3. Setup Database:**

```bashbrew install node@20 postgresql@15

psql postgres

```brew services start postgresql@15- Authentication: JWT-based with role-based access control   - [Windows](#windows)



```sql```

CREATE USER godjira WITH PASSWORD 'your_password';

CREATE DATABASE godjira_dev OWNER godjira;- Real-time: WebSocket support for live notifications

\q

```**Windows:**



**4. Install pnpm & Clone:**- Download Node.js from https://nodejs.org- Deployment: Docker and Kubernetes ready with Helm charts7. [Configuration](#configuration)3. [Technology Stack](#technology-stack)

```bash

npm install -g pnpm- Download PostgreSQL from https://www.postgresql.org/download/windows

git clone https://github.com/yourusername/GodJira.git

cd GodJira

pnpm install

```### 2. Install pnpm



**5. Configure Environment:**## Features8. [Running the Application](#running-the-application)

```bash

cp apps/.env.example apps/.env```bash

cp web/.env.example web/.env

```npm install -g pnpm



Edit `apps/.env`:```

```env

DATABASE_URL="postgresql://godjira:your_password@localhost:5432/godjira_dev"**Core Functionality:**9. [API Documentation](#api-documentation)4. [Prerequisites](#prerequisites)## 📊 Project Overview

JWT_SECRET="your-secret-key-minimum-32-characters"

JWT_REFRESH_SECRET="your-refresh-secret-minimum-32-characters"### 3. Setup Database

```

- Issue tracking (tasks, bugs, stories, epics, spikes)

**6. Run Migrations:**

```bash```bash

cd apps

pnpm prisma migrate deploy# Linux/macOS- Sprint management with burndown charts10. [Testing](#testing)

pnpm prisma generate

```sudo -u postgres psql



---- Multi-project support



### Windows# Windows



**1. Install Node.js:**psql -U postgres- Comments with mentions11. [Deployment](#deployment)5. [Dependencies](#dependencies)



Download from https://nodejs.org```



**2. Install PostgreSQL:**- Time tracking and work logs



Download from https://www.postgresql.org/download/windows```sql



**3. Setup Database:**CREATE USER godjira WITH PASSWORD 'your_password';- Issue relationships and linking12. [Project Structure](#project-structure)

```powershell

psql -U postgresCREATE DATABASE godjira_dev OWNER godjira;

```

\q- File attachments with thumbnails

```sql

CREATE USER godjira WITH PASSWORD 'your_password';```

CREATE DATABASE godjira_dev OWNER godjira;

\q- Advanced search and filtering13. [Documentation](#documentation)6. [Installation](#installation)GodJira is a comprehensive JIRA clone with full enterprise features including real-time notifications, advanced analytics, file uploads, and export capabilities. Built with NestJS, Prisma, and PostgreSQL, it's containerized and ready for production deployment on Kubernetes.

```

### 4. Configure Environment

**4. Install pnpm & Clone:**

```powershell- CSV/Excel export

npm install -g pnpm

git clone https://github.com/yourusername/GodJira.git```bash

cd GodJira

pnpm install# Clone and install- Real-time activity feeds14. [License](#license)

```

git clone https://github.com/yourusername/GodJira.git

**5. Configure Environment:**

```powershellcd GodJira

Copy-Item apps\.env.example apps\.env

Copy-Item web\.env.example web\.envpnpm install

```

**User Management:**   - [Linux](#linux)

Edit `apps\.env`:

```env# Copy environment files

DATABASE_URL="postgresql://godjira:your_password@localhost:5432/godjira_dev"

JWT_SECRET="your-secret-key-minimum-32-characters"cp apps/.env.example apps/.env- Role-based access control (ADMIN, MANAGER, USER)

JWT_REFRESH_SECRET="your-refresh-secret-minimum-32-characters"

```cp web/.env.example web/.env



**6. Run Migrations:**```- Email verification---

```powershell

cd apps

pnpm prisma migrate deploy

pnpm prisma generateEdit `apps/.env`:- Password reset

```

```env

---

DATABASE_URL="postgresql://godjira:your_password@localhost:5432/godjira_dev"- User profiles with avatars   - [macOS](#macos)### ✅ **All Core Features Implemented**

## Running the Application

JWT_SECRET="your-secret-key-minimum-32-characters"

### Manual Start

JWT_REFRESH_SECRET="your-refresh-secret-minimum-32-characters"- Account lockout protection

**Terminal 1 - Backend:**

```bash```

cd apps

pnpm dev- Team management## Overview

```

### 5. Run Migrations

**Terminal 2 - Frontend:**

```bash

cd web

pnpm dev```bash

```

cd apps**Notifications:**   - [Windows](#windows)

### Windows PowerShell Script

```powershellpnpm prisma migrate deploy

.\start.ps1

```pnpm prisma generate- Real-time WebSocket notifications



**Access:**```

- Frontend: http://localhost:5173

- Backend API: http://localhost:3000- Email notificationsGodJira is a full-featured project management system inspired by Atlassian JIRA. It provides teams with powerful tools to plan, track, and manage software development projects.

- API Docs: http://localhost:3000/api/docs

### 6. Start Application

---

- In-app notification center

## Default Test User

**Terminal 1 - Backend:**

- **Email:** admin@godjira.local

- **Password:** Admin123!```bash7. [Configuration](#configuration)✅ **Authentication & Security (NIST Compliant)**  

- **Role:** ADMIN

cd apps

---

pnpm dev**Analytics:**

## Documentation

```

- [Architecture](docs/architecture.md)

- [Docker Guide](docs/docker-dev.md)- Sprint burndown charts### Current Status

- [Environment Variables](docs/env.md)

- [Testing](docs/PHASE1_TEST_CHECKLIST.md)**Terminal 2 - Frontend:**

- [Kubernetes Deployment](K8S_DEPLOYMENT.md)

```bash- Team velocity reports

---

cd web

## License

pnpm dev- Issue distribution reports8. [Running the Application](#running-the-application)✅ **User Management with RBAC**  

MIT License

```

- User workload reports

**Access:**

- Frontend: http://localhost:5173- **Backend**: Complete with 113 REST API endpoints across 16 modules

- Backend: http://localhost:3000

- API Docs: http://localhost:3000/api/docs**Security:**



## Windows PowerShell Script- JWT authentication with refresh tokens- **Frontend**: In development with React and TypeScript9. [API Documentation](#api-documentation)✅ **Project & Sprint Management**  



```powershell- Bcrypt password hashing (12 rounds)

.\start.ps1

```- Rate limiting (100 requests/minute)- **Database**: PostgreSQL with 16 models and comprehensive relationships



## Default Test User- CORS protection



- Email: admin@godjira.local- Helmet.js security headers- **Authentication**: JWT-based with role-based access control (RBAC)10. [Testing](#testing)✅ **Complete Issue Tracking System**  

- Password: Admin123!

- Role: ADMIN- Account lockout after failed login attempts



## Documentation- Password history enforcement- **Real-time**: WebSocket support for live notifications



- Architecture: docs/architecture.md

- Docker Guide: docs/docker-dev.md

- Environment Variables: docs/env.md**Monitoring:**- **Deployment**: Docker and Kubernetes ready with Helm charts11. [Deployment](#deployment)✅ **Comments with @Mentions**  

- Testing: docs/PHASE1_TEST_CHECKLIST.md

- Kubernetes: K8S_DEPLOYMENT.md- Prometheus metrics



## License- Health check endpoint



MIT License- Comprehensive audit logging


- Database connection monitoring---12. [Project Structure](#project-structure)✅ **Time Tracking (Work Logs)**  



## Technology Stack



**Backend:**## Features13. [Documentation](#documentation)✅ **Audit Logging & Activity Feeds**  

- NestJS 10.4 (Node.js 20+)

- Prisma 6.18 ORM

- PostgreSQL 15

- JWT with Passport.js### Core Functionality14. [License](#license)✅ **Issue Links & Relationships**  

- Socket.io 4.8

- Nodemailer with Handlebars templates

- Multer + Sharp for file processing

- Swagger/OpenAPI documentation- **Issue Tracking**: Create and manage tasks, bugs, stories, epics, and spikes✅ **Watchers & Subscriptions**  

- Prometheus client

- **Sprint Management**: Plan and execute sprints with burndown charts

**Frontend:**

- React 18- **Project Organization**: Multi-project support with customizable workflows---✅ **Team Management**  

- Vite

- TypeScript 5.x- **Team Collaboration**: Comments, mentions, and watchers

- React Router v6

- TanStack Query (React Query)- **Time Tracking**: Work log entries with reporting✅ **Real-Time WebSocket Notifications (9 types)**  

- Tailwind CSS

- Socket.io client- **Issue Relationships**: Link related issues with various link types

- Axios

- **File Attachments**: Upload files with automatic thumbnail generation## Overview✅ **Analytics & Reporting (Burndown Charts, Velocity)**  

**Infrastructure:**

- Docker with multi-stage builds- **Advanced Search**: Filter and search issues across projects

- Kubernetes + Helm 3

- pnpm package manager- **Data Export**: Export issues and reports to CSV/Excel✅ **File Uploads (Avatars + Attachments with Thumbnails)**  

- Turborepo for monorepo management

- Nginx reverse proxy- **Activity Feeds**: Real-time activity tracking and audit logs

- Prometheus + Grafana monitoring

GodJira is a full-featured project management system inspired by Atlassian JIRA. It provides teams with powerful tools to plan, track, and manage software development projects.✅ **Export Functionality (CSV & Excel)**  

## Prerequisites

### User Management

- Node.js 20 or higher

- pnpm 8 or higher✅ **Email Notifications**  

- PostgreSQL 15 or higher

- Docker 20 or higher (optional)- Role-based access control (ADMIN, MANAGER, USER)

- Docker Compose 2 or higher (optional)

- Git- Email verification and password reset### Current Status✅ **Kubernetes Deployment (Manifests + Helm Charts)**  



## Installation- User profiles with avatars



### Option 1: Linux (Ubuntu/Debian)- Account lockout protection✅ **Monitoring (Prometheus + Grafana)**  



**Step 1: Install Node.js**- Team management and assignments



Using NodeSource repository:- **Backend**: Complete with 113 REST API endpoints across 16 modules✅ **Health Checks & Metrics**

```bash

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -### Notifications

sudo apt-get install -y nodejs

```- **Frontend**: In development with React and TypeScript



Or using nvm:- Real-time WebSocket notifications

```bash

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash- Email notifications with customizable templates- **Database**: PostgreSQL with 16 models and comprehensive relationships---

source ~/.bashrc

nvm install 20- Notification preferences

nvm use 20

```- In-app notification center- **Authentication**: JWT-based with role-based access control (RBAC)



**Step 2: Install pnpm**

```bash

npm install -g pnpm### Analytics & Reporting- **Real-time**: WebSocket support for live notifications## 🚀 Tech Stack

```



**Step 3: Install PostgreSQL**

```bash- Sprint burndown charts- **Deployment**: Docker and Kubernetes ready with Helm charts

sudo apt update

sudo apt install postgresql postgresql-contrib- Team velocity reports

sudo systemctl start postgresql

sudo systemctl enable postgresql- Issue distribution by status, type, and priority### Backend (100% Complete)

```

- User workload reports

**Step 4: Configure PostgreSQL**

```bash- Custom time-range analytics---- **NestJS 10.4** - Progressive Node.js framework

sudo -u postgres psql

```



In PostgreSQL shell:### Security- **Prisma 6.18** - Type-safe ORM with PostgreSQL 15

```sql

CREATE USER godjira WITH PASSWORD 'your_password';

CREATE DATABASE godjira_dev OWNER godjira;

\q- JWT authentication with refresh tokens## Features- **Socket.io 4.8** - Real-time WebSocket communication

```

- Bcrypt password hashing (12 rounds)

**Step 5: Install Docker (Optional)**

```bash- Rate limiting (100 requests/minute per IP)- **JWT + Passport** - Authentication with refresh tokens

sudo apt update

sudo apt install apt-transport-https ca-certificates curl software-properties-common- CORS protection

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null- Helmet.js security headers### Core Functionality- **Bcrypt** - NIST-compliant password hashing (12 rounds)

sudo apt update

sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin- Account lockout after failed login attempts

sudo usermod -aG docker $USER

newgrp docker- Password history enforcement- **Swagger/OpenAPI** - Interactive API documentation

```



**Step 6: Clone Repository**

```bash### Monitoring- **Issue Tracking**: Create and manage tasks, bugs, stories, epics, and spikes- **Nodemailer** - Email notifications

git clone https://github.com/yourusername/GodJira.git

cd GodJira

pnpm install

```- Prometheus metrics endpoint- **Sprint Management**: Plan and execute sprints with burndown charts- **Multer** - File upload handling



**Step 7: Configure Environment**- Health check endpoint

```bash

cp apps/.env.example apps/.env- Comprehensive audit logging- **Project Organization**: Multi-project support with customizable workflows- **Sharp** - Image processing and thumbnail generation

cp web/.env.example web/.env

```- Database connection monitoring



Edit `apps/.env` with your database credentials:- **Team Collaboration**: Comments, mentions, and watchers- **ExcelJS + CSV-Writer** - Data export functionality

```env

DATABASE_URL="postgresql://godjira:your_password@localhost:5432/godjira_dev"---

JWT_SECRET="your-secret-key-min-32-characters"

JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-characters"- **Time Tracking**: Work log entries with reporting- **Prometheus Client** - Metrics and monitoring

```

## Technology Stack

**Step 8: Run Database Migrations**

```bash- **Issue Relationships**: Link related issues with various link types

cd apps

pnpm prisma migrate deploy### Backend

pnpm prisma generate

```- **File Attachments**: Upload files with automatic thumbnail generation### Frontend (Coming Soon)



### Option 2: Linux (Fedora/RHEL/CentOS)- **Framework**: NestJS 10.4 (Node.js 20+)



**Step 1: Install Node.js**- **ORM**: Prisma 6.18- **Advanced Search**: Filter and search issues across projects- **React 18+** with TypeScript

```bash

sudo dnf module install nodejs:20- **Database**: PostgreSQL 15

```

- **Authentication**: JWT with Passport.js- **Data Export**: Export issues and reports to CSV/Excel- **Vite** - Lightning-fast build tool

Or using nvm:

```bash- **Real-time**: Socket.io 4.8

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

source ~/.bashrc- **Email**: @nestjs-modules/mailer with Handlebars- **Activity Feeds**: Real-time activity tracking and audit logs- **TanStack Query (React Query)** - Server state management

nvm install 20

```- **File Processing**: Multer + Sharp



**Step 2: Install pnpm**- **Validation**: class-validator + class-transformer- **Socket.io Client** - Real-time updates

```bash

npm install -g pnpm- **API Documentation**: Swagger/OpenAPI

```

- **Monitoring**: Prometheus client### User Management- **Tailwind CSS** - Utility-first styling

**Step 3: Install PostgreSQL**

```bash

sudo dnf install postgresql-server postgresql-contrib

sudo postgresql-setup --initdb### Frontend- **React Router** - Client-side routing

sudo systemctl start postgresql

sudo systemctl enable postgresql

```

- **Framework**: React 18- Role-based access control (ADMIN, MANAGER, USER)- **Zustand** - State management

**Step 4: Configure PostgreSQL**

- **Build Tool**: Vite

Edit `/var/lib/pgsql/data/pg_hba.conf`:

```- **Language**: TypeScript 5.x- Email verification and password reset

local   all             all                                     md5

host    all             all             127.0.0.1/32            md5- **Routing**: React Router v6 (hash routing)

```

- **State Management**: TanStack Query (React Query)- User profiles with avatars### Infrastructure & DevOps

Restart PostgreSQL:

```bash- **UI Framework**: Tailwind CSS

sudo systemctl restart postgresql

```- **WebSocket**: Socket.io client- Account lockout protection- **Docker** - Multi-stage containerization



Create database:- **HTTP Client**: Axios

```bash

sudo -u postgres psql- Team management and assignments- **Kubernetes** - Production orchestration

```

### Infrastructure

In PostgreSQL shell:

```sql- **Helm 3** - Kubernetes package management

CREATE USER godjira WITH PASSWORD 'your_password';

CREATE DATABASE godjira_dev OWNER godjira;- **Containerization**: Docker with multi-stage builds

\q

```- **Orchestration**: Kubernetes + Helm 3### Notifications- **PostgreSQL 15** - Relational database



**Step 5: Follow steps 5-8 from Ubuntu/Debian section**- **Package Manager**: pnpm



### Option 3: Linux (Arch)- **Monorepo**: Turborepo- **Prometheus** - Metrics collection



**Step 1: Install Node.js**- **Reverse Proxy**: Nginx

```bash

sudo pacman -S nodejs npm- **Monitoring**: Prometheus + Grafana- Real-time WebSocket notifications- **Grafana** - Monitoring dashboards

```



**Step 2: Install pnpm**

```bash---- Email notifications with customizable templates- **Cloudflare Tunnel** - Zero-trust access (ready)

npm install -g pnpm

```



**Step 3: Install PostgreSQL**## Prerequisites- Notification preferences- **pnpm** - Fast, efficient package manager

```bash

sudo pacman -S postgresql

sudo -u postgres initdb -D /var/lib/postgres/data

sudo systemctl start postgresqlEnsure you have the following installed on your system:- In-app notification center- **Turborepo** - High-performance monorepo build system

sudo systemctl enable postgresql

```



**Step 4: Configure PostgreSQL**- **Node.js**: Version 20 or higher

```bash

sudo -u postgres psql- **pnpm**: Version 8 or higher

```

- **PostgreSQL**: Version 15 or higher### Analytics & Reporting---

In PostgreSQL shell:

```sql- **Docker**: Version 20 or higher (optional, for containerized development)

CREATE USER godjira WITH PASSWORD 'your_password';

CREATE DATABASE godjira_dev OWNER godjira;- **Docker Compose**: Version 2 or higher (optional)

\q

```- **Git**: Latest version



**Step 5: Follow steps 5-8 from Ubuntu/Debian section**- Sprint burndown charts## 📋 Prerequisites



### Option 4: macOS---



**Step 1: Install Xcode Command Line Tools**- Team velocity reports

```bash

xcode-select --install## Dependencies

```

- Issue distribution by status, type, and priority- **Node.js** 20+ (LTS recommended)

**Step 2: Install Homebrew**

```bash### Backend Dependencies

/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

```- User workload reports- **pnpm** 9+ (`npm install -g pnpm`)



For Apple Silicon, add Homebrew to PATH:```json

```bash

echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile{- Custom time-range analytics- **Docker Desktop** (for local development)

eval "$(/opt/homebrew/bin/brew shellenv)"

```  "@nestjs/common": "^10.4.10",



**Step 3: Install Node.js**  "@nestjs/core": "^10.4.10",- **PostgreSQL 15+** (or use Docker Compose)



Using Homebrew:  "@nestjs/platform-express": "^10.4.10",

```bash

brew install node@20  "@nestjs/platform-socket.io": "^10.4.10",### Security- **Kubernetes** (optional, for production deployment)

brew link node@20

```  "@nestjs/swagger": "^8.0.5",



Or using nvm:  "@nestjs/websockets": "^10.4.10",- **Helm 3** (optional, for Kubernetes deployment)

```bash

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash  "@prisma/client": "^6.18.0",

source ~/.zshrc

nvm install 20  "bcrypt": "^5.1.1",- JWT authentication with refresh tokens

nvm use 20

```  "class-validator": "^0.14.1",



**Step 4: Install pnpm**  "passport-jwt": "^4.0.1",- Bcrypt password hashing (12 rounds)---

```bash

npm install -g pnpm  "socket.io": "^4.8.1"

```

}- Rate limiting (100 requests/minute per IP)

**Step 5: Install PostgreSQL**

```

Option A - Using Homebrew:

```bash- CORS protection## 🛠️ Quick Start

brew install postgresql@15

brew services start postgresql@15### Frontend Dependencies

```

- Helmet.js security headers

Option B - Using Postgres.app:

```json

Download from https://postgresapp.com

{- Account lockout after failed login attempts### 1. Clone and Install Dependencies

Add to PATH:

```bash  "react": "^18.3.1",

echo 'export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"' >> ~/.zshrc

source ~/.zshrc  "react-dom": "^18.3.1",- Password history enforcement

```

  "react-router-dom": "^6.28.0",

Option C - Using Docker Desktop:

  "@tanstack/react-query": "^5.62.10",```powershell

Install Docker Desktop from https://www.docker.com/products/docker-desktop

  "tailwindcss": "^3.4.15",

**Step 6: Configure PostgreSQL**

```bash  "vite": "^6.0.1"### Monitoring# Clone the repository

psql postgres

```}



In PostgreSQL shell:```git clone https://github.com/yourusername/GodJira.git

```sql

CREATE USER godjira WITH PASSWORD 'your_password';

CREATE DATABASE godjira_dev OWNER godjira;

\q---- Prometheus metrics endpointcd GodJira

```



**Step 7: Install Docker (Optional)**

## Installation- Health check endpoint

Download Docker Desktop from https://www.docker.com/products/docker-desktop



For Apple Silicon, enable "Use Rosetta for x86/amd64 emulation" in Docker Desktop settings if needed.

### Linux- Comprehensive audit logging# Install pnpm globally (if not installed)

**Step 8: Clone Repository**

```bash

git clone https://github.com/yourusername/GodJira.git

cd GodJira#### Ubuntu / Debian- Database connection monitoringnpm install -g pnpm

pnpm install

```



**Step 9: Configure Environment**1. **Install Node.js**

```bash

cp apps/.env.example apps/.env

cp web/.env.example web/.env

```   Using NodeSource repository (recommended):---# Install all workspace dependencies



Edit `apps/.env`:   ```bash

```env

DATABASE_URL="postgresql://godjira:your_password@localhost:5432/godjira_dev"   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -pnpm install

JWT_SECRET="your-secret-key-min-32-characters"

JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-characters"   sudo apt-get install -y nodejs

```

   ```## Technology Stack```

**Step 10: Run Database Migrations**

```bash

cd apps

pnpm prisma migrate deploy   Or using nvm (Node Version Manager):

pnpm prisma generate

```   ```bash



**macOS Performance Tips:**   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash### Backend### 2. Environment Configuration



For better Docker performance:   source ~/.bashrc

- Docker Desktop Settings Resources: 4+ CPUs, 8+ GB Memory, 2 GB Swap, 64+ GB Disk

- Enable VirtioFS (macOS 12.2+): Docker Desktop Settings General   nvm install 20

- Docker volumes for node_modules already configured in docker-compose.dev.yml

   nvm use 20

### Option 5: Windows

   ```- **Framework**: NestJS 10.4 (Node.js 20+)```powershell

**Step 1: Install Node.js**



Download from https://nodejs.org (LTS version 20.x)

2. **Install pnpm**- **ORM**: Prisma 6.18# Copy environment template

Verify:

```powershell

node --version

npm --version   ```bash- **Database**: PostgreSQL 15cd apps

```

   npm install -g pnpm

**Step 2: Install pnpm**

```powershell   ```- **Authentication**: JWT with Passport.jscopy .env.example .env

npm install -g pnpm

```



**Step 3: Install PostgreSQL**3. **Install PostgreSQL**- **Real-time**: Socket.io 4.8



Option A - Using Windows Installer:



Download from https://www.postgresql.org/download/windows   ```bash- **Email**: @nestjs-modules/mailer with Handlebars# Edit .env and configure:



During installation:   sudo apt update

- Set password for postgres user

- Default port: 5432   sudo apt install postgresql postgresql-contrib- **File Processing**: Multer + Sharp# - DATABASE_URL (PostgreSQL connection string)

- Install pgAdmin 4 (optional)

   sudo systemctl start postgresql

Option B - Using Docker Desktop:

   sudo systemctl enable postgresql- **Validation**: class-validator + class-transformer# - JWT_SECRET (random secure string)

Install Docker Desktop from https://www.docker.com/products/docker-desktop

   ```

**Step 4: Configure PostgreSQL**

```powershell- **API Documentation**: Swagger/OpenAPI# - JWT_REFRESH_SECRET (random secure string)

psql -U postgres

```4. **Configure PostgreSQL**



In PostgreSQL shell:- **Monitoring**: Prometheus client# - EMAIL_* settings (for notifications)

```sql

CREATE USER godjira WITH PASSWORD 'your_password';   ```bash

CREATE DATABASE godjira_dev OWNER godjira;

\q   sudo -u postgres psql```

```

   ```

**Step 5: Install Git**

### Frontend

Download from https://git-scm.com/download/win

   In PostgreSQL shell:

**Step 6: Install Docker Desktop (Optional)**

   ```sql### 3. Start Database

Download from https://www.docker.com/products/docker-desktop

   CREATE USER godjira WITH PASSWORD 'your_password';

Enable WSL 2 backend:

```powershell   CREATE DATABASE godjira_dev OWNER godjira;- **Framework**: React 18

wsl --install

```   \q



**Step 7: Clone Repository**   ```- **Build Tool**: Vite```powershell

```powershell

git clone https://github.com/yourusername/GodJira.git

cd GodJira

pnpm install5. **Install Docker (Optional)**- **Language**: TypeScript 5.x# Start PostgreSQL with Docker Compose

```



**Step 8: Configure Environment**

```powershell   ```bash- **Routing**: React Router v6 (hash routing)docker-compose up -d postgres

Copy-Item apps\.env.example apps\.env

Copy-Item web\.env.example web\.env   sudo apt update

```

   sudo apt install apt-transport-https ca-certificates curl software-properties-common- **State Management**: TanStack Query (React Query)

Edit `apps\.env`:

```env   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

DATABASE_URL="postgresql://godjira:your_password@localhost:5432/godjira_dev"

JWT_SECRET="your-secret-key-min-32-characters"   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null- **UI Framework**: Tailwind CSS# Check database is running

JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-characters"

```   sudo apt update



**Step 9: Run Database Migrations**   sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin- **WebSocket**: Socket.io clientdocker ps

```powershell

cd apps   sudo usermod -aG docker $USER

pnpm prisma migrate deploy

pnpm prisma generate   newgrp docker- **HTTP Client**: Axios

```

   ```

**Windows Troubleshooting:**

# Access PgAdmin (optional)

PowerShell Execution Policy error:

```powershell6. **Clone and Setup Project**

Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

```### Infrastructure# URL: http://localhost:5050



Path issues:   ```bash

```powershell

$env:PATH += ";C:\Program Files\PostgreSQL\15\bin"   git clone https://github.com/yourusername/GodJira.git# Email: admin@godjira.local

```

   cd GodJira

Port conflicts:

   pnpm install- **Containerization**: Docker with multi-stage builds# Password: admin123

Modify `apps/.env` and `web/vite.config.ts` if port 3000 or 5432 is in use.

   cp apps/.env.example apps/.env

## Configuration

   cp web/.env.example web/.env- **Orchestration**: Kubernetes + Helm 3```

### Backend Environment Variables

   ```

Create `apps/.env`:

- **Package Manager**: pnpm

```env

# Database7. **Configure Environment Variables**

DATABASE_URL="postgresql://godjira:password@localhost:5432/godjira_dev"

- **Monorepo**: Turborepo### 4. Setup Database Schema

# JWT Configuration

JWT_SECRET="your-secret-key-minimum-32-characters-long"   Edit `apps/.env` with your database credentials:

JWT_REFRESH_SECRET="your-refresh-secret-minimum-32-characters-long"

JWT_EXPIRES_IN="30m"   ```env- **Reverse Proxy**: Nginx

JWT_REFRESH_EXPIRES_IN="7d"

   DATABASE_URL="postgresql://godjira:your_password@localhost:5432/godjira_dev"

# Email Configuration

MAIL_HOST="localhost"   JWT_SECRET="your-secret-key-min-32-characters"- **Monitoring**: Prometheus + Grafana```powershell

MAIL_PORT=1025

MAIL_USER=""   JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-characters"

MAIL_PASSWORD=""

MAIL_FROM="noreply@godjira.local"   ```# Navigate to backend directory

FRONTEND_URL="http://localhost:5173"



# File Upload

UPLOAD_PATH="./uploads"8. **Run Database Migrations**---cd apps

MAX_FILE_SIZE=20971520

MAX_AVATAR_SIZE=10485760



# Security   ```bash

BCRYPT_ROUNDS=12

MAX_FAILED_LOGIN_ATTEMPTS=5   cd apps

ACCOUNT_LOCKOUT_DURATION=900000

   pnpm prisma migrate deploy## Prerequisites# Generate Prisma client

# Rate Limiting

THROTTLE_TTL=60000   pnpm prisma generate

THROTTLE_LIMIT=100

   ```pnpm prisma:generate

# Server

PORT=3000

NODE_ENV="development"

```#### Fedora / RHEL / CentOSEnsure you have the following installed on your system:



### Frontend Environment Variables



Create `web/.env`:1. **Install Node.js**# Run database migrations



```env

VITE_API_URL=http://localhost:3000/api/v1

VITE_WS_URL=http://localhost:3000   ```bash- **Node.js**: Version 20 or higherpnpm prisma:migrate

```

   sudo dnf module install nodejs:20

## Running the Application

   ```- **pnpm**: Version 8 or higher

### Local Development (Without Docker)



**Step 1: Start PostgreSQL**

   Or using nvm:- **PostgreSQL**: Version 15 or higher# (Optional) Seed database with sample data

Linux:

```bash   ```bash

sudo systemctl start postgresql

```   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash- **Docker**: Version 20 or higher (optional, for containerized development)pnpm prisma:seed



macOS:   source ~/.bashrc

```bash

brew services start postgresql@15   nvm install 20- **Docker Compose**: Version 2 or higher (optional)

```

   ```

Windows: PostgreSQL service starts automatically

- **Git**: Latest version# (Optional) Open Prisma Studio to view data

**Step 2: Start Backend**

```bash2. **Install pnpm**

cd apps

pnpm devpnpm prisma:studio

```

   ```bash

Backend runs at:

- API: http://localhost:3000   npm install -g pnpm---# Access at: http://localhost:5555

- API Docs: http://localhost:3000/api/docs

   ```

**Step 3: Start Frontend**

```

Open new terminal:

```bash3. **Install PostgreSQL**

cd web

pnpm dev## Dependencies

```

   ```bash

Frontend runs at: http://localhost:5173

   sudo dnf install postgresql-server postgresql-contrib### 5. Start Backend API

### Docker Development

   sudo postgresql-setup --initdb

**Step 1: Start All Services**

```bash   sudo systemctl start postgresql### Backend Dependencies

docker-compose -f docker-compose.dev.yml up -d

```   sudo systemctl enable postgresql



Services:   ``````powershell

- Backend: http://localhost:3000

- Frontend: http://localhost:5173

- PostgreSQL: localhost:5432

- pgAdmin: http://localhost:5050 (admin@godjira.local / admin)4. **Configure PostgreSQL**```json# Development mode with hot reload

- Mailhog: http://localhost:8025

- Redis: localhost:6379



**Step 2: View Logs**   Edit `/var/lib/pgsql/data/pg_hba.conf` and change authentication method:{cd apps

```bash

docker-compose -f docker-compose.dev.yml logs -f   ```

```

   local   all             all                                     md5  "@nestjs/common": "^10.4.10",pnpm dev

**Step 3: Stop Services**

```bash   host    all             all             127.0.0.1/32            md5

docker-compose -f docker-compose.dev.yml down

```   ```  "@nestjs/core": "^10.4.10",



**Step 4: Restart Specific Service**

```bash

docker-compose -f docker-compose.dev.yml restart api   Restart PostgreSQL:  "@nestjs/platform-express": "^10.4.10",# Or use the root start script

```

   ```bash

### Windows Quick Start

   sudo systemctl restart postgresql  "@nestjs/platform-socket.io": "^10.4.10",cd ..

Use the PowerShell script:

```powershell   ```

.\start.ps1

```  "@nestjs/swagger": "^8.0.5",./start.ps1



## API Documentation   Create database:



### Swagger UI   ```bash  "@nestjs/websockets": "^10.4.10",



Access interactive API documentation:   sudo -u postgres psql



http://localhost:3000/api/docs   ```  "@prisma/client": "^6.18.0",# API will be available at:



### API Overview



- Base URL: http://localhost:3000/api/v1   In PostgreSQL shell:  "bcrypt": "^5.1.1",# - API: http://localhost:3000

- Authentication: Bearer JWT token in Authorization header

- Total Endpoints: 113 REST APIs   ```sql

- Modules: 16 feature modules

   CREATE USER godjira WITH PASSWORD 'your_password';  "class-validator": "^0.14.1",# - Swagger Docs: http://localhost:3000/api/docs

### Key Endpoints

   CREATE DATABASE godjira_dev OWNER godjira;

**Authentication:**

- POST /auth/register   \q  "passport-jwt": "^4.0.1",# - Health Check: http://localhost:3000/api/v1/health

- POST /auth/login

- POST /auth/refresh   ```

- GET /auth/profile

- POST /auth/verify-email  "socket.io": "^4.8.1"# - Metrics: http://localhost:3000/api/v1/metrics



**Projects:**5. **Follow steps 5-8 from Ubuntu/Debian section above**

- GET /projects

- POST /projects}```

- GET /projects/:id

- PATCH /projects/:id#### Arch Linux

- DELETE /projects/:id

```

**Issues:**

- GET /issues1. **Install Node.js**

- POST /issues

- GET /issues/:id### 6. Test the API

- PATCH /issues/:id

- PATCH /issues/:id/status   ```bash

- PATCH /issues/:id/assign

   sudo pacman -S nodejs npm### Frontend Dependencies

**Sprints:**

- GET /sprints   ```

- POST /sprints

- POST /sprints/:id/startOpen Swagger documentation in your browser:

- POST /sprints/:id/complete

2. **Install pnpm**

For complete documentation, see:

- docs/architecture.md```json```



## Testing   ```bash



### Unit Tests   npm install -g pnpm{http://localhost:3000/api/docs

```bash

cd apps   ```

pnpm test

```  "react": "^18.3.1",```



### E2E Tests3. **Install PostgreSQL**

```bash

cd apps  "react-dom": "^18.3.1",

pnpm test:e2e

```   ```bash



### Test Coverage   sudo pacman -S postgresql  "react-router-dom": "^6.28.0",Or test with curl:

```bash

cd apps   sudo -u postgres initdb -D /var/lib/postgres/data

pnpm test:cov

```   sudo systemctl start postgresql  "@tanstack/react-query": "^5.62.10",```powershell



### Manual Testing   sudo systemctl enable postgresql



See test checklist:   ```  "tailwindcss": "^3.4.15",# Health check

- docs/PHASE1_TEST_CHECKLIST.md



### Test Users

4. **Configure PostgreSQL**  "vite": "^6.0.1"curl http://localhost:3000/api/v1/health

Default test user:

- Email: admin@godjira.local

- Password: Admin123!

- Role: ADMIN   ```bash}



## Deployment   sudo -u postgres psql



### Docker Production   ``````# Register a new user



```bash

docker-compose up -d

```   In PostgreSQL shell:curl -X POST http://localhost:3000/api/v1/auth/register `



Services:   ```sql

- API: http://localhost:3000

- PostgreSQL: localhost:5432   CREATE USER godjira WITH PASSWORD 'your_password';---  -H "Content-Type: application/json" `

- pgAdmin: http://localhost:5050

- Prometheus: http://localhost:9090   CREATE DATABASE godjira_dev OWNER godjira;

- Grafana: http://localhost:3001

   \q  -d '{"email":"admin@example.com","password":"SecurePass123!","name":"Admin User"}'

### Kubernetes Deployment

   ```

**Step 1: Create Namespace**

```bash## Installation

kubectl apply -f k8s/namespace.yaml

```5. **Follow steps 5-8 from Ubuntu/Debian section above**



**Step 2: Deploy PostgreSQL**# Login

```bash

kubectl apply -f k8s/postgres-statefulset.yaml---

```

### Linuxcurl -X POST http://localhost:3000/api/v1/auth/login `

**Step 3: Deploy API**

```bash### macOS

kubectl apply -f k8s/api-deployment.yaml

```  -H "Content-Type: application/json" `



**Step 4: Deploy Web Frontend**#### Intel and Apple Silicon Macs

```bash

kubectl apply -f k8s/web-deployment.yaml#### Ubuntu / Debian  -d '{"email":"admin@example.com","password":"SecurePass123!"}'

```

1. **Install Xcode Command Line Tools**

**Step 5: Setup Ingress**

```bash```

kubectl apply -f k8s/ingress.yaml

```   ```bash



### Helm Deployment   xcode-select --install1. **Install Node.js**



```bash   ```

helm install godjira ./helm/godjira -f ./helm/godjira/values.yaml

```---



For detailed Kubernetes setup:2. **Install Homebrew**

- K8S_DEPLOYMENT.md

   Using NodeSource repository (recommended):

## Project Structure

   ```bash

```

GodJira/   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"   ```bash## 📁 Project Structure

├── apps/                      Backend NestJS application

│   ├── src/   ```

│   │   ├── auth/              Authentication module

│   │   ├── users/             User management   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

│   │   ├── projects/          Project management

│   │   ├── sprints/           Sprint management   For Apple Silicon, add Homebrew to PATH:

│   │   ├── issues/            Issue tracking

│   │   ├── comments/          Comments   ```bash   sudo apt-get install -y nodejs```

│   │   ├── worklogs/          Time tracking

│   │   ├── issue-links/       Issue relationships   echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile

│   │   ├── watchers/          Issue watchers

│   │   ├── teams/             Team management   eval "$(/opt/homebrew/bin/brew shellenv)"   ```GodJira/

│   │   ├── audit/             Audit logs

│   │   ├── notifications/     WebSocket notifications   ```

│   │   ├── analytics/         Reports and charts

│   │   ├── attachments/       File uploads├── apps/

│   │   ├── export/            Data export

│   │   ├── email/             Email service3. **Install Node.js**

│   │   ├── health/            Health checks

│   │   ├── metrics/           Prometheus metrics   Or using nvm (Node Version Manager):│   ├── src/

│   │   ├── prisma/            Database service

│   │   └── common/            Shared utilities   Using Homebrew (recommended):

│   ├── prisma/

│   │   └── schema.prisma      Database schema   ```bash   ```bash│   │   ├── auth/              # ✅ JWT authentication & strategies

│   └── package.json

│   brew install node@20

├── web/                       Frontend React application

│   ├── src/   brew link node@20   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash│   │   ├── users/             # ✅ User management with RBAC

│   │   ├── components/        Reusable components

│   │   ├── pages/             Page components   ```

│   │   ├── contexts/          React contexts

│   │   ├── services/          API services   source ~/.bashrc│   │   ├── projects/          # ✅ Project CRUD & statistics

│   │   ├── lib/               Utilities

│   │   └── types/             TypeScript types   Or using nvm:

│   ├── public/

│   └── package.json   ```bash   nvm install 20│   │   ├── sprints/           # ✅ Sprint lifecycle management

│

├── docs/                      Documentation   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

│   ├── architecture.md        System architecture

│   ├── docker-dev.md          Docker development guide   source ~/.zshrc   nvm use 20│   │   ├── issues/            # ✅ Issue tracking with sub-tasks

│   ├── env.md                 Environment variables

│   ├── PHASE1_IMPLEMENTATION.md   nvm install 20

│   ├── PHASE1_TEST_CHECKLIST.md

│   ├── STACK_COMPLIANCE.md   nvm use 20   ```│   │   ├── comments/          # ✅ Comments with @mentions

│   └── STACK_STATUS.md

│   ```

├── k8s/                       Kubernetes manifests

│   ├── namespace.yaml│   │   ├── worklogs/          # ✅ Time tracking

│   ├── api-deployment.yaml

│   ├── postgres-statefulset.yaml4. **Install pnpm**

│   ├── web-deployment.yaml

│   └── ingress.yaml2. **Install pnpm**│   │   ├── audit/             # ✅ Audit logs & activity feeds

│

├── helm/                      Helm charts   ```bash

│   └── godjira/

│   npm install -g pnpm│   │   ├── issue-links/       # ✅ Issue relationships

├── monitoring/                Monitoring configuration

│   ├── prometheus.yml   ```

│   └── grafana/

│   ```bash│   │   ├── watchers/          # ✅ Issue subscriptions

├── docker-compose.yml         Production Docker Compose

├── docker-compose.dev.yml     Development Docker Compose5. **Install PostgreSQL**

├── package.json               Root package.json

├── pnpm-workspace.yaml        pnpm workspace config   npm install -g pnpm│   │   ├── teams/             # ✅ Team management

├── turbo.json                 Turborepo config

└── README.md                  This file   **Option A: Using Homebrew**

```

   ```bash   ```│   │   ├── notifications/     # ✅ Real-time WebSocket notifications

## Contributing

   brew install postgresql@15

1. Fork the repository

2. Create feature branch (git checkout -b feature/amazing-feature)   brew services start postgresql@15│   │   ├── analytics/         # ✅ Burndown charts & velocity tracking

3. Commit changes (git commit -m 'Add amazing feature')

4. Push to branch (git push origin feature/amazing-feature)   ```

5. Open Pull Request

3. **Install PostgreSQL**│   │   ├── attachments/       # ✅ File attachments with thumbnails

## License

   **Option B: Using Postgres.app** (GUI application)

This project is licensed under the MIT License.

   │   │   ├── export/            # ✅ CSV/Excel export

See LICENSE file for details.

   Download from [postgresapp.com](https://postgresapp.com/) and drag to Applications folder. Start Postgres.app and add to PATH:

---

   ```bash   ```bash│   │   ├── email/             # ✅ Email service

**Last Updated:** November 2025

   echo 'export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"' >> ~/.zshrc

**Documentation:**

- Architecture Overview: docs/architecture.md   source ~/.zshrc   sudo apt update│   │   ├── health/            # ✅ Health checks

- Docker Development: docs/docker-dev.md

- Environment Variables: docs/env.md   ```

- Phase 1 Implementation: docs/PHASE1_IMPLEMENTATION.md

- Testing Procedures: docs/PHASE1_TEST_CHECKLIST.md   sudo apt install postgresql postgresql-contrib│   │   ├── metrics/           # ✅ Prometheus metrics

- Stack Compliance: docs/STACK_COMPLIANCE.md

- Stack Status: docs/STACK_STATUS.md   **Option C: Using Docker Desktop**

- Kubernetes Deployment: K8S_DEPLOYMENT.md

      sudo systemctl start postgresql│   │   ├── prisma/            # ✅ Database service

   Install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/) and skip to Docker setup below.

   sudo systemctl enable postgresql│   │   ├── common/            # ✅ Shared utilities

6. **Configure PostgreSQL**

   ```│   │   ├── app.module.ts      # Application root module

   If using Homebrew or Postgres.app:

   ```bash│   │   └── main.ts            # Application entry point

   psql postgres

   ```4. **Configure PostgreSQL**│   ├── prisma/



   In PostgreSQL shell:│   │   ├── schema.prisma      # Complete database schema (16 models)

   ```sql

   CREATE USER godjira WITH PASSWORD 'your_password';   ```bash│   │   └── migrations/        # Database migrations

   CREATE DATABASE godjira_dev OWNER godjira;

   \q   sudo -u postgres psql│   ├── Dockerfile             # Multi-stage production build

   ```

   ```│   └── package.json           # Backend dependencies

7. **Install Docker (Optional)**

├── helm/

   Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/) and install.

   In PostgreSQL shell:│   └── godjira/               # ✅ Kubernetes Helm charts

   For Apple Silicon, ensure "Use Rosetta for x86/amd64 emulation" is enabled in Docker Desktop settings if needed.

   ```sql│       ├── Chart.yaml

8. **Clone and Setup Project**

   CREATE USER godjira WITH PASSWORD 'your_password';│       ├── values.yaml

   ```bash

   git clone https://github.com/yourusername/GodJira.git   CREATE DATABASE godjira_dev OWNER godjira;│       └── templates/

   cd GodJira

   pnpm install   \q├── k8s/                       # ✅ Kubernetes raw manifests

   cp apps/.env.example apps/.env

   cp web/.env.example web/.env   ```│   ├── namespace.yaml

   ```

│   ├── postgres-statefulset.yaml

9. **Configure Environment Variables**

5. **Install Docker (Optional)**│   ├── api-deployment.yaml

   Edit `apps/.env` with your database credentials:

   ```env│   ├── ingress.yaml

   DATABASE_URL="postgresql://godjira:your_password@localhost:5432/godjira_dev"

   JWT_SECRET="your-secret-key-min-32-characters"   ```bash│   ├── cert-manager-issuer.yaml

   JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-characters"

   ```   sudo apt update│   └── prometheus-servicemonitor.yaml



10. **Run Database Migrations**   sudo apt install apt-transport-https ca-certificates curl software-properties-common├── monitoring/                # ✅ Prometheus & Grafana config



    ```bash   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg│   ├── prometheus.yml

    cd apps

    pnpm prisma migrate deploy   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null│   └── grafana/

    pnpm prisma generate

    ```   sudo apt update├── docker-compose.yml         # Local development services



#### macOS Performance Optimization   sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin├── pnpm-workspace.yaml        # Workspace configuration



For better Docker performance on macOS:   sudo usermod -aG docker $USER├── turbo.json                 # Turborepo build config



1. **Increase Docker Resources**   newgrp docker├── K8S_DEPLOYMENT.md          # Kubernetes deployment guide

   

   Docker Desktop → Settings → Resources:   ```├── CHECKLIST.md               # Comprehensive feature checklist

   - CPUs: 4+ cores

   - Memory: 8+ GB└── README.md                  # This file

   - Swap: 2 GB

   - Disk: 64+ GB6. **Clone and Setup Project**```



2. **Enable VirtioFS** (macOS 12.2+)

   

   Docker Desktop → Settings → General → Enable "VirtioFS"   ```bash---



3. **Use Docker Volumes for node_modules**   git clone https://github.com/yourusername/GodJira.git

   

   Already configured in `docker-compose.dev.yml` for optimal performance.   cd GodJira## 🗄️ Database Schema (16 Models)



---   pnpm install



### Windows   cp apps/.env.example apps/.env### Core Models



1. **Install Node.js**   cp web/.env.example web/.env



   Download and install from [nodejs.org](https://nodejs.org/) (LTS version 20.x).   ```#### **User Model**



   Verify installation:Authentication, roles, avatars, account security

   ```powershell

   node --version7. **Configure Environment Variables**```typescript

   npm --version

   ```- id: UUID



2. **Install pnpm**   Edit `apps/.env` with your database credentials:- email: String (unique)



   ```powershell   ```env- password: String (bcrypt hashed, 12 rounds)

   npm install -g pnpm

   ```   DATABASE_URL="postgresql://godjira:your_password@localhost:5432/godjira_dev"- name: String



3. **Install PostgreSQL**   JWT_SECRET="your-secret-key-min-32-characters"- bio?: String



   **Option A: Using Windows Installer**   JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-characters"- jobTitle?: String

   

   Download from [postgresql.org](https://www.postgresql.org/download/windows/) and run the installer.   ```- department?: String



   During installation:- role: UserRole (ADMIN | MANAGER | USER)

   - Set password for postgres user

   - Default port: 54328. **Run Database Migrations**- avatar?: String (base64 data URL)

   - Install pgAdmin 4 (optional GUI tool)

- isActive: Boolean

   **Option B: Using Docker Desktop**

      ```bash- isEmailVerified: Boolean

   Install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/) and skip to Docker setup below.

   cd apps- passwordHistory: String[] (prevent reuse)

4. **Configure PostgreSQL**

   pnpm prisma migrate deploy- failedLoginAttempts: Int

   Open Command Prompt or PowerShell:

   ```powershell   pnpm prisma generate- lockedUntil?: DateTime

   psql -U postgres

   ```   ```- createdAt: DateTime



   In PostgreSQL shell:- updatedAt: DateTime

   ```sql

   CREATE USER godjira WITH PASSWORD 'your_password';#### Fedora / RHEL / CentOS```

   CREATE DATABASE godjira_dev OWNER godjira;

   \q

   ```

1. **Install Node.js**#### **Project Model**

5. **Install Git**

Project management with unique keys

   Download from [git-scm.com](https://git-scm.com/download/win) and install.

   ```bash```typescript

6. **Install Docker Desktop (Optional)**

   sudo dnf module install nodejs:20- id: UUID

   Download from [docker.com](https://www.docker.com/products/docker-desktop/) and install.

   ```- key: String (unique, e.g., "WEB", "MOB")

   Enable WSL 2 backend for better performance (Windows 10/11):

   ```powershell- name: String

   wsl --install

   ```   Or using nvm:- description?: String



7. **Clone and Setup Project**   ```bash- ownerId: UUID → User



   ```powershell   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash- createdAt: DateTime

   git clone https://github.com/yourusername/GodJira.git

   cd GodJira   source ~/.bashrc- updatedAt: DateTime

   pnpm install

   Copy-Item apps\.env.example apps\.env   nvm install 20```

   Copy-Item web\.env.example web\.env

   ```   ```



8. **Configure Environment Variables**#### **Sprint Model**



   Edit `apps\.env` with your database credentials:2. **Install pnpm**Agile sprint lifecycle

   ```env

   DATABASE_URL="postgresql://godjira:your_password@localhost:5432/godjira_dev"```typescript

   JWT_SECRET="your-secret-key-min-32-characters"

   JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-characters"   ```bash- id: UUID

   ```

   npm install -g pnpm- name: String

9. **Run Database Migrations**

   ```- goal?: String

   ```powershell

   cd apps- startDate?: DateTime

   pnpm prisma migrate deploy

   pnpm prisma generate3. **Install PostgreSQL**- endDate?: DateTime

   ```

- status: SprintStatus (PLANNED | ACTIVE | COMPLETED | CANCELLED)

#### Windows Troubleshooting

   ```bash- projectId: UUID → Project

- **PowerShell Execution Policy**: If you encounter script execution errors:

  ```powershell   sudo dnf install postgresql-server postgresql-contrib- createdAt: DateTime

  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

  ```   sudo postgresql-setup --initdb- updatedAt: DateTime



- **Path Issues**: Ensure Node.js and PostgreSQL bin directories are in PATH:   sudo systemctl start postgresql```

  ```powershell

  $env:PATH += ";C:\Program Files\PostgreSQL\15\bin"   sudo systemctl enable postgresql

  ```

   ```#### **Issue Model**

- **Port Conflicts**: If port 3000 or 5432 is in use, modify `apps/.env` and `web/vite.config.ts`.

Complete ticket system

---

4. **Configure PostgreSQL**```typescript

## Configuration

- id: UUID

### Environment Variables

   Edit `/var/lib/pgsql/data/pg_hba.conf` and change authentication method:- key: String (unique, e.g., "WEB-123")

#### Backend (`apps/.env`)

   ```- title: String

```env

# Database   local   all             all                                     md5- description?: String (markdown)

DATABASE_URL="postgresql://godjira:password@localhost:5432/godjira_dev"

   host    all             all             127.0.0.1/32            md5- type: IssueType (TASK | BUG | STORY | EPIC | SPIKE)

# JWT Configuration

JWT_SECRET="your-secret-key-minimum-32-characters-long"   ```- status: IssueStatus (BACKLOG | TODO | IN_PROGRESS | IN_REVIEW | BLOCKED | DONE | CLOSED)

JWT_REFRESH_SECRET="your-refresh-secret-minimum-32-characters-long"

JWT_EXPIRES_IN="30m"- priority: IssuePriority (LOW | MEDIUM | HIGH | URGENT | CRITICAL)

JWT_REFRESH_EXPIRES_IN="7d"

   Restart PostgreSQL:- storyPoints?: Int (Fibonacci scale)

# Email Configuration (Development)

MAIL_HOST="localhost"   ```bash- labels: String[]

MAIL_PORT=1025

MAIL_USER=""   sudo systemctl restart postgresql- projectId: UUID → Project

MAIL_PASSWORD=""

MAIL_FROM="noreply@godjira.local"   ```- sprintId?: UUID → Sprint

FRONTEND_URL="http://localhost:5173"

- creatorId: UUID → User

# File Upload

UPLOAD_PATH="./uploads"   Create database:- assigneeId?: UUID → User

MAX_FILE_SIZE=20971520

MAX_AVATAR_SIZE=10485760   ```bash- parentIssueId?: UUID → Issue (for sub-tasks)



# Security   sudo -u postgres psql- createdAt: DateTime

BCRYPT_ROUNDS=12

MAX_FAILED_LOGIN_ATTEMPTS=5   ```- updatedAt: DateTime

ACCOUNT_LOCKOUT_DURATION=900000

```

# Rate Limiting

THROTTLE_TTL=60000   In PostgreSQL shell:

THROTTLE_LIMIT=100

   ```sql#### **Comment Model**

# Server

PORT=3000   CREATE USER godjira WITH PASSWORD 'your_password';Comments with markdown support

NODE_ENV="development"

```   CREATE DATABASE godjira_dev OWNER godjira;```typescript



#### Frontend (`web/.env`)   \q- id: UUID



```env   ```- content: String (markdown)

VITE_API_URL=http://localhost:3000/api/v1

VITE_WS_URL=http://localhost:3000- issueId?: UUID → Issue

```

5. **Follow steps 5-8 from Ubuntu/Debian section above**- taskId?: UUID → Task

### Docker Configuration

- authorId: UUID → User

For Docker-based development, environment variables are configured in `docker-compose.dev.yml`.

#### Arch Linux- createdAt: DateTime

---

- updatedAt: DateTime

## Running the Application

1. **Install Node.js**```

### Local Development (Without Docker)



1. **Start PostgreSQL** (if not using Docker)

   ```bash#### **WorkLog Model**

   Linux/macOS:

   ```bash   sudo pacman -S nodejs npmTime tracking per issue

   sudo systemctl start postgresql  # Linux

   brew services start postgresql@15  # macOS   ``````typescript

   ```

- id: UUID

   Windows: PostgreSQL service should start automatically.

2. **Install pnpm**- description: String

2. **Start Backend**

- timeSpent: Int (minutes)

   ```bash

   cd apps   ```bash- logDate: DateTime

   pnpm dev

   ```   npm install -g pnpm- issueId: UUID → Issue



   Backend will run at `http://localhost:3000`   ```- userId: UUID → User

   API docs at `http://localhost:3000/api/docs`

- createdAt: DateTime

3. **Start Frontend** (in new terminal)

3. **Install PostgreSQL**- updatedAt: DateTime

   ```bash

   cd web```

   pnpm dev

   ```   ```bash



   Frontend will run at `http://localhost:5173`   sudo pacman -S postgresql#### **IssueLink Model**



### Docker Development   sudo -u postgres initdb -D /var/lib/postgres/dataIssue relationships



1. **Start all services**   sudo systemctl start postgresql```typescript



   ```bash   sudo systemctl enable postgresql- id: UUID

   docker-compose -f docker-compose.dev.yml up -d

   ```   ```- linkType: IssueLinkType (BLOCKS | BLOCKED_BY | RELATES_TO | DUPLICATES | DUPLICATED_BY | PARENT_OF | CHILD_OF)



   Services:- fromIssueId: UUID → Issue

   - Backend: `http://localhost:3000`

   - Frontend: `http://localhost:5173`4. **Configure PostgreSQL**- toIssueId: UUID → Issue

   - PostgreSQL: `localhost:5432`

   - pgAdmin: `http://localhost:5050` (admin@godjira.local / admin)- createdAt: DateTime

   - Mailhog: `http://localhost:8025`

   - Redis: `localhost:6379`   ```bash```



2. **View logs**   sudo -u postgres psql



   ```bash   ```#### **Watcher Model**

   docker-compose -f docker-compose.dev.yml logs -f

   ```Issue subscription system



3. **Stop services**   In PostgreSQL shell:```typescript



   ```bash   ```sql- id: UUID

   docker-compose -f docker-compose.dev.yml down

   ```   CREATE USER godjira WITH PASSWORD 'your_password';- userId: UUID → User



4. **Restart specific service**   CREATE DATABASE godjira_dev OWNER godjira;- issueId: UUID → Issue



   ```bash   \q- createdAt: DateTime

   docker-compose -f docker-compose.dev.yml restart api

   ```   ```- UNIQUE(userId, issueId)



### Windows-Specific Start Script```



For Windows users, a PowerShell script is provided:5. **Follow steps 5-8 from Ubuntu/Debian section above**



```powershell#### **Team Model**

.\start.ps1

```---Team management



This will check prerequisites and start Docker Compose development environment.```typescript



---### macOS- id: UUID



## API Documentation- name: String (unique, e.g., "Platform Team", "Developers")



### Swagger UI#### Intel and Apple Silicon Macs- description?: String



Once the backend is running, access the interactive API documentation:- createdAt: DateTime



**URL**: `http://localhost:3000/api/docs`1. **Install Xcode Command Line Tools**- updatedAt: DateTime



### API Overview```



- **Base URL**: `http://localhost:3000/api/v1`   ```bash

- **Authentication**: Bearer JWT token in `Authorization` header

- **Total Endpoints**: 113 REST APIs   xcode-select --install#### **TeamMember Model**

- **Modules**: 16 feature modules

   ```Team membership with roles

### Key Endpoints

```typescript

**Authentication**

- `POST /auth/register` - Register new user2. **Install Homebrew**- id: UUID

- `POST /auth/login` - Login

- `POST /auth/refresh` - Refresh access token- teamId: UUID → Team

- `GET /auth/profile` - Get current user profile

- `POST /auth/verify-email` - Verify email   ```bash- userId: UUID → User



**Projects**   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"- role: String (LEAD | MEMBER)

- `GET /projects` - List all projects

- `POST /projects` - Create project   ```- joinedAt: DateTime

- `GET /projects/:id` - Get project details

- `PATCH /projects/:id` - Update project- UNIQUE(teamId, userId)

- `DELETE /projects/:id` - Delete project

   For Apple Silicon, add Homebrew to PATH:```

**Issues**

- `GET /issues` - List issues (with filters)   ```bash

- `POST /issues` - Create issue

- `GET /issues/:id` - Get issue details   echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile#### **TeamProject Model**

- `PATCH /issues/:id` - Update issue

- `PATCH /issues/:id/status` - Change issue status   eval "$(/opt/homebrew/bin/brew shellenv)"Team-project associations

- `PATCH /issues/:id/assign` - Assign issue

   ``````typescript

**Sprints**

- `GET /sprints` - List sprints- id: UUID

- `POST /sprints` - Create sprint

- `POST /sprints/:id/start` - Start sprint3. **Install Node.js**- teamId: UUID → Team

- `POST /sprints/:id/complete` - Complete sprint

- projectId: UUID → Project

For complete API documentation, see [docs/architecture.md](docs/architecture.md).

   Using Homebrew (recommended):- assignedAt: DateTime

---

   ```bash- UNIQUE(teamId, projectId)

## Testing

   brew install node@20```

### Running Tests

   brew link node@20

**Unit Tests**

```bash   ```#### **Notification Model**

cd apps

pnpm testReal-time notifications

```

   Or using nvm:```typescript

**E2E Tests**

```bash   ```bash- id: UUID

cd apps

pnpm test:e2e   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash- type: NotificationType (9 types)

```

   source ~/.zshrc- title: String

**Test Coverage**

```bash   nvm install 20- message: String

cd apps

pnpm test:cov   nvm use 20- userId: UUID → User

```

   ```- actorId?: UUID

### Manual Testing

- actorName?: String

Use the provided test checklist:

- [Phase 1 Test Checklist](docs/PHASE1_TEST_CHECKLIST.md)4. **Install pnpm**- issueId?: UUID



### Test Users- issueKey?: String



Default test user (created after setup):   ```bash- projectId?: UUID

- **Email**: `admin@godjira.local`

- **Password**: `Admin123!`   npm install -g pnpm- sprintId?: UUID

- **Role**: ADMIN

   ```- commentId?: UUID

---

- metadata?: JSON

## Deployment

5. **Install PostgreSQL**- isRead: Boolean

### Docker Production

- readAt?: DateTime

```bash

docker-compose up -d   **Option A: Using Homebrew**- createdAt: DateTime

```

   ```bash```

Services:

- API: `http://localhost:3000`   brew install postgresql@15

- PostgreSQL: `localhost:5432`

- pgAdmin: `http://localhost:5050`   brew services start postgresql@15**Notification Types**:

- Prometheus: `http://localhost:9090`

- Grafana: `http://localhost:3001`   ```- `ISSUE_ASSIGNED` - Issue assignment notifications



### Kubernetes Deployment- `ISSUE_UPDATED` - Issue update notifications



1. **Create namespace**   **Option B: Using Postgres.app** (GUI application)- `ISSUE_COMMENTED` - New comment notifications



   ```bash   - `ISSUE_MENTIONED` - @mention notifications

   kubectl apply -f k8s/namespace.yaml

   ```   Download from [postgresapp.com](https://postgresapp.com/) and drag to Applications folder. Start Postgres.app and add to PATH:- `ISSUE_STATUS_CHANGED` - Status change notifications



2. **Deploy PostgreSQL**   ```bash- `SPRINT_STARTED` - Sprint start notifications



   ```bash   echo 'export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"' >> ~/.zshrc- `SPRINT_COMPLETED` - Sprint completion notifications

   kubectl apply -f k8s/postgres-statefulset.yaml

   ```   source ~/.zshrc- `TEAM_ADDED` - Team membership notifications



3. **Deploy API**   ```- `WATCHER_ADDED` - Watcher confirmation notifications



   ```bash

   kubectl apply -f k8s/api-deployment.yaml

   ```   **Option C: Using Docker Desktop**#### **Attachment Model**



4. **Deploy Web Frontend**   File attachments with thumbnails



   ```bash   Install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/) and skip to Docker setup below.```typescript

   kubectl apply -f k8s/web-deployment.yaml

   ```- id: UUID



5. **Setup Ingress**6. **Configure PostgreSQL**- filename: String



   ```bash- originalName: String

   kubectl apply -f k8s/ingress.yaml

   ```   If using Homebrew or Postgres.app:- mimetype: String



### Helm Deployment   ```bash- size: Int (bytes)



```bash   psql postgres- data: String (base64 data URL)

helm install godjira ./helm/godjira -f ./helm/godjira/values.yaml

```   ```- thumbnail?: String (base64, 200x200)



For detailed Kubernetes setup, see [K8S_DEPLOYMENT.md](K8S_DEPLOYMENT.md).- issueId: UUID → Issue



---   In PostgreSQL shell:- uploadedBy: UUID → User



## Project Structure   ```sql- createdAt: DateTime



```   CREATE USER godjira WITH PASSWORD 'your_password';```

GodJira/

├── apps/                      # Backend NestJS application   CREATE DATABASE godjira_dev OWNER godjira;

│   ├── src/

│   │   ├── auth/              # Authentication module   \q#### **AuditLog Model**

│   │   ├── users/             # User management

│   │   ├── projects/          # Project management   ```Complete audit trail for compliance

│   │   ├── sprints/           # Sprint management

│   │   ├── issues/            # Issue tracking```typescript

│   │   ├── comments/          # Comments

│   │   ├── worklogs/          # Time tracking7. **Install Docker (Optional)**- id: UUID

│   │   ├── issue-links/       # Issue relationships

│   │   ├── watchers/          # Issue watchers- action: AuditAction (CREATE | UPDATE | DELETE | STATUS_CHANGE | ASSIGN | COMMENT)

│   │   ├── teams/             # Team management

│   │   ├── audit/             # Audit logs   Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/) and install.- entityType: String

│   │   ├── notifications/     # WebSocket notifications

│   │   ├── analytics/         # Reports and charts- entityId: UUID

│   │   ├── attachments/       # File uploads

│   │   ├── export/            # Data export   For Apple Silicon, ensure "Use Rosetta for x86/amd64 emulation" is enabled in Docker Desktop settings if needed.- issueId?: UUID → Issue

│   │   ├── email/             # Email service

│   │   ├── health/            # Health checks- userId: UUID

│   │   ├── metrics/           # Prometheus metrics

│   │   ├── prisma/            # Database service8. **Clone and Setup Project**- userName: String

│   │   └── common/            # Shared utilities

│   ├── prisma/- changes: String (JSON)

│   │   └── schema.prisma      # Database schema

│   └── package.json   ```bash- ipAddress?: String

│

├── web/                       # Frontend React application   git clone https://github.com/yourusername/GodJira.git- userAgent?: String

│   ├── src/

│   │   ├── components/        # Reusable components   cd GodJira- createdAt: DateTime

│   │   ├── pages/             # Page components

│   │   ├── contexts/          # React contexts   pnpm install```

│   │   ├── services/          # API services

│   │   ├── lib/               # Utilities   cp apps/.env.example apps/.env

│   │   └── types/             # TypeScript types

│   ├── public/   cp web/.env.example web/.env#### **Task Model**

│   └── package.json

│   ```Legacy task support

├── docs/                      # Documentation

│   ├── architecture.md        # System architecture```typescript

│   ├── docker-dev.md          # Docker development guide

│   ├── env.md                 # Environment variables9. **Configure Environment Variables**- id: UUID

│   ├── PHASE1_IMPLEMENTATION.md

│   ├── PHASE1_TEST_CHECKLIST.md- title: String

│   ├── STACK_COMPLIANCE.md

│   └── STACK_STATUS.md   Edit `apps/.env` with your database credentials:- description?: String

│

├── k8s/                       # Kubernetes manifests   ```env- status: TaskStatus (TODO | IN_PROGRESS | DONE | CANCELLED)

│   ├── namespace.yaml

│   ├── api-deployment.yaml   DATABASE_URL="postgresql://godjira:your_password@localhost:5432/godjira_dev"- priority: TaskPriority (LOW | MEDIUM | HIGH)

│   ├── postgres-statefulset.yaml

│   ├── web-deployment.yaml   JWT_SECRET="your-secret-key-min-32-characters"- dueDate?: DateTime

│   └── ingress.yaml

│   JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-characters"- projectId: UUID → Project

├── helm/                      # Helm charts

│   └── godjira/   ```- creatorId: UUID → User

│

├── monitoring/                # Monitoring configuration- assigneeId?: UUID → User

│   ├── prometheus.yml

│   └── grafana/10. **Run Database Migrations**- createdAt: DateTime

│

├── docker-compose.yml         # Production Docker Compose- updatedAt: DateTime

├── docker-compose.dev.yml     # Development Docker Compose

├── package.json               # Root package.json    ```bash```

├── pnpm-workspace.yaml        # pnpm workspace config

├── turbo.json                 # Turborepo config    cd apps

└── README.md                  # This file

```    pnpm prisma migrate deploy---



---    pnpm prisma generate



## Documentation    ```## 🔐 Security Features



- [Architecture Overview](docs/architecture.md) - Detailed system architecture

- [Docker Development Guide](docs/docker-dev.md) - Docker setup and troubleshooting

- [Environment Variables](docs/env.md) - All configuration options#### macOS Performance Optimization### NIST-Compliant Password Security

- [Phase 1 Implementation](docs/PHASE1_IMPLEMENTATION.md) - Backend implementation details

- [Phase 1 Test Checklist](docs/PHASE1_TEST_CHECKLIST.md) - Testing procedures- ✅ Minimum 8 characters required

- [Stack Compliance](docs/STACK_COMPLIANCE.md) - Technology stack validation

- [Stack Status](docs/STACK_STATUS.md) - Implementation statusFor better Docker performance on macOS:- ✅ Must contain uppercase, lowercase, number, and special character

- [Kubernetes Deployment](K8S_DEPLOYMENT.md) - K8s deployment guide

- ✅ Bcrypt hashing with 12 rounds (configurable)

---

1. **Increase Docker Resources**- ✅ Password history tracking (prevents last 5 passwords from reuse)

## Contributing

   - ✅ Account lockout after 5 failed attempts (15-minute lock)

1. Fork the repository

2. Create a feature branch (`git checkout -b feature/amazing-feature`)   Docker Desktop → Settings → Resources:- ✅ Secure password reset with time-limited tokens

3. Commit your changes (`git commit -m 'Add amazing feature'`)

4. Push to the branch (`git push origin feature/amazing-feature`)   - CPUs: 4+ cores- ✅ Email verification system

5. Open a Pull Request

   - Memory: 8+ GB

---

   - Swap: 2 GB### Authentication & Authorization

## License

   - Disk: 64+ GB- ✅ JWT authentication with 30-minute access tokens

This project is licensed under the MIT License - see the LICENSE file for details.

- ✅ Refresh tokens with 7-day expiry

---

2. **Enable VirtioFS** (macOS 12.2+)- ✅ Role-Based Access Control (RBAC)

## Support

     - **USER**: Standard user permissions

For issues, questions, or contributions, please open an issue on GitHub.

   Docker Desktop → Settings → General → Enable "VirtioFS"  - **MANAGER**: Project management capabilities

---

  - **ADMIN**: Full system access

**Last Updated**: November 2025

3. **Use Docker Volumes for node_modules**- ✅ JWT refresh token strategy

   - ✅ Passport.js integration (Local + JWT strategies)

   Already configured in `docker-compose.dev.yml` for optimal performance.- ✅ WebSocket JWT authentication



---### API Security

- ✅ Rate limiting: 100 requests/minute (Throttler)

### Windows- ✅ Helmet security headers

- ✅ CORS configuration (configurable frontend URL)

1. **Install Node.js**- ✅ SQL injection protection (Prisma ORM)

- ✅ Input validation (class-validator)

   Download and install from [nodejs.org](https://nodejs.org/) (LTS version 20.x).- ✅ XSS protection

- ✅ Base64 file storage (no file path exposure)

   Verify installation:- ✅ Environment variable secrets management

   ```powershell

   node --version### Audit & Compliance

   npm --version- ✅ Complete audit trail (AuditLog model)

   ```- ✅ User activity tracking

- ✅ IP address and user agent logging

2. **Install pnpm**- ✅ Change history (old/new values in JSON)

- ✅ Entity-level audit logging

   ```powershell

   npm install -g pnpm---

   ```

## 📚 API Documentation

3. **Install PostgreSQL**

**Total Endpoints**: **113**

   **Option A: Using Windows Installer**

   Access interactive Swagger documentation at:

   Download from [postgresql.org](https://www.postgresql.org/download/windows/) and run the installer.```

http://localhost:3000/api/docs

   During installation:```

   - Set password for postgres user

   - Default port: 5432### API Modules Overview

   - Install pgAdmin 4 (optional GUI tool)

#### **Authentication (8 endpoints)**

   **Option B: Using Docker Desktop**- `POST /api/v1/auth/register` - User registration

   - `POST /api/v1/auth/login` - User login (returns JWT + refresh token)

   Install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/) and skip to Docker setup below.- `POST /api/v1/auth/refresh` - Refresh access token

- `POST /api/v1/auth/forgot-password` - Password reset request

4. **Configure PostgreSQL**- `POST /api/v1/auth/reset-password` - Reset password with token

- `POST /api/v1/auth/verify-email` - Verify email address

   Open Command Prompt or PowerShell:- `GET /api/v1/auth/profile` - Get JWT payload (lightweight auth check, used by Docker healthcheck)

   ```powershell

   psql -U postgres#### **Users (14 endpoints)**

   ```- `GET /api/v1/users` - List all users (paginated, searchable)

- `GET /api/v1/users/me` - Get current user profile

   In PostgreSQL shell:- `GET /api/v1/users/:id` - Get user by ID

   ```sql- `PATCH /api/v1/users/me` - Update current user profile

   CREATE USER godjira WITH PASSWORD 'your_password';- `POST /api/v1/users/me/avatar` - Upload avatar (base64)

   CREATE DATABASE godjira_dev OWNER godjira;- `PATCH /api/v1/users/me/password` - Change password

   \q- `PATCH /api/v1/users/:id/deactivate` - Deactivate user (Admin)

   ```- `PATCH /api/v1/users/:id/activate` - Activate user (Admin)

- `PATCH /api/v1/users/:id/role` - Change user role (Admin)

5. **Install Git**- `DELETE /api/v1/users/:id` - Delete user (Admin)

- Plus more admin endpoints...

   Download from [git-scm.com](https://git-scm.com/download/win) and install.

#### **Projects (7 endpoints)**

6. **Install Docker Desktop (Optional)**- `POST /api/v1/projects` - Create project

- `GET /api/v1/projects` - List projects (paginated, searchable)

   Download from [docker.com](https://www.docker.com/products/docker-desktop/) and install.- `GET /api/v1/projects/:id` - Get project by ID

- `GET /api/v1/projects/key/:key` - Get project by key

   Enable WSL 2 backend for better performance (Windows 10/11):- `GET /api/v1/projects/:id/statistics` - Project statistics

   ```powershell- `PATCH /api/v1/projects/:id` - Update project

   wsl --install- `DELETE /api/v1/projects/:id` - Delete project

   ```

#### **Sprints (9 endpoints)**

7. **Clone and Setup Project**- `POST /api/v1/sprints` - Create sprint

- `GET /api/v1/sprints` - List sprints (by project)

   ```powershell- `GET /api/v1/sprints/:id` - Get sprint details

   git clone https://github.com/yourusername/GodJira.git- `PATCH /api/v1/sprints/:id` - Update sprint

   cd GodJira- `PATCH /api/v1/sprints/:id/start` - Start sprint

   pnpm install- `PATCH /api/v1/sprints/:id/complete` - Complete sprint

   Copy-Item apps\.env.example apps\.env- `DELETE /api/v1/sprints/:id` - Delete sprint

   Copy-Item web\.env.example web\.env- `GET /api/v1/sprints/:id/statistics` - Sprint statistics

   ```- `GET /api/v1/sprints/:id/burndown` - Burndown chart data



8. **Configure Environment Variables**#### **Issues (15 endpoints)**

- `POST /api/v1/issues` - Create issue

   Edit `apps\.env` with your database credentials:- `GET /api/v1/issues` - List issues (advanced filtering)

   ```env- `GET /api/v1/issues/:id` - Get issue details

   DATABASE_URL="postgresql://godjira:your_password@localhost:5432/godjira_dev"- `GET /api/v1/issues/key/:key` - Get issue by key

   JWT_SECRET="your-secret-key-min-32-characters"- `PATCH /api/v1/issues/:id` - Update issue

   JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-characters"- `PATCH /api/v1/issues/:id/assign` - Assign issue to user

   ```- `PATCH /api/v1/issues/:id/status` - Update issue status

- `DELETE /api/v1/issues/:id` - Delete issue

9. **Run Database Migrations**- `POST /api/v1/issues/bulk-update` - Bulk update issues

- `POST /api/v1/issues/:id/sub-tasks` - Create sub-task

   ```powershell- `GET /api/v1/issues/:id/sub-tasks` - Get sub-tasks

   cd apps- Plus more sub-task management endpoints...

   pnpm prisma migrate deploy

   pnpm prisma generate#### **Comments (6 endpoints)**

   ```- `POST /api/v1/comments` - Create comment

- `GET /api/v1/comments/issue/:issueId` - Get issue comments

#### Windows Troubleshooting- `GET /api/v1/comments/:id` - Get comment by ID

- `PATCH /api/v1/comments/:id` - Update comment

- **PowerShell Execution Policy**: If you encounter script execution errors:- `DELETE /api/v1/comments/:id` - Delete comment

  ```powershell- `POST /api/v1/comments/:id/mention` - @mention user

  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

  ```#### **Work Logs (7 endpoints)**

- `POST /api/v1/work-logs` - Log time on issue

- **Path Issues**: Ensure Node.js and PostgreSQL bin directories are in PATH:- `GET /api/v1/work-logs/issue/:issueId` - Get issue work logs

  ```powershell- `GET /api/v1/work-logs/user/:userId` - Get user work logs

  $env:PATH += ";C:\Program Files\PostgreSQL\15\bin"- `GET /api/v1/work-logs/user/:userId/stats` - User time statistics

  ```- `GET /api/v1/work-logs/:id` - Get work log details

- `PATCH /api/v1/work-logs/:id` - Update work log

- **Port Conflicts**: If port 3000 or 5432 is in use, modify `apps/.env` and `web/vite.config.ts`.- `DELETE /api/v1/work-logs/:id` - Delete work log



---#### **Issue Links (3 endpoints)**

- `POST /api/v1/issue-links` - Create issue link

## Configuration- `GET /api/v1/issue-links/issue/:issueId` - Get issue links

- `DELETE /api/v1/issue-links/:id` - Delete issue link

### Environment Variables

Link types: `BLOCKS`, `BLOCKED_BY`, `RELATES_TO`, `DUPLICATES`, `DUPLICATED_BY`, `PARENT_OF`, `CHILD_OF`

#### Backend (`apps/.env`)

#### **Watchers (6 endpoints)**

```env- `POST /api/v1/watchers/issue/:issueId` - Watch issue

# Database- `DELETE /api/v1/watchers/issue/:issueId` - Unwatch issue

DATABASE_URL="postgresql://godjira:password@localhost:5432/godjira_dev"- `GET /api/v1/watchers/issue/:issueId` - Get issue watchers

- `GET /api/v1/watchers/issue/:issueId/count` - Get watcher count

# JWT Configuration- `GET /api/v1/watchers/issue/:issueId/is-watching` - Check if watching

JWT_SECRET="your-secret-key-minimum-32-characters-long"- `GET /api/v1/watchers/my-watched-issues` - Get my watched issues

JWT_REFRESH_SECRET="your-refresh-secret-minimum-32-characters-long"

JWT_EXPIRES_IN="30m"#### **Teams (13 endpoints)**

JWT_REFRESH_EXPIRES_IN="7d"- `POST /api/v1/teams` - Create team

- `GET /api/v1/teams` - List all teams (paginated)

# Email Configuration (Development)- `GET /api/v1/teams/my-teams` - Get current user's teams

MAIL_HOST="localhost"- `GET /api/v1/teams/project/:projectId` - Get teams by project

MAIL_PORT=1025- `GET /api/v1/teams/:id` - Get team details

MAIL_USER=""- `PATCH /api/v1/teams/:id` - Update team

MAIL_PASSWORD=""- `DELETE /api/v1/teams/:id` - Delete team

MAIL_FROM="noreply@godjira.local"- `POST /api/v1/teams/:teamId/members` - Add team member

FRONTEND_URL="http://localhost:5173"- `DELETE /api/v1/teams/:teamId/members/:userId` - Remove member

- `PATCH /api/v1/teams/:teamId/members/:userId/role` - Update member role

# File Upload- `POST /api/v1/teams/:teamId/projects` - Add project to team

UPLOAD_PATH="./uploads"- `DELETE /api/v1/teams/:teamId/projects/:projectId` - Remove project

MAX_FILE_SIZE=20971520- Plus team statistics endpoint...

MAX_AVATAR_SIZE=10485760

#### **Notifications (5 endpoints + WebSocket)**

# Security- `GET /api/v1/notifications` - Get notifications (paginated, filtered)

BCRYPT_ROUNDS=12- `GET /api/v1/notifications/unread-count` - Get unread count

MAX_FAILED_LOGIN_ATTEMPTS=5- `PATCH /api/v1/notifications/:id/read` - Mark notification as read

ACCOUNT_LOCKOUT_DURATION=900000- `PATCH /api/v1/notifications/read-all` - Mark all as read

- `DELETE /api/v1/notifications/:id` - Delete notification

# Rate Limiting- **WebSocket**: `ws://localhost:3000/notifications` (JWT auth)

THROTTLE_TTL=60000

THROTTLE_LIMIT=100#### **Analytics (6 endpoints)**

- `GET /api/v1/analytics/sprint/:sprintId/burndown` - Burndown chart

# Server- `GET /api/v1/analytics/sprint/:sprintId/velocity` - Velocity chart

PORT=3000- `GET /api/v1/analytics/project/:projectId/summary` - Project summary

NODE_ENV="development"- `GET /api/v1/analytics/user/:userId/productivity` - User productivity

```- `GET /api/v1/analytics/issue/:issueId/aging` - Issue aging report

- `GET /api/v1/analytics/team/:teamId/capacity` - Team capacity

#### Frontend (`web/.env`)

#### **Attachments (4 endpoints)**

```env- `POST /api/v1/attachments/issues/:issueId` - Upload attachment

VITE_API_URL=http://localhost:3000/api/v1- `GET /api/v1/attachments/issues/:issueId` - List issue attachments

VITE_WS_URL=http://localhost:3000- `GET /api/v1/attachments/:id` - Get attachment details

```- `DELETE /api/v1/attachments/:id` - Delete attachment



### Docker ConfigurationSupported formats:

- **Images**: JPG, PNG, GIF, WebP (max 10MB, auto-thumbnail generation)

For Docker-based development, environment variables are configured in `docker-compose.dev.yml`.- **Documents**: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV (max 20MB)



---#### **Export (4 endpoints)**

- `GET /api/v1/export/issues` - Export issues (CSV/Excel)

## Running the Application- `GET /api/v1/export/sprints/:id` - Export sprint report

- `GET /api/v1/export/work-logs` - Export work logs

### Local Development (Without Docker)- `GET /api/v1/export/user-activity/:userId` - Export user activity



1. **Start PostgreSQL** (if not using Docker)Export features:

- ✅ CSV and Excel format support

   Linux/macOS:- ✅ Date range filtering

   ```bash- ✅ Project and sprint filtering

   sudo systemctl start postgresql  # Linux- ✅ Styled Excel headers

   brew services start postgresql@15  # macOS- ✅ Auto-sized columns

   ```- ✅ Multi-sheet Excel support



   Windows: PostgreSQL service should start automatically.#### **Audit (2 endpoints)**

- `GET /api/v1/audit/logs` - Get audit logs (paginated, filtered)

2. **Start Backend**- `GET /api/v1/audit/activity-feed` - Get activity feed



   ```bash#### **Health & Metrics (2 endpoints)**

   cd apps- `GET /api/v1/health` - Health check (liveness/readiness)

   pnpm dev- `GET /api/v1/metrics` - Prometheus metrics

   ```

---

   Backend will run at `http://localhost:3000`

   API docs at `http://localhost:3000/api/docs`## 🔄 Real-Time Notifications



3. **Start Frontend** (in new terminal)### WebSocket Connection



   ```bashConnect to WebSocket at `ws://localhost:3000/notifications`:

   cd web

   pnpm dev```javascript

   ```import io from 'socket.io-client';



   Frontend will run at `http://localhost:5173`const socket = io('ws://localhost:3000/notifications', {

  auth: {

### Docker Development    token: 'your-jwt-access-token'

  }

1. **Start all services**});



   ```bashsocket.on('connected', (data) => {

   docker-compose -f docker-compose.dev.yml up -d  console.log('Connected as:', data.userId);

   ```  console.log('Socket ID:', data.socketId);

});

   Services:

   - Backend: `http://localhost:3000`socket.on('notification', (notification) => {

   - Frontend: `http://localhost:5173`  console.log('New notification:', notification);

   - PostgreSQL: `localhost:5432`  // Display notification in UI

   - pgAdmin: `http://localhost:5050` (admin@godjira.local / admin)  showNotification(notification.title, notification.message);

   - Mailhog: `http://localhost:8025`});

   - Redis: `localhost:6379`

socket.on('disconnect', () => {

2. **View logs**  console.log('Disconnected from notification server');

});

   ```bash

   docker-compose -f docker-compose.dev.yml logs -fsocket.on('error', (error) => {

   ```  console.error('WebSocket error:', error);

});

3. **Stop services**```



   ```bash### Multi-Device Support

   docker-compose -f docker-compose.dev.yml down

   ```Users can be online on multiple devices simultaneously. Notifications are delivered to all active connections.



4. **Restart specific service**### Notification Events



   ```bash- `connected` - Connection established

   docker-compose -f docker-compose.dev.yml restart api- `notification` - New notification received

   ```- `disconnect` - Connection closed

- `error` - Connection error

### Windows-Specific Start Script

---

For Windows users, a PowerShell script is provided:

## 🐳 Docker Deployment

```powershell

.\start.ps1### Local Development

```

```powershell

This will check prerequisites and start Docker Compose development environment.# Start all services (PostgreSQL, PgAdmin, Prometheus, Grafana)

docker-compose up -d

---

# Check services

## API Documentationdocker-compose ps



### Swagger UI# View logs

docker-compose logs -f api

Once the backend is running, access the interactive API documentation:

# Stop all services

**URL**: `http://localhost:3000/api/docs`docker-compose down



### API Overview# Stop and remove volumes

docker-compose down -v

- **Base URL**: `http://localhost:3000/api/v1````

- **Authentication**: Bearer JWT token in `Authorization` header

- **Total Endpoints**: 113 REST APIs### Production Build

- **Modules**: 16 feature modules

```powershell

### Key Endpoints# Build backend image

docker build -f apps/Dockerfile -t godjira/api:latest .

**Authentication**

- `POST /auth/register` - Register new user# Run container

- `POST /auth/login` - Logindocker run -d \

- `POST /auth/refresh` - Refresh access token  -p 3000:3000 \

- `GET /auth/profile` - Get current user profile  --name godjira-api \

- `POST /auth/verify-email` - Verify email  --env-file apps/.env \

  godjira/api:latest

**Projects**

- `GET /projects` - List all projects# Check logs

- `POST /projects` - Create projectdocker logs -f godjira-api

- `GET /projects/:id` - Get project details```

- `PATCH /projects/:id` - Update project

- `DELETE /projects/:id` - Delete project---



**Issues**## ☸️ Kubernetes Deployment

- `GET /issues` - List issues (with filters)

- `POST /issues` - Create issue### Using Kubectl (Raw Manifests)

- `GET /issues/:id` - Get issue details

- `PATCH /issues/:id` - Update issue```powershell

- `PATCH /issues/:id/status` - Change issue status# Apply all Kubernetes manifests

- `PATCH /issues/:id/assign` - Assign issuekubectl apply -f k8s/



**Sprints**# Check deployment status

- `GET /sprints` - List sprintskubectl get all -n godjira

- `POST /sprints` - Create sprint

- `POST /sprints/:id/start` - Start sprint# Check pods

- `POST /sprints/:id/complete` - Complete sprintkubectl get pods -n godjira



For complete API documentation, see [docs/architecture.md](docs/architecture.md).# View logs

kubectl logs -n godjira -l app=godjira-api -f

---

# Port forward to access locally

## Testingkubectl port-forward -n godjira svc/godjira-api 3000:3000



### Running Tests# Delete deployment

kubectl delete -f k8s/

**Unit Tests**```

```bash

cd apps### Using Helm

pnpm test

``````powershell

# Install chart

**E2E Tests**helm install godjira ./helm/godjira -n godjira --create-namespace

```bash

cd apps# Check status

pnpm test:e2ehelm status godjira -n godjira

```

# Upgrade

**Test Coverage**helm upgrade godjira ./helm/godjira -n godjira

```bash

cd apps# Rollback

pnpm test:covhelm rollback godjira -n godjira

```

# Uninstall

### Manual Testinghelm uninstall godjira -n godjira

```

Use the provided test checklist:

- [Phase 1 Test Checklist](docs/PHASE1_TEST_CHECKLIST.md)### Production Features



### Test Users- ✅ **2 replicas** with horizontal pod autoscaling

- ✅ **Health probes** (liveness every 10s, readiness every 5s)

Default test user (created after setup):- ✅ **Resource limits** (CPU: 500m-1000m, Memory: 512Mi-1Gi)

- **Email**: `admin@godjira.local`- ✅ **Persistent storage** for PostgreSQL (10Gi)

- **Password**: `Admin123!`- ✅ **SSL/TLS** with cert-manager (Let's Encrypt)

- **Role**: ADMIN- ✅ **Ingress** with Nginx

- ✅ **Prometheus** metrics scraping

---- ✅ **Grafana** dashboards

- ✅ **Multi-architecture** support (ARM64/AMD64)

## Deployment- ✅ **Non-root** container execution

- ✅ **Rolling updates** with zero downtime

### Docker Production

---

```bash

docker-compose up -d## 📊 Monitoring & Observability

```

### Prometheus Metrics

Services:

- API: `http://localhost:3000`Access metrics at:

- PostgreSQL: `localhost:5432````

- pgAdmin: `http://localhost:5050`http://localhost:3000/api/v1/metrics

- Prometheus: `http://localhost:9090````

- Grafana: `http://localhost:3001`

Available metrics:

### Kubernetes Deployment- HTTP request duration

- HTTP request total count

1. **Create namespace**- Active WebSocket connections

- Database query performance

   ```bash- Memory usage

   kubectl apply -f k8s/namespace.yaml- CPU usage

   ```

### Grafana Dashboards

2. **Deploy PostgreSQL**

Access Grafana at:

   ```bash```

   kubectl apply -f k8s/postgres-statefulset.yamlhttp://localhost:3001

   ``````



3. **Deploy API**Default credentials:

- Username: `admin`

   ```bash- Password: `admin123`

   kubectl apply -f k8s/api-deployment.yaml

   ```Pre-configured dashboards:

- Application metrics

4. **Deploy Web Frontend**- Database performance

- API endpoint statistics

   ```bash- Resource usage

   kubectl apply -f k8s/web-deployment.yaml

   ```### Health Checks



5. **Setup Ingress**```powershell

# Health check endpoint

   ```bashcurl http://localhost:3000/api/v1/health

   kubectl apply -f k8s/ingress.yaml

   ```# Response:

{

### Helm Deployment  "status": "ok",

  "info": {

```bash    "database": {

helm install godjira ./helm/godjira -f ./helm/godjira/values.yaml      "status": "up"

```    },

    "memory": {

For detailed Kubernetes setup, see [K8S_DEPLOYMENT.md](K8S_DEPLOYMENT.md).      "status": "up"

    }

---  }

}

## Project Structure```



```---

GodJira/

├── apps/                      # Backend NestJS application## 🧪 Testing

│   ├── src/

│   │   ├── auth/              # Authentication module```powershell

│   │   ├── users/             # User management# Run unit tests

│   │   ├── projects/          # Project managementpnpm test

│   │   ├── sprints/           # Sprint management

│   │   ├── issues/            # Issue tracking# Run unit tests in watch mode

│   │   ├── comments/          # Commentspnpm test:watch

│   │   ├── worklogs/          # Time tracking

│   │   ├── issue-links/       # Issue relationships# Run E2E tests

│   │   ├── watchers/          # Issue watcherspnpm test:e2e

│   │   ├── teams/             # Team management

│   │   ├── audit/             # Audit logs# Generate coverage report

│   │   ├── notifications/     # WebSocket notificationspnpm test:cov

│   │   ├── analytics/         # Reports and charts

│   │   ├── attachments/       # File uploads# Open coverage report

│   │   ├── export/            # Data exportstart coverage/lcov-report/index.html

│   │   ├── email/             # Email service```

│   │   ├── health/            # Health checks

│   │   ├── metrics/           # Prometheus metrics---

│   │   ├── prisma/            # Database service

│   │   └── common/            # Shared utilities## 🔧 Database Management

│   ├── prisma/

│   │   └── schema.prisma      # Database schema### Prisma Studio (GUI)

│   └── package.json

│```powershell

├── web/                       # Frontend React applicationcd apps

│   ├── src/pnpm prisma:studio

│   │   ├── components/        # Reusable components```

│   │   ├── pages/             # Page components

│   │   ├── contexts/          # React contextsAccess at: `http://localhost:5555`

│   │   ├── services/          # API services

│   │   ├── lib/               # Utilities### PgAdmin (Web UI)

│   │   └── types/             # TypeScript types

│   ├── public/Access at: `http://localhost:5050`

│   └── package.json

│Credentials:

├── docs/                      # Documentation- Email: `admin@godjira.local`

│   ├── architecture.md        # System architecture- Password: `admin123`

│   ├── docker-dev.md          # Docker development guide

│   ├── env.md                 # Environment variables### Migrations

│   ├── PHASE1_IMPLEMENTATION.md

│   ├── PHASE1_TEST_CHECKLIST.md```powershell

│   ├── STACK_COMPLIANCE.md# Create new migration

│   └── STACK_STATUS.mdpnpm prisma:migrate:dev --name migration_name

│

├── k8s/                       # Kubernetes manifests# Apply pending migrations

│   ├── namespace.yamlpnpm prisma:migrate:deploy

│   ├── api-deployment.yaml

│   ├── postgres-statefulset.yaml# Reset database (DEV ONLY)

│   ├── web-deployment.yamlpnpm prisma:migrate:reset

│   └── ingress.yaml

│# View migration status

├── helm/                      # Helm chartspnpm prisma:migrate:status

│   └── godjira/```

│

├── monitoring/                # Monitoring configuration### Seeding

│   ├── prometheus.yml

│   └── grafana/```powershell

│# Seed database with sample data

├── docker-compose.yml         # Production Docker Composepnpm prisma:seed

├── docker-compose.dev.yml     # Development Docker Compose```

├── package.json               # Root package.json

├── pnpm-workspace.yaml        # pnpm workspace config---

├── turbo.json                 # Turborepo config

└── README.md                  # This file## 📝 Environment Variables

```

Create `.env` file in `apps/` directory:

---

```env

## Documentation# Database

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/godjira"

- [Architecture Overview](docs/architecture.md) - Detailed system architecture

- [Docker Development Guide](docs/docker-dev.md) - Docker setup and troubleshooting# JWT Secrets

- [Environment Variables](docs/env.md) - All configuration optionsJWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

- [Phase 1 Implementation](docs/PHASE1_IMPLEMENTATION.md) - Backend implementation detailsJWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"

- [Phase 1 Test Checklist](docs/PHASE1_TEST_CHECKLIST.md) - Testing proceduresJWT_EXPIRATION="30m"

- [Stack Compliance](docs/STACK_COMPLIANCE.md) - Technology stack validationJWT_REFRESH_EXPIRATION="7d"

- [Stack Status](docs/STACK_STATUS.md) - Implementation status

- [Kubernetes Deployment](K8S_DEPLOYMENT.md) - K8s deployment guide# Server

PORT=3000

---NODE_ENV="development"



## Contributing# Email Configuration (Nodemailer)

EMAIL_HOST="smtp.gmail.com"

1. Fork the repositoryEMAIL_PORT=587

2. Create a feature branch (`git checkout -b feature/amazing-feature`)EMAIL_USER="your-email@gmail.com"

3. Commit your changes (`git commit -m 'Add amazing feature'`)EMAIL_PASSWORD="your-app-password"

4. Push to the branch (`git push origin feature/amazing-feature`)EMAIL_FROM="GodJira <noreply@godjira.com>"

5. Open a Pull Request

# Frontend URL (for CORS)

---FRONTEND_URL="http://localhost:5173"



## License# File Upload

MAX_FILE_SIZE=10485760  # 10MB in bytes

This project is licensed under the MIT License - see the LICENSE file for details.```



------



## Support## 🚀 Performance Optimizations



For issues, questions, or contributions, please open an issue on GitHub.- ✅ Prisma query optimization with select and include

- ✅ Database indexing on frequently queried fields

---- ✅ Pagination for list endpoints (default: 20 items/page)

- ✅ Compression middleware (gzip)

**Last Updated**: November 2025- ✅ Docker multi-stage builds (optimized image size)

- ✅ Connection pooling (Prisma default)
- ✅ Rate limiting (100 req/min via Throttler)

---

## 🎯 Roadmap

### ✅ Completed (Backend - 100%)
- [x] Complete monorepo setup with Turborepo
- [x] Complete database schema (16 models)
- [x] Prisma ORM with migrations
- [x] Authentication system (JWT + refresh tokens)
- [x] User management with RBAC
- [x] Project CRUD with statistics
- [x] Sprint lifecycle management
- [x] Issue tracking with sub-tasks
- [x] Comments system with @mentions
- [x] Work logs & time tracking
- [x] Audit logging & activity feeds
- [x] Issue linking & relationships
- [x] Watchers feature
- [x] Team management
- [x] Real-time WebSocket notifications
- [x] Analytics & reporting (burndown charts, velocity)
- [x] File uploads (avatars + attachments with thumbnails)
- [x] Export functionality (CSV + Excel)
- [x] Email notifications
- [x] Kubernetes deployment (manifests + Helm charts)
- [x] Prometheus metrics & Grafana dashboards
- [x] Health checks
- [x] Docker containerization
- [x] Comprehensive API documentation (Swagger)

### 📅 Planned

#### Frontend Development
- [ ] React 18+ with TypeScript
- [ ] Dashboard with project overview
- [ ] Issue board (Kanban view)
- [ ] Sprint board
- [ ] Real-time updates (WebSocket integration)
- [ ] User profile and settings
- [ ] Team management UI
- [ ] Analytics dashboards
- [ ] File upload UI with drag-and-drop
- [ ] Export UI with format selection

#### Advanced Backend Features
- [ ] Custom workflows and automations
- [ ] Advanced search with JQL (JIRA Query Language)
- [ ] Release management
- [ ] Roadmap planning
- [ ] Custom fields for issues
- [ ] Webhooks for external integrations
- [ ] Two-factor authentication (2FA)
- [ ] SAML/OAuth2 integration
- [ ] GraphQL API
- [ ] Mobile push notifications

#### DevOps & Infrastructure
- [ ] CI/CD pipeline (GitHub Actions)
  - [ ] Automated testing on PR
  - [ ] Docker build and push
  - [ ] Automated deployment to K8s
- [ ] Database backup strategy
- [ ] Log aggregation (Loki)
- [ ] Alerting rules (Prometheus Alertmanager)
- [ ] Load testing (k6/Artillery)
- [ ] Security testing (OWASP ZAP)

#### Testing
- [ ] Unit tests for services (Jest) - Target: 80%+ coverage
- [ ] Controller tests
- [ ] Integration tests
- [ ] E2E tests (Supertest)
- [ ] API contract tests
- [ ] Load testing
- [ ] Security testing

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Troubleshooting

### Issue: Docker not running
**Solution**: Start Docker Desktop

### Issue: Database connection failed
**Solution**:
```powershell
docker-compose up -d postgres
docker ps  # Verify running
```

### Issue: Prisma Client not generated
**Solution**:
```powershell
cd apps
pnpm prisma:generate
```

### Issue: Port 3000 already in use
**Solution**:
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: Migration errors
**Solution**:
```powershell
# Reset database (DEV ONLY)
pnpm prisma:migrate:reset

# Reapply migrations
pnpm prisma:migrate:deploy
```

### Issue: WebSocket connection fails
**Solution**: Ensure JWT token is valid and passed in auth parameter

---

## 📄 License

MIT License - Feel free to use this project for learning and commercial purposes.

---

## 🎉 Success!

Your GodJira backend is **100% complete** and production-ready! 🚀

### What You Have:
✅ **113 API endpoints** across **16 modules**  
✅ **16 database models** with complete relationships  
✅ **Real-time notifications** via WebSocket  
✅ **Advanced analytics** with burndown charts and velocity tracking  
✅ **File uploads** with thumbnail generation  
✅ **Export functionality** for CSV and Excel  
✅ **NIST-compliant security** with comprehensive audit logging  
✅ **Kubernetes-ready** with Helm charts  
✅ **Production monitoring** with Prometheus and Grafana  

### Access Points:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/v1/health
- **Metrics**: http://localhost:3000/api/v1/metrics
- **Prisma Studio**: http://localhost:5555
- **PgAdmin**: http://localhost:5050
- **Grafana**: http://localhost:3001

### Next Steps:
1. **Frontend Development** - Build React UI to consume the API
2. **CI/CD Pipeline** - Automate testing and deployment
3. **Production Deployment** - Deploy to Kubernetes cluster
4. **Monitoring Setup** - Configure Prometheus alerts and Grafana dashboards

---

**Need Help?**
- 📖 Check the Swagger docs: http://localhost:3000/api/docs
- 📋 Review the checklist: `CHECKLIST.md`
- ☸️ Kubernetes guide: `K8S_DEPLOYMENT.md`
- 🗄️ Database management: `pnpm prisma:studio`

---

Built with ❤️ for the developer community | **Backend: 100% Complete** ⚡✅
