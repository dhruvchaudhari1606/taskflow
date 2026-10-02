import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from '@database/entities/task.entity';
import { Project } from '@database/entities/project.entity';
import { WorkspaceMember } from '@database/entities/workspace-member.entity';
import { Comment } from '@database/entities/comment.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ReorderTaskDto } from './dto/reorder-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TaskStatus } from '@common/constants/constants';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(WorkspaceMember)
    private memberRepo: Repository<WorkspaceMember>,
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,
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

  async createTask(userId: string, dto: CreateTaskDto): Promise<Task> {
    const project = await this.verifyProjectAccess(dto.project_id, userId);

    // Auto-generate task key: PROJECT_KEY-XXX (e.g. EXEC-14)
    const taskCount = await this.taskRepo.count({
      where: { project_id: dto.project_id },
    });
    const taskKey = `${project.key}-${taskCount + 1}`;

    let position = dto.position;
    if (position === undefined) {
      const highestTask = await this.taskRepo.findOne({
        where: {
          project_id: dto.project_id,
          status: dto.status || TaskStatus.TODO,
        },
        order: { position: 'DESC' },
      });
      position = highestTask ? highestTask.position + 1000 : 1000;
    }

    const task = this.taskRepo.create({
      ...dto,
      task_key: taskKey,
      position,
      reporter_id: userId,
      status: dto.status || TaskStatus.TODO,
    });

    return this.taskRepo.save(task);
  }

  async getProjectTasks(projectId: string, userId: string): Promise<Task[]> {
    await this.verifyProjectAccess(projectId, userId);

    return this.taskRepo.find({
      where: { project_id: projectId },
      relations: [
        'project',
        'assignee',
        'reporter',
        'comments',
        'comments.user',
      ],
      order: { position: 'ASC' },
    });
  }

  async getWorkspaceTasks(
    workspaceId: string,
    userId: string,
  ): Promise<Task[]> {
    const member = await this.memberRepo.findOne({
      where: { workspace_id: workspaceId, user_id: userId },
    });
    if (!member) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    const projects = await this.projectRepo.find({
      where: { workspace_id: workspaceId },
      select: ['id'],
    });

    if (projects.length === 0) return [];

    const projectIds = projects.map((p) => p.id);
    return this.taskRepo.find({
      where: { project_id: In(projectIds) },
      relations: [
        'project',
        'assignee',
        'reporter',
        'comments',
        'comments.user',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async getTaskById(taskId: string, userId: string): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: [
        'project',
        'assignee',
        'reporter',
        'comments',
        'comments.user',
      ],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.verifyProjectAccess(task.project_id, userId);
    return task;
  }

  async updateTask(
    taskId: string,
    userId: string,
    dto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.getTaskById(taskId, userId);

    Object.assign(task, dto);
    return this.taskRepo.save(task);
  }

  async reorderTask(
    taskId: string,
    userId: string,
    dto: ReorderTaskDto,
  ): Promise<Task> {
    const task = await this.getTaskById(taskId, userId);

    task.status = dto.status;
    if (dto.column_id !== undefined) {
      task.column_id = dto.column_id;
    }
    task.position = dto.position;

    return this.taskRepo.save(task);
  }

  async deleteTask(
    taskId: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    const task = await this.getTaskById(taskId, userId);
    await this.taskRepo.softDelete(task.id);
    return { success: true };
  }

  async addComment(
    taskId: string,
    userId: string,
    dto: CreateCommentDto,
  ): Promise<Comment> {
    await this.getTaskById(taskId, userId);

    const comment = this.commentRepo.create({
      task_id: taskId,
      user_id: userId,
      content: dto.content,
    });

    const saved = await this.commentRepo.save(comment);
    return this.commentRepo.findOneOrFail({
      where: { id: saved.id },
      relations: ['user'],
    });
  }

  async getTaskComments(taskId: string, userId: string): Promise<Comment[]> {
    await this.getTaskById(taskId, userId);

    return this.commentRepo.find({
      where: { task_id: taskId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }
}
