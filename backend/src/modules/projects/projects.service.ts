import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '@database/entities/project.entity';
import { WorkspaceMember } from '@database/entities/workspace-member.entity';
import { Task } from '@database/entities/task.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { TaskStatus, WorkspaceRole } from '@common/constants/constants';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(WorkspaceMember)
    private memberRepo: Repository<WorkspaceMember>,
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
  ) {}

  private async verifyWorkspaceAccess(workspaceId: string, userId: string) {
    const member = await this.memberRepo.findOne({
      where: { workspace_id: workspaceId, user_id: userId },
    });
    if (!member) {
      throw new ForbiddenException('You do not have access to this workspace');
    }
    return member;
  }

  async createProject(userId: string, dto: CreateProjectDto): Promise<Project> {
    await this.verifyWorkspaceAccess(dto.workspace_id, userId);

    const project = this.projectRepo.create({
      ...dto,
      lead_id: dto.lead_id || userId,
    });

    return this.projectRepo.save(project);
  }

  async getWorkspaceProjects(
    workspaceId: string,
    userId: string,
  ): Promise<any[]> {
    try {
      await this.verifyWorkspaceAccess(workspaceId, userId);

      const projects = await this.projectRepo.find({
        where: { workspace_id: workspaceId },
        relations: ['lead', 'tasks'],
        order: { createdAt: 'DESC' },
      });

      return projects.map((p) => ({
        ...p,
        taskCount: p.tasks?.length || 0,
        completedTaskCount:
          p.tasks?.filter((t) => t.status === (TaskStatus.DONE as string))
            .length || 0,
      }));
    } catch (e: unknown) {
      console.error(
        'CRITICAL getWorkspaceProjects error:',
        e instanceof Error ? e.stack : e,
      );
      throw e;
    }
  }

  async getProjectById(projectId: string, userId: string): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['workspace', 'lead', 'tasks', 'tasks.assignee'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.verifyWorkspaceAccess(project.workspace_id, userId);
    return project;
  }

  async updateProject(
    projectId: string,
    userId: string,
    dto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.getProjectById(projectId, userId);

    Object.assign(project, dto);
    return this.projectRepo.save(project);
  }

  async deleteProject(
    projectId: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    const project = await this.getProjectById(projectId, userId);
    const member = await this.verifyWorkspaceAccess(
      project.workspace_id,
      userId,
    );

    if (member.role === WorkspaceRole.MEMBER) {
      throw new ForbiddenException(
        'Only owners and admins can delete projects',
      );
    }

    await this.projectRepo.softDelete(projectId);
    return { success: true };
  }

  async getProjectHealth(projectId: string, userId: string) {
    const project = await this.getProjectById(projectId, userId);
    const tasks = await this.taskRepo.find({
      where: { project_id: projectId },
    });

    const total = tasks.length;
    const completed = tasks.filter(
      (t) => t.status === (TaskStatus.DONE as string),
    ).length;
    const inProgress = tasks.filter(
      (t) => t.status === (TaskStatus.IN_PROGRESS as string),
    ).length;
    const inReview = tasks.filter(
      (t) => t.status === (TaskStatus.IN_REVIEW as string),
    ).length;
    const todo = tasks.filter(
      (t) => t.status === (TaskStatus.TODO as string),
    ).length;

    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      projectId,
      name: project.name,
      total,
      completed,
      inProgress,
      inReview,
      todo,
      completionRate,
      status: project.status,
    };
  }
}
