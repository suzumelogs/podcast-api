import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'admin@gmail.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'The password associated with the user account',
    example: 'admin@123',
  })
  @IsString()
  password: string;
}
