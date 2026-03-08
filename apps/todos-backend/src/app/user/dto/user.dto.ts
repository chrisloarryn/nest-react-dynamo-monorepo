import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: 'user-1' })
  id!: string;

  @ApiProperty({ example: 'Ada Lovelace' })
  fullName!: string;

  @ApiProperty({ example: 'ada@example.com' })
  email!: string;

  @ApiPropertyOptional({
    example: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
  })
  avatarUrl?: string;
}
