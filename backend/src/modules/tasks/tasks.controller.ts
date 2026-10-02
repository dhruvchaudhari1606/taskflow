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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ReorderTaskDto } from './dto/reorder-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AuthUser } from '@app-types/authUser.type';

@ApiBearerAuth()
@ApiTags('Tasks')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'tasks',
  version: '1',
})
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task in a project' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  createTask(@Req() req: Request, @Body() createDto: CreateTaskDto) {
    const user = req.user as AuthUser;
    return this.tasksService.createTask(user.userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks for a project or workspace' })
  @ApiResponse({ status: 200, description: 'List of tasks' })
  getTasks(
    @Req() req: Request,
    @Query('projectId') projectId?: string,
    @Query('workspaceId') workspaceId?: string,
  ) {
    const user = req.user as AuthUser;
    if (projectId) {
      return this.tasksService.getProjectTasks(projectId, user.userId);
    }
    if (workspaceId) {
      return this.tasksService.getWorkspaceTasks(workspaceId, user.userId);
    }
    return [];
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get task details by ID with assignee, reporter, and comments',
  })
  @ApiResponse({ status: 200, description: 'Task details retrieved' })
  getTaskById(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    const user = req.user as AuthUser;
    return this.tasksService.getTaskById(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task properties' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  updateTask(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTaskDto,
  ) {
    const user = req.user as AuthUser;
    return this.tasksService.updateTask(id, user.userId, updateDto);
  }

  @Patch(':id/reorder')
  @ApiOperation({
    summary: 'Reorder task position or move across Kanban columns',
  })
  @ApiResponse({
    status: 200,
    description: 'Task position and status reordered',
  })
  reorderTask(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() reorderDto: ReorderTaskDto,
  ) {
    const user = req.user as AuthUser;
    return this.tasksService.reorderTask(id, user.userId, reorderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive/Delete a task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  deleteTask(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    const user = req.user as AuthUser;
    return this.tasksService.deleteTask(id, user.userId);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a discussion comment to a task' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  addComment(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() commentDto: CreateCommentDto,
  ) {
    const user = req.user as AuthUser;
    return this.tasksService.addComment(id, user.userId, commentDto);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get discussion comments for a task' })
  @ApiResponse({ status: 200, description: 'List of task comments' })
  getTaskComments(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    const user = req.user as AuthUser;
    return this.tasksService.getTaskComments(id, user.userId);
  }
}
