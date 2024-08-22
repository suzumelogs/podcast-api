import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from '../_dtos/create_category.dto';
import { UpdateCategoryDto } from '../_dtos/update_category.dto';
import { Category, CategoryDocument } from '../_schemas/category.schema';
import { DocumentCollector } from '../common/executor/collector';
import { CollectionDto } from '../_dtos/input.dto';
import { CollectionResponse } from '../_dtos/output.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(
    collectionDto: CollectionDto,
  ): Promise<CollectionResponse<CategoryDocument>> {
    try {
      const collector = new DocumentCollector<CategoryDocument>(
        this.categoryModel,
      );
      return collector.find(collectionDto);
    } catch (error) {
      throw error;
    }
  }

  async findById(id: string): Promise<{ statusCode: number; data: Category }> {
    try {
      const category = await this.categoryModel.findById(id).lean().exec();

      if (!category) {
        throw new NotFoundException(`Category with id ${id} not found`);
      }

      return { statusCode: HttpStatus.OK, data: category };
    } catch (error) {
      throw error;
    }
  }

  async create(
    createCategoryDto: CreateCategoryDto,
    file: Express.Multer.File,
  ): Promise<{ statusCode: number; message: string; data: Category }> {
    try {
      const imageUrl = file
        ? (await this.cloudinaryService.uploadImageCategory(file)).secure_url
        : createCategoryDto.imageUrl;

      const categoryData = { ...createCategoryDto, imageUrl };
      const data = await this.categoryModel.create(categoryData);

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
    updateCategoryDto: UpdateCategoryDto,
    file?: Express.Multer.File,
  ): Promise<{ statusCode: number; message: string; data: Category }> {
    try {
      const currentCategory = await this.categoryModel.findById(id).exec();
      if (!currentCategory) {
        throw new NotFoundException(`Category with id ${id} not found`);
      }

      let imageUrl = updateCategoryDto.imageUrl;
      if (file) {
        const uploadResponse =
          await this.cloudinaryService.uploadImageCategory(file);
        imageUrl = uploadResponse.secure_url;

        if (currentCategory.imageUrl) {
          const publicId = this.cloudinaryService.extractPublicId(
            currentCategory.imageUrl,
          );

          await this.cloudinaryService.bulkDelete(
            [publicId],
            'podcast/category',
          );
        }
      }

      const updatedData = { ...updateCategoryDto, imageUrl };

      const data = await this.categoryModel
        .findByIdAndUpdate(id, updatedData, {
          new: true,
          runValidators: true,
        })
        .lean()
        .exec();

      if (!data) {
        throw new NotFoundException(`Category with id ${id} not found`);
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
      const category = await this.categoryModel.findById(id).exec();

      if (!category) {
        throw new NotFoundException(`Category with id ${id} not found`);
      }

      if (category.imageUrl) {
        const publicId = this.cloudinaryService.extractPublicId(
          category.imageUrl,
        );
        await this.cloudinaryService.bulkDelete([publicId], 'podcast/category');
      }

      await this.categoryModel.findByIdAndDelete(id).exec();

      return {
        statusCode: HttpStatus.OK,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}
