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
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateChapterDto } from 'src/_dtos/create_chapter.dto';
import { CollectionDto } from 'src/_dtos/input.dto';
import { UpdateChapterDto } from 'src/_dtos/update_chapter.dto';
import { Chapter } from 'src/_schemas/chapter.schema';
import { AccessTokenGuard } from 'src/common/gaurds/gaurd.access_token';
import { ChaptersService } from './chapters.service';

@UseGuards(AccessTokenGuard)
@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Get()
  async findAll(@Query() query: CollectionDto): Promise<{ data: Chapter[] }> {
    return this.chaptersService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.chaptersService.findById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createChapterDto: CreateChapterDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.chaptersService.create(createChapterDto, file);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updateChapterDto: UpdateChapterDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.chaptersService.update(id, updateChapterDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chaptersService.remove(id);
  }
}
