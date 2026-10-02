import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
import { ProjectColumnsService } from './project-columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ReorderColumnsDto } from './dto/reorder-columns.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AuthUser } from '@app-types/authUser.type';

@ApiBearerAuth()
@ApiTags('Project Columns')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'projects/:projectId/columns',
  version: '1',
})
export class ProjectColumnsController {
  constructor(private readonly columnsService: ProjectColumnsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all board columns/lists for a project' })
  @ApiResponse({ status: 200, description: 'List of project board columns' })
  getProjectColumns(
    @Req() req: Request,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    const user = req.user as AuthUser;
    return this.columnsService.getProjectColumns(projectId, user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new board column/list in a project' })
  @ApiResponse({ status: 201, description: 'Column created successfully' })
  createColumn(
    @Req() req: Request,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateColumnDto,
  ) {
    const user = req.user as AuthUser;
    return this.columnsService.createColumn(projectId, user.userId, dto);
  }

  @Patch(':columnId')
  @ApiOperation({ summary: 'Update column title, color, or position' })
  @ApiResponse({ status: 200, description: 'Column updated successfully' })
  updateColumn(
    @Req() req: Request,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('columnId', ParseUUIDPipe) columnId: string,
    @Body() dto: UpdateColumnDto,
  ) {
    const user = req.user as AuthUser;
    return this.columnsService.updateColumn(
      projectId,
      columnId,
      user.userId,
      dto,
    );
  }

  @Delete(':columnId')
  @ApiOperation({ summary: 'Delete a board column and reassign its tasks' })
  @ApiResponse({ status: 200, description: 'Column deleted successfully' })
  deleteColumn(
    @Req() req: Request,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('columnId', ParseUUIDPipe) columnId: string,
  ) {
    const user = req.user as AuthUser;
    return this.columnsService.deleteColumn(projectId, columnId, user.userId);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Batch reorder board columns by UUID array' })
  @ApiResponse({ status: 200, description: 'Columns reordered successfully' })
  reorderColumns(
    @Req() req: Request,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: ReorderColumnsDto,
  ) {
    const user = req.user as AuthUser;
    return this.columnsService.reorderColumns(projectId, user.userId, dto);
  }
}
