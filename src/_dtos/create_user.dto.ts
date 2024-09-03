import { IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Tên của người dùng',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email của người dùng',
    example: 'john.doe@example.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Mật khẩu của người dùng',
    example: 'securePassword123',
  })
  @IsString()
  password: string;

  @ApiPropertyOptional({
    description: 'Refresh token của người dùng (nếu có)',
    example: 'someRefreshTokenString',
  })
  refreshToken?: string;
}
