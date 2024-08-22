import { Module } from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { ChaptersController } from './chapters.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Chapter, ChapterSchema } from '../_schemas/chapter.schema';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { User, UserSchema } from '../_schemas/user.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chapter.name, schema: ChapterSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
  ],
  controllers: [ChaptersController],
  providers: [ChaptersService, UsersService, CloudinaryService],
  exports: [ChaptersService],
})
export class ChaptersModule {}
