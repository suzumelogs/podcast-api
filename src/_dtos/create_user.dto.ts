import { IsDateString, IsOptional, IsString } from 'class-validator';
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

  refreshToken?: string;

  @ApiPropertyOptional({
    description: 'Ngày sinh của người dùng (nếu có)',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Giới tính của người dùng (nếu có)',
    example: 'male',
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ của người dùng (nếu có)',
    example: '123 Main St',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Số điện thoại của người dùng (nếu có)',
    example: '+123456789',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
