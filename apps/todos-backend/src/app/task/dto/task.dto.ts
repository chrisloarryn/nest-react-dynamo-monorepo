import { Type } from 'class-transformer';
import { IsHexColor, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '../interfaces/task.interface';

export class TaskLabelDto {
  @ApiProperty({ example: '#0079bf' })
  @IsHexColor()
  bg!: string;

  @ApiProperty({ example: 'performance' })
  @IsString()
  type!: string;
}

export class TaskDto {
  @ApiProperty({ example: 'task-1' })
  id!: string;

  @ApiPropertyOptional({ example: 'Add title' })
  title?: string;

  @ApiProperty({ example: 'Create the validate workflow' })
  text!: string;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.TODO })
  status!: TaskStatus;

  @ApiProperty({ example: 'task' })
  type!: string;

  @ApiProperty({ example: 1 })
  order!: number;

  @ApiProperty({ example: 'board-1' })
  boardId!: string;

  @ApiProperty({ example: 'column-1' })
  columnId!: string;

  @ApiProperty({ example: 'user-1' })
  userId!: string;

  @ApiPropertyOptional({ example: 'user-2' })
  assignedTo?: string;

  @ApiPropertyOptional({ type: () => TaskLabelDto })
  @Type(() => TaskLabelDto)
  label?: TaskLabelDto;

  @ApiPropertyOptional({ example: false, default: false })
  archived?: boolean;
}
