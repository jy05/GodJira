import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IssueLinksService } from './issue-links.service';
import { CreateIssueLinkDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('issue-links')
@Controller('issue-links')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IssueLinksController {
  constructor(private readonly issueLinksService: IssueLinksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a link between two issues' })
  @ApiResponse({
    status: 201,
    description: 'Issue link created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'One or both issues not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid link or link already exists',
  })
  create(@Body() createIssueLinkDto: CreateIssueLinkDto) {
    return this.issueLinksService.create(createIssueLinkDto);
  }

  @Get('issue/:issueId')
  @ApiOperation({ summary: 'Get all links for an issue' })
  @ApiResponse({
    status: 200,
    description: 'Issue links retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Issue not found',
  })
  findAllForIssue(@Param('issueId') issueId: string) {
    return this.issueLinksService.findAllForIssue(issueId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a link between issues' })
  @ApiResponse({
    status: 200,
    description: 'Link removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Link not found',
  })
  remove(@Param('id') id: string) {
    return this.issueLinksService.remove(id);
  }
}
