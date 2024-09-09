import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChapterDto {
  @ApiProperty({
    description: 'The name or title of the chapter',
    example: 'Chapter 1: Introduction',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name must not be empty' })
  name: string;

  @ApiProperty({
    description: 'A brief description of the chapter',
    example: 'This chapter covers the basics of the book.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Description must not be empty' })
  description: string;

  @ApiPropertyOptional({
    description:
      'An optional URL that links to additional resources or information about this chapter, such as an online version or reference page.',
    example: 'http://example.com/chapter-url',
  })
  url?: string;

  @ApiProperty({
    description:
      'The unique MongoDB ID of the book to which this chapter belongs',
    example: '60d0fe4f5311236168a109ca',
  })
  @IsMongoId({ message: 'Invalid Book ID' })
  @IsNotEmpty({ message: 'Book Id must not be empty' })
  bookId: string;
}
