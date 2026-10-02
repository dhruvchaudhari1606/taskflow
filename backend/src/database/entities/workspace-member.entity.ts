import { Exclude } from 'class-transformer';
import { Column, Entity, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Workspace } from './workspace.entity';
import { User } from './user.entity';
import { WorkspaceRole } from '@common/constants/constants';

@Entity('workspace_members')
@Unique(['workspace_id', 'user_id'])
export class WorkspaceMember extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  workspace_id!: string;

  @Index()
  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({
    type: 'enum',
    enum: WorkspaceRole,
    default: WorkspaceRole.MEMBER,
  })
  role!: WorkspaceRole;

  @Exclude()
  @ManyToOne(() => Workspace, (workspace) => workspace.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspace_id' })
  workspace!: Workspace;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
