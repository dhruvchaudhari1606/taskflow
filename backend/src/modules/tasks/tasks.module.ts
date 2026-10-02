import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '@database/entities/task.entity';
import { Project } from '@database/entities/project.entity';
import { WorkspaceMember } from '@database/entities/workspace-member.entity';
import { Comment } from '@database/entities/comment.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Project, WorkspaceMember, Comment]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
