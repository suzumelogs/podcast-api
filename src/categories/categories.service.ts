import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from '../_dtos/create_category.dto';
import { UpdateCategoryDto } from '../_dtos/update_category.dto';
import { Category, CategoryDocument } from '../_schemas/category.schema';
import { DocumentCollector } from '../common/executor/collector';
import { CollectionDto } from '../_dtos/input.dto';
import { CollectionResponse } from '../_dtos/output.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
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
  ): Promise<{ statusCode: number; message: string; data: Category }> {
    try {
      const data = await this.categoryModel.create(createCategoryDto);

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
  ): Promise<{ statusCode: number; message: string; data: Category }> {
    try {
      const data = await this.categoryModel
        .findByIdAndUpdate(id, updateCategoryDto, {
          new: true,
          runValidators: true,
        })
        .lean()
        .exec();

      if (!data) {
        throw new NotFoundException(`Category with id ${id} not found`);
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
      const data = await this.categoryModel.findByIdAndDelete(id).lean().exec();

      if (!data) {
        throw new NotFoundException(`Category with id ${id} not found`);
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
