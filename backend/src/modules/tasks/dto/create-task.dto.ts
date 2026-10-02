import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TaskPriority } from '@common/constants/constants';

export class CreateTaskDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  project_id!: string;

  @ApiProperty({ example: 'Implement Redis token session blacklist' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    example: 'Configure Redis connection pooling and TTL key expiry',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ default: 'TODO', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  column_id?: string;

  @ApiProperty({
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
    required: false,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({ example: 1000, required: false })
  @IsNumber()
  @IsOptional()
  position?: number;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  assignee_id?: string;

  @ApiProperty({ example: '2026-03-15T00:00:00.000Z', required: false })
  @IsOptional()
  due_date?: Date;

  @ApiProperty({ example: ['Backend', 'Security'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
