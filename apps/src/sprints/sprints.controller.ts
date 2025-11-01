import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SprintsService } from './sprints.service';
import { CreateSprintDto, UpdateSprintDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('sprints')
@Controller('sprints')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sprint' })
  @ApiResponse({
    status: 201,
    description: 'Sprint created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  create(@Body() createSprintDto: CreateSprintDto) {
    return this.sprintsService.create(createSprintDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sprints' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Sprints retrieved successfully',
  })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
  ) {
    return this.sprintsService.findAll({ skip, take, projectId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sprint by ID' })
  @ApiResponse({
    status: 200,
    description: 'Sprint found',
  })
  @ApiResponse({
    status: 404,
    description: 'Sprint not found',
  })
  findOne(@Param('id') id: string) {
    return this.sprintsService.findOne(id);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get sprint statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  getStatistics(@Param('id') id: string) {
    return this.sprintsService.getStatistics(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update sprint' })
  @ApiResponse({
    status: 200,
    description: 'Sprint updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot update completed or cancelled sprint',
  })
  update(@Param('id') id: string, @Body() updateSprintDto: UpdateSprintDto) {
    return this.sprintsService.update(id, updateSprintDto);
  }

  @Patch(':id/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start sprint' })
  @ApiResponse({
    status: 200,
    description: 'Sprint started successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Only planned sprints can be started or project already has active sprint',
  })
  start(@Param('id') id: string) {
    return this.sprintsService.start(id);
  }

  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete sprint' })
  @ApiResponse({
    status: 200,
    description: 'Sprint completed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Only active sprints can be completed',
  })
  complete(@Param('id') id: string) {
    return this.sprintsService.complete(id);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel sprint' })
  @ApiResponse({
    status: 200,
    description: 'Sprint cancelled successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel completed sprint',
  })
  cancel(@Param('id') id: string) {
    return this.sprintsService.cancel(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete sprint' })
  @ApiResponse({
    status: 200,
    description: 'Sprint deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete active sprint',
  })
  remove(@Param('id') id: string) {
    return this.sprintsService.remove(id);
  }
}
