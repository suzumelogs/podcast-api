import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateEpisodeDto } from 'src/_dtos/create_episode.dto';
import { CollectionDto } from 'src/_dtos/input.dto';
import { CollectionResponse, EpisodeWithFavorite } from 'src/_dtos/output.dto';
import { UpdateEpisodeDto } from 'src/_dtos/update_episode.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DocumentCollector } from 'src/common/executor/collector';
import { Episode, EpisodeDocument } from '../_schemas/episode.schema';
import { AssemblyAI } from 'assemblyai';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from 'src/_schemas/user.schema';
import { Chapter, ChapterDocument } from 'src/_schemas/chapter.schema';
import { Book, BookDocument } from 'src/_schemas/book.schema';
import { statSync, createReadStream } from 'fs';
import { Response } from 'express';

@Injectable()
export class EpisodesService {
  private readonly assemblyAIClient: AssemblyAI;

  constructor(
    @InjectModel(Episode.name)
    private readonly episodeModel: Model<EpisodeDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Chapter.name)
    private readonly chapterModel: Model<ChapterDocument>,
    @InjectModel(Book.name)
    private readonly bookModel: Model<BookDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly configService: ConfigService,
  ) {
    this.assemblyAIClient = new AssemblyAI({
      apiKey: this.configService.get<string>('ASSEMBLYAI_API_KEY'),
    });
  }

  async findAll(
    collectionDto: CollectionDto,
  ): Promise<CollectionResponse<EpisodeDocument>> {
    try {
      const collector = new DocumentCollector<EpisodeDocument>(
        this.episodeModel,
      );
      return collector.find(collectionDto);
    } catch (error) {
      throw error;
    }
  }

  async findAllByMe(
    collectionDto: CollectionDto,
    userId: string,
  ): Promise<CollectionResponse<EpisodeWithFavorite>> {
    try {
      const collector = new DocumentCollector<EpisodeDocument>(
        this.episodeModel,
      );
      const episodes = await collector.find(collectionDto);

      const userFavorites = await this.userModel
        .findById(userId)
        .select('favorites')
        .lean()
        .exec();

      const favoriteEpisodes = userFavorites?.favorites || [];

      const episodesWithFavoriteStatus: EpisodeWithFavorite[] =
        episodes.data.map((episode) => {
          const plainEpisode = episode.toObject();

          return {
            ...plainEpisode,
            isFavorite: favoriteEpisodes.some(
              (favId: mongoose.Types.ObjectId) =>
                favId.equals(plainEpisode._id),
            ),
          };
        });

      return {
        ...episodes,
        data: episodesWithFavoriteStatus,
      };
    } catch (error) {
      throw error;
    }
  }

  async findById(id: string): Promise<{ statusCode: number; data: Episode }> {
    try {
      const episode = await this.episodeModel.findById(id).lean().exec();

      if (!episode) {
        throw new NotFoundException(`Episode with id ${id} not found`);
      }

      return { statusCode: HttpStatus.OK, data: episode };
    } catch (error) {
      throw error;
    }
  }

  async findByIdOfMe(
    id: string,
    userId: string,
  ): Promise<{ statusCode: number; data: Episode & { isFavorite: boolean } }> {
    try {
      const episode = await this.episodeModel
        .findById(id)
        .populate({
          path: 'chapterId',
          populate: {
            path: 'bookId',
          },
        })
        .lean()
        .exec();

      if (!episode) {
        throw new NotFoundException(`Episode with id ${id} not found`);
      }

      const userFavorites = await this.userModel
        .findById(userId)
        .select('favorites')
        .lean()
        .exec();

      const favoriteEpisodes = userFavorites?.favorites || [];

      const isFavorite = favoriteEpisodes.some(
        (favId: mongoose.Types.ObjectId) => favId.equals(episode._id),
      );

      return {
        statusCode: HttpStatus.OK,
        data: {
          ...episode,
          isFavorite,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async create(
    createEpisodeDto: CreateEpisodeDto,
    file?: Express.Multer.File,
    audioFile?: Express.Multer.File,
  ): Promise<{ statusCode: number; message: string; data: Episode }> {
    try {
      let artwork = createEpisodeDto.artwork;
      if (file) {
        const uploadResponseFile =
          await this.cloudinaryService.uploadImageEpisodes(file);
        artwork = uploadResponseFile.secure_url;
      }

      let url = createEpisodeDto.url;
      if (audioFile) {
        const uploadResponseAudio =
          await this.cloudinaryService.uploadAudio(audioFile);
        url = uploadResponseAudio.secure_url;
      }

      const episodeData = { ...createEpisodeDto, artwork, url };
      const data = await this.episodeModel.create(episodeData);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Created successfully',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateEpisodeDto: UpdateEpisodeDto,
    file?: Express.Multer.File,
    audioFile?: Express.Multer.File,
  ): Promise<{ statusCode: number; message: string; data: Episode }> {
    try {
      const currentEpisode = await this.episodeModel.findById(id).exec();
      if (!currentEpisode) {
        throw new NotFoundException(`Episode with id ${id} not found`);
      }

      let artwork = updateEpisodeDto.artwork;
      if (file) {
        const uploadResponseFile =
          await this.cloudinaryService.uploadImageEpisodes(file);
        artwork = uploadResponseFile.secure_url;

        if (currentEpisode.artwork) {
          const publicId = this.cloudinaryService.extractPublicId(
            currentEpisode.artwork,
          );
          await this.cloudinaryService.bulkDelete(
            [publicId],
            'podcast/episode',
          );
        }
      }

      let url = updateEpisodeDto.url;
      if (audioFile) {
        const uploadResponseAudioFile =
          await this.cloudinaryService.uploadAudio(audioFile);
        url = uploadResponseAudioFile.secure_url;

        if (currentEpisode.url) {
          const publicId = this.cloudinaryService.extractPublicId(
            currentEpisode.url,
          );
          await this.cloudinaryService.bulkDelete([publicId], 'podcast/audio');
        }
      }

      const updatedData = { ...updateEpisodeDto, artwork, url };

      const data = await this.episodeModel
        .findByIdAndUpdate(id, updatedData, {
          new: true,
          runValidators: true,
        })
        .lean()
        .exec();

      if (!data) {
        throw new NotFoundException(`Episode with id ${id} not found`);
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Updated successfully',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string): Promise<{ statusCode: number; message: string }> {
    try {
      const episode = await this.episodeModel.findById(id).exec();

      if (!episode) {
        throw new NotFoundException(`Episode with id ${id} not found`);
      }

      if (episode.artwork) {
        const publicId = this.cloudinaryService.extractPublicId(
          episode.artwork,
        );
        await this.cloudinaryService.bulkDelete([publicId], 'podcast/episode');
      }

      await this.episodeModel.findByIdAndDelete(id).exec();

      return {
        statusCode: HttpStatus.OK,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async stream(id: string, headers, res: Response) {
    // Process find path in database
    const path = 'storage\\audios\\1729493889771-audiosample.mp3';
    const { size } = statSync(path);
    const videoRange = headers.range;
    if (videoRange) {
      const parts = videoRange.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
      const chunksize = end - start + 1;
      const readStreamfile = createReadStream(path, {
        start,
        end,
        highWaterMark: 60,
      });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': chunksize,
      };
      res.writeHead(HttpStatus.PARTIAL_CONTENT, head);
      readStreamfile.pipe(res);
    } else {
      const head = {
        'Content-Length': size,
      };
      res.writeHead(HttpStatus.OK, head); //200
      createReadStream(path).pipe(res);
    }
  }

  // async findByChapterId(
  //   chapterId: string,
  // ): Promise<{ statusCode: number; data: Episode[] }> {
  //   try {
  //     const episodes = await this.episodeModel
  //       .find({ chapterId })
  //       .sort({ createdAt: -1 })
  // .populate({
  //   path: 'chapterId',
  //   populate: {
  //     path: 'bookId',
  //   },
  // })
  //       .lean()
  //       .exec();

  //     return {
  //       statusCode: HttpStatus.OK,
  //       data: episodes.length ? episodes : [],
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async findByChapterId(chapterId: string): Promise<{
    statusCode: number;
    data: { book: Book; chapter: Chapter; episodes: Episode[] };
  }> {
    try {
      const chapter = await this.chapterModel.findById(chapterId).lean().exec();

      if (!chapter) {
        throw new NotFoundException(`Chapter with id ${chapterId} not found`);
      }

      const book = await this.bookModel.findById(chapter.bookId).lean().exec();

      if (!book) {
        throw new NotFoundException(`Book with id ${chapter.bookId} not found`);
      }

      const episodes = await this.episodeModel
        .find({ chapterId })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      return {
        statusCode: HttpStatus.OK,
        data: {
          book,
          chapter,
          episodes,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async findNextEpisode(
    chapterId: string,
    currentEpisodeId: string,
  ): Promise<{ statusCode: number; data: Episode | null }> {
    try {
      const currentEpisode = await this.episodeModel
        .findById(currentEpisodeId)
        .exec();

      if (!currentEpisode) {
        throw new NotFoundException(
          `Current episode with id ${currentEpisodeId} not found`,
        );
      }

      const nextEpisode = await this.episodeModel
        .findOne({ chapterId, _id: { $ne: currentEpisodeId } })
        .sort({ createdAt: 1 })
        .populate({
          path: 'chapterId',
          populate: {
            path: 'bookId',
          },
        })
        .lean()
        .exec();

      return {
        statusCode: HttpStatus.OK,
        data: nextEpisode || null,
      };
    } catch (error) {
      throw error;
    }
  }

  async findPrevEpisode(
    chapterId: string,
    currentEpisodeId: string,
  ): Promise<{ statusCode: number; data: Episode | null }> {
    try {
      const currentEpisode = await this.episodeModel
        .findById(currentEpisodeId)
        .exec();

      if (!currentEpisode) {
        throw new NotFoundException(
          `Current episode with id ${currentEpisodeId} not found`,
        );
      }

      const prevEpisode = await this.episodeModel
        .findOne({ chapterId, _id: { $ne: currentEpisodeId } })
        .sort({ createdAt: -1 })
        .populate({
          path: 'chapterId',
          populate: {
            path: 'bookId',
          },
        })
        .lean()
        .exec();

      return {
        statusCode: HttpStatus.OK,
        data: prevEpisode || null,
      };
    } catch (error) {
      throw error;
    }
  }

  async transcribeAudioUrl(
    episodeId: string,
  ): Promise<{ statusCode: number; transcription: string }> {
    try {
      const episode = await this.episodeModel.findById(episodeId).exec();
      if (!episode) {
        throw new NotFoundException(`Episode with id ${episodeId} not found`);
      }

      if (!episode.url || !episode) {
        throw new NotFoundException(
          `URL is missing for episode with id ${episodeId}`,
        );
      }

      const { id: transcriptId } =
        await this.assemblyAIClient.transcripts.transcribe({
          audio_url: episode.url,
        });

      const result = await this.pollTranscriptionStatus(transcriptId);

      return {
        statusCode: HttpStatus.OK,
        transcription: result.text,
      };
    } catch (error) {
      throw error;
    }
  }

  private async pollTranscriptionStatus(
    transcriptId: string,
    interval: number = 5000,
  ): Promise<any> {
    while (true) {
      const result = await this.assemblyAIClient.transcripts.get(transcriptId);
      if (result.status === 'completed') {
        return result;
      }
      await this.delay(interval);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async updateIsTop(
    id: string,
  ): Promise<{ statusCode: number; message: string; data: Episode }> {
    try {
      const episode = await this.episodeModel.findById(id).exec();

      if (!episode) {
        throw new NotFoundException(`Episode with id ${id} not found`);
      }

      const topEpisodesCount = await this.episodeModel
        .countDocuments({ isTop: true })
        .exec();

      if (!episode.isTop && topEpisodesCount >= 10) {
        throw new BadRequestException(
          'Cannot mark more than 10 episodes as top',
        );
      }

      episode.isTop = !episode.isTop;
      await episode.save();

      return {
        statusCode: HttpStatus.OK,
        message: `Episode is now ${episode.isTop ? 'marked as top' : 'unmarked as top'}`,
        data: episode,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAllTop(): Promise<{ statusCode: number; data: Episode[] }> {
    try {
      const episodesTop = await this.episodeModel.find({ isTop: true }).lean();
      return {
        statusCode: HttpStatus.OK,
        data: episodesTop,
      };
    } catch (error) {
      throw error;
    }
  }
}
