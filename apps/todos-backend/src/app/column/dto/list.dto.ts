import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ListDto {
  @ApiProperty({ example: 'column-1' })
  id!: string;

  @ApiProperty({ example: 'In Progress' })
  name!: string;

  @ApiProperty({ example: 2 })
  order!: number;

  @ApiProperty({ example: 'board-1' })
  boardId!: string;

  @ApiPropertyOptional({ example: false, default: false })
  archived?: boolean;

  @ApiPropertyOptional({ type: [String], example: ['task-1', 'task-2'] })
  tasks?: string[];
}
