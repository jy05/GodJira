# GodJira Public Deployment with Cloudflare

## Overview

This guide shows how to make GodJira publicly accessible using **Cloudflare Tunnel** (formerly Argo Tunnel), which:

✅ **Protects your private IP** - No port forwarding needed  
✅ **Automatic HTTPS** - Free SSL/TLS certificates from Cloudflare  
✅ **DDoS Protection** - Cloudflare's global network shields your server  
✅ **Zero Trust Security** - No exposed ports on your firewall  
✅ **Works anywhere** - Behind NAT, on Raspberry Pi, any network  

## Methods Comparison

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **Cloudflare Tunnel** | Free, hides IP, auto HTTPS, no ports | Requires domain | Most users |
| **Cloudflare + Ingress** | Native K8s, cert-manager | Exposes IP, needs LoadBalancer | Production K8s |
| **Tailscale** | Private, easy | Not public internet | Private access |

---

## Method 1: Cloudflare Tunnel (Recommended)

### Prerequisites

1. **Domain name** (can buy on Cloudflare, Namecheap, etc.)
2. **Cloudflare account** (free tier works)
3. **Domain added to Cloudflare** (change nameservers at your registrar)
4. **GodJira running** (Docker Compose or Kubernetes)

### Architecture

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

## Step-by-Step Setup

### Step 1: Add Domain to Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click **Add a Site**
3. Enter your domain (e.g., `yourdomain.com`)
4. Select **Free plan**
5. Copy the nameservers provided
6. Update nameservers at your domain registrar
7. Wait for activation (5-30 minutes)

### Step 2: Install Cloudflared

#### On Linux (including Raspberry Pi ARM64)

```bash
# For AMD64/x86_64
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# For ARM64 (Raspberry Pi 4/5)
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64
sudo mv cloudflared-linux-arm64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared

# Verify installation
cloudflared --version
```

#### On Windows (PowerShell as Administrator)

```powershell
# Download cloudflared
Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"

# Move to Program Files
Move-Item cloudflared.exe "C:\Program Files\cloudflared\cloudflared.exe"

# Add to PATH
$env:Path += ";C:\Program Files\cloudflared"

# Verify
cloudflared --version
```

#### On macOS

```bash
brew install cloudflared

# Verify
cloudflared --version
```

### Step 3: Authenticate with Cloudflare

```bash
# This opens browser for authentication
cloudflared tunnel login

# Follow the browser prompts to select your domain
# This creates credentials at ~/.cloudflared/cert.pem
```

### Step 4: Create Tunnel

```bash
# Create a tunnel (choose a name)
cloudflared tunnel create godjira

# This creates credentials at ~/.cloudflared/<TUNNEL-ID>.json
# Save the Tunnel ID shown in the output
```

### Step 5: Configure Tunnel

Create tunnel configuration file:

```bash
# Create config directory if it doesn't exist
mkdir -p ~/.cloudflared

# Create configuration file
nano ~/.cloudflared/config.yml
```

**For Docker Compose Deployment:**

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

**For Kubernetes Deployment:**

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

### Step 6: Create DNS Records

```bash
# Create DNS records pointing to your tunnel
cloudflared tunnel route dns godjira godjira.yourdomain.com
cloudflared tunnel route dns godjira api.godjira.yourdomain.com
cloudflared tunnel route dns godjira docs.godjira.yourdomain.com
cloudflared tunnel route dns godjira metrics.godjira.yourdomain.com

# Verify DNS records in Cloudflare dashboard
```

### Step 7: Run Tunnel

#### Test Mode (Foreground)

```bash
# Run in foreground to test
cloudflared tunnel run godjira

# Leave running and test in browser
# Visit https://godjira.yourdomain.com
# HTTPS is automatic - Cloudflare provides the certificate!
```

#### Production Mode (Background Service)

**Linux (systemd):**

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

**Windows (Task Scheduler):**

```powershell
# Create a scheduled task
$action = New-ScheduledTaskAction -Execute "C:\Program Files\cloudflared\cloudflared.exe" -Argument "tunnel --config C:\Users\YOUR_USERNAME\.cloudflared\config.yml run godjira"
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName "CloudflaredTunnel" -Action $action -Trigger $trigger -Principal $principal

# Start the task
Start-ScheduledTask -TaskName "CloudflaredTunnel"
```

**Docker (Alternative):**

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

### Step 8: Configure Cloudflare Security

#### Enable Security Features

1. Go to Cloudflare Dashboard → Your Domain
2. **SSL/TLS** → Set to **Full** or **Full (strict)**
3. **Security** → **WAF** → Enable
4. **Security** → **DDoS Protection** → Enable (automatic)
5. **Speed** → **Optimization** → Enable Auto Minify (HTML, CSS, JS)

#### Create Firewall Rules (Optional)

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
