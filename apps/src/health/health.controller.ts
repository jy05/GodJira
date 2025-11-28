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

  @Get()
  @HealthCheck()
  @Header('Content-Type', 'application/json')
  @ApiOperation({ summary: 'Health check endpoint for Kubernetes probes and encryption status' })
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

  @Get('ui')
  @ApiOperation({ summary: 'Health check dashboard with formatted UI' })
  @ApiResponse({
    status: 200,
    description: 'Health dashboard page',
  })
  async healthUI(@Res() res: Response) {
    // Get health data
    const healthData = await this.check();
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GodJira Health Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 3rem;
            color: white;
        }
        
        .header h1 {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .status-badge {
            display: inline-block;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1.1rem;
            margin-top: 1rem;
        }
        
        .status-badge.ok {
            background: #10b981;
            color: white;
        }
        
        .status-badge.error {
            background: #ef4444;
            color: white;
        }
        
        .cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .card {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }
        
        .card-header {
            display: flex;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #f3f4f6;
        }
        
        .card-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            margin-right: 1rem;
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
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
        }
        
        .card-body {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            background: #f9fafb;
            border-radius: 8px;
        }
        
        .info-label {
            font-weight: 500;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .info-value {
            font-weight: 600;
            color: #1f2937;
            font-size: 1rem;
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
            color: white;
            opacity: 0.8;
            margin-top: 2rem;
            font-size: 0.9rem;
        }
        
        .details-section {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .details-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #f3f4f6;
        }
        
        pre {
            background: #1f2937;
            color: #f3f4f6;
            padding: 1.5rem;
            border-radius: 12px;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 0.85rem;
            line-height: 1.6;
        }
        
        .shield-icon {
            display: inline-block;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 GodJira Health Dashboard</h1>
            <p>System Status & Monitoring</p>
            <div class="status-badge ${healthData.status === 'ok' ? 'ok' : 'error'}">
                System: ${healthData.status.toUpperCase()}
            </div>
        </div>
        
        <div class="cards">
            <!-- Database Card -->
            <div class="card">
                <div class="card-header">
                    <div class="card-icon ${healthData.info?.database?.status === 'up' ? 'up' : 'down'}">
                        🗄️
                    </div>
                    <div class="card-title">Database</div>
                </div>
                <div class="card-body">
                    <div class="info-row">
                        <span class="info-label">Status</span>
                        <span class="info-value ${healthData.info?.database?.status === 'up' ? 'up' : 'down'}">
                            ${healthData.info?.database?.status || 'unknown'}
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
                    <div class="card-icon ${healthData.info?.encryption?.status === 'up' ? 'up' : 'down'}">
                        <span class="shield-icon">🔒</span>
                    </div>
                    <div class="card-title">Encryption</div>
                </div>
                <div class="card-body">
                    <div class="info-row">
                        <span class="info-label">Status</span>
                        <span class="info-value ${healthData.info?.encryption?.status === 'up' ? 'up' : 'down'}">
                            ${healthData.info?.encryption?.status || 'unknown'}
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Configured</span>
                        <span class="info-value ${healthData.info?.encryption?.configured ? 'up' : 'warning'}">
                            ${healthData.info?.encryption?.configured ? 'Yes' : 'No (Dev Mode)'}
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Key Length</span>
                        <span class="info-value">${healthData.info?.encryption?.keyLength || 0} bytes (${(healthData.info?.encryption?.keyLength || 0) * 8} bits)</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Environment</span>
                        <span class="info-value">${healthData.info?.encryption?.environment || 'unknown'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Algorithm</span>
                        <span class="info-value">AES-256-GCM</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="details-section">
            <div class="details-title">📊 Raw Health Data</div>
            <pre>${JSON.stringify(healthData, null, 2)}</pre>
        </div>
        
        <div class="timestamp">
            Last updated: ${new Date().toLocaleString()} | Auto-refresh: <span id="countdown">30</span>s
        </div>
    </div>
    
    <script>
        // Auto-refresh every 30 seconds
        let countdown = 30;
        setInterval(() => {
            countdown--;
            document.getElementById('countdown').textContent = countdown;
            if (countdown <= 0) {
                location.reload();
            }
        }, 1000);
    </script>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}
