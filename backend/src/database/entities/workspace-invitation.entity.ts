import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Workspace } from './workspace.entity';
import { User } from './user.entity';
import {
  WorkspaceRole,
  WorkspaceInvitationStatus,
} from '@common/constants/constants';

@Entity('workspace_invitations')
export class WorkspaceInvitation extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  workspace_id!: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({
    type: 'enum',
    enum: WorkspaceRole,
    default: WorkspaceRole.MEMBER,
  })
  role!: WorkspaceRole;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 128 })
  token!: string;

  @Column({ type: 'uuid', nullable: true })
  inviter_id?: string | null;

  @Column({
    type: 'enum',
    enum: WorkspaceInvitationStatus,
    default: WorkspaceInvitationStatus.PENDING,
  })
  status!: WorkspaceInvitationStatus;

  @Column({ type: 'timestamp' })
  expires_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  accepted_at?: Date | null;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace!: Workspace;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'inviter_id' })
  inviter?: User | null;
}
