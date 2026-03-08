import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Ada Lovelace' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: 'ada@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({
    example: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  avatarUrl?: string;
}
