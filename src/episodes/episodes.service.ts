import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEpisodeDto } from 'src/_dtos/create_episode.dto';
import { CollectionDto } from 'src/_dtos/input.dto';
import { CollectionResponse } from 'src/_dtos/output.dto';
import { UpdateEpisodeDto } from 'src/_dtos/update_episode.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DocumentCollector } from 'src/common/executor/collector';
import { Episode, EpisodeDocument } from '../_schemas/episode.schema';
import { AssemblyAI } from 'assemblyai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EpisodesService {
  private readonly assemblyAIClient: AssemblyAI;

  constructor(
    @InjectModel(Episode.name)
    private readonly episodeModel: Model<EpisodeDocument>,
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

  async create(
    createEpisodeDto: CreateEpisodeDto,
    file?: Express.Multer.File,
  ): Promise<{ statusCode: number; message: string; data: Episode }> {
    try {
      let artwork = createEpisodeDto.artwork;
      if (file) {
        const uploadResponse =
          await this.cloudinaryService.uploadImageEpisodes(file);
        artwork = uploadResponse.secure_url;
      }

      const episodeData = { ...createEpisodeDto, artwork };
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
  ): Promise<{ statusCode: number; message: string; data: Episode }> {
    try {
      const currentEpisode = await this.episodeModel.findById(id).exec();
      if (!currentEpisode) {
        throw new NotFoundException(`Episode with id ${id} not found`);
      }

      let artwork = updateEpisodeDto.artwork;
      if (file) {
        const uploadResponse =
          await this.cloudinaryService.uploadImageEpisodes(file);
        artwork = uploadResponse.secure_url;

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

      const updatedData = { ...updateEpisodeDto, artwork };

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

  async findByChapterId(
    chapterId: string,
  ): Promise<{ statusCode: number; data: Episode[] }> {
    try {
      const episodes = await this.episodeModel
        .find({ chapterId })
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
        data: episodes.length ? episodes : [],
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

  async transcribeurl(
    episodeId: string,
  ): Promise<{ statusCode: number; transcription: string }> {
    try {
      const episode = await this.episodeModel.findById(episodeId).exec();

      if (!episode || !episode.url) {
        throw new NotFoundException(
          `Episode with id ${episodeId} not found or url URL is missing`,
        );
      }

      const transcription = await this.assemblyAIClient.transcripts.transcribe({
        audio_url: episode.url,
      });

      let result;
      while (true) {
        result = await this.assemblyAIClient.transcripts.get(transcription.id);
        if (result.status === 'completed') {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      return {
        statusCode: HttpStatus.OK,
        transcription: result.text,
      };
    } catch (error) {
      throw error;
    }
  }
}
