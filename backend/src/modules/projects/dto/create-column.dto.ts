import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateColumnDto {
  @ApiProperty({ example: 'Development Done' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: '#4F46E5', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  color?: string;

  @ApiProperty({ example: 1000, required: false })
  @IsNumber()
  @IsOptional()
  position?: number;
}
