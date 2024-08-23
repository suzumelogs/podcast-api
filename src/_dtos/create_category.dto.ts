import { IsString, Length } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Length(3, 50)
  name: string;

  @IsString()
  @Length(10, 255)
  description: string;

  imageUrl?: string;
}
