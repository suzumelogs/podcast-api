import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty({ message: 'Name must not be empty' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Description must not be empty' })
  description: string;

  url?: string;
}
