import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateChapterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  imageUrl?: string;

  @IsMongoId()
  categoryId: string;
}
