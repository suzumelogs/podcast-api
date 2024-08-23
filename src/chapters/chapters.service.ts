import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chapter, ChapterDocument } from '../_schemas/chapter.schema';
import { CollectionDto } from '../_dtos/input.dto';
import { CollectionResponse } from '../_dtos/output.dto';
import { DocumentCollector } from '../common/executor/collector';
import { CreateChapterDto } from 'src/_dtos/create_chapter.dto';
import { UpdateChapterDto } from 'src/_dtos/update_chapter.dto';
import { UsersService } from 'src/users/users.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectModel(Chapter.name)
    private readonly chapterModel: Model<ChapterDocument>,
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(
    collectionDto: CollectionDto,
    user: any,
  ): Promise<CollectionResponse<ChapterDocument>> {
    try {
      const userId = user?.sub;
      const userLogin = await this.usersService.findById(userId);
      const collector = new DocumentCollector<ChapterDocument>(
        this.chapterModel,
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

  async findById(id: string): Promise<{ statusCode: number; data: Chapter }> {
    try {
      const chapter = await this.chapterModel.findById(id).lean().exec();

      if (!chapter) {
        throw new NotFoundException(`Chapter with id ${id} not found`);
      }

      return { statusCode: HttpStatus.OK, data: chapter };
    } catch (error) {
      throw error;
    }
  }

  // async create(
  //   createChapterDto: CreateChapterDto,
  //   file: Express.Multer.File,
  // ): Promise<{ statusCode: number; message: string; data: Chapter }> {
  //   try {
  //     const imageUrl = file
  //       ? (await this.cloudinaryService.uploadImageChapter(file)).secure_url
  //       : createChapterDto.imageUrl;

  //     const chapterData = { ...createChapterDto, imageUrl };

  //     const data = await this.chapterModel.create(chapterData);

  //     return {
  //       statusCode: HttpStatus.CREATED,
  //       message: 'Created successfully',
  //       data,
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async create(
    createChapterDto: CreateChapterDto,
  ): Promise<{ statusCode: number; message: string; data: Chapter }> {
    try {
      const data = await this.chapterModel.create(createChapterDto);

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
    updateChapterDto: UpdateChapterDto,
    file?: Express.Multer.File,
  ): Promise<{ statusCode: number; message: string; data: Chapter }> {
    try {
      const currentChapter = await this.chapterModel.findById(id).exec();
      if (!currentChapter) {
        throw new NotFoundException(`Chapter with id ${id} not found`);
      }

      let imageUrl = updateChapterDto.imageUrl;
      if (file) {
        const uploadResponse =
          await this.cloudinaryService.uploadImageChapter(file);
        imageUrl = uploadResponse.secure_url;

        if (currentChapter.imageUrl) {
          const publicId = this.cloudinaryService.extractPublicId(
            currentChapter.imageUrl,
          );
          await this.cloudinaryService.bulkDelete(
            [publicId],
            'podcast/chapter',
          );
        }
      }

      const updatedData = { ...updateChapterDto, imageUrl };

      const data = await this.chapterModel
        .findByIdAndUpdate(id, updatedData, {
          new: true,
          runValidators: true,
        })
        .lean()
        .exec();

      if (!data) {
        throw new NotFoundException(`Chapter with id ${id} not found`);
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
      const chapter = await this.chapterModel.findById(id).exec();

      if (!chapter) {
        throw new NotFoundException(`Chapter with id ${id} not found`);
      }

      if (chapter.imageUrl) {
        const publicId = this.cloudinaryService.extractPublicId(
          chapter.imageUrl,
        );
        await this.cloudinaryService.bulkDelete([publicId], 'podcast/chapter');
      }

      await this.chapterModel.findByIdAndDelete(id).exec();

      return {
        statusCode: HttpStatus.OK,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}
