import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBoardDto {
  @ApiProperty({ example: 'Validate roadmap' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'https://images.example.com/board.jpg' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  backgroundImage?: string;

  @ApiProperty({ example: 'user-1' })
  @IsString()
  createdBy!: string;

  @ApiPropertyOptional({ example: '2026-03-08T12:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dateCreated?: string;

  @ApiPropertyOptional({ type: [String], example: ['user-1', 'user-2'] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  users?: string[];
}
