import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateChapterDto {
  @IsString()
  @IsNotEmpty({ message: 'Name must not be empty' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description must not be empty' })
  description: string;

  url?: string;

  @IsMongoId()
  @IsNotEmpty({ message: 'BookId must not be empty' })
  bookId: string;
}
