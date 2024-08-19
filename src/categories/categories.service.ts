import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from '../_dtos/create_category.dto';
import { UpdateCategoryDto } from '../_dtos/update_category.dto';
import { Category, CategoryDocument } from '../_schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll(): Promise<Category[]> {
    try {
      return await this.categoryModel.find().lean();
    } catch (error) {
      throw error;
    }
  }

  async findById(id: string): Promise<Category> {
    try {
      const category = await this.categoryModel.findById(id).lean().exec();

      if (!category) {
        throw new NotFoundException(`Category with id ${id} not found`);
      }

      return category;
    } catch (error) {
      throw error;
    }
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      return await this.categoryModel.create(createCategoryDto);
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    try {
      const updatedCategory = await this.categoryModel
        .findByIdAndUpdate(id, updateCategoryDto, {
          new: true,
          runValidators: true,
        })
        .lean()
        .exec();

      if (!updatedCategory) {
        throw new NotFoundException(`Category with id ${id} not found`);
      }

      return updatedCategory;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string): Promise<Category> {
    try {
      const deletedCategory = await this.categoryModel
        .findByIdAndDelete(id)
        .lean()
        .exec();

      if (!deletedCategory) {
        throw new NotFoundException(`Category with id ${id} not found`);
      }

      return deletedCategory;
    } catch (error) {
      throw error;
    }
  }
}
