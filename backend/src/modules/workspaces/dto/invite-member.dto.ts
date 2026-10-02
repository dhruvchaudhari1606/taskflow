import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { WorkspaceRole } from '@common/constants/constants';

export class InviteMemberDto {
  @ApiProperty({ example: 'member@company.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    enum: WorkspaceRole,
    default: WorkspaceRole.MEMBER,
    required: false,
  })
  @IsEnum(WorkspaceRole)
  @IsOptional()
  role?: WorkspaceRole;
}
