import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AuthUser } from '@app-types/authUser.type';

@ApiBearerAuth()
@ApiTags('Projects')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'projects',
  version: '1',
})
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project in a workspace' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  createProject(@Req() req: Request, @Body() createDto: CreateProjectDto) {
    const user = req.user as AuthUser;
    return this.projectsService.createProject(user.userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects in a workspace' })
  @ApiResponse({
    status: 200,
    description: 'List of projects in the workspace',
  })
  getWorkspaceProjects(
    @Req() req: Request,
    @Query('workspaceId', ParseUUIDPipe) workspaceId: string,
  ) {
    const user = req.user as AuthUser;
    return this.projectsService.getWorkspaceProjects(workspaceId, user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details by ID with tasks' })
  @ApiResponse({ status: 200, description: 'Project details retrieved' })
  getProjectById(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    const user = req.user as AuthUser;
    return this.projectsService.getProjectById(id, user.userId);
  }

  @Get(':id/health')
  @ApiOperation({
    summary: 'Get project delivery health and task completion rates',
  })
  @ApiResponse({ status: 200, description: 'Project health summary' })
  getProjectHealth(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const user = req.user as AuthUser;
    return this.projectsService.getProjectHealth(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project details' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  updateProject(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProjectDto,
  ) {
    const user = req.user as AuthUser;
    return this.projectsService.updateProject(id, user.userId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive/Delete a project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  deleteProject(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    const user = req.user as AuthUser;
    return this.projectsService.deleteProject(id, user.userId);
  }
}
