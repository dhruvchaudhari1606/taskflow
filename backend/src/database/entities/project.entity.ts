import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Workspace } from './workspace.entity';
import { User } from './user.entity';
import { Task } from './task.entity';
import { BoardColumn } from './board-column.entity';
import { ProjectStatus } from '@common/constants/constants';

@Entity('projects')
export class Project extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  workspace_id!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  key!: string; // e.g. "EXEC", "DS", "MOB"

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 50, default: 'Engineering' })
  category!: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
  })
  status!: ProjectStatus;

  @Column({ type: 'uuid', nullable: true })
  lead_id?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  target_date?: Date | null;

  @ManyToOne(() => Workspace, (workspace) => workspace.projects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspace_id' })
  workspace!: Workspace;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lead_id' })
  lead?: User | null;

  @OneToMany(() => Task, (task) => task.project, { cascade: true })
  tasks!: Task[];

  @OneToMany(() => BoardColumn, (col) => col.project, { cascade: true })
  columns!: BoardColumn[];
}
