import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { WorkspaceMember } from './workspace-member.entity';
import { Project } from './project.entity';
import { WorkspaceInvitation } from './workspace-invitation.entity';

@Entity('workspaces')
export class Workspace extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatar_url?: string | null;

  @Column({ type: 'uuid' })
  owner_id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @OneToMany(() => WorkspaceMember, (member) => member.workspace, {
    cascade: true,
  })
  members!: WorkspaceMember[];

  @OneToMany(() => Project, (project) => project.workspace, {
    cascade: true,
  })
  projects!: Project[];

  @OneToMany(() => WorkspaceInvitation, (invitation) => invitation.workspace, {
    cascade: true,
  })
  invitations!: WorkspaceInvitation[];
}
