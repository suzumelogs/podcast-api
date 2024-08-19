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
} from '@nestjs/common';
import { EpisodesService } from './episodes.service';
import { AccessTokenGuard } from 'src/common/gaurds/gaurd.access_token';
import { CollectionDto } from 'src/_dtos/input.dto';
import { Episode } from 'src/_schemas/episode.schema';
import { CreateEpisodeDto } from 'src/_dtos/create_episode.dto';
import { UpdateEpisodeDto } from 'src/_dtos/update_episode.dto';

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
  create(@Body() createEpisodeDto: CreateEpisodeDto) {
    return this.episodesService.create(createEpisodeDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEpisodeDto: UpdateEpisodeDto) {
    return this.episodesService.update(id, updateEpisodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.episodesService.remove(id);
  }
}
