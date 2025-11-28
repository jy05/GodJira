import { Controller, Get, Header, Res } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { validateEncryptionSetup } from '../common/utils/encryption.utils';
import { Response } from 'express';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get('json')
  @HealthCheck()
  @Header('Content-Type', 'application/json')
  @ApiOperation({ summary: 'Health check endpoint for Kubernetes probes and encryption status (JSON)' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
  })
  @ApiResponse({
    status: 503,
    description: 'Service is unhealthy',
  })
  async check() {
    return this.health.check([
      async () => {
        await this.prisma.$queryRaw`SELECT 1`;
        return {
          database: {
            status: 'up',
          },
        };
      },
      async () => {
        try {
          const encryptionStatus = validateEncryptionSetup();
          return {
            encryption: {
              status: 'up',
              configured: encryptionStatus.configured,
              keyLength: encryptionStatus.keyLength,
              environment: encryptionStatus.environment,
            },
          };
        } catch (error) {
          return {
            encryption: {
              status: 'down',
              error: error.message,
            },
          };
        }
      },
    ]);
  }

  @Get()
  @ApiOperation({ summary: 'Health check dashboard HTML page' })
  @ApiResponse({
    status: 200,
    description: 'Health dashboard page',
  })
  async healthPage(@Res() res: Response) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GodJira Health Check</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f9fafb;
            min-height: 100vh;
            color: #333;
        }
        
        /* Top Navigation Bar */
        .navbar {
            background: white;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            position: sticky;
            top: 0;
            z-index: 50;
        }
        
        .nav-content {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 1rem;
            height: 64px;
            display: flex;
            align-items: center;
        }
        
        .logo-link {
            display: flex;
            align-items: center;
            cursor: pointer;
            transition: opacity 0.2s;
            text-decoration: none;
        }
        
        .logo-link:hover .logo-text {
            color: #1e40af;
        }
        
        .logo-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: #2563eb;
            transition: color 0.2s;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1.5rem;
        }
        
        .header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .header h1 {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
            color: #111827;
        }
        
        .header p {
            font-size: 0.8rem;
            color: #6b7280;
            margin-top: 0.25rem;
        }
        
        .status-badge {
            display: inline-block;
            padding: 0.375rem 1rem;
            border-radius: 50px;
            font-weight: 600;
            font-size: 0.9rem;
            margin-top: 0.75rem;
        }
        
        .status-badge.ok {
            background: #10b981;
            color: white;
        }
        
        .status-badge.error {
            background: #ef4444;
            color: white;
        }
        
        .status-badge.loading {
            background: #f59e0b;
            color: white;
        }
        
        .cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.25rem;
            margin-bottom: 1.5rem;
        }
        
        .card {
            background: white;
            border-radius: 12px;
            padding: 1.25rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .card-header {
            display: flex;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid #f3f4f6;
        }
        
        .card-icon {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            margin-right: 0.75rem;
        }
        
        .card-icon.up {
            background: #d1fae5;
            color: #059669;
        }
        
        .card-icon.down {
            background: #fee2e2;
            color: #dc2626;
        }
        
        .card-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: #1f2937;
        }
        
        .card-body {
            display: flex;
            flex-direction: column;
            gap: 0.625rem;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem;
            background: #f9fafb;
            border-radius: 6px;
        }
        
        .info-label {
            font-weight: 500;
            color: #6b7280;
            font-size: 0.8rem;
        }
        
        .info-value {
            font-weight: 600;
            color: #1f2937;
            font-size: 0.875rem;
        }
        
        .info-value.up {
            color: #059669;
        }
        
        .info-value.down {
            color: #dc2626;
        }
        
        .info-value.warning {
            color: #f59e0b;
        }
        
        .timestamp {
            text-align: center;
            color: #6b7280;
            margin-top: 1.5rem;
            font-size: 0.8rem;
        }
        
        .details-section {
            background: white;
            border-radius: 12px;
            padding: 1.25rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .details-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid #f3f4f6;
        }
        
        pre {
            background: #1f2937;
            color: #f3f4f6;
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 0.75rem;
            line-height: 1.4;
        }
        
        .loading {
            text-align: center;
            padding: 1.5rem;
            color: #6b7280;
            font-size: 1rem;
        }
        
        .error-message {
            background: #fee2e2;
            color: #dc2626;
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(209, 213, 219, 0.3);
            border-radius: 50%;
            border-top-color: #f59e0b;
            animation: spin 1s linear infinite;
        }
    </style>
</head>
<body>
    <!-- Top Navigation Bar -->
    <nav class="navbar">
        <div class="nav-content">
            <a href="http://localhost:5173" class="logo-link" title="Back to GodJira">
                <span class="logo-text">GodJira</span>
            </a>
        </div>
    </nav>
    
    <div class="container">
        <div class="header">
            <h1>Health Check Dashboard</h1>
            <p>System Status & Monitoring</p>
            <div id="status-badge" class="status-badge loading">
                <span class="spinner"></span> Loading...
            </div>
        </div>
        
        <div id="content">
            <div class="loading">Fetching health data...</div>
        </div>
        
        <div class="timestamp">
            Last updated: <span id="last-update">-</span> | Auto-refresh: <span id="countdown">30</span>s
        </div>
    </div>
    
    <script>
        let countdown = 30;
        let countdownInterval;
        
        async function fetchHealthData() {
            try {
                console.log('Fetching from:', window.location.origin + '/health/json');
                const response = await fetch(window.location.origin + '/health/json');
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status + ': ' + response.statusText);
                }
                const data = await response.json();
                console.log('Health data:', data);
                displayHealthData(data);
                document.getElementById('last-update').textContent = new Date().toLocaleString();
                resetCountdown();
            } catch (error) {
                console.error('Fetch error:', error);
                displayError(error);
            }
        }
        
        function displayHealthData(data) {
            const statusBadge = document.getElementById('status-badge');
            statusBadge.className = 'status-badge ' + (data.status === 'ok' ? 'ok' : 'error');
            statusBadge.innerHTML = 'System: ' + data.status.toUpperCase();
            
            const dbStatus = data.info?.database?.status || 'unknown';
            const encStatus = data.info?.encryption?.status || 'unknown';
            const encConfigured = data.info?.encryption?.configured;
            const encKeyLength = data.info?.encryption?.keyLength || 0;
            const encEnvironment = data.info?.encryption?.environment || 'unknown';
            
            document.getElementById('content').innerHTML = \`
                <div class="cards">
                    <!-- Database Card -->
                    <div class="card">
                        <div class="card-header">
                            <div class="card-icon \${dbStatus === 'up' ? 'up' : 'down'}">
                                DB
                            </div>
                            <div class="card-title">Database</div>
                        </div>
                        <div class="card-body">
                            <div class="info-row">
                                <span class="info-label">Status</span>
                                <span class="info-value \${dbStatus === 'up' ? 'up' : 'down'}">
                                    \${dbStatus}
                                </span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Type</span>
                                <span class="info-value">PostgreSQL</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Connection</span>
                                <span class="info-value up">Active</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Encryption Card -->
                    <div class="card">
                        <div class="card-header">
                            <div class="card-icon \${encStatus === 'up' ? 'up' : 'down'}">
                                ENC
                            </div>
                            <div class="card-title">Encryption</div>
                        </div>
                        <div class="card-body">
                            <div class="info-row">
                                <span class="info-label">Status</span>
                                <span class="info-value \${encStatus === 'up' ? 'up' : 'down'}">
                                    \${encStatus}
                                </span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Configured</span>
                                <span class="info-value \${encConfigured ? 'up' : 'warning'}">
                                    \${encConfigured ? 'Yes' : 'No (Dev Mode)'}
                                </span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Key Length</span>
                                <span class="info-value">\${encKeyLength} bytes (\${encKeyLength * 8} bits)</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Environment</span>
                                <span class="info-value">\${encEnvironment}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Algorithm</span>
                                <span class="info-value">AES-256-GCM</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="details-section">
                    <div class="details-title">Raw Health Data</div>
                    <pre>\${JSON.stringify(data, null, 2)}</pre>
                </div>
            \`;
        }
        
        function displayError(error) {
            const statusBadge = document.getElementById('status-badge');
            statusBadge.className = 'status-badge error';
            statusBadge.innerHTML = 'System: ERROR';
            
            document.getElementById('content').innerHTML = \`
                <div class="error-message">
                    <strong>Error fetching health data:</strong><br>
                    \${error.message || 'Unknown error occurred'}<br><br>
                    Check the browser console for more details.
                </div>
            \`;
        }
        
        function resetCountdown() {
            countdown = 30;
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
            countdownInterval = setInterval(() => {
                countdown--;
                document.getElementById('countdown').textContent = countdown;
                if (countdown <= 0) {
                    fetchHealthData();
                }
            }, 1000);
        }
        
        // Initial fetch
        fetchHealthData();
    </script>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}
