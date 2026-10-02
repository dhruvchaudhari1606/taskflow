import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ProjectStatus } from '@common/constants/constants';

export class CreateProjectDto {
  @ApiProperty({ example: 'Platform Execution Core' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @ApiProperty({ example: 'EXEC' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  key!: string;

  @ApiProperty({
    example: 'Primary core execution roadmap and architecture milestones',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Engineering', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
    required: false,
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  lead_id?: string;

  @ApiProperty({ example: '2026-03-31T00:00:00.000Z', required: false })
  @IsOptional()
  target_date?: Date;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  workspace_id!: string;
}
