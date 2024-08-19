import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateEpisodeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsMongoId()
  chapterId: string;
}
