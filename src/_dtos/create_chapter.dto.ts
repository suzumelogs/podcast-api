import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChapterDto {
  @ApiProperty({
    description: 'Tên của chương',
    example: 'Chapter 1: Introduction',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name must not be empty' })
  name: string;

  @ApiProperty({
    description: 'Mô tả của chương',
    example: 'This chapter covers the basics of the book.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Description must not be empty' })
  description: string;

  @ApiPropertyOptional({
    description: 'URL liên kết đến chương (nếu có)',
    example: 'http://example.com/chapter-url',
  })
  url?: string;

  @ApiProperty({
    description: 'ID của cuốn sách chứa chương này',
    example: '60d0fe4f5311236168a109ca',
  })
  @IsMongoId({ message: 'Invalid Book ID' })
  @IsNotEmpty({ message: 'Book Id must not be empty' })
  bookId: string;
}
