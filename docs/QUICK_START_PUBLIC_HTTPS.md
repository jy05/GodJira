# Quick Start: GodJira with Public HTTPS Access

## 🚀 Fastest Way to Deploy GodJira with Public HTTPS

This guide gets you from zero to a publicly accessible GodJira instance with HTTPS in under 30 minutes.

## What You'll Get

✅ GodJira running on your server (Raspberry Pi, Linux, etc.)  
✅ Accessible at `https://godjira.yourdomain.com`  
✅ Automatic HTTPS certificate (free)  
✅ Your private IP stays hidden  
✅ DDoS protection included  
✅ No port forwarding needed  

## Prerequisites

- [ ] Server with Docker installed (can be Raspberry Pi)
- [ ] Domain name (buy one for ~$10/year)
- [ ] Cloudflare account (free)
- [ ] 30 minutes of time

---

## Step-by-Step (Copy & Paste)

### 1️⃣ Setup Domain (5 minutes)

```bash
# 1. Buy domain at Namecheap, Cloudflare, Google Domains, etc.
# 2. Sign up at cloudflare.com (free plan)
# 3. Add your domain to Cloudflare
# 4. Update nameservers at your registrar to Cloudflare's
# 5. Wait 10-30 minutes for activation
```

### 2️⃣ Install GodJira (10 minutes)

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

### 3️⃣ Install Cloudflare Tunnel (5 minutes)

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

### 4️⃣ Configure Tunnel (5 minutes)

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

### 5️⃣ Update GodJira Config (2 minutes)

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

### 6️⃣ Start Tunnel (2 minutes)

```bash
# Run tunnel (test first)
cloudflared tunnel run godjira

# Leave this running and test in browser:
# https://godjira.yourdomain.com
# HTTPS works automatically! 🎉

# If it works, install as service:
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

### 7️⃣ Configure Cloudflare Security (3 minutes)

1. Go to Cloudflare Dashboard → Your Domain
2. **SSL/TLS** → Set to **Full**
3. **Security** → Enable **WAF** (Web Application Firewall)
4. **Speed** → Enable **Auto Minify**
5. Done!

---

## ✅ Verification

```bash
# Test HTTPS
curl -I https://godjira.yourdomain.com
# Should return: HTTP/2 200, server: cloudflare

# Test API
curl https://api.godjira.yourdomain.com/health

# Test in browser
# Visit: https://godjira.yourdomain.com
# Should load with 🔒 HTTPS!
```

---

## 🎯 What Just Happened?

1. **GodJira** runs on your local server (localhost:5173, localhost:3000)
2. **Cloudflare Tunnel** creates encrypted connection to Cloudflare
3. **Cloudflare** provides:
   - Free HTTPS certificate (automatic)
   - DDoS protection
   - CDN (faster loading globally)
   - Hides your IP address
4. **Users** access via `https://godjira.yourdomain.com`
5. **Your IP** stays completely hidden

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

---

## 🔧 Troubleshooting

### Tunnel won't connect

```bash
# Check if running
sudo systemctl status cloudflared

# View logs
sudo journalctl -u cloudflared -f

# Test manually
cloudflared tunnel run godjira --loglevel debug
```

### 502 Bad Gateway

```bash
# Check if GodJira is running
docker compose ps

# Check if ports are correct
curl http://localhost:5173  # Should work locally
```

### HTTPS shows warning

```bash
# Wait a few minutes for DNS propagation
# Check Cloudflare SSL setting is "Full" not "Flexible"
```

---

## 📊 Cost Breakdown

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

## 🚀 Next Steps

1. **Set up email** - Configure SMTP for notifications
2. **Add team members** - Invite users to your instance
3. **Enable 2FA** - Extra security for admin accounts
4. **Set up backups** - Automate database backups
5. **Monitor usage** - Check Cloudflare analytics

---

## 📚 Learn More

- **Full Documentation**: [PUBLIC_DEPLOYMENT_CLOUDFLARE.md](./PUBLIC_DEPLOYMENT_CLOUDFLARE.md)
- **Raspberry Pi Guide**: [RASPBERRY_PI_DEPLOYMENT.md](./RASPBERRY_PI_DEPLOYMENT.md)
- **Security Guide**: [SECURITY.md](../SECURITY.md)

---

## 🆘 Need Help?

- Check [Troubleshooting Guide](./PUBLIC_DEPLOYMENT_CLOUDFLARE.md#troubleshooting)
- Open an [Issue on GitHub](https://github.com/jy05/GodJira/issues)
- Review [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)

---

**Congratulations! Your GodJira instance is now publicly accessible with HTTPS!** 🎉

Last Updated: November 27, 2025
