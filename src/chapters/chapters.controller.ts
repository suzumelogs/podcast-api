import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { AccessTokenGuard } from 'src/common/gaurds/gaurd.access_token';
import { CollectionDto } from 'src/_dtos/input.dto';
import { Chapter } from 'src/_schemas/chapter.schema';
import { CreateChapterDto } from 'src/_dtos/create_chapter.dto';
import { UpdateChapterDto } from 'src/_dtos/update_chapter.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(AccessTokenGuard)
@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Get()
  async findAll(
    @Query() query: CollectionDto,
    @Req() req: any,
  ): Promise<{ data: Chapter[] }> {
    return this.chaptersService.findAll(query, req.user);
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
