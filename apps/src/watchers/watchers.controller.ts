import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { WatchersService } from './watchers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('watchers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('watchers')
export class WatchersController {
  constructor(private readonly watchersService: WatchersService) {}

  @Post('issue/:issueId')
  @ApiOperation({ summary: 'Watch an issue' })
  @ApiParam({ name: 'issueId', type: 'string' })
  async watchIssue(@Param('issueId') issueId: string, @Request() req) {
    return this.watchersService.watchIssue(req.user.userId, issueId);
  }

  @Delete('issue/:issueId')
  @ApiOperation({ summary: 'Unwatch an issue' })
  @ApiParam({ name: 'issueId', type: 'string' })
  async unwatchIssue(@Param('issueId') issueId: string, @Request() req) {
    return this.watchersService.unwatchIssue(req.user.userId, issueId);
  }

  @Get('issue/:issueId')
  @ApiOperation({ summary: 'Get all watchers for an issue' })
  @ApiParam({ name: 'issueId', type: 'string' })
  async getIssueWatchers(@Param('issueId') issueId: string) {
    return this.watchersService.getIssueWatchers(issueId);
  }

  @Get('issue/:issueId/count')
  @ApiOperation({ summary: 'Get watcher count for an issue' })
  @ApiParam({ name: 'issueId', type: 'string' })
  async getWatcherCount(@Param('issueId') issueId: string) {
    const count = await this.watchersService.getWatcherCount(issueId);
    return { count };
  }

  @Get('issue/:issueId/is-watching')
  @ApiOperation({ summary: 'Check if current user is watching an issue' })
  @ApiParam({ name: 'issueId', type: 'string' })
  async isWatching(@Param('issueId') issueId: string, @Request() req) {
    const isWatching = await this.watchersService.isWatching(
      req.user.userId,
      issueId,
    );
    return { isWatching };
  }

  @Get('my-watched-issues')
  @ApiOperation({ summary: 'Get all issues watched by current user' })
  async getMyWatchedIssues(@Request() req) {
    return this.watchersService.getUserWatchedIssues(req.user.userId);
  }
}
