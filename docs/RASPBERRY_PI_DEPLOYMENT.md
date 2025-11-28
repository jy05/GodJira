# GodJira on Raspberry Pi - ARM64 Deployment Guide

## Overview

GodJira is **fully containerized** and can run on Raspberry Pi (ARM64 architecture) or any Linux system. All dependencies are packaged in containers - no external installations required beyond Docker/Kubernetes.

## System Requirements

### Minimum Requirements (Single Node)
- **Hardware**: Raspberry Pi 4 (4GB RAM minimum, 8GB recommended)
- **OS**: Raspberry Pi OS 64-bit (Debian-based) or Ubuntu Server 64-bit
- **Storage**: 32GB microSD card minimum (SSD highly recommended for database performance)
- **Network**: Stable internet connection for initial setup

### Recommended for Production
- **Hardware**: Raspberry Pi 4/5 with 8GB RAM or cluster of multiple Pi units
- **Storage**: External SSD via USB 3.0 (much better performance than microSD)
- **Cooling**: Active cooling (fan or heatsink) for sustained workloads

## Architecture Support

✅ **ARM64/aarch64** - Raspberry Pi 3B+, 4, 5, and compatible SBCs
✅ **AMD64/x86_64** - Standard desktop/server systems
✅ **Multi-arch images** - Docker will automatically pull the correct architecture

All official Docker images used in GodJira support ARM64:
- ✅ `postgres:15-alpine` (ARM64 native)
- ✅ `redis:7-alpine` (ARM64 native)
- ✅ `prom/prometheus:latest` (multi-arch)
- ✅ `grafana/grafana:latest` (multi-arch)
- ✅ `dpage/pgadmin4:latest` (multi-arch)
- ✅ Node.js 20 base images (multi-arch)

## Installation Methods

Choose based on your setup:
1. **Docker Compose** (easiest, good for single Pi)
2. **K3s (Lightweight Kubernetes)** (recommended for production)
3. **MicroK8s** (alternative Kubernetes)

---

## Method 1: Docker Compose (Easiest)

Perfect for a single Raspberry Pi running the full stack.

### Step 1: Prepare Raspberry Pi

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y git curl
```

### Step 2: Install Docker

```bash
# Install Docker (official script works on Raspberry Pi)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Enable Docker to start on boot
sudo systemctl enable docker

# Logout and login again for group changes to take effect
# Or run: newgrp docker

# Verify installation
docker --version
docker compose version
```

### Step 3: Clone GodJira

```bash
# Clone repository
git clone https://github.com/jy05/GodJira.git
cd GodJira
```

### Step 4: Configure Environment

```bash
# Generate secure secrets
# If PowerShell script doesn't work, use openssl directly:
export POSTGRES_PASSWORD="$(openssl rand -base64 32)"
export PGADMIN_PASSWORD="$(openssl rand -base64 32)"
export GRAFANA_PASSWORD="$(openssl rand -base64 32)"

# Create .env files
cp .env.example .env
cp apps/.env.example apps/.env

# Generate JWT secrets
JWT_SECRET=$(openssl rand -base64 64)
JWT_REFRESH_SECRET=$(openssl rand -base64 64)
ENCRYPTION_KEY=$(openssl rand -hex 32)

# Update apps/.env file
sed -i "s|GENERATE_SECURE_SECRET_DO_NOT_USE_THIS_EXAMPLE|$JWT_SECRET|" apps/.env
sed -i "s|GENERATE_DIFFERENT_SECRET_DO_NOT_USE_THIS_EXAMPLE|$JWT_REFRESH_SECRET|" apps/.env
sed -i "s|GENERATE_WITH_OPENSSL_RAND_HEX_32_DO_NOT_USE_EXAMPLE|$ENCRYPTION_KEY|" apps/.env
sed -i "s|CHANGE_THIS_PASSWORD|$POSTGRES_PASSWORD|g" apps/.env

# Or edit manually
nano apps/.env
```

### Step 5: Build Images for ARM64

GodJira's custom images (API and Web) need to be built for ARM64:

```bash
# Build API backend for ARM64
cd apps
docker build -t godjira-api:latest -f Dockerfile .
cd ..

# Build Web frontend for ARM64
cd web
docker build -t godjira-web:latest -f Dockerfile .
cd ..
```

**Note**: Building on Raspberry Pi will take 15-30 minutes. Be patient!

### Step 6: Start Services

```bash
# Start development environment
docker compose -f docker-compose.dev.yml up -d

# Or for production
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.dev.yml ps

# View logs
docker compose -f docker-compose.dev.yml logs -f
```

### Step 7: Access Services

Find your Raspberry Pi's IP address:
```bash
hostname -I
```

Access GodJira:
- **Frontend**: http://[PI_IP]:5173 (dev) or http://[PI_IP]:8080 (prod)
- **API**: http://[PI_IP]:3000
- **API Docs**: http://[PI_IP]:3000/api/docs
- **Grafana**: http://[PI_IP]:3001

### Performance Optimization for Pi

```yaml
# Edit docker-compose.dev.yml to reduce resource usage
version: '3.8'
services:
  api-dev:
    deploy:
      resources:
        limits:
          cpus: '2.0'      # Limit to 2 cores
          memory: 1G       # Limit to 1GB RAM
        reservations:
          memory: 512M
  
  postgres-dev:
    command: postgres -c max_connections=50 -c shared_buffers=256MB
    deploy:
      resources:
        limits:
          memory: 512M
```

---

## Method 2: K3s (Lightweight Kubernetes) - Recommended

K3s is a lightweight Kubernetes designed for ARM/IoT devices. Perfect for Raspberry Pi!

### Step 1: Install K3s

```bash
# Install K3s (single node)
curl -sfL https://get.k3s.io | sh -

# Wait for K3s to be ready
sudo k3s kubectl get node

# Set up kubectl access
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $USER:$USER ~/.kube/config
export KUBECONFIG=~/.kube/config

# Verify
kubectl get nodes
```

### Step 2: Install Helm

```bash
# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify
helm version
```

### Step 3: Clone and Prepare GodJira

```bash
git clone https://github.com/jy05/GodJira.git
cd GodJira
```

### Step 4: Build Container Images

```bash
# Build and load images into K3s
# Build API
cd apps
sudo k3s ctr images import <(docker build -q -t godjira-api:latest -f Dockerfile . && docker save godjira-api:latest)
# Or simpler:
docker build -t godjira-api:latest -f Dockerfile .
sudo k3s ctr images import <(docker save godjira-api:latest)
cd ..

# Build Web
cd web
docker build -t godjira-web:latest -f Dockerfile .
sudo k3s ctr images import <(docker save godjira-web:latest)
cd ..
```

### Step 5: Create Secrets

```bash
# Generate secrets
export JWT_SECRET="$(openssl rand -base64 64)"
export JWT_REFRESH_SECRET="$(openssl rand -base64 64)"
export ENCRYPTION_KEY="$(openssl rand -hex 32)"
export POSTGRES_PASSWORD="$(openssl rand -base64 32)"

# Create namespace
kubectl create namespace godjira

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

### Step 6: Deploy with Helm

```bash
# Create custom values for Raspberry Pi
cat > pi-values.yaml <<EOF
# Raspberry Pi optimized values
api:
  replicaCount: 1
  image:
    repository: godjira-api
    tag: latest
    pullPolicy: Never  # Use local image
  resources:
    requests:
      memory: "256Mi"
      cpu: "250m"
    limits:
      memory: "512Mi"
      cpu: "1000m"

web:
  replicaCount: 1
  image:
    repository: godjira-web
    tag: latest
    pullPolicy: Never  # Use local image
  resources:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "256Mi"
      cpu: "500m"

postgresql:
  auth:
    password: ""  # From secret
  persistence:
    size: 5Gi  # Adjust based on your storage
  resources:
    requests:
      memory: "256Mi"
      cpu: "250m"
    limits:
      memory: "512Mi"
      cpu: "500m"

ingress:
  enabled: false  # Use NodePort instead for local access
EOF

# Deploy with Helm
helm install godjira ./helm \
  --namespace godjira \
  --values pi-values.yaml \
  --set postgresql.auth.password="$POSTGRES_PASSWORD"

# Watch deployment
kubectl get pods -n godjira -w
```

### Step 7: Access Services

```bash
# Get NodePort
kubectl get svc -n godjira

# Access via NodePort
# Frontend: http://[PI_IP]:[WEB_NODEPORT]
# API: http://[PI_IP]:[API_NODEPORT]

# Or use port-forward
kubectl port-forward svc/web 8080:80 -n godjira --address 0.0.0.0
kubectl port-forward svc/api 3000:3000 -n godjira --address 0.0.0.0
```

---

## Method 3: MicroK8s (Alternative)

```bash
# Install MicroK8s
sudo snap install microk8s --classic

# Add user to group
sudo usermod -a -G microk8s $USER
sudo chown -f -R $USER ~/.kube
newgrp microk8s

# Enable required addons
microk8s enable dns storage helm3

# Set up kubectl alias
alias kubectl='microk8s kubectl'

# Follow similar steps as K3s method above
```

---

## Raspberry Pi Cluster (Advanced)

For high availability, set up multiple Raspberry Pis:

### Hardware Setup
- 3+ Raspberry Pi 4/5 units (8GB recommended)
- Network switch
- Power supply (PoE switch recommended)
- USB SSDs for each Pi

### K3s Cluster Installation

**Master Node (first Pi):**
```bash
# Install K3s server
curl -sfL https://get.k3s.io | sh -s - server --cluster-init

# Get token for worker nodes
sudo cat /var/lib/rancher/k3s/server/node-token
```

**Worker Nodes (other Pis):**
```bash
# Replace MASTER_IP and TOKEN
curl -sfL https://get.k3s.io | K3S_URL=https://MASTER_IP:6443 \
  K3S_TOKEN=TOKEN sh -

# Verify cluster
kubectl get nodes
```

**Deploy GodJira:**
```bash
# On master node, follow K3s deployment steps above
# Scale replicas across nodes:
kubectl scale deployment api --replicas=3 -n godjira
kubectl scale deployment web --replicas=2 -n godjira
```

---

## Performance Tips for Raspberry Pi

### 1. Use External SSD
```bash
# Boot from USB SSD (much faster than microSD)
# Instructions: https://www.raspberrypi.com/documentation/computers/raspberry-pi.html
```

### 2. Optimize PostgreSQL
```bash
# Edit PostgreSQL config for ARM
kubectl edit configmap postgres-config -n godjira

# Add:
shared_buffers = 256MB
effective_cache_size = 1GB
max_connections = 50
work_mem = 4MB
```

### 3. Enable Swap (if needed)
```bash
sudo dphys-swapfile swapoff
sudo sed -i 's/CONF_SWAPSIZE=100/CONF_SWAPSIZE=2048/' /etc/dphys-swapfile
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

### 4. Limit Container Resources
All containers should have memory/CPU limits set (see values files above).

### 5. Disable Unnecessary Services
```bash
# If using K3s, disable monitoring if low on RAM
kubectl scale deployment metrics-server --replicas=0 -n kube-system
```

---

## Monitoring on Raspberry Pi

```bash
# Check resource usage
kubectl top nodes
kubectl top pods -n godjira

# View metrics
kubectl port-forward svc/grafana 3000:3000 -n godjira --address 0.0.0.0
# Access: http://[PI_IP]:3000
```

---

## Troubleshooting

### Issue: Images won't pull
**Solution**: Build locally for ARM64 as shown above.

### Issue: Out of memory
**Solution**: 
```bash
# Reduce replica counts
kubectl scale deployment api --replicas=1 -n godjira

# Add swap space
sudo dphys-swapfile swapoff
sudo sed -i 's/CONF_SWAPSIZE=.*/CONF_SWAPSIZE=4096/' /etc/dphys-swapfile
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

### Issue: Slow performance
**Solution**:
- Use external SSD instead of microSD
- Reduce resource limits in deployment
- Disable Grafana/Prometheus if not needed
- Use Redis for caching

### Issue: Database corruption
**Solution**:
```bash
# Always shut down properly
docker compose -f docker-compose.dev.yml down
# Or for K8s
kubectl delete namespace godjira --grace-period=30
```

---

## Remote Access

### Option 1: Tailscale (Recommended)
```bash
# Install Tailscale on Pi
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# Access from anywhere via Tailscale IP
```

### Option 2: Port Forwarding
Configure your router to forward ports:
- 80/443 → Pi:8080 (for web access)
- 3000 → Pi:3000 (for API)

### Option 3: Cloudflare Tunnel
```bash
# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64
sudo mv cloudflared-linux-arm64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared

# Set up tunnel (follow Cloudflare docs)
cloudflared tunnel create godjira
```

---

## System Portability

### ✅ Yes, GodJira is Fully Portable!

GodJira can run on **ANY** system with Docker/Kubernetes:

| Platform | Architecture | Status |
|----------|-------------|--------|
| Raspberry Pi 4/5 | ARM64 | ✅ Tested |
| Linux (x86_64) | AMD64 | ✅ Production Ready |
| Windows | AMD64 | ✅ Docker Desktop |
| macOS (Intel) | AMD64 | ✅ Docker Desktop |
| macOS (M1/M2/M3) | ARM64 | ✅ Native Support |
| AWS/Azure/GCP | AMD64 | ✅ Cloud Ready |
| Orange Pi / Rock Pi | ARM64 | ✅ Compatible |

**All you need:**
1. Docker (for single-node)
2. Kubernetes (for production)
3. Git (to clone repo)

**NO external dependencies** - everything runs in containers!

---

## Quick Start Summary

**Fastest way to run on Raspberry Pi:**

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# 2. Clone repo
git clone https://github.com/jy05/GodJira.git
cd GodJira

# 3. Generate secrets
export POSTGRES_PASSWORD="$(openssl rand -base64 32)"
export PGADMIN_PASSWORD="$(openssl rand -base64 32)"
export GRAFANA_PASSWORD="$(openssl rand -base64 32)"

# 4. Build images (this takes 15-30 minutes on Pi)
docker build -t godjira-api:latest -f apps/Dockerfile ./apps
docker build -t godjira-web:latest -f web/Dockerfile ./web

# 5. Configure environment
cp .env.example .env
cp apps/.env.example apps/.env
# Edit apps/.env with generated secrets

# 6. Start!
docker compose -f docker-compose.dev.yml up -d

# 7. Access
# Frontend: http://[PI_IP]:5173
# API Docs: http://[PI_IP]:3000/api/docs
```

---

**Need Help?** See [Troubleshooting](#troubleshooting) or open an issue on GitHub.

**Last Updated**: November 27, 2025
