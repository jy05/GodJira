import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { SprintsModule } from './sprints/sprints.module';
import { IssuesModule } from './issues/issues.module';
import { CommentsModule } from './comments/comments.module';
import { WorkLogsModule } from './worklogs/worklogs.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { EmailModule } from './email/email.module';
import { AuditModule } from './audit/audit.module';
import { IssueLinksModule } from './issue-links/issue-links.module';
import { WatchersModule } from './watchers/watchers.module';
import { TeamsModule } from './teams/teams.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    PrismaModule,
    EmailModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    SprintsModule,
    IssuesModule,
    CommentsModule,
    WorkLogsModule,
    HealthModule,
    MetricsModule,
    AuditModule,
    IssueLinksModule,
    WatchersModule,
    TeamsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
