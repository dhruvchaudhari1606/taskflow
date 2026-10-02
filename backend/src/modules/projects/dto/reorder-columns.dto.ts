import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class ReorderColumnsDto {
  @ApiProperty({
    example: [
      'c8b56d35-950c-4fa2-bf6a-493202e21950',
      'd5e219b6-8977-4cac-843d-9043b2c658a5',
    ],
    description: 'Array of column UUIDs in desired order',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  columnIds!: string[];
}
