import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CookieService } from '@modules/auth/cookies/cookie.service';
import { AuthUser } from '@app-types/authUser.type';

@ApiTags('Workspaces')
@Controller({
  path: 'workspaces',
  version: '1',
})
export class WorkspacesController {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly cookieService: CookieService,
  ) {}

  // ─── Public Invitation Endpoints (Must precede parameterized :id routes) ───

  @Get('invitations/:token')
  @ApiOperation({ summary: 'Get invitation details by token (Public)' })
  @ApiResponse({ status: 200, description: 'Invitation details' })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired invitation token',
  })
  getInvitationByToken(@Param('token') token: string) {
    return this.workspacesService.getInvitationByToken(token);
  }

  @Post('invitations/:token/accept')
  @ApiOperation({
    summary: 'Accept invitation and register or join workspace (Public)',
  })
  @ApiResponse({
    status: 200,
    description: 'Invitation accepted and session created',
  })
  async acceptInvitation(
    @Param('token') token: string,
    @Body() dto: AcceptInviteDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.workspacesService.acceptInvitation(
      token,
      dto,
      req,
    );
    this.cookieService.setAuthCookies(res, result.tokens);
    return {
      message: result.message,
      user: result.user,
      workspace: result.workspace,
    };
  }

  // ─── Protected Workspace Endpoints ──────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new multi-tenant workspace' })
  @ApiResponse({ status: 201, description: 'Workspace created successfully' })
  createWorkspace(@Req() req: Request, @Body() createDto: CreateWorkspaceDto) {
    const user = req.user as AuthUser;
    return this.workspacesService.createWorkspace(user.userId, createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all workspaces for the current user' })
  @ApiResponse({ status: 200, description: 'List of user workspaces' })
  getUserWorkspaces(@Req() req: Request) {
    const user = req.user as AuthUser;
    return this.workspacesService.getUserWorkspaces(user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get workspace details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Workspace details with members and projects',
  })
  getWorkspaceById(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const user = req.user as AuthUser;
    return this.workspacesService.getWorkspaceById(id, user.userId);
  }

  @Get(':id/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all members belonging to a workspace' })
  @ApiResponse({ status: 200, description: 'List of workspace members' })
  getWorkspaceMembers(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const user = req.user as AuthUser;
    return this.workspacesService.getWorkspaceMembers(id, user.userId);
  }

  @Get(':id/invitations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all pending invitations for a workspace' })
  @ApiResponse({ status: 200, description: 'List of pending invitations' })
  getWorkspaceInvitations(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const user = req.user as AuthUser;
    return this.workspacesService.getWorkspaceInvitations(id, user.userId);
  }

  @Delete(':id/invitations/:invitationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a pending workspace invitation' })
  @ApiResponse({ status: 200, description: 'Invitation revoked successfully' })
  revokeInvitation(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
  ) {
    const user = req.user as AuthUser;
    return this.workspacesService.revokeInvitation(
      id,
      invitationId,
      user.userId,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update workspace details' })
  @ApiResponse({ status: 200, description: 'Workspace updated successfully' })
  updateWorkspace(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateWorkspaceDto,
  ) {
    const user = req.user as AuthUser;
    return this.workspacesService.updateWorkspace(id, user.userId, updateDto);
  }

  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Invite a member to the workspace or add existing user',
  })
  @ApiResponse({
    status: 201,
    description: 'Member invited or added successfully',
  })
  inviteMember(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() inviteDto: InviteMemberDto,
  ) {
    const user = req.user as AuthUser;
    return this.workspacesService.inviteMember(id, user.userId, inviteDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete (archive) a workspace' })
  @ApiResponse({ status: 200, description: 'Workspace deleted successfully' })
  deleteWorkspace(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    const user = req.user as AuthUser;
    return this.workspacesService.deleteWorkspace(id, user.userId);
  }
}
