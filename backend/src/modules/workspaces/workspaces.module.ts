import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from '@database/entities/workspace.entity';
import { WorkspaceMember } from '@database/entities/workspace-member.entity';
import { WorkspaceInvitation } from '@database/entities/workspace-invitation.entity';
import { User } from '@database/entities/user.entity';
import { Role } from '@database/entities/role.entity';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { MailModule } from '@modules/mail/mail.module';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workspace,
      WorkspaceMember,
      WorkspaceInvitation,
      User,
      Role,
    ]),
    MailModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [WorkspacesController],
  providers: [WorkspacesService],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
