import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create_book.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;
}
