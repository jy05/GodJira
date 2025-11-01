import { Module } from '@nestjs/common';
import { WorkLogsService } from './worklogs.service';
import { WorkLogsController } from './worklogs.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkLogsController],
  providers: [WorkLogsService],
  exports: [WorkLogsService],
})
export class WorkLogsModule {}
