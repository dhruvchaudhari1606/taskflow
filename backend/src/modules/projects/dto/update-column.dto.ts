import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateColumnDto {
  @ApiProperty({ example: 'QA & Review', required: false })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: '#0891b2', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  color?: string;

  @ApiProperty({ example: 2000, required: false })
  @IsNumber()
  @IsOptional()
  position?: number;
}
