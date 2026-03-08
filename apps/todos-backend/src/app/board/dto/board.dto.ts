import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BoardDto {
  @ApiProperty({ example: 'board-1' })
  id!: string;

  @ApiProperty({ example: 'Product roadmap' })
  name!: string;

  @ApiPropertyOptional({ example: 'https://images.example.com/board.jpg' })
  backgroundImage?: string;

  @ApiProperty({ example: 'user-1' })
  createdBy!: string;

  @ApiPropertyOptional({ example: '2026-03-08T12:00:00.000Z' })
  dateCreated?: string;

  @ApiPropertyOptional({ type: [String], example: ['user-1', 'user-2'] })
  users?: string[];
}
