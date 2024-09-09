import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEpisodeDto {
  @ApiProperty({
    description: 'The title of the episode',
    example: 'Episode 1: The Beginning',
  })
  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty' })
  title: string;

  @ApiProperty({
    description: 'The name of the album to which this episode belongs',
    example: 'The Great Journey',
  })
  @IsString()
  @IsNotEmpty({ message: 'Album must not be empty' })
  album: string;

  @ApiProperty({
    description: 'The name of the artist responsible for this episode',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Artist must not be empty' })
  artist: string;

  @ApiPropertyOptional({
    description:
      'An optional URL pointing to the artwork associated with this episode, such as a cover image',
    example: 'http://example.com/artwork.jpg',
  })
  artwork?: string;

  @ApiProperty({
    description:
      'The URL where the episode can be accessed or streamed, such as a link to an audio file or a streaming service',
    example: 'http://example.com/url.mp3',
  })
  @IsString()
  @IsNotEmpty({ message: 'URL must not be empty' })
  url: string;

  @ApiProperty({
    description: 'A brief description of the episode',
    example: 'This episode covers the beginning of the journey.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Description must not be empty' })
  description: string;

  @ApiProperty({
    description:
      'The unique MongoDB ID of the chapter to which this episode belongs',
    example: '60d0fe4f5311236168a109ca',
  })
  @IsMongoId({ message: 'Invalid Chapter ID' })
  @IsNotEmpty({ message: 'Chapter ID must not be empty' })
  chapterId: string;
}
