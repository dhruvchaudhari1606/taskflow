import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { BoardColumn } from '@database/entities/board-column.entity';
import { Project } from '@database/entities/project.entity';
import { WorkspaceMember } from '@database/entities/workspace-member.entity';
import { Task } from '@database/entities/task.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ReorderColumnsDto } from './dto/reorder-columns.dto';
import {
  DEFAULT_BOARD_COLUMNS,
  findColumnByStatus,
} from '@common/utils/task-status.util';

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
      const seeded = DEFAULT_BOARD_COLUMNS.map((c) =>
        this.columnRepo.create({
          project_id: projectId,
          name: c.name,
          color: c.color,
          position: c.position,
        }),
      );
      columns = await this.columnRepo.save(seeded);
    }

    await this.linkUnassignedTasks(projectId, columns);

    return columns;
  }

  /**
   * Attach tasks that have no column yet (e.g. seeded or created before the
   * board existed) to the column matching their status. Runs on every board
   * load, not only on first column creation, so no task is left unlinked.
   */
  private async linkUnassignedTasks(
    projectId: string,
    columns: BoardColumn[],
  ): Promise<void> {
    const unlinked = await this.taskRepo.find({
      where: { project_id: projectId, column_id: IsNull() },
    });
    if (unlinked.length === 0) return;

    const updates = unlinked.flatMap((task) => {
      const matched = findColumnByStatus(columns, task.status);
      if (!matched) return [];
      task.column_id = matched.id;
      return [task];
    });

    if (updates.length > 0) {
      await this.taskRepo.save(updates);
    }
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
