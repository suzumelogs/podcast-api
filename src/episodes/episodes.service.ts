import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { AssemblyAI } from 'assemblyai';
import mongoose, { Model } from 'mongoose';
import { CreateEpisodeDto } from 'src/_dtos/create_episode.dto';
import { CollectionDto } from 'src/_dtos/input.dto';
import { CollectionResponse, EpisodeWithFavorite } from 'src/_dtos/output.dto';
import { UpdateEpisodeDto } from 'src/_dtos/update_episode.dto';
import { Book, BookDocument } from 'src/_schemas/book.schema';
import { Chapter, ChapterDocument } from 'src/_schemas/chapter.schema';
import { User, UserDocument } from 'src/_schemas/user.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DocumentCollector } from 'src/common/executor/collector';
import { Episode, EpisodeDocument } from '../_schemas/episode.schema';
import { EpisodePaginationDto } from 'src/_dtos/episode-pagination.dto';

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
    userId?: string,
  ): Promise<{ statusCode: number; data: Episode & { isFavorite: boolean } }> {
    const episode = await this.episodeModel
      .findById(id)
      .populate({
        path: 'chapterId',
        populate: { path: 'bookId' },
      })
      .lean()
      .exec();

    if (!episode) {
      throw new NotFoundException(`Episode with id ${id} not found`);
    }

    let isFavorite = false;

    if (userId) {
      const userFavorites = await this.userModel
        .findById(userId, 'favorites')
        .lean()
        .exec();
      isFavorite =
        userFavorites?.favorites?.some(
          (favId: mongoose.Types.ObjectId) =>
            favId.toString() === episode._id.toString(),
        ) ?? false;
    }

    return {
      statusCode: HttpStatus.OK,
      data: { ...episode, isFavorite },
    };
  }

  async create(
    createEpisodeDto: CreateEpisodeDto,
  ): Promise<{ statusCode: number; message: string; data: Episode }> {
    try {
      const episodeData = { ...createEpisodeDto };
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
  ): Promise<{ statusCode: number; message: string; data: Episode }> {
    try {
      const currentEpisode = await this.episodeModel.findById(id).exec();
      if (!currentEpisode) {
        throw new NotFoundException(`Episode with id ${id} not found`);
      }

      const updatedData = { ...updateEpisodeDto };

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

      await this.episodeModel.findByIdAndDelete(id).exec();

      return {
        statusCode: HttpStatus.OK,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw error;
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

  async findAllPagination(dto: EpisodePaginationDto): Promise<any> {
    const {
      page = 1,
      limit = 10,
      categoryId,
      bookId,
      chapterId,
      ...filters
    } = dto;

    const skip = (page - 1) * limit;
    const filter: any = {};

    if (filters.title) {
      filter.title = { $regex: filters.title, $options: 'i' };
    }

    if (filters.album) {
      filter.album = { $regex: filters.album, $options: 'i' };
    }

    if (filters.artist) {
      filter.artist = { $regex: filters.artist, $options: 'i' };
    }

    if (filters.description) {
      filter.description = { $regex: filters.description, $options: 'i' };
    }

    if (typeof filters.isPremium === 'boolean') {
      filter.isPremium = filters.isPremium;
    }

    if (typeof filters.isTop === 'boolean') {
      filter.isTop = filters.isTop;
    }

    let bookIds: mongoose.Types.ObjectId[] = [];
    if (categoryId) {
      const books = await this.bookModel.find({ categoryId }).select('_id');
      bookIds = books.map((book) => book._id);
    }

    let chapterIds: mongoose.Types.ObjectId[] = [];
    if (bookId) {
      bookIds.push(new mongoose.Types.ObjectId(bookId));
    }

    if (bookIds.length > 0) {
      const chapters = await this.chapterModel
        .find({ bookId: { $in: bookIds } })
        .select('_id');
      chapterIds = chapters.map((chapter) => chapter._id);
    }

    if (chapterId) {
      chapterIds.push(new mongoose.Types.ObjectId(chapterId));
    }

    if (chapterIds.length > 0) {
      filter.chapterId = { $in: chapterIds };
    }

    const [data, total] = await Promise.all([
      this.episodeModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.episodeModel.countDocuments(filter).exec(),
    ]);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      limit: Number(limit),
      data,
    };
  }
}
