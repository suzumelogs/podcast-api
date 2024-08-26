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

@Injectable()
export class EpisodesService {
  constructor(
    @InjectModel(Episode.name)
    private readonly episodeModel: Model<EpisodeDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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
      let artWork = createEpisodeDto.artWork;
      if (file) {
        const uploadResponse =
          await this.cloudinaryService.uploadImageEpisodes(file);
        artWork = uploadResponse.secure_url;
      }

      const episodeData = { ...createEpisodeDto, artWork };
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

      let artWork = updateEpisodeDto.artWork;
      if (file) {
        const uploadResponse =
          await this.cloudinaryService.uploadImageEpisodes(file);
        artWork = uploadResponse.secure_url;

        if (currentEpisode.artWork) {
          const publicId = this.cloudinaryService.extractPublicId(
            currentEpisode.artWork,
          );
          await this.cloudinaryService.bulkDelete(
            [publicId],
            'podcast/episode',
          );
        }
      }

      const updatedData = { ...updateEpisodeDto, artWork };

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

      if (episode.artWork) {
        const publicId = this.cloudinaryService.extractPublicId(
          episode.artWork,
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
}
