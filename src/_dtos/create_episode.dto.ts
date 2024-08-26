import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateEpisodeDto {
  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Album must not be empty' })
  album: string;

  @IsString()
  @IsNotEmpty({ message: 'Artist must not be empty' })
  artist: string;

  artWork?: string;

  @IsString()
  @IsNotEmpty({ message: 'Description must not be empty' })
  description: string;

  @IsMongoId({ message: 'Invalid Chapter ID' })
  @IsNotEmpty({ message: 'Chapter ID must not be empty' })
  chapterId: string;
}
