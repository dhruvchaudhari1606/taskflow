import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class ReorderTaskDto {
  @ApiProperty({
    example: 'IN_PROGRESS',
    description: 'Column status key or title',
  })
  @IsString()
  @IsNotEmpty()
  status!: string;

  @ApiProperty({
    example: 2500,
    description: 'New order position index in target column',
  })
  @IsNumber()
  @IsNotEmpty()
  position!: number;

  @ApiProperty({
    example: 'c8b56d35-950c-4fa2-bf6a-493202e21950',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  column_id?: string;
}
