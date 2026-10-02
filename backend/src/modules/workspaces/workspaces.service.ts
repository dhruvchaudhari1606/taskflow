import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Request } from 'express';
import { Workspace } from '@database/entities/workspace.entity';
import { WorkspaceMember } from '@database/entities/workspace-member.entity';
import { WorkspaceInvitation } from '@database/entities/workspace-invitation.entity';
import { User } from '@database/entities/user.entity';
import { Role } from '@database/entities/role.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import {
  WorkspaceRole,
  WorkspaceInvitationStatus,
  UserStatus,
} from '@common/constants/constants';
import { MailTemplate } from '@common/constants/mail.constants';
import { MailService } from '@modules/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '@modules/auth/auth.service';
import { PasswordService } from '@modules/auth/password/password.service';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepo: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private memberRepo: Repository<WorkspaceMember>,
    @InjectRepository(WorkspaceInvitation)
    private invitationRepo: Repository<WorkspaceInvitation>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    private mailService: MailService,
    private configService: ConfigService,
    private passwordService: PasswordService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async createWorkspace(
    userId: string,
    dto: CreateWorkspaceDto,
  ): Promise<Workspace> {
    const baseSlug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name);
    let slug = baseSlug || 'workspace';

    const existingSlug = await this.workspaceRepo.findOne({ where: { slug } });
    if (existingSlug) {
      slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const workspace = this.workspaceRepo.create({
      name: dto.name,
      slug,
      description: dto.description || null,
      owner_id: userId,
    });

    const saved = await this.workspaceRepo.save(workspace);

    // Automatically add owner as WORKSPACE_OWNER member
    const member = this.memberRepo.create({
      workspace_id: saved.id,
      user_id: userId,
      role: WorkspaceRole.OWNER,
    });
    await this.memberRepo.save(member);

    return saved;
  }

  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    const memberships = await this.memberRepo.find({
      where: { user_id: userId },
      relations: ['workspace', 'workspace.owner'],
    });

    return memberships.map((m) => m.workspace);
  }

  async getWorkspaceById(
    workspaceId: string,
    userId: string,
  ): Promise<Workspace> {
    const membership = await this.memberRepo.findOne({
      where: { workspace_id: workspaceId, user_id: userId },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
      relations: [
        'owner',
        'members',
        'members.user',
        'projects',
        'invitations',
      ],
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  async getWorkspaceMembers(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMember[]> {
    const membership = await this.memberRepo.findOne({
      where: { workspace_id: workspaceId, user_id: userId },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    return this.memberRepo.find({
      where: { workspace_id: workspaceId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async getWorkspaceInvitations(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceInvitation[]> {
    const membership = await this.memberRepo.findOne({
      where: { workspace_id: workspaceId, user_id: userId },
    });

    if (!membership || membership.role === WorkspaceRole.MEMBER) {
      throw new ForbiddenException(
        'Only owners and admins can view pending invitations',
      );
    }

    return this.invitationRepo.find({
      where: {
        workspace_id: workspaceId,
        status: WorkspaceInvitationStatus.PENDING,
      },
      relations: ['inviter'],
      order: { createdAt: 'DESC' },
    });
  }

  async revokeInvitation(
    workspaceId: string,
    invitationId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    const membership = await this.memberRepo.findOne({
      where: { workspace_id: workspaceId, user_id: userId },
    });

    if (!membership || membership.role === WorkspaceRole.MEMBER) {
      throw new ForbiddenException(
        'Only owners and admins can revoke invitations',
      );
    }

    const invitation = await this.invitationRepo.findOne({
      where: { id: invitationId, workspace_id: workspaceId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    invitation.status = WorkspaceInvitationStatus.REVOKED;
    await this.invitationRepo.save(invitation);

    return { success: true, message: 'Invitation revoked successfully' };
  }

  async updateWorkspace(
    workspaceId: string,
    userId: string,
    dto: UpdateWorkspaceDto,
  ): Promise<Workspace> {
    const membership = await this.memberRepo.findOne({
      where: { workspace_id: workspaceId, user_id: userId },
    });

    if (
      !membership ||
      (membership.role !== WorkspaceRole.OWNER &&
        membership.role !== WorkspaceRole.ADMIN)
    ) {
      throw new ForbiddenException(
        'Only workspace owners or admins can modify workspace settings',
      );
    }

    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (dto.name) workspace.name = dto.name;
    if (dto.description !== undefined) workspace.description = dto.description;
    if (dto.slug) {
      const slug = this.slugify(dto.slug);
      const existing = await this.workspaceRepo.findOne({ where: { slug } });
      if (existing && existing.id !== workspaceId) {
        throw new ConflictException(
          'Slug is already taken by another workspace',
        );
      }
      workspace.slug = slug;
    }

    return this.workspaceRepo.save(workspace);
  }

  async inviteMember(
    workspaceId: string,
    inviterId: string,
    dto: InviteMemberDto,
  ): Promise<any> {
    const inviterMembership = await this.memberRepo.findOne({
      where: { workspace_id: workspaceId, user_id: inviterId },
      relations: ['user'],
    });

    if (!inviterMembership || inviterMembership.role === WorkspaceRole.MEMBER) {
      throw new ForbiddenException('Only owners and admins can invite members');
    }

    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const cleanEmail = dto.email.toLowerCase().trim();

    const targetUser = await this.userRepo.findOne({
      where: { email: cleanEmail },
    });

    if (targetUser) {
      const existingMembership = await this.memberRepo.findOne({
        where: { workspace_id: workspaceId, user_id: targetUser.id },
      });

      if (existingMembership) {
        throw new ConflictException(
          'User is already a member of this workspace',
        );
      }

      const member = this.memberRepo.create({
        workspace_id: workspaceId,
        user_id: targetUser.id,
        role: dto.role || WorkspaceRole.MEMBER,
      });

      const savedMember = await this.memberRepo.save(member);

      return {
        success: true,
        type: 'MEMBER_ADDED',
        message: `${targetUser.name || targetUser.email} has been added to the workspace`,
        member: {
          id: savedMember.id,
          role: savedMember.role,
          user: {
            id: targetUser.id,
            name: targetUser.name,
            email: targetUser.email,
          },
        },
      };
    }

    // User does NOT exist in DB -> Create pending invitation entry and send email
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    let invitation = await this.invitationRepo.findOne({
      where: {
        workspace_id: workspaceId,
        email: cleanEmail,
        status: WorkspaceInvitationStatus.PENDING,
      },
    });

    if (invitation) {
      invitation.token = token;
      invitation.role = dto.role || WorkspaceRole.MEMBER;
      invitation.expires_at = expiresAt;
      invitation.inviter_id = inviterId;
    } else {
      invitation = this.invitationRepo.create({
        workspace_id: workspaceId,
        email: cleanEmail,
        role: dto.role || WorkspaceRole.MEMBER,
        inviter_id: inviterId,
        token,
        status: WorkspaceInvitationStatus.PENDING,
        expires_at: expiresAt,
      });
    }

    const savedInvitation = await this.invitationRepo.save(invitation);

    const frontendUrl =
      this.configService.get<string>('app.frontendUrl') ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';
    const inviteLink = `${frontendUrl}/accept-invite?token=${token}`;
    const inviterName =
      inviterMembership.user?.name ||
      inviterMembership.user?.email ||
      'A team member';

    try {
      await this.mailService.send({
        to: cleanEmail,
        subject: `You've been invited to join ${workspace.name} on TaskFlow`,
        template: MailTemplate.WORKSPACE_INVITATION,
        context: {
          workspaceName: workspace.name,
          inviterName,
          inviteLink,
        },
      });
    } catch (err: unknown) {
      console.warn(
        `[MailService] Warning: Could not deliver invitation email to ${cleanEmail}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    console.log(
      `\n========================================\n[TaskFlow] INVITATION LINK for ${cleanEmail}:\n${inviteLink}\n========================================\n`,
    );

    return {
      success: true,
      type: 'INVITATION_SENT',
      message: `Invitation sent to ${cleanEmail}`,
      invitation: {
        id: savedInvitation.id,
        email: savedInvitation.email,
        role: savedInvitation.role,
        token: savedInvitation.token,
        inviteLink,
        expires_at: savedInvitation.expires_at,
      },
    };
  }

  async getInvitationByToken(token: string) {
    if (!token) {
      throw new BadRequestException('Invitation token is required');
    }

    const invitation = await this.invitationRepo.findOne({
      where: { token },
      relations: ['workspace', 'inviter'],
    });

    if (!invitation) {
      throw new NotFoundException('Invalid invitation link');
    }

    if (invitation.status !== WorkspaceInvitationStatus.PENDING) {
      throw new BadRequestException(
        invitation.status === WorkspaceInvitationStatus.ACCEPTED
          ? 'This invitation has already been accepted'
          : 'This invitation is no longer valid',
      );
    }

    if (new Date() > new Date(invitation.expires_at)) {
      invitation.status = WorkspaceInvitationStatus.EXPIRED;
      await this.invitationRepo.save(invitation);
      throw new BadRequestException('This invitation link has expired');
    }

    return {
      valid: true,
      email: invitation.email,
      role: invitation.role,
      workspace: {
        id: invitation.workspace.id,
        name: invitation.workspace.name,
        slug: invitation.workspace.slug,
      },
      inviter: {
        name: invitation.inviter?.name || 'A team member',
        email: invitation.inviter?.email,
      },
      expires_at: invitation.expires_at,
    };
  }

  async acceptInvitation(token: string, dto: AcceptInviteDto, req: Request) {
    if (!token) {
      throw new BadRequestException('Invitation token is required');
    }

    const invitation = await this.invitationRepo.findOne({
      where: { token },
      relations: ['workspace'],
    });

    if (!invitation) {
      throw new NotFoundException('Invalid invitation link');
    }

    if (invitation.status !== WorkspaceInvitationStatus.PENDING) {
      throw new BadRequestException(
        invitation.status === WorkspaceInvitationStatus.ACCEPTED
          ? 'This invitation has already been accepted'
          : 'This invitation is no longer valid',
      );
    }

    if (new Date() > new Date(invitation.expires_at)) {
      invitation.status = WorkspaceInvitationStatus.EXPIRED;
      await this.invitationRepo.save(invitation);
      throw new BadRequestException('This invitation link has expired');
    }

    let user = await this.userRepo.findOne({
      where: { email: invitation.email },
      relations: ['roles'],
    });

    const hashedPassword = await this.passwordService.hash(dto.password);

    if (!user) {
      let role = await this.roleRepo.findOne({ where: { name: 'user' } });
      if (!role) {
        role = await this.roleRepo.save(
          this.roleRepo.create({ name: 'user', description: 'Standard user' }),
        );
      }

      user = this.userRepo.create({
        name: dto.name.trim(),
        first_name: dto.name.trim().split(' ')[0],
        last_name: dto.name.trim().split(' ').slice(1).join(' ') || undefined,
        email: invitation.email,
        password: hashedPassword,
        roles: [role],
        status: UserStatus.ACTIVE,
        email_verified_at: new Date(),
      });

      user = await this.userRepo.save(user);
    } else {
      user.name = dto.name.trim();
      user.password = hashedPassword;
      user.status = UserStatus.ACTIVE;
      if (!user.email_verified_at) {
        user.email_verified_at = new Date();
      }
      user = await this.userRepo.save(user);
    }

    // Add to workspace_members
    let member = await this.memberRepo.findOne({
      where: { workspace_id: invitation.workspace_id, user_id: user.id },
    });

    if (!member) {
      member = this.memberRepo.create({
        workspace_id: invitation.workspace_id,
        user_id: user.id,
        role: invitation.role,
      });
      await this.memberRepo.save(member);
    }

    // Mark invitation as accepted
    invitation.status = WorkspaceInvitationStatus.ACCEPTED;
    invitation.accepted_at = new Date();
    await this.invitationRepo.save(invitation);

    // Create session and JWT tokens for immediate login
    const tokens = await this.authService.createSessionForUser(user, req);

    return {
      message: 'Invitation accepted and account activated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
      workspace: invitation.workspace,
      tokens,
    };
  }

  async deleteWorkspace(
    workspaceId: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.owner_id !== userId) {
      throw new ForbiddenException(
        'Only the workspace owner can delete the workspace',
      );
    }

    await this.workspaceRepo.softDelete(workspaceId);
    return { success: true };
  }
}
