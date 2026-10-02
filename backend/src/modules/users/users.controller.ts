import { ROLES } from '@common/constants/constants';
import { Roles } from '@common/decorators/roles.decorator';
import { QueryDto } from '@common/dto/query.dto';
import { RolesGuard } from '@common/guards/roles.guard';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import {
  Controller,
  Get,
  Patch,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UsersService } from './users.service';
import { AuthUser } from '@app-types/authUser.type';
import { User } from '@database/entities/user.entity';

@ApiBearerAuth()
@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private userService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @Get()
  @ApiOperation({
    summary: 'List all users with pagination and search (Admin only)',
  })
  @ApiResponse({ status: 200, description: 'Paginated user list retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden: Requires Admin role' })
  getUsers(@Req() req: Request, @Query() query: QueryDto) {
    return this.userService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN, ROLES.USER)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@Req() req: Request) {
    const user = req.user as AuthUser;
    const profile = await this.userService.findByEmail(user.email);
    if (profile && !profile.name) {
      profile.name =
        [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
        profile.email.split('@')[0];
    }
    return profile;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN, ROLES.USER)
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile (alias for /me)' })
  @ApiResponse({ status: 200, description: 'Current user profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: Request) {
    const user = req.user as AuthUser;
    const profile = await this.userService.findByEmail(user.email);
    if (profile && !profile.name) {
      profile.name =
        [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
        profile.email.split('@')[0];
    }
    return profile;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  async updateProfile(
    @Req() req: Request,
    @Body() dto: { name?: string; first_name?: string; last_name?: string },
  ) {
    const user = req.user as AuthUser;
    const updateData: Partial<User> = {};
    if (dto.name) {
      updateData.name = dto.name;
      const parts = dto.name.trim().split(' ');
      updateData.first_name = parts[0];
      if (parts.length > 1) updateData.last_name = parts.slice(1).join(' ');
    }
    if (dto.first_name) updateData.first_name = dto.first_name;
    if (dto.last_name) updateData.last_name = dto.last_name;

    return this.userService.updateUser(user.userId, updateData);
  }
}
