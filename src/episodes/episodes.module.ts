import { Module } from '@nestjs/common';
import { EpisodesService } from './episodes.service';
import { EpisodesController } from './episodes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Episode, EpisodeSchema } from '../_schemas/episode.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Episode.name, schema: EpisodeSchema }]),
  ],
  controllers: [EpisodesController],
  providers: [EpisodesService],
  exports: [EpisodesService],
})
export class EpisodesModule {}
