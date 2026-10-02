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
import { Task } from './task.entity';

@Entity('board_columns')
export class BoardColumn extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  project_id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 30, default: '#4F46E5' })
  color!: string;

  @Column({ type: 'double precision', default: 1000 })
  position!: number;

  @ManyToOne(() => Project, (project) => project.columns, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @OneToMany(() => Task, (task) => task.column)
  tasks?: Task[];
}
