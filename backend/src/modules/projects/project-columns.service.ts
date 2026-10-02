import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardColumn } from '@database/entities/board-column.entity';
import { Project } from '@database/entities/project.entity';
import { WorkspaceMember } from '@database/entities/workspace-member.entity';
import { Task } from '@database/entities/task.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ReorderColumnsDto } from './dto/reorder-columns.dto';

const DEFAULT_COLUMNS = [
  { name: 'TODO', color: '#4F46E5', position: 1000 },
  { name: 'In Progress', color: '#0891b2', position: 2000 },
  { name: 'In Review', color: '#7c3aed', position: 3000 },
  { name: 'Done', color: '#059669', position: 4000 },
];

@Injectable()
export class ProjectColumnsService {
  constructor(
    @InjectRepository(BoardColumn)
    private columnRepo: Repository<BoardColumn>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(WorkspaceMember)
    private memberRepo: Repository<WorkspaceMember>,
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
  ) {}

  private async verifyProjectAccess(
    projectId: string,
    userId: string,
  ): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const member = await this.memberRepo.findOne({
      where: { workspace_id: project.workspace_id, user_id: userId },
    });
    if (!member) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async getProjectColumns(
    projectId: string,
    userId: string,
  ): Promise<BoardColumn[]> {
    await this.verifyProjectAccess(projectId, userId);

    let columns = await this.columnRepo.find({
      where: { project_id: projectId },
      order: { position: 'ASC' },
    });

    // Auto-seed default columns if this project has no board columns yet
    if (columns.length === 0) {
      const seeded = DEFAULT_COLUMNS.map((c) =>
        this.columnRepo.create({
          project_id: projectId,
          name: c.name,
          color: c.color,
          position: c.position,
        }),
      );
      columns = await this.columnRepo.save(seeded);

      // Backfill existing tasks with column_id matching column name or status
      const existingTasks = await this.taskRepo.find({
        where: { project_id: projectId },
      });

      for (const task of existingTasks) {
        if (!task.column_id) {
          const matched = columns.find(
            (col) =>
              col.name.toUpperCase() === (task.status || '').toUpperCase() ||
              col.name.replace(/\s+/g, '_').toUpperCase() ===
                (task.status || '').toUpperCase(),
          );
          if (matched) {
            task.column_id = matched.id;
            await this.taskRepo.save(task);
          }
        }
      }
    }

    return columns;
  }

  async createColumn(
    projectId: string,
    userId: string,
    dto: CreateColumnDto,
  ): Promise<BoardColumn> {
    await this.verifyProjectAccess(projectId, userId);

    let position = dto.position;
    if (position === undefined) {
      const highest = await this.columnRepo.findOne({
        where: { project_id: projectId },
        order: { position: 'DESC' },
      });
      position = highest ? highest.position + 1000 : 1000;
    }

    const column = this.columnRepo.create({
      project_id: projectId,
      name: dto.name.trim(),
      color: dto.color?.trim() || '#4F46E5',
      position,
    });

    return this.columnRepo.save(column);
  }

  async updateColumn(
    projectId: string,
    columnId: string,
    userId: string,
    dto: UpdateColumnDto,
  ): Promise<BoardColumn> {
    await this.verifyProjectAccess(projectId, userId);

    const column = await this.columnRepo.findOne({
      where: { id: columnId, project_id: projectId },
    });

    if (!column) {
      throw new NotFoundException('Column not found in this project');
    }

    if (dto.name !== undefined && dto.name.trim()) {
      column.name = dto.name.trim();
    }
    if (dto.color !== undefined && dto.color.trim()) {
      column.color = dto.color.trim();
    }
    if (dto.position !== undefined) {
      column.position = dto.position;
    }

    return this.columnRepo.save(column);
  }

  async deleteColumn(
    projectId: string,
    columnId: string,
    userId: string,
  ): Promise<{ success: boolean; movedTasksCount: number }> {
    await this.verifyProjectAccess(projectId, userId);

    const column = await this.columnRepo.findOne({
      where: { id: columnId, project_id: projectId },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    const remainingColumns = await this.columnRepo.find({
      where: { project_id: projectId },
      order: { position: 'ASC' },
    });

    if (remainingColumns.length <= 1) {
      throw new BadRequestException('A board must retain at least one column');
    }

    const fallbackColumn = remainingColumns.find((c) => c.id !== columnId)!;

    // Gracefully reassign any tasks inside this column to fallback column
    const tasksInColumn = await this.taskRepo.find({
      where: [
        { column_id: columnId },
        { project_id: projectId, status: column.name },
      ],
    });

    let movedTasksCount = 0;
    if (tasksInColumn.length > 0) {
      for (const t of tasksInColumn) {
        t.column_id = fallbackColumn.id;
        t.status = fallbackColumn.name;
        await this.taskRepo.save(t);
        movedTasksCount++;
      }
    }

    await this.columnRepo.delete(column.id);

    return { success: true, movedTasksCount };
  }

  async reorderColumns(
    projectId: string,
    userId: string,
    dto: ReorderColumnsDto,
  ): Promise<BoardColumn[]> {
    await this.verifyProjectAccess(projectId, userId);

    const existingColumns = await this.columnRepo.find({
      where: { project_id: projectId },
    });

    const colMap = new Map(existingColumns.map((c) => [c.id, c]));

    const updated: BoardColumn[] = [];
    for (let i = 0; i < dto.columnIds.length; i++) {
      const colId = dto.columnIds[i];
      const col = colMap.get(colId);
      if (col) {
        col.position = (i + 1) * 1000;
        updated.push(col);
      }
    }

    if (updated.length > 0) {
      await this.columnRepo.save(updated);
    }

    return this.columnRepo.find({
      where: { project_id: projectId },
      order: { position: 'ASC' },
    });
  }
}
