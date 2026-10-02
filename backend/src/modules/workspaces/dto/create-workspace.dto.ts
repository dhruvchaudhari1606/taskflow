import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateWorkspaceDto {
  @ApiProperty({ example: 'Alpha Operations' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'alpha-operations', required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    example: 'Primary cross-functional operations workspace',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
