import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({
    description: 'The title of the book',
    example: 'The Great Gatsby',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name must not be empty' })
  name: string;

  @ApiProperty({
    description: 'A brief description or summary of the book',
    example: 'A novel set in the 1920s about the mysterious Jay Gatsby.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Description must not be empty' })
  description: string;

  @ApiPropertyOptional({
    description:
      'An optional URL that links to more information about the book, such as a purchase page or additional resources',
    example: 'http://example.com/book-url',
  })
  url?: string;
}
