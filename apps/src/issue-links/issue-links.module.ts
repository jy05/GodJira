import { Module } from '@nestjs/common';
import { IssueLinksController } from './issue-links.controller';
import { IssueLinksService } from './issue-links.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IssueLinksController],
  providers: [IssueLinksService],
  exports: [IssueLinksService],
})
export class IssueLinksModule {}
