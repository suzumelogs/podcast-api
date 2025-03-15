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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateEpisodeDto } from 'src/_dtos/create_episode.dto';
import { CollectionDto } from 'src/_dtos/input.dto';
import { UpdateEpisodeDto } from 'src/_dtos/update_episode.dto';
import { Episode } from 'src/_schemas/episode.schema';
import { AuthUser } from 'src/common/decorator/decorator.auth_user';
import { AccessTokenGuard } from 'src/common/gaurds/gaurd.access_token';
import { EpisodesService } from './episodes.service';
import { EpisodePaginationDto } from 'src/_dtos/episode-pagination.dto';

@ApiTags('Episodes')
@Controller('episodes')
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @ApiBearerAuth('JWT-auth')
  @Get()
  async findAll(@Query() query: CollectionDto): Promise<{ data: Episode[] }> {
    return this.episodesService.findAll(query);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(AccessTokenGuard)
  @Get('by-me')
  async findAllByMe(
    @Query() collectionDto: CollectionDto,
    @AuthUser('sub') userId: string,
  ) {
    return this.episodesService.findAllByMe(collectionDto, userId);
  }

  @ApiBearerAuth('JWT-auth')
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.episodesService.findById(id);
  }

  @Get(':id/by-me')
  findByIdOfMe(@Param('id') id: string, @Query('userId') userId?: string) {
    return this.episodesService.findByIdOfMe(id, userId);
  }

  @ApiBearerAuth('JWT-auth')
  @Post()
  create(@Body() createEpisodeDto: CreateEpisodeDto) {
    return this.episodesService.create(createEpisodeDto);
  }

  @ApiBearerAuth('JWT-auth')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEpisodeDto: UpdateEpisodeDto) {
    return this.episodesService.update(id, updateEpisodeDto);
  }

  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.episodesService.remove(id);
  }

  @ApiBearerAuth('JWT-auth')
  @Get('chapter/:chapterId')
  async findByChapterId(@Param('chapterId') chapterId: string) {
    return this.episodesService.findByChapterId(chapterId);
  }

  @Get('chapter/:chapterId/prev/:currentEpisodeId/auto-click')
  async findPrevEpisodeAutoClick(
    @Param('chapterId') chapterId: string,
    @Param('currentEpisodeId') currentEpisodeId: string,
  ) {
    return this.episodesService.findPrevEpisode(chapterId, currentEpisodeId);
  }

  @Get('chapter/:chapterId/next/:currentEpisodeId/auto-click')
  async findNextEpisodeAutoClick(
    @Param('chapterId') chapterId: string,
    @Param('currentEpisodeId') currentEpisodeId: string,
  ) {
    return this.episodesService.findNextEpisode(chapterId, currentEpisodeId);
  }

  @Post('chapter/:chapterId/prev/:currentEpisodeId/click')
  async findPrevEpisodeClick(
    @Param('chapterId') chapterId: string,
    @Param('currentEpisodeId') currentEpisodeId: string,
  ) {
    return this.episodesService.findPrevEpisode(chapterId, currentEpisodeId);
  }

  @Post('chapter/:chapterId/next/:currentEpisodeId/click')
  async findNextEpisodeClick(
    @Param('chapterId') chapterId: string,
    @Param('currentEpisodeId') currentEpisodeId: string,
  ) {
    return this.episodesService.findNextEpisode(chapterId, currentEpisodeId);
  }

  @Post(':id/audio-url/transcribe')
  async transcribeAudio(@Param('id') id: string) {
    return this.episodesService.transcribeAudioUrl(id);
  }

  @ApiBearerAuth('JWT-auth')
  @Patch(':id/update/is-top')
  async updateIsTop(@Param('id') id: string) {
    return this.episodesService.updateIsTop(id);
  }

  @ApiBearerAuth('JWT-auth')
  @Get('get/all-top')
  async findAllTop(): Promise<{ data: Episode[] }> {
    return this.episodesService.findAllTop();
  }

  @ApiBearerAuth('JWT-auth')
  @Get('all/pagination')
  async findAllPagination(@Query() dto: EpisodePaginationDto) {
    return this.episodesService.findAllPagination(dto);
  }
}
