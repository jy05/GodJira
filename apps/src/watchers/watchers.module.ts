import { Module } from '@nestjs/common';
import { WatchersController } from './watchers.controller';
import { WatchersService } from './watchers.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WatchersController],
  providers: [WatchersService],
  exports: [WatchersService],
})
export class WatchersModule {}
