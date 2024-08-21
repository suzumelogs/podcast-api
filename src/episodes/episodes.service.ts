import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Episode, EpisodeDocument } from '../_schemas/episode.schema';
import { CollectionDto } from 'src/_dtos/input.dto';
import { CollectionResponse } from 'src/_dtos/output.dto';
import { DocumentCollector } from 'src/common/executor/collector';
import { CreateEpisodeDto } from 'src/_dtos/create_episode.dto';
import { UpdateEpisodeDto } from 'src/_dtos/update_episode.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class EpisodesService {
  constructor(
    @InjectModel(Episode.name)
    private readonly episodeModel: Model<EpisodeDocument>,
    private readonly usersService: UsersService,
  ) {}

  async findAll(
    collectionDto: CollectionDto,
    user: any,
  ): Promise<CollectionResponse<EpisodeDocument>> {
    try {
      const userId = user?.sub;
      const userLogin = await this.usersService.findById(userId);
      const collector = new DocumentCollector<EpisodeDocument>(
        this.episodeModel,
      );

      if (userLogin?.premium) {
        return collector.find(collectionDto);
      }

      return collector.find({
        filter: { display: { $eq: 'true' } },
        ...collectionDto,
      });
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
  ): Promise<{ statusCode: number; message: string; data: Episode }> {
    try {
      const data = await this.episodeModel.create(createEpisodeDto);

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
      const data = await this.episodeModel
        .findByIdAndUpdate(id, updateEpisodeDto, {
          new: true,
          runValidators: true,
        })
        .lean()
        .exec();

      if (!data) {
        throw new NotFoundException(`Episode with id ${id} not found`);
      }

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Updated successfully',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string): Promise<{ statusCode: number; message: string }> {
    try {
      const data = await this.episodeModel.findByIdAndDelete(id).lean().exec();

      if (!data) {
        throw new NotFoundException(`Episode with id ${id} not found`);
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}