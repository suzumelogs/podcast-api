import { IsOptional, IsString, IsDate, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'The full name of the user',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'The date of birth of the user',
    type: Date,
    required: false,
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDate()
  dateOfBirth?: Date;

  @ApiProperty({
    description: 'The gender of the user',
    type: String,
    required: false,
    example: 'male',
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({
    description: 'The address of the user',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'The phone number of the user',
    type: String,
    required: false,
    example: '+1234567890',
  })
  @IsOptional()
  @IsPhoneNumber(null)
  phoneNumber?: string;
}
