import { Controller, Get, Header } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { validateEncryptionSetup } from '../common/utils/encryption.utils';

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
}
