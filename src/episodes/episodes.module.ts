import { Module } from '@nestjs/common';
import { EpisodesService } from './episodes.service';
import { EpisodesController } from './episodes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Episode, EpisodeSchema } from '../_schemas/episode.schema';
import { User, UserSchema } from '../_schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Episode.name, schema: EpisodeSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [EpisodesController],
  providers: [EpisodesService, UsersService, CloudinaryService],
  exports: [EpisodesService, UsersService],
})
export class EpisodesModule {}
