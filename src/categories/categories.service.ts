import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from 'src/_dtos/create_category.dto';
import { CollectionDto } from 'src/_dtos/input.dto';
import { CollectionResponse } from 'src/_dtos/output.dto';
import { UpdateCategoryDto } from 'src/_dtos/update_category.dto';
import { Book, BookDocument } from 'src/_schemas/book.schema';
import { Category, CategoryDocument } from 'src/_schemas/category.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DocumentCollector } from 'src/common/executor/collector';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Book.name)
    private readonly bookModel: Model<BookDocument>,
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

      const books = await this.bookModel.find({ categoryId: id }).lean().exec();

      const result = {
        ...category,
        books,
      };

      return { statusCode: HttpStatus.OK, data: result };
    } catch (error) {
      throw error;
    }
  }

  async create(
    createCategoryDto: CreateCategoryDto,
    file: Express.Multer.File,
  ): Promise<{ statusCode: number; message: string; data: Category }> {
    try {
      const url = file
        ? (await this.cloudinaryService.uploadImageCategory(file)).secure_url
        : createCategoryDto.url;

      const categoryData = { ...createCategoryDto, url };
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

      let url = updateCategoryDto.url;
      if (file) {
        const uploadResponse =
          await this.cloudinaryService.uploadImageCategory(file);
        url = uploadResponse.secure_url;

        if (currentCategory.url) {
          const publicId = this.cloudinaryService.extractPublicId(
            currentCategory.url,
          );

          await this.cloudinaryService.bulkDelete(
            [publicId],
            'podcast/category',
          );
        }
      }

      const updatedData = { ...updateCategoryDto, url };

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

      if (category.url) {
        const publicId = this.cloudinaryService.extractPublicId(category.url);
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

  async getCategoryValueLabels(): Promise<{ label: string; value: string }[]> {
    try {
      const categories = await this.categoryModel.find().lean();
      return categories.map((book) => ({
        label: book.name,
        value: book._id.toString(),
      }));
    } catch (error) {
      throw error;
    }
  }

  async findAllNoPagination(): Promise<{
    statusCode: number;
    data: Category[];
  }> {
    try {
      const episodesTop = await this.categoryModel.find().lean();
      return {
        statusCode: HttpStatus.OK,
        data: episodesTop,
      };
    } catch (error) {
      throw error;
    }
  }
}
