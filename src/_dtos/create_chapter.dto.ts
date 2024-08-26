import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateChapterDto {
  @IsString()
  @IsNotEmpty({ message: 'Name must not be empty' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Description must not be empty' })
  description: string;

  url?: string;

  @IsMongoId({ message: 'Invalid Book ID' })
  @IsNotEmpty({ message: 'Book Id must not be empty' })
  bookId: string;
}
