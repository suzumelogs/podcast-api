import { IsEmpty, IsString } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsEmpty()
  name: string;

  @IsString()
  @IsEmpty()
  description: string;

  url?: string;
}
