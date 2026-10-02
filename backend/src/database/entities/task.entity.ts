import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Project } from './project.entity';
import { User } from './user.entity';
import { Comment } from './comment.entity';
import { BoardColumn } from './board-column.entity';
import { TaskPriority, TaskStatus } from '@common/constants/constants';

@Entity('tasks')
export class Task extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  project_id!: string;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  task_key!: string; // e.g. "TASK-89"

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    default: TaskStatus.TODO,
  })
  status!: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  column_id?: string | null;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority!: TaskPriority;

  @Column({ type: 'double precision', default: 0 })
  position!: number; // For drag-and-drop sort order

  @Column({ type: 'uuid', nullable: true })
  assignee_id?: string | null;

  @Column({ type: 'uuid', nullable: true })
  reporter_id?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  due_date?: Date | null;

  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  @Exclude()
  @ManyToOne(() => Project, (project) => project.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @ManyToOne(() => BoardColumn, (column) => column.tasks, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'column_id' })
  column?: BoardColumn | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignee_id' })
  assignee?: User | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reporter_id' })
  reporter?: User | null;

  @OneToMany(() => Comment, (comment) => comment.task, { cascade: true })
  comments!: Comment[];
}
