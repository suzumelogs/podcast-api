import { IsEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsEmpty()
  name: string;

  @IsString()
  @IsEmpty()
  description: string;

  imageUrl?: string;
}
