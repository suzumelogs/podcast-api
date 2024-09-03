import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { AccessTokenGuard } from '../common/gaurds/gaurd.access_token';
import { Book } from '../_schemas/book.schema';
import { CreateBookDto } from '../_dtos/create_book.dto';
import { UpdateBookDto } from '../_dtos/update_book.dto';
import { CollectionDto } from '../_dtos/input.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Books')
@ApiBearerAuth('JWT-auth')
@UseGuards(AccessTokenGuard)
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  async findAll(@Query() query: CollectionDto): Promise<{ data: Book[] }> {
    return this.booksService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.booksService.findById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.booksService.create(createBookDto, file);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.booksService.update(id, updateBookDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }

  @Get('value-labels/book')
  async getBookValueLabels() {
    const valueLabels = await this.booksService.getBookValueLabels();
    return valueLabels;
  }
}
