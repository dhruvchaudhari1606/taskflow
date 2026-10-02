import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '@database/entities/project.entity';
import { WorkspaceMember } from '@database/entities/workspace-member.entity';
import { Task } from '@database/entities/task.entity';
import { BoardColumn } from '@database/entities/board-column.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ProjectColumnsService } from './project-columns.service';
import { ProjectColumnsController } from './project-columns.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, WorkspaceMember, Task, BoardColumn]),
  ],
  controllers: [ProjectsController, ProjectColumnsController],
  providers: [ProjectsService, ProjectColumnsService],
  exports: [ProjectsService, ProjectColumnsService],
})
export class ProjectsModule {}
