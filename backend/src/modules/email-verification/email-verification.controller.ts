import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { EmailVerificationService } from './email-verification.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class EmailVerificationController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address using verification token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification token',
  })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.emailVerificationService.verifyEmail(dto);
    return {
      message: 'Email verified successfully',
    };
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address using 6-digit OTP' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const user = await this.emailVerificationService.verifyOtp(
      dto.email,
      dto.otp,
    );
    return {
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend 6-digit verification OTP' })
  async resendOtp(@Body() dto: ResendVerificationDto) {
    await this.emailVerificationService.resendVerificationOtp(dto.email);
    return {
      message:
        'If your account requires verification, a new verification code has been sent.',
    };
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend email verification link with enumeration protection',
  })
  async resendVerification(@Body() dto: ResendVerificationDto) {
    await this.emailVerificationService.resendVerification(dto);
    return {
      message:
        'If your account requires verification, a new verification link has been sent.',
    };
  }
}
