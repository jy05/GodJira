# GodJira Kubernetes Deployment Guide

This document provides instructions for deploying GodJira to Kubernetes with Helm, Prometheus monitoring, and k9s management.

## Prerequisites

1. **Kubernetes Cluster**: Docker Desktop with Kubernetes enabled, Minikube, or production cluster
2. **kubectl**: Kubernetes command-line tool
3. **Helm 3+**: Package manager for Kubernetes
4. **k9s**: Terminal-based UI for Kubernetes clusters
5. **Docker**: For building container images

### Install Required Tools

```powershell
# Install Helm (Windows with Chocolatey)
choco install kubernetes-helm

# Install k9s
choco install k9s

# Or download binaries directly:
# Helm: https://helm.sh/docs/intro/install/
# k9s: https://k9scli.io/topics/install/
```

## Step 1: Build Docker Image

```powershell
# Build multi-architecture image (supports ARM64 Raspberry Pi + AMD64)
cd apps/api
docker build -t godjira/api:latest -f Dockerfile .

# For multi-platform build with BuildKit:
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 -t godjira/api:latest --push .
```

## Step 2: Install Prerequisites in Cluster

### Install Nginx Ingress Controller

```powershell
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install nginx-ingress ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace
```

### Install cert-manager (SSL Certificates)

```powershell
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

### Install Prometheus Operator (Monitoring)

```powershell
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace
```

## Step 3: Deploy GodJira with Helm

### Option A: Direct Kubernetes Manifests

```powershell
# Deploy all resources
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres-statefulset.yaml
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/cert-manager-issuer.yaml
kubectl apply -f k8s/prometheus-servicemonitor.yaml

# Check deployment status
kubectl get pods -n godjira
kubectl get svc -n godjira
```

### Option B: Helm Chart (Recommended)

```powershell
# Install with default values
helm install godjira ./helm/godjira --namespace godjira --create-namespace

# Or customize values
helm install godjira ./helm/godjira --namespace godjira --create-namespace \
  --set global.domain=your-domain.com \
  --set api.replicaCount=3 \
  --set postgresql.auth.password=secure-password \
  --set api.secrets.jwtSecret=$(openssl rand -base64 32) \
  --set api.secrets.jwtRefreshSecret=$(openssl rand -base64 32)

# Upgrade deployment
helm upgrade godjira ./helm/godjira --namespace godjira

# Uninstall
helm uninstall godjira --namespace godjira
```

## Step 4: Database Migration

```powershell
# Port-forward to PostgreSQL
kubectl port-forward -n godjira svc/postgres 5432:5432

# Run migrations (in another terminal)
cd apps/api
pnpm prisma migrate deploy
pnpm prisma generate
```

## Step 5: Access Application

### Local Development (Port Forward)

```powershell
# API backend
kubectl port-forward -n godjira svc/api 3000:3000

# Access Swagger docs: http://localhost:3000/api/docs
```

### Production (with Ingress)

Update DNS records to point to your cluster's ingress IP:
- `api.godjira.example.com` → API backend
- `godjira.example.com` → Frontend (when added)

```powershell
# Get ingress IP
kubectl get ingress -n godjira
```

## Step 6: Monitor with k9s

```powershell
# Launch k9s
k9s

# Common k9s commands:
# :pods        - View pods
# :services    - View services
# :deployments - View deployments
# :logs        - View logs
# :describe    - Describe resource
# Ctrl+A       - Show all namespaces
# /godjira     - Filter by godjira namespace
```

### k9s Navigation

- `:pods` → Select pod → Press `l` for logs
- `:pods` → Select pod → Press `d` to describe
- `:pods` → Select pod → Press `s` for shell access
- Press `?` for help menu

## Step 7: Access Prometheus & Grafana

### Prometheus (Metrics)

```powershell
# Port-forward to Prometheus
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090

# Access UI: http://localhost:9090
```

### Grafana (Dashboards)

```powershell
# Port-forward to Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3001:80

# Access UI: http://localhost:3001
# Default credentials: admin / prom-operator
```

## Step 8: Verify Monitoring

1. **Check ServiceMonitor**:
   ```powershell
   kubectl get servicemonitor -n godjira
   ```

2. **Verify Prometheus Target**:
   - Open Prometheus UI: http://localhost:9090
   - Navigate to Status → Targets
   - Find `godjira-api` target (should show "UP")

3. **Query Metrics**:
   ```promql
   # Total HTTP requests
   http_requests_total

   # Request duration
   http_request_duration_seconds_bucket
   ```

## Cloudflare Tunnel Setup (Optional)

For zero-trust access without public IP:

```powershell
# Install cloudflared in cluster
helm repo add cloudflare https://cloudflare.github.io/helm-charts
helm install cloudflared cloudflare/cloudflare-tunnel \
  --namespace godjira \
  --set tunnel.token=YOUR_TUNNEL_TOKEN

# Create tunnel at: https://dash.cloudflare.com → Zero Trust → Access → Tunnels
```

## Troubleshooting

### Pods not starting

```powershell
k9s
:pods
# Select pod → Press 'd' to describe
# Select pod → Press 'l' for logs
```

### Database connection issues

```powershell
# Check PostgreSQL pod logs
kubectl logs -n godjira postgres-0

# Test connection from API pod
kubectl exec -n godjira -it deployment/api -- sh
# Inside pod:
apk add postgresql-client
psql postgresql://godjira:godjira123@postgres:5432/godjira
```

### SSL certificate issues

```powershell
# Check cert-manager
kubectl get certificate -n godjira
kubectl describe certificate godjira-tls-cert -n godjira

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager
```

## Scaling

```powershell
# Scale API replicas
kubectl scale deployment api --replicas=5 -n godjira

# Or with Helm
helm upgrade godjira ./helm/godjira --set api.replicaCount=5 -n godjira

# Enable autoscaling
helm upgrade godjira ./helm/godjira --set autoscaling.enabled=true -n godjira
```

## Backup & Restore

```powershell
# Backup PostgreSQL
kubectl exec -n godjira postgres-0 -- pg_dump -U godjira godjira > backup.sql

# Restore
kubectl exec -i -n godjira postgres-0 -- psql -U godjira godjira < backup.sql
```

## Clean Up

```powershell
# Delete GodJira deployment
helm uninstall godjira -n godjira
kubectl delete namespace godjira

# Delete monitoring stack
helm uninstall prometheus -n monitoring
kubectl delete namespace monitoring

# Delete ingress controller
helm uninstall nginx-ingress -n ingress-nginx
kubectl delete namespace ingress-nginx
```
