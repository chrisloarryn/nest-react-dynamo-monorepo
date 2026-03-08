import { ApiProperty } from '@nestjs/swagger';

export class ApiMessageDto {
  @ApiProperty({ example: 'Hello API' })
  message!: string;
}
