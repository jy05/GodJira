# GodJira

GodJira is an enterprise-grade project management system inspired by Atlassian JIRA. Built with NestJS, Prisma, PostgreSQL, and React, it provides comprehensive issue tracking, sprint management, team collaboration, and real-time notifications.

The system is designed for containerized deployment on Kubernetes, featuring a complete REST API backend with 113 endpoints across 16 modules, WebSocket-based real-time updates, and advanced analytics capabilities. It includes full support for agile workflows with sprint planning, burndown charts, time tracking, file attachments, and role-based access control.

GodJira implements NIST-compliant security standards with JWT authentication, bcrypt password hashing, rate limiting, and comprehensive audit logging. The architecture supports horizontal scaling through stateless API design and includes integrated monitoring with Prometheus and Grafana.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Dependencies](#dependencies)
- [Installation](#installation)
  - [Linux](#linux)
  - [macOS](#macos)
  - [Windows](#windows)

## Prerequisites

- Docker 20 or higher
- Docker Compose 2 or higher
- Kubernetes cluster (for production deployment)
- kubectl configured and connected to your cluster
- Helm 3 (for Kubernetes deployment)
- Git

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

## Dependencies

## Installation

### Linux

### macOS

### Windows
