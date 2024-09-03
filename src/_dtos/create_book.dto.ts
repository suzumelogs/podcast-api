import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({
    description: 'Tên của cuốn sách',
    example: 'The Great Gatsby',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name must not be empty' })
  name: string;

  @ApiProperty({
    description: 'Mô tả của cuốn sách',
    example: 'A novel set in the 1920s about the mysterious Jay Gatsby.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Description must not be empty' })
  description: string;

  @ApiPropertyOptional({
    description: 'URL liên kết đến cuốn sách (nếu có)',
    example: 'http://example.com/book-url',
  })
  url?: string;
}
