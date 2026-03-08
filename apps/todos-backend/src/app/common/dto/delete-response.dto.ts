import { ApiProperty } from '@nestjs/swagger';

export class DeleteResponseDto {
  @ApiProperty({ example: true })
  deleted!: true;

  @ApiProperty({ example: 'user-1' })
  id!: string;
}
