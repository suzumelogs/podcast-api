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
import { EpisodesService } from './episodes.service';
import { AccessTokenGuard } from 'src/common/gaurds/gaurd.access_token';
import { CollectionDto } from 'src/_dtos/input.dto';
import { Episode } from 'src/_schemas/episode.schema';
import { CreateEpisodeDto } from 'src/_dtos/create_episode.dto';
import { UpdateEpisodeDto } from 'src/_dtos/update_episode.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(AccessTokenGuard)
@Controller('episodes')
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Get()
  async findAll(
    @Query() query: CollectionDto,
    @Req() req: any,
  ): Promise<{ data: Episode[] }> {
    return this.episodesService.findAll(query, req.user);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.episodesService.findById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createEpisodeDto: CreateEpisodeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.episodesService.create(createEpisodeDto, file);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updateEpisodeDto: UpdateEpisodeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.episodesService.update(id, updateEpisodeDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.episodesService.remove(id);
  }
}
