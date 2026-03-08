import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateListDto {
  @ApiProperty({ example: 'In Progress' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  order!: number;

  @ApiProperty({ example: 'board-1' })
  @IsString()
  boardId!: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  archived?: boolean;

  @ApiPropertyOptional({ type: [String], example: ['task-1', 'task-2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tasks?: string[];
}
