import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { UsersService } from '@modules/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoggerService } from '@common/logger/logger.service';
import { SessionService } from './sessions/session.service';
import { TokenService } from './tokens/token.service';
import { PasswordService } from './password/password.service';
import { AuditService } from '@modules/audit/audit.service';
import { Request } from 'express';
import { getDeviceInfo } from '@common/utils/device.util';
import { AuditEvent, UserStatus } from '@common/constants/constants';
import { EmailVerificationService } from '@modules/email-verification/email-verification.service';
import { WorkspacesService } from '@modules/workspaces/workspaces.service';
import { VerifyOtpDto } from '@modules/email-verification/dto/verify-otp.dto';
import { ResendVerificationDto } from '@modules/email-verification/dto/resend-verification.dto';
import { User } from '@database/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  private getRefreshExpirationDate(): Date {
    const refreshExpiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') || '30d';
    const refreshTtlMs =
      typeof ms === 'function'
        ? (ms(refreshExpiresIn as StringValue) ?? 30 * 24 * 60 * 60 * 1000)
        : 30 * 24 * 60 * 60 * 1000;
    return new Date(Date.now() + refreshTtlMs);
  }

  async createSessionForUser(user: User, req: Request) {
    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.roles?.[0]?.name || user.role?.name || 'user',
      tokenVersion: user.token_version,
    });

    const userAgent = (req.headers?.['user-agent'] as string) || '';
    const deviceInfo = getDeviceInfo(userAgent);
    const ipAddress = req.ips?.length ? req.ips[0] : req.ip;
    const expiresAt = this.getRefreshExpirationDate();

    const sessionDetails = await this.sessionService.createSession({
      user_id: user.id,
      ...deviceInfo,
      ip_address: ipAddress,
      expires_at: expiresAt,
      last_active_at: new Date(),
    });

    const refreshToken = this.tokenService.generateRefreshToken({
      sub: user.id,
      sessionId: sessionDetails.id,
      tokenVersion: user.token_version,
    });

    const refreshTokenHash =
      await this.tokenService.hashRefreshToken(refreshToken);

    await this.sessionService.updateSessionToken(
      sessionDetails.id,
      refreshTokenHash,
      expiresAt,
    );

    await this.usersService.updateLastLogin(user.id);

    return {
      accessToken,
      refreshToken,
      expiresAt,
    };
  }

  async register(registerDetails: RegisterDto) {
    try {
      const existingUser = await this.usersService.findByEmail(
        registerDetails.email,
      );

      if (existingUser) {
        // If user is already registered and verified, disallow registration
        if (
          existingUser.email_verified_at &&
          existingUser.status === UserStatus.ACTIVE
        ) {
          this.logger.warn(
            `User already registered and verified: ${registerDetails.email}`,
            AuthService.name,
          );
          throw new ConflictException(
            'An account with this email already exists and is verified. Please log in.',
          );
        }

        // User exists but has not completed OTP verification:
        // Allow re-registration, update password, and send a fresh OTP!
        const hashedPassword = await this.passwordService.hash(
          registerDetails.password,
        );
        await this.usersService.updateUser(existingUser.id, {
          name: registerDetails.name,
          first_name:
            registerDetails.firstName || registerDetails.name.split(' ')[0],
          last_name:
            registerDetails.lastName ||
            registerDetails.name.split(' ').slice(1).join(' ') ||
            undefined,
          password: hashedPassword,
          status: UserStatus.PENDING_VERIFICATION,
          email_verified_at: null,
        });

        await this.emailVerificationService.sendVerification(existingUser);

        this.logger.log(
          `Re-registration allowed for unverified user: ${registerDetails.email}`,
          AuthService.name,
        );

        return {
          message: 'Verification code sent to your email',
          email: existingUser.email,
          requiresOtp: true,
        };
      }

      // Fresh registration
      const user = await this.usersService.createUser(registerDetails);

      await this.auditService.log({
        userId: user.id,
        event: AuditEvent.AUTH_REGISTER,
        metadata: { email: registerDetails.email },
      });

      await this.emailVerificationService.sendVerification(user);

      return {
        message: 'Account created. Verification code sent to your email.',
        email: user.email,
        requiresOtp: true,
      };
    } catch (error) {
      this.logger.error(
        `Registration failed for ${registerDetails.email}`,
        error instanceof Error ? error.stack : String(error),
        AuthService.name,
      );
      throw error;
    }
  }

  async verifyOtp(dto: VerifyOtpDto, req: Request) {
    const user = await this.emailVerificationService.verifyOtp(
      dto.email,
      dto.otp,
    );

    // Auto-create initial workspace if none exists
    const existingWorkspaces = await this.workspacesService.getUserWorkspaces(
      user.id,
    );
    let activeWorkspace = existingWorkspaces[0];

    if (!activeWorkspace) {
      const wsName =
        dto.workspaceName?.trim() ||
        `${user.first_name || user.name || 'My'}'s Workspace`;
      activeWorkspace = await this.workspacesService.createWorkspace(user.id, {
        name: wsName,
      });
    }

    const sessionTokens = await this.createSessionForUser(user, req);

    return {
      message: 'Account verified and signed in successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.roles?.[0]?.name || 'user',
        status: user.status,
      },
      workspace: activeWorkspace,
      tokens: sessionTokens,
    };
  }

  async resendOtp(dto: ResendVerificationDto) {
    await this.emailVerificationService.resendVerificationOtp(dto.email);
    return {
      message:
        'If an unverified account exists for this email, a new verification code has been sent.',
      email: dto.email,
    };
  }

  async login(loginDto: LoginDto, req: Request) {
    try {
      this.logger.log('Login attempt', AuthService.name);
      const user = await this.usersService.findByEmail(loginDto.email);

      if (!user) {
        await this.auditService.log({
          event: AuditEvent.AUTH_LOGIN_FAILURE,
          metadata: { email: loginDto.email, reason: 'user_not_found' },
        });
        throw new UnauthorizedException('Invalid credentials');
      }

      if (user.status === UserStatus.PENDING_VERIFICATION) {
        await this.auditService.log({
          userId: user.id,
          event: AuditEvent.AUTH_LOGIN_FAILURE,
          metadata: { email: loginDto.email, status: user.status },
        });
        throw new UnauthorizedException(
          'Please verify your email before logging in',
        );
      }

      if (
        user.status === UserStatus.LOCKED ||
        user.status === UserStatus.DISABLED
      ) {
        await this.auditService.log({
          userId: user.id,
          event: AuditEvent.AUTH_LOGIN_FAILURE,
          metadata: { email: loginDto.email, status: user.status },
        });
        throw new UnauthorizedException(`Account is ${user.status}`);
      }

      const isPasswordValid = await this.passwordService.compare(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        await this.auditService.log({
          userId: user.id,
          event: AuditEvent.AUTH_LOGIN_FAILURE,
          metadata: { email: loginDto.email, reason: 'invalid_password' },
        });
        throw new UnauthorizedException('Invalid credentials');
      }

      const accessToken = this.tokenService.generateAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role?.name || 'user',
        tokenVersion: user.token_version,
      });

      // Extract device info from user-agent
      const userAgent = (req.headers?.['user-agent'] as string) || '';
      const deviceInfo = getDeviceInfo(userAgent);

      const ipAddress = req.ips?.length ? req.ips[0] : req.ip;

      const expiresAt = this.getRefreshExpirationDate();

      const sessionDetails = await this.sessionService.createSession({
        user_id: user.id,
        ...deviceInfo,
        ip_address: ipAddress,
        expires_at: expiresAt,
        last_active_at: new Date(),
      });

      const refreshToken = this.tokenService.generateRefreshToken({
        sub: user.id,
        sessionId: sessionDetails.id,
        tokenVersion: user.token_version,
      });

      const refreshTokenHash =
        await this.tokenService.hashRefreshToken(refreshToken);

      await this.sessionService.updateSessionToken(
        sessionDetails.id,
        refreshTokenHash,
        expiresAt,
      );

      await this.usersService.updateLastLogin(user.id);

      await this.auditService.log({
        userId: user.id,
        event: AuditEvent.AUTH_LOGIN_SUCCESS,
        ipAddress,
        userAgent,
        metadata: { sessionId: sessionDetails.id },
      });

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name:
            user.name ||
            [user.first_name, user.last_name].filter(Boolean).join(' ') ||
            user.email.split('@')[0],
          email: user.email,
        },
      };
    } catch (error) {
      this.logger.error(
        `Login failed for ${loginDto.email}`,
        error instanceof Error ? error.stack : String(error),
        AuthService.name,
      );
      throw error;
    }
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.tokenService.verifyRefreshToken(refreshToken);

      const { sub: userId, sessionId, tokenVersion } = payload;

      const userDetails = await this.usersService.findById(userId);

      if (!userDetails) {
        throw new UnauthorizedException('User not found');
      }

      if (
        userDetails.status === UserStatus.LOCKED ||
        userDetails.status === UserStatus.DISABLED
      ) {
        throw new UnauthorizedException(`Account is ${userDetails.status}`);
      }

      if (userDetails.token_version !== tokenVersion) {
        throw new UnauthorizedException('Token has been revoked');
      }

      const newAccessToken = this.tokenService.generateAccessToken({
        sub: userId,
        email: userDetails.email,
        role: userDetails.role?.name || 'user',
        tokenVersion: userDetails.token_version,
      });

      const newRefreshToken = this.tokenService.generateRefreshToken({
        sub: userId,
        sessionId,
        tokenVersion: userDetails.token_version,
      });

      const newHash = await this.tokenService.hashRefreshToken(newRefreshToken);

      const expiresAt = this.getRefreshExpirationDate();

      // Concurrency-protected pessimistic locking rotation
      try {
        await this.sessionService.rotateSessionToken(
          sessionId,
          refreshToken,
          newHash,
          expiresAt,
        );
      } catch (rotationError) {
        if (
          rotationError instanceof UnauthorizedException &&
          rotationError.message === 'Refresh token reuse detected'
        ) {
          // Account-wide emergency kill switch: invalidate all active sessions and tokens
          await this.sessionService.revokeAllUserSessions(userId);
          await this.usersService.incrementTokenVersion(userId);

          await this.auditService.log({
            userId,
            event: AuditEvent.AUTH_REFRESH_REUSE_DETECTED,
            metadata: { sessionId },
          });
        }
        throw rotationError;
      }

      await this.auditService.log({
        userId,
        event: AuditEvent.AUTH_REFRESH,
        metadata: { sessionId },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      this.logger.error(
        'Token refresh failed',
        error instanceof Error ? error.stack : String(error),
        AuthService.name,
      );
      throw error;
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = await this.tokenService.verifyRefreshToken(refreshToken);

      const { sub: userId, sessionId } = payload;

      await this.sessionService.revokeSession(sessionId);

      await this.auditService.log({
        userId,
        event: AuditEvent.AUTH_LOGOUT,
        metadata: { sessionId },
      });
    } catch (error) {
      this.logger.error(
        'Logout failed',
        error instanceof Error ? error.stack : String(error),
        AuthService.name,
      );
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await this.sessionService.revokeAllUserSessions(userId);
    await this.usersService.incrementTokenVersion(userId);

    await this.auditService.log({
      userId,
      event: AuditEvent.AUTH_LOGOUT_ALL,
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findExistUserById(userId);

    const isCurrentPasswordValid = await this.passwordService.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password does not match');
    }

    const isDevDefault =
      (process.env.APP_ENV === 'development' ||
        process.env.NODE_ENV !== 'production') &&
      newPassword === 'password123';
    if (!isDevDefault) {
      const validation = this.passwordService.validateStrength(newPassword);
      if (!validation.isValid) {
        throw new BadRequestException(
          validation.message || 'Password does not meet security requirements',
        );
      }
    }

    const hashedPassword = await this.passwordService.hash(newPassword);
    await this.usersService.updateUser(userId, {
      password: hashedPassword,
    });
    await this.usersService.incrementTokenVersion(userId);

    await this.auditService.log({
      userId,
      event: AuditEvent.PASSWORD_CHANGED,
    });

    return { message: 'Password changed successfully' };
  }
}
