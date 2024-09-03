import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({
    description: 'Email của người dùng',
    example: 'admin@gmail.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Mật khẩu của người dùng',
    example: 'admin@123',
  })
  @IsString()
  password: string;
}
