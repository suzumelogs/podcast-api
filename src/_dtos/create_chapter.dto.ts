import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateChapterDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  imageUrl: string;

  @IsMongoId()
  bookId: string;
}
