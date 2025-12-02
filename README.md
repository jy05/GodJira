# GodJira - Enterprise Project Management System

⚠️ **SECURITY NOTICE**: Before deploying, read [SECURITY.md](./SECURITY.md) and [SECURITY_QUICK_START.md](./SECURITY_QUICK_START.md) for critical security setup instructions.

## Overview

GodJira is a production-ready, enterprise-grade project management system inspired by Atlassian JIRA. Built with modern cloud-native technologies, it provides comprehensive issue tracking, sprint management, team collaboration, and real-time notifications.

### Key Features

- **113 REST API Endpoints** across 16 modules
- **Real-time Updates** via WebSocket connections
- **Advanced Analytics** with burndown charts and metrics
- **Agile Workflows** with sprint planning and backlog management
- **Time Tracking** with worklog management
- **File Attachments** with encryption at rest
- **Role-Based Access Control** (RBAC) with granular permissions
- **Audit Logging** for compliance and security monitoring
- **Multi-tenant** team and project isolation

### Architecture

GodJira is built on a containerized microservices architecture optimized for Kubernetes:

- **Backend**: NestJS (Node.js) with TypeScript
- **Database**: PostgreSQL 15 with Prisma ORM
- **Frontend**: React with TypeScript and Vite
- **Caching**: Redis (optional, for production)
- **Monitoring**: Prometheus & Grafana
- **Orchestration**: Kubernetes with Helm charts
- **Container Runtime**: Docker

### Production-Ready Features

✅ **Fully Containerized** - All dependencies packaged in Docker images  
✅ **Kubernetes Native** - StatefulSets, Deployments, Services, and Ingress  
✅ **Helm Charts** - Simplified deployment and configuration management  
✅ **Horizontal Scaling** - Stateless API design for auto-scaling  
✅ **Health Checks** - Liveness and readiness probes  
✅ **TLS/SSL** - Automatic certificate management with cert-manager  
✅ **Secret Management** - Integration with external secret stores  
✅ **Database Migrations** - Automated via Prisma on pod startup  
✅ **NIST Security Compliance** - Industry-standard authentication and encryption  
✅ **Zero External Dependencies** - All services run within Kubernetes cluster

## 🔒 Security First

**CRITICAL**: All hardcoded credentials have been removed as of November 27, 2025. You **MUST** set up secure credentials before deploying:

1. 📖 Read [SECURITY.md](./SECURITY.md) - **Required before deployment**
2. 🚀 Quick Start: [SECURITY_QUICK_START.md](./SECURITY_QUICK_START.md)
3. 🔐 Generate secure secrets: `.\scripts\generate-secrets.ps1 -All`
4. 🚫 Never commit `.env` files or secrets to version control
5. ✅ Verify all placeholder passwords are replaced

## Table of Contents

- [Overview](#overview)
- [Security](#security-first)
- [Prerequisites](#prerequisites)
- [Installation Methods](#installation-methods)
  - [Development (Docker Compose)](#development-environment-docker-compose)
  - [Production (Kubernetes + Helm)](#production-deployment-kubernetes--helm)
  - [Production (Kubernetes Manifests)](#production-deployment-kubernetes-manifests)
  - [Raspberry Pi & ARM Systems](#raspberry-pi--arm-systems)
- [Dependencies & Containers](#dependencies--containers)
- [Configuration](#configuration)
  - [Public Access with HTTPS](#public-access-with-https)
- [Monitoring & Observability](#monitoring--observability)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Prerequisites

### Required Tools

| Tool | Minimum Version | Purpose |
|------|----------------|---------|
| Docker | 20.10+ | Container runtime |
| Docker Compose | 2.0+ | Multi-container orchestration (dev) |
| Kubernetes | 1.24+ | Production orchestration |
| kubectl | 1.24+ | Kubernetes CLI |
| Helm | 3.10+ | Kubernetes package manager |
| Git | 2.30+ | Version control |

**Note**: For production deployment, you need a Kubernetes cluster. Options include:
- **Local Development**: Minikube, kind, Docker Desktop with Kubernetes
- **Cloud Providers**: AWS EKS, Google GKE, Azure AKS, DigitalOcean DOKS
- **On-Premise**: kubeadm, Rancher, OpenShift

### Installation by Platform

### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install Docker
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install Git
sudo apt install -y git
```

### macOS

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Docker Desktop
brew install --cask docker

# Install kubectl
brew install kubectl

# Install Helm
brew install helm

# Install Git
brew install git
```

### Windows (PowerShell - Run as Administrator)

```powershell
# Install Chocolatey if not already installed
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Docker Desktop
choco install -y docker-desktop

# Install kubectl
choco install -y kubernetes-cli

# Install Helm
choco install -y kubernetes-helm

# Install Git
choco install -y git

# Restart required after installation
Write-Host "Please restart your computer to complete the installation"
```

```

## Dependencies & Containers

**All dependencies are containerized** - no external installations required for deployment.

### Multi-Architecture Support

🌍 **GodJira supports multiple CPU architectures:**

- ✅ **AMD64/x86_64** - Intel/AMD processors (standard servers, desktops)
- ✅ **ARM64/aarch64** - Raspberry Pi, Apple Silicon, AWS Graviton
- ✅ **Automatic selection** - Docker pulls the correct image for your system

All official images support ARM64 natively:
- `postgres:15-alpine` - Multi-arch official image
- `redis:7-alpine` - Multi-arch official image
- `node:20-alpine` - Multi-arch official image
- `prom/prometheus` - Multi-arch official image
- `grafana/grafana` - Multi-arch official image

**Custom images** (API/Web) are built from multi-arch base images and can be compiled for any platform.

### Container Architecture

GodJira uses a fully containerized architecture where **every service runs in its own container/pod**:

| Service | Container Image | Purpose | Dependencies |
|---------|----------------|---------|--------------|
| **API Backend** | `godjira-api:latest` | NestJS REST API + WebSocket | Node.js 20, Prisma, TypeScript |
| **Frontend** | `godjira-web:latest` | React SPA with Nginx | Node.js 20 (build), Nginx (runtime) |
| **PostgreSQL** | `postgres:15-alpine` | Primary database | None (official image) |
| **Redis** | `redis:7-alpine` | Caching layer (optional) | None (official image) |
| **Prometheus** | `prom/prometheus:latest` | Metrics collection | None (official image) |
| **Grafana** | `grafana/grafana:latest` | Metrics visualization | None (official image) |
| **PgAdmin** | `dpage/pgadmin4:latest` | Database management (dev only) | None (official image) |

### Container Contents

#### API Backend Container (`apps/Dockerfile`)
- ✅ Node.js 20 runtime
- ✅ NestJS framework
- ✅ Prisma Client (auto-generated)
- ✅ TypeScript compiled artifacts
- ✅ All npm dependencies bundled
- ✅ Database migration scripts
- ✅ Health check endpoints

#### Frontend Container (`web/Dockerfile`)
- ✅ Vite-built static assets
- ✅ Nginx web server
- ✅ Optimized for production (gzip, caching)
- ✅ SPA routing configuration
- ✅ Health check endpoint

### Persistent Storage

Only the PostgreSQL database requires persistent storage:

```yaml
# Kubernetes StatefulSet with PVC
- PostgreSQL data: 10Gi persistent volume
- Backup strategy: Via pg_dump or PVC snapshots
- No host-path dependencies
```

All other services are **stateless** and can be scaled horizontally.

## Installation Methods

Choose the appropriate method for your environment:

- 🔧 **Development**: Docker Compose (quick local setup)
- 🚀 **Production**: Kubernetes with Helm (recommended)
- ⚙️ **Production**: Kubernetes with raw manifests (advanced)
- 🥧 **Raspberry Pi / ARM**: See [Raspberry Pi Deployment Guide](./docs/RASPBERRY_PI_DEPLOYMENT.md)

### System Portability

✅ **GodJira is 100% containerized and portable!**

Run on **ANY** platform with Docker/Kubernetes:

| Platform | Architecture | Status |
|----------|-------------|--------|
| 🥧 **Raspberry Pi 4/5** | ARM64 | ✅ Full Support |
| 🐧 **Linux** | AMD64/ARM64 | ✅ Production Ready |
| 🪟 **Windows** | AMD64 | ✅ Docker Desktop |
| 🍎 **macOS (Intel)** | AMD64 | ✅ Docker Desktop |
| 🍎 **macOS (Apple Silicon)** | ARM64 | ✅ Native Support |
| ☁️ **AWS/Azure/GCP** | AMD64 | ✅ Cloud Ready |
| 🔶 **Orange Pi / Rock Pi** | ARM64 | ✅ Compatible |

**All dependencies are containerized** - no external software installation required beyond Docker/Kubernetes!

## Raspberry Pi & ARM Systems

GodJira runs perfectly on Raspberry Pi and other ARM-based systems!

### Quick Start for Raspberry Pi

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# 2. Clone and build
git clone https://github.com/jy05/GodJira.git
cd GodJira
docker build -t godjira-api:latest -f apps/Dockerfile ./apps
docker build -t godjira-web:latest -f web/Dockerfile ./web

# 3. Configure and start
export POSTGRES_PASSWORD="$(openssl rand -base64 32)"
export PGADMIN_PASSWORD="$(openssl rand -base64 32)"
export GRAFANA_PASSWORD="$(openssl rand -base64 32)"
docker compose -f docker-compose.dev.yml up -d
```

📖 **Complete Guide**: [Raspberry Pi Deployment Guide](./docs/RASPBERRY_PI_DEPLOYMENT.md)

Includes:
- Docker Compose setup for single Pi
- K3s (lightweight Kubernetes) deployment
- Performance optimization for ARM
- Raspberry Pi cluster configuration
- Troubleshooting for ARM systems

## Development Environment (Docker Compose)

Perfect for local development and testing.

### Quick Start

1. **Clone Repository**

```bash
git clone https://github.com/jy05/GodJira.git
cd GodJira
```

2. **Generate Secure Secrets**

```powershell
# Windows PowerShell
.\scripts\generate-secrets.ps1 -All
```

```bash
# Linux/macOS
./scripts/generate-secrets.sh  # If available, or use openssl commands
```

3. **Configure Environment**

```bash
# Copy template files
cp .env.example .env
cp apps/.env.example apps/.env
cp web/.env.example web/.env

# Edit .env files and replace ALL placeholder values
# See SECURITY_QUICK_START.md for details
```

4. **Set Required Environment Variables**

```bash
# Linux/macOS
export POSTGRES_PASSWORD="$(openssl rand -base64 32)"
export PGADMIN_PASSWORD="$(openssl rand -base64 32)"
export GRAFANA_PASSWORD="$(openssl rand -base64 32)"
```

```powershell
# Windows PowerShell
$env:POSTGRES_PASSWORD = "$(openssl rand -base64 32)"
$env:PGADMIN_PASSWORD = "$(openssl rand -base64 32)"
$env:GRAFANA_PASSWORD = "$(openssl rand -base64 32)"
```

5. **Start Services**

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Check status
docker-compose -f docker-compose.dev.yml ps
```

6. **Access Services**

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Main application UI |
| API | http://localhost:3000 | REST API |
| API Docs | http://localhost:3000/api/docs | Swagger documentation |
| Mailhog | http://localhost:8025 | Email testing |
| PgAdmin | http://localhost:5050 | Database management |
| Prometheus | http://localhost:9090 | Metrics |
| Grafana | http://localhost:3001 | Dashboards |

7. **Stop Services**

```bash
docker-compose -f docker-compose.dev.yml down

# Remove volumes (caution: deletes data)
docker-compose -f docker-compose.dev.yml down -v
```

## Production Deployment (Kubernetes + Helm)

**Recommended method** for production deployments. Helm simplifies configuration and upgrades.

### Prerequisites

1. **Kubernetes cluster** running and accessible
2. **kubectl** configured with cluster access
3. **Helm 3** installed
4. **Ingress controller** installed (nginx-ingress recommended)
5. **cert-manager** installed (for TLS certificates)

### Installation Steps

1. **Clone Repository**

```bash
git clone https://github.com/jy05/GodJira.git
cd GodJira
```

2. **Create Namespace**

```bash
kubectl create namespace godjira
```

3. **Generate and Create Secrets**

```bash
# Generate secrets (NEVER commit these!)
export JWT_SECRET="$(openssl rand -base64 64)"
export JWT_REFRESH_SECRET="$(openssl rand -base64 64)"
export ENCRYPTION_KEY="$(openssl rand -hex 32)"
export POSTGRES_PASSWORD="$(openssl rand -base64 32)"

# Create Kubernetes secrets
kubectl create secret generic api-secret \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --from-literal=JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
  --from-literal=ENCRYPTION_KEY="$ENCRYPTION_KEY" \
  --from-literal=DATABASE_URL="postgresql://godjira:$POSTGRES_PASSWORD@postgres:5432/godjira?schema=public" \
  --namespace=godjira

kubectl create secret generic postgres-secret \
  --from-literal=POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  --namespace=godjira
```

4. **Configure Values**

Create a `values.yaml` override file or use command-line flags:

```yaml
# custom-values.yaml
ingress:
  enabled: true
  hosts:
    - host: godjira.yourdomain.com
      paths:
        - path: /
          pathType: Prefix

postgresql:
  auth:
    password: ""  # Provided via secret above
  persistence:
    size: 20Gi  # Adjust based on needs

api:
  replicaCount: 3  # Scale for high availability
  resources:
    requests:
      memory: "512Mi"
      cpu: "500m"
    limits:
      memory: "2Gi"
      cpu: "2000m"

web:
  replicaCount: 2
```

5. **Install with Helm**

```bash
# Install or upgrade
helm upgrade --install godjira ./helm \
  --namespace godjira \
  --values custom-values.yaml \
  --set postgresql.auth.password="$POSTGRES_PASSWORD" \
  --wait

# Check deployment status
helm status godjira -n godjira

# List all resources
kubectl get all -n godjira
```

6. **Verify Deployment**

```bash
# Check pod status
kubectl get pods -n godjira

# View logs
kubectl logs -f deployment/api -n godjira
kubectl logs -f deployment/web -n godjira

# Check services
kubectl get svc -n godjira

# Check ingress
kubectl get ingress -n godjira
```

7. **Access Application**

```bash
# Get ingress URL
kubectl get ingress -n godjira

# Or port-forward for testing
kubectl port-forward svc/web 8080:80 -n godjira
# Access at http://localhost:8080
```

### Helm Management

```bash
# View current values
helm get values godjira -n godjira

# Upgrade deployment
helm upgrade godjira ./helm -n godjira --values custom-values.yaml

# Rollback to previous version
helm rollback godjira -n godjira

# Uninstall
helm uninstall godjira -n godjira
```

## Production Deployment (Kubernetes Manifests)

For advanced users who prefer raw Kubernetes manifests.

### Prerequisites

Same as Helm method, plus familiarity with Kubernetes YAML manifests.

### Installation Steps

1. **Clone Repository**

```bash
git clone https://github.com/jy05/GodJira.git
cd GodJira
```

2. **Create Secrets**

```bash
# Generate secure secrets
JWT_SECRET=$(openssl rand -base64 64)
JWT_REFRESH_SECRET=$(openssl rand -base64 64)
ENCRYPTION_KEY=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -base64 32)

# Create secrets
kubectl create namespace godjira

kubectl create secret generic api-secret \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --from-literal=JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
  --from-literal=ENCRYPTION_KEY="$ENCRYPTION_KEY" \
  --from-literal=DATABASE_URL="postgresql://godjira:$POSTGRES_PASSWORD@postgres:5432/godjira?schema=public" \
  --namespace=godjira

kubectl create secret generic postgres-secret \
  --from-literal=POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  --namespace=godjira
```

3. **Review and Customize Manifests**

```bash
# Edit manifests in k8s/ directory as needed
# Important files:
# - namespace.yaml
# - postgres-statefulset.yaml
# - api-deployment.yaml
# - web-deployment.yaml
# - ingress.yaml
```

4. **Deploy to Kubernetes**

```bash
# Apply all manifests
kubectl apply -f k8s/

# Or apply in specific order
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres-statefulset.yaml
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/web-deployment.yaml
kubectl apply -f k8s/web-service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/cert-manager-issuer.yaml
```

5. **Verify Deployment**

```bash
# Check all resources
kubectl get all -n godjira

# Watch pod startup
kubectl get pods -n godjira -w

# Check logs
kubectl logs -f -l app=api -n godjira
```

6. **Access Application**

```bash
# Via ingress (configure DNS to point to your cluster)
# https://godjira.yourdomain.com

# Or via port-forward for testing
kubectl port-forward svc/api 3000:3000 -n godjira
kubectl port-forward svc/web 8080:80 -n godjira
```

### Scaling

```bash
# Scale API pods
kubectl scale deployment api --replicas=5 -n godjira

# Scale web frontend
kubectl scale deployment web --replicas=3 -n godjira

# Check horizontal pod autoscaler (if configured)
kubectl get hpa -n godjira
```

## Configuration

### Environment Variables

All configuration is managed through environment variables and Kubernetes secrets.

**Critical Variables** (must be set):
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret (min 256 bits)
- `JWT_REFRESH_SECRET` - Refresh token secret (min 256 bits)
- `ENCRYPTION_KEY` - Data encryption key (32 bytes hex)
- `POSTGRES_PASSWORD` - Database password

**Optional Variables**:
- `NODE_ENV` - Environment (development/production)
- `PORT` - API port (default: 3000)
- `FRONTEND_URL` - Frontend URL for CORS
- `REDIS_HOST` - Redis host (optional caching)
- `SMTP_*` - Email configuration
- `MAX_FILE_SIZE` - Upload size limit

See [docs/env.md](./docs/env.md) for complete reference.

### Public Access with HTTPS

🌍 **Make GodJira publicly accessible with automatic HTTPS:**

⚡ **Want to deploy in 30 minutes?** → **[Quick Start Guide](./docs/QUICK_START_PUBLIC_HTTPS.md)**

**Cloudflare Tunnel** (Recommended - Free):
- ✅ Automatic HTTPS certificates
- ✅ Hides your private IP address
- ✅ No port forwarding needed
- ✅ DDoS protection included
- ✅ Works behind NAT/firewall
- ✅ Perfect for Raspberry Pi and home servers

```bash
# Quick setup
cloudflared tunnel login
cloudflared tunnel create godjira
cloudflared tunnel route dns godjira godjira.yourdomain.com
cloudflared tunnel run godjira
# Done! Access at https://godjira.yourdomain.com
```

📖 **Documentation**:
- **[Quick Start Guide](./docs/QUICK_START_PUBLIC_HTTPS.md)** - 30-minute deployment
- **[Complete Guide](./docs/PUBLIC_DEPLOYMENT_CLOUDFLARE.md)** - Detailed setup & troubleshooting

Includes:
- Step-by-step Cloudflare Tunnel setup
- Kubernetes + cert-manager integration
- Let's Encrypt certificate automation
- Security best practices
- Troubleshooting guide

### TLS/SSL Certificates

**Automatic** (recommended):
```yaml
# Uses cert-manager with Let's Encrypt
# Configured in k8s/cert-manager-issuer.yaml
# Certificates auto-renewed before expiry
```

**Manual**:
```bash
# Create TLS secret
kubectl create secret tls godjira-tls \
  --cert=path/to/cert.crt \
  --key=path/to/cert.key \
  --namespace=godjira
```

## Monitoring & Observability

### Built-in Monitoring

GodJira includes integrated monitoring:

1. **Prometheus** - Metrics collection
   - API response times
   - Database query performance
   - Memory/CPU usage
   - Custom business metrics

2. **Grafana** - Visualization
   - Pre-configured dashboards
   - Real-time metrics
   - Alerting rules

3. **Health Checks**
   - Liveness probes (pod restart if unhealthy)
   - Readiness probes (traffic routing)
   - Endpoints: `/health`, `/metrics`

### Accessing Monitoring

```bash
# Port-forward to Prometheus
kubectl port-forward svc/prometheus 9090:9090 -n godjira

# Port-forward to Grafana
kubectl port-forward svc/grafana 3000:3000 -n godjira
```

### Logs

```bash
# View API logs
kubectl logs -f deployment/api -n godjira

# View all pod logs
kubectl logs -f -l app.kubernetes.io/name=godjira -n godjira

# Stream logs from all pods
stern godjira -n godjira  # Requires stern CLI
```

## Troubleshooting

### Common Issues

**Pods not starting:**
```bash
# Check pod status
kubectl describe pod <pod-name> -n godjira

# Check events
kubectl get events -n godjira --sort-by='.lastTimestamp'

# Common causes:
# - Missing secrets (check kubectl get secrets -n godjira)
# - Insufficient resources (check node capacity)
# - Image pull errors (check image names and registry access)
```

**Database connection errors:**
```bash
# Verify PostgreSQL is running
kubectl get pods -l app=postgres -n godjira

# Check PostgreSQL logs
kubectl logs -f statefulset/postgres -n godjira

# Test connection from API pod
kubectl exec -it deployment/api -n godjira -- sh
# Inside pod: psql $DATABASE_URL
```

**Ingress not working:**
```bash
# Check ingress configuration
kubectl describe ingress -n godjira

# Verify ingress controller is running
kubectl get pods -n ingress-nginx

# Check cert-manager for TLS issues
kubectl get certificate -n godjira
kubectl describe certificate godjira-tls -n godjira
```

### Debug Mode

```bash
# Enable debug logging
kubectl set env deployment/api LOG_LEVEL=debug -n godjira

# Exec into pod
kubectl exec -it deployment/api -n godjira -- sh

# Check environment variables
kubectl exec deployment/api -n godjira -- env | grep -E 'DATABASE|JWT|NODE_ENV'
```

### Resource Usage

```bash
# Check resource usage
kubectl top pods -n godjira
kubectl top nodes

# Check resource requests/limits
kubectl describe deployment api -n godjira | grep -A 5 "Limits:\|Requests:"
```

## Architecture Diagrams

```
┌─────────────────────────────────────────────────────────────┐
│                         Kubernetes Cluster                   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Ingress (nginx)                                       │ │
│  │  - TLS Termination                                     │ │
│  │  - Load Balancing                                      │ │
│  └──────┬─────────────────────────────────────────────────┘ │
│         │                                                    │
│  ┌──────▼──────────┐         ┌──────────────────┐          │
│  │  Web Frontend   │         │   API Backend    │          │
│  │  (React+Nginx)  │◄────────│   (NestJS)       │          │
│  │  Deployment     │         │   Deployment     │          │
│  │  Replicas: 2-5  │         │   Replicas: 3-10 │          │
│  └─────────────────┘         └────────┬─────────┘          │
│                                       │                     │
│                              ┌────────▼──────────┐          │
│                              │   PostgreSQL      │          │
│                              │   StatefulSet     │          │
│                              │   PVC: 10-100Gi   │          │
│                              └───────────────────┘          │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Monitoring Stack                                       │ │
│  │  - Prometheus (metrics)                                 │ │
│  │  - Grafana (visualization)                              │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Production Checklist

Before deploying to production:

- [ ] Read [SECURITY.md](./SECURITY.md) completely
- [ ] Generate unique secrets for production environment
- [ ] Configure external secret management (Vault, AWS Secrets Manager)
- [ ] **Set up public HTTPS access** - See [PUBLIC_DEPLOYMENT_CLOUDFLARE.md](./docs/PUBLIC_DEPLOYMENT_CLOUDFLARE.md)
- [ ] Configure domain name and DNS
- [ ] Enable Cloudflare DDoS protection and WAF
- [ ] Set resource limits and requests appropriately
- [ ] Enable horizontal pod autoscaling
- [ ] Configure persistent volume backup strategy
- [ ] Set up monitoring and alerting
- [ ] Test database backup and restore procedures
- [ ] Configure log aggregation (ELK, Loki, etc.)
- [ ] Review and adjust rate limiting settings
- [ ] Enable network policies for pod-to-pod communication
- [ ] Set up CI/CD pipeline for automated deployments
- [ ] Perform load testing
- [ ] Document disaster recovery procedures

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

See [LICENSE](./LICENSE) for details.

## Support

- 📖 **Documentation**: [docs/](./docs/)
- 🥧 **Raspberry Pi Guide**: [RASPBERRY_PI_DEPLOYMENT.md](./docs/RASPBERRY_PI_DEPLOYMENT.md)
- 🌍 **Public HTTPS Deployment**: [PUBLIC_DEPLOYMENT_CLOUDFLARE.md](./docs/PUBLIC_DEPLOYMENT_CLOUDFLARE.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/jy05/GodJira/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/jy05/GodJira/discussions)
- 🔒 **Security**: [SECURITY.md](./SECURITY.md)

---

**Last Updated**: November 27, 2025  
**Version**: 2.0.0  
**Status**: Production Ready ✅
