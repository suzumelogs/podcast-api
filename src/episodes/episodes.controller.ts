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
import { CreateEpisodeDto } from 'src/_dtos/create_episode.dto';
import { CollectionDto } from 'src/_dtos/input.dto';
import { UpdateEpisodeDto } from 'src/_dtos/update_episode.dto';
import { Episode } from 'src/_schemas/episode.schema';
import { EpisodesService } from './episodes.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/common/gaurds/gaurd.access_token';
import { AuthUser } from 'src/common/decorator/decorator.auth_user';

@ApiTags('Episodes')
@ApiBearerAuth('JWT-auth')
@UseGuards(AccessTokenGuard)
@Controller('episodes')
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Get()
  async findAll(@Query() query: CollectionDto): Promise<{ data: Episode[] }> {
    return this.episodesService.findAll(query);
  }

  @Get('by-me')
  async findAllByMe(
    @Query() collectionDto: CollectionDto,
    @AuthUser('sub') userId: string,
  ) {
    return this.episodesService.findAllByMe(collectionDto, userId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.episodesService.findById(id);
  }

  @Get(':id/by-me')
  findByIdOfMe(@Param('id') id: string, @AuthUser('sub') userId: string) {
    return this.episodesService.findByIdOfMe(id, userId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createEpisodeDto: CreateEpisodeDto,
    @UploadedFile() file?: Express.Multer.File,
    @UploadedFile() audioFile?: Express.Multer.File,
  ) {
    return this.episodesService.create(createEpisodeDto, file, audioFile);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updateEpisodeDto: UpdateEpisodeDto,
    @UploadedFile() file?: Express.Multer.File,
    @UploadedFile() audioFile?: Express.Multer.File,
  ) {
    return this.episodesService.update(id, updateEpisodeDto, file, audioFile);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.episodesService.remove(id);
  }

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
}
