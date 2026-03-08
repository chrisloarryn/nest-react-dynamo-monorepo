import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '../interfaces/task.interface';
import { TaskLabelDto } from './task.dto';

export class CreateTaskDto {
  @ApiPropertyOptional({ example: 'Add title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Implement OpenAPI contracts' })
  @IsString()
  text!: string;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.TODO })
  @IsEnum(TaskStatus)
  status!: TaskStatus;

  @ApiProperty({ example: 'task' })
  @IsString()
  type!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  order!: number;

  @ApiProperty({ example: 'board-1' })
  @IsString()
  boardId!: string;

  @ApiProperty({ example: 'column-1' })
  @IsString()
  columnId!: string;

  @ApiProperty({ example: 'user-1' })
  @IsString()
  userId!: string;

  @ApiPropertyOptional({ example: 'user-2' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ type: () => TaskLabelDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TaskLabelDto)
  label?: TaskLabelDto;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  archived?: boolean;
}
