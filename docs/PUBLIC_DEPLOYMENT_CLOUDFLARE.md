# GodJira Public Deployment with HTTPS

## Overview

This comprehensive guide shows you how to make GodJira publicly accessible with automatic HTTPS. It includes both a **Quick Start** (30 minutes) and detailed deployment options.

**What you'll achieve:**

- GodJira running on your server (Raspberry Pi, Linux, Windows, macOS)
- Accessible at `https://godjira.yourdomain.com`
- Automatic HTTPS certificate (free)
- Your private IP stays hidden
- DDoS protection included
- No port forwarding needed

---

## Table of Contents

1. [Quick Start (30 Minutes)](#quick-start-30-minutes)
2. [Deployment Methods Comparison](#deployment-methods-comparison)
3. [Method 1: Cloudflare Tunnel (Detailed)](#method-1-cloudflare-tunnel-detailed)
4. [Method 2: Kubernetes with cert-manager](#method-2-cloudflare-with-kubernetes-ingress)
5. [Method 3: Tailscale Private Access](#method-3-tailscale-private-access)
6. [Security Best Practices](#security-best-practices)
7. [Troubleshooting](#troubleshooting)
8. [Quick Reference](#quick-reference)

---

# Quick Start (30 Minutes)

**Fastest way to deploy GodJira with public HTTPS access.**

## Prerequisites Checklist

- [ ] Server with Docker installed (can be Raspberry Pi)
- [ ] Domain name (buy one for ~$10/year)
- [ ] Cloudflare account (free)
- [ ] 30 minutes of time

---

## Step-by-Step (Copy & Paste)

### Step 1: Setup Domain (5 minutes)

1. Buy domain at Namecheap, Cloudflare, Google Domains, etc.
2. Sign up at cloudflare.com (free plan)
3. Add your domain to Cloudflare
4. Update nameservers at your registrar to Cloudflare's
5. Wait 10-30 minutes for activation

### Step 2: Install GodJira (10 minutes)

```bash
# Clone repository
git clone https://github.com/jy05/GodJira.git
cd GodJira

# Generate secrets
export POSTGRES_PASSWORD="$(openssl rand -base64 32)"
export PGADMIN_PASSWORD="$(openssl rand -base64 32)"
export GRAFANA_PASSWORD="$(openssl rand -base64 32)"

# Configure environment
cp apps/.env.example apps/.env
# Edit apps/.env:
# - Replace JWT_SECRET with: $(openssl rand -base64 64)
# - Replace JWT_REFRESH_SECRET with: $(openssl rand -base64 64)
# - Replace ENCRYPTION_KEY with: $(openssl rand -hex 32)
# - Replace POSTGRES_PASSWORD with your generated password

# Start GodJira
docker compose -f docker-compose.dev.yml up -d

# Verify it's running
curl http://localhost:5173
```

### Step 3: Install Cloudflare Tunnel (5 minutes)

```bash
# For Linux/Raspberry Pi (AMD64)
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# For Raspberry Pi (ARM64)
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64
sudo mv cloudflared-linux-arm64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared

# For macOS
brew install cloudflared

# For Windows (PowerShell as Admin)
# Download from: https://github.com/cloudflare/cloudflared/releases/latest
# Move to: C:\Program Files\cloudflared\

# Verify
cloudflared --version
```

### Step 4: Configure Tunnel (5 minutes)

```bash
# Login to Cloudflare (opens browser)
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create godjira
# Save the Tunnel ID shown!

# Create config file
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

Paste this (replace YOUR_TUNNEL_ID and yourdomain.com):

```yaml
tunnel: godjira
credentials-file: /home/YOUR_USERNAME/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: godjira.yourdomain.com
    service: http://localhost:5173
  - hostname: api.godjira.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

```bash
# Create DNS records
cloudflared tunnel route dns godjira godjira.yourdomain.com
cloudflared tunnel route dns godjira api.godjira.yourdomain.com
```

### Step 5: Update GodJira Config (2 minutes)

```bash
# Edit apps/.env
nano apps/.env

# Update these lines:
FRONTEND_URL=https://godjira.yourdomain.com
ALLOWED_ORIGINS=https://godjira.yourdomain.com,https://api.godjira.yourdomain.com

# Edit web/.env (if exists)
nano web/.env

# Update:
VITE_API_BASE_URL=https://api.godjira.yourdomain.com
VITE_WS_URL=wss://api.godjira.yourdomain.com

# Restart containers
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d
```

### Step 6: Start Tunnel (2 minutes)

```bash
# Run tunnel (test first)
cloudflared tunnel run godjira

# Leave this running and test in browser:
# https://godjira.yourdomain.com
# HTTPS works automatically!

# If it works, install as service:
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

### Step 7: Configure Cloudflare Security (3 minutes)

1. Go to Cloudflare Dashboard → Your Domain
2. **SSL/TLS** → Set to **Full**
3. **Security** → Enable **WAF** (Web Application Firewall)
4. **Speed** → Enable **Auto Minify**
5. Done!

---

## Quick Start Verification

```bash
# Test HTTPS
curl -I https://godjira.yourdomain.com
# Should return: HTTP/2 200, server: cloudflare

# Test API
curl https://api.godjira.yourdomain.com/health

# Test in browser
# Visit: https://godjira.yourdomain.com
# Should load with HTTPS lock icon!
```

---

## What Just Happened?

```
Internet Users
      ↓
Cloudflare (HTTPS, DDoS protection)
      ↓
Cloudflare Tunnel (encrypted)
      ↓
Your Server (private IP)
      ↓
GodJira (localhost)
```

1. **GodJira** runs on your local server (localhost:5173, localhost:3000)
2. **Cloudflare Tunnel** creates encrypted connection to Cloudflare
3. **Cloudflare** provides:
   - Free HTTPS certificate (automatic)
   - DDoS protection
   - CDN (faster loading globally)
   - Hides your IP address
4. **Users** access via `https://godjira.yourdomain.com`
5. **Your IP** stays completely hidden

---

## Cost Breakdown

| Item | Cost |
|------|------|
| Domain name | $10-15/year |
| Cloudflare account | Free |
| Cloudflare Tunnel | Free |
| HTTPS certificate | Free (automatic) |
| DDoS protection | Free |
| CDN | Free |
| **Total** | **~$1/month** |

---

# Deployment Methods Comparison

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **Cloudflare Tunnel** | Free, hides IP, auto HTTPS, no ports | Requires domain | Most users |
| **Cloudflare + Ingress** | Native K8s, cert-manager | Exposes IP, needs LoadBalancer | Production K8s |
| **Tailscale** | Private, easy | Not public internet | Private access |

---

# Method 1: Cloudflare Tunnel (Detailed)

# Method 1: Cloudflare Tunnel (Detailed)

This section provides detailed configuration options and advanced setups for Cloudflare Tunnel.

## Architecture

**Cloudflare Tunnel creates a secure connection from your server to Cloudflare's network:**

```
Internet Users
      ↓
Cloudflare Network (HTTPS)
      ↓
Cloudflare Tunnel (encrypted)
      ↓
Your Server (private network)
      ↓
GodJira (localhost)
```

**Your IP stays hidden!** All traffic goes through Cloudflare's network.

---

## Detailed Configuration Guide

### Advanced Tunnel Configuration

### Advanced Tunnel Configuration

**Configuration file options for different deployment scenarios:**

#### For Docker Compose Deployment:

```yaml
# ~/.cloudflared/config.yml
tunnel: godjira  # Your tunnel name
credentials-file: /home/YOUR_USERNAME/.cloudflared/TUNNEL_ID.json  # Update with your tunnel ID

ingress:
  # Main web application
  - hostname: godjira.yourdomain.com
    service: http://localhost:5173  # Dev frontend
    # OR for production:
    # service: http://localhost:8080

  # API endpoint (optional - separate subdomain)
  - hostname: api.godjira.yourdomain.com
    service: http://localhost:3000

  # API Documentation
  - hostname: docs.godjira.yourdomain.com
    service: http://localhost:3000
    path: /api/docs/*

  # Grafana monitoring (optional)
  - hostname: metrics.godjira.yourdomain.com
    service: http://localhost:3001

  # Catch-all rule (required - must be last)
  - service: http_status:404
```

#### For Kubernetes Deployment:

```yaml
# ~/.cloudflared/config.yml
tunnel: godjira
credentials-file: /home/YOUR_USERNAME/.cloudflared/TUNNEL_ID.json

ingress:
  # Main web application
  - hostname: godjira.yourdomain.com
    service: http://web.godjira.svc.cluster.local:80
    originRequest:
      noTLSVerify: true

  # API endpoint
  - hostname: api.godjira.yourdomain.com
    service: http://api.godjira.svc.cluster.local:3000
    originRequest:
      noTLSVerify: true

  # Catch-all
  - service: http_status:404
```

**Important**: Replace:
- `YOUR_USERNAME` with your actual username
- `TUNNEL_ID` with your actual tunnel ID
- `yourdomain.com` with your actual domain
- Port numbers if you changed them

### Production Deployment Options

#### Option 1: Linux Systemd Service

```bash
# Install as a service
sudo cloudflared service install

# Edit service to use your config
sudo nano /etc/systemd/system/cloudflared.service

# Add these lines in [Service] section:
# ExecStart=/usr/local/bin/cloudflared tunnel --config /home/YOUR_USERNAME/.cloudflared/config.yml run godjira

# Reload and start
sudo systemctl daemon-reload
sudo systemctl enable cloudflared
sudo systemctl start cloudflared

# Check status
sudo systemctl status cloudflared

# View logs
sudo journalctl -u cloudflared -f
```

#### Option 2: Windows Task Scheduler

```powershell
# Create a scheduled task
$action = New-ScheduledTaskAction -Execute "C:\Program Files\cloudflared\cloudflared.exe" -Argument "tunnel --config C:\Users\YOUR_USERNAME\.cloudflared\config.yml run godjira"
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName "CloudflaredTunnel" -Action $action -Trigger $trigger -Principal $principal

# Start the task
Start-ScheduledTask -TaskName "CloudflaredTunnel"
```

#### Option 3: Docker Container

```yaml
# Add to docker-compose.dev.yml or docker-compose.prod.yml
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared
    restart: unless-stopped
    command: tunnel --config /etc/cloudflared/config.yml run godjira
    volumes:
      - ~/.cloudflared:/etc/cloudflared
    network_mode: host  # Required to access localhost services
    depends_on:
      - web
      - api-dev
```

Then run:
```bash
docker compose -f docker-compose.dev.yml up -d cloudflared
```

### Cloudflare Dashboard Configuration

#### SSL/TLS Settings

1. Go to Cloudflare Dashboard → Your Domain
2. **SSL/TLS** → Set to **Full** or **Full (strict)**
3. **Security** → **WAF** → Enable
4. **Security** → **DDoS Protection** → Enable (automatic)
5. **Speed** → **Optimization** → Enable Auto Minify (HTML, CSS, JS)

#### Optional Firewall Rules

```bash
# Block specific countries (if needed)
# Dashboard → Security → WAF → Firewall rules

# Rate limiting
# Dashboard → Security → WAF → Rate limiting rules
# Example: Limit login attempts to 5 per minute
```

#### Enable Zero Trust (Recommended)

```bash
# Protect admin areas with Cloudflare Access
# Dashboard → Zero Trust → Access → Applications

# Create application:
# - Name: GodJira Admin
# - Subdomain: godjira
# - Path: /admin/*
# - Policy: Email with your domain
```

### Step 9: Update GodJira Configuration

Update your `.env` files to use your public domain:

```bash
# apps/.env
FRONTEND_URL=https://godjira.yourdomain.com
ALLOWED_ORIGINS=https://godjira.yourdomain.com,https://api.godjira.yourdomain.com

# web/.env
VITE_API_BASE_URL=https://api.godjira.yourdomain.com
VITE_WS_URL=wss://api.godjira.yourdomain.com
```

Restart your containers:
```bash
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d
```

### Step 10: Test Your Deployment

```bash
# Test HTTPS (should work automatically)
curl -I https://godjira.yourdomain.com

# Should see:
# HTTP/2 200
# server: cloudflare
# cf-ray: ...

# Test API
curl https://api.godjira.yourdomain.com/health

# Test WebSocket (in browser console)
# const ws = new WebSocket('wss://api.godjira.yourdomain.com');
```

---

## Method 2: Cloudflare with Kubernetes Ingress

For Kubernetes clusters with a public IP/LoadBalancer.

### Prerequisites

1. Kubernetes cluster with external IP
2. Domain on Cloudflare
3. cert-manager installed

### Step 1: Install cert-manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Verify installation
kubectl get pods -n cert-manager
```

### Step 2: Get Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use **Edit zone DNS** template
4. Select your domain
5. Copy the token

### Step 3: Create Cloudflare Secret

```bash
# Create secret with your Cloudflare API token
kubectl create secret generic cloudflare-api-token \
  --from-literal=api-token=YOUR_CLOUDFLARE_API_TOKEN \
  --namespace=godjira
```

### Step 4: Create ClusterIssuer

```bash
# Create cluster-issuer.yaml
cat > cluster-issuer.yaml <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod-cloudflare
spec:
  acme:
    email: your-email@example.com  # Change this
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - dns01:
        cloudflare:
          email: your-cloudflare-email@example.com  # Change this
          apiTokenSecretRef:
            name: cloudflare-api-token
            key: api-token
EOF

kubectl apply -f cluster-issuer.yaml
```

### Step 5: Update Ingress

```bash
# Edit k8s/ingress.yaml or helm values
cat > godjira-ingress.yaml <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: godjira-ingress
  namespace: godjira
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod-cloudflare"
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    # Cloudflare proxy settings
    nginx.ingress.kubernetes.io/configuration-snippet: |
      proxy_set_header X-Real-IP \$http_cf_connecting_ip;
      proxy_set_header X-Forwarded-For \$http_cf_connecting_ip;
spec:
  tls:
  - hosts:
    - godjira.yourdomain.com
    - api.godjira.yourdomain.com
    secretName: godjira-tls
  rules:
  - host: godjira.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80
  - host: api.godjira.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 3000
EOF

kubectl apply -f godjira-ingress.yaml
```

### Step 6: Configure Cloudflare DNS

1. Go to Cloudflare Dashboard → DNS
2. Add A records pointing to your LoadBalancer IP:
   - `godjira.yourdomain.com` → `YOUR_LOADBALANCER_IP`
   - `api.godjira.yourdomain.com` → `YOUR_LOADBALANCER_IP`
3. Enable **Proxy** (orange cloud) for DDoS protection

### Step 7: Verify Certificate

```bash
# Check certificate status
kubectl get certificate -n godjira

# Should show READY=True after a few minutes

# Check certificate details
kubectl describe certificate godjira-tls -n godjira
```

---

## Method 3: Tailscale (Private Access)

For secure private access without exposing to public internet.

### Setup

```bash
# Install Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# Authenticate
sudo tailscale up

# Enable HTTPS with Tailscale certs
sudo tailscale cert godjira.YOUR-TAILNET.ts.net

# Configure GodJira to use Tailscale DNS
# Access via: https://godjira.YOUR-TAILNET.ts.net
```

---

## Security Best Practices

### 1. Enable Cloudflare WAF Rules

```bash
# Recommended rules:
# - Block known bots
# - OWASP Core Rule Set
# - Rate limiting on login endpoints
# - Country blocking (if applicable)
```

### 2. Configure CORS Properly

```javascript
// apps/src/main.ts
app.enableCors({
  origin: [
    'https://godjira.yourdomain.com',
    'https://api.godjira.yourdomain.com'
  ],
  credentials: true
});
```

### 3. Use Environment Variables

```bash
# Never hardcode your domain
FRONTEND_URL=https://godjira.yourdomain.com
API_URL=https://api.godjira.yourdomain.com
```

### 4. Enable Cloudflare Analytics

- Monitor traffic patterns
- Set up alerts for unusual activity
- Review security events regularly

### 5. Backup Your Tunnel Credentials

```bash
# Backup these files securely:
~/.cloudflared/cert.pem
~/.cloudflared/TUNNEL_ID.json
~/.cloudflared/config.yml

# Store in password manager or encrypted backup
```

---

## Troubleshooting

### Tunnel Not Connecting

```bash
# Check tunnel status
cloudflared tunnel info godjira

# Test connectivity
cloudflared tunnel run godjira --loglevel debug

# Check service status
sudo systemctl status cloudflared
sudo journalctl -u cloudflared -n 50
```

### HTTPS Not Working

```bash
# Check Cloudflare SSL mode
# Must be "Full" or "Full (strict)"

# Check DNS propagation
dig godjira.yourdomain.com

# Check certificate
curl -vI https://godjira.yourdomain.com
```

### 502 Bad Gateway

```bash
# Check if GodJira is running
docker compose ps

# Check if ports are correct in config.yml
# Verify service is accessible locally
curl http://localhost:5173
```

### WebSocket Connection Failed

```bash
# Ensure WebSocket support in config.yml
# Add to ingress configuration:
ingress:
  - hostname: api.godjira.yourdomain.com
    service: http://localhost:3000
    originRequest:
      noTLSVerify: true
      http2Origin: true  # Enable HTTP/2
```

---

## Cost Breakdown

| Service | Cost | What You Get |
|---------|------|--------------|
| Cloudflare Free | $0/month | Tunnel, HTTPS, DDoS protection, CDN |
| Domain Name | $10-15/year | Your custom domain |
| **Total** | **~$1/month** | Professional setup with HTTPS |

**No additional costs** - Cloudflare Tunnel is free forever!

---

## Complete Setup Example

```bash
# 1. Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared

# 2. Login to Cloudflare
cloudflared tunnel login

# 3. Create tunnel
cloudflared tunnel create godjira

# Save the Tunnel ID shown (looks like: 12345678-1234-1234-1234-123456789abc)

# 4. Create config file
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml <<EOF
tunnel: godjira
credentials-file: /home/$(whoami)/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: godjira.yourdomain.com
    service: http://localhost:5173
  - hostname: api.godjira.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
EOF

# 5. Create DNS records
cloudflared tunnel route dns godjira godjira.yourdomain.com
cloudflared tunnel route dns godjira api.godjira.yourdomain.com

# 6. Update GodJira config
nano apps/.env
# Set: FRONTEND_URL=https://godjira.yourdomain.com

# 7. Restart GodJira
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d

# 8. Start tunnel
cloudflared tunnel run godjira

# 9. Test in browser
# Visit: https://godjira.yourdomain.com
# HTTPS works automatically! 🎉

# 10. Install as service (optional)
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

---

## Quick Reference

### Tunnel Commands

```bash
# List tunnels
cloudflared tunnel list

# Show tunnel info
cloudflared tunnel info godjira

# Delete tunnel
cloudflared tunnel delete godjira

# Update DNS
cloudflared tunnel route dns godjira subdomain.yourdomain.com

# Test configuration
cloudflared tunnel --config ~/.cloudflared/config.yml ingress validate
```

### Service Management

```bash
# Start service
sudo systemctl start cloudflared

# Stop service
sudo systemctl stop cloudflared

# Restart service
sudo systemctl restart cloudflared

# View logs
sudo journalctl -u cloudflared -f

# Check status
sudo systemctl status cloudflared
```

---

## Summary

✅ **Cloudflare Tunnel** (Recommended)
- Free HTTPS certificates (automatic)
- Hides your IP address completely
- No port forwarding needed
- Works behind NAT/firewall
- DDoS protection included
- Best for home servers and Raspberry Pi

✅ **Kubernetes + cert-manager**
- Native Kubernetes integration
- Automatic certificate renewal
- Good for production clusters
- Requires public IP

✅ **Tailscale**
- Private access only
- No public internet exposure
- Good for personal use

**Recommendation**: Use **Cloudflare Tunnel** for public access with maximum security and zero cost!

---

**Last Updated**: November 27, 2025
