import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEpisodeDto {
  @ApiProperty({
    description: 'Tiêu đề của tập',
    example: 'Episode 1: The Beginning',
  })
  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty' })
  title: string;

  @ApiProperty({
    description: 'Tên album của tập',
    example: 'The Great Journey',
  })
  @IsString()
  @IsNotEmpty({ message: 'Album must not be empty' })
  album: string;

  @ApiProperty({
    description: 'Tên nghệ sĩ của tập',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Artist must not be empty' })
  artist: string;

  @ApiPropertyOptional({
    description: 'artwork của tập (nếu có)',
    example: 'http://example.com/artwork.jpg',
  })
  artwork?: string;

  @ApiProperty({
    description: 'URL audio của tập',
    example: 'http://example.com/audio.mp3',
  })
  @IsString()
  @IsNotEmpty({ message: 'Audio URL must not be empty' })
  audioUrl: string;

  @ApiProperty({
    description: 'Mô tả của tập',
    example: 'This episode covers the beginning of the journey.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Description must not be empty' })
  description: string;

  @ApiProperty({
    description: 'ID của chương chứa tập này',
    example: '60d0fe4f5311236168a109ca',
  })
  @IsMongoId({ message: 'Invalid Chapter ID' })
  @IsNotEmpty({ message: 'Chapter ID must not be empty' })
  chapterId: string;
}
