import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'The current password of the user.',
    example: 'current_password123',
  })
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description:
      'The new password for the user. Must be between 6 and 20 characters long.',
    example: 'new_password456',
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  newPassword: string;
}
