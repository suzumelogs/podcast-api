import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBookDto } from '../_dtos/create_book.dto';
import { UpdateBookDto } from '../_dtos/update_book.dto';
import { Book, BookDocument } from '../_schemas/book.schema';
import { DocumentCollector } from '../common/executor/collector';
import { CollectionDto } from '../_dtos/input.dto';
import { CollectionResponse } from '../_dtos/output.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name)
    private readonly bookModel: Model<BookDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(
    collectionDto: CollectionDto,
  ): Promise<CollectionResponse<BookDocument>> {
    try {
      const collector = new DocumentCollector<BookDocument>(this.bookModel);
      return collector.find(collectionDto);
    } catch (error) {
      throw error;
    }
  }

  async findById(id: string): Promise<{ statusCode: number; data: Book }> {
    try {
      const book = await this.bookModel.findById(id).lean().exec();

      if (!book) {
        throw new NotFoundException(`Book with id ${id} not found`);
      }

      return { statusCode: HttpStatus.OK, data: book };
    } catch (error) {
      throw error;
    }
  }

  async create(
    createBookDto: CreateBookDto,
    file: Express.Multer.File,
  ): Promise<{ statusCode: number; message: string; data: Book }> {
    try {
      const url = file
        ? (await this.cloudinaryService.uploadImageBook(file)).secure_url
        : createBookDto.url;

      const bookData = { ...createBookDto, url };
      const data = await this.bookModel.create(bookData);

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
    updateBookDto: UpdateBookDto,
    file?: Express.Multer.File,
  ): Promise<{ statusCode: number; message: string; data: Book }> {
    try {
      const currentBook = await this.bookModel.findById(id).exec();
      if (!currentBook) {
        throw new NotFoundException(`Book with id ${id} not found`);
      }

      let url = updateBookDto.url;
      if (file) {
        const uploadResponse =
          await this.cloudinaryService.uploadImageBook(file);
        url = uploadResponse.secure_url;

        if (currentBook.url) {
          const publicId = this.cloudinaryService.extractPublicId(
            currentBook.url,
          );

          await this.cloudinaryService.bulkDelete([publicId], 'podcast/book');
        }
      }

      const updatedData = { ...updateBookDto, url };

      const data = await this.bookModel
        .findByIdAndUpdate(id, updatedData, {
          new: true,
          runValidators: true,
        })
        .lean()
        .exec();

      if (!data) {
        throw new NotFoundException(`Book with id ${id} not found`);
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
      const book = await this.bookModel.findById(id).exec();

      if (!book) {
        throw new NotFoundException(`Book with id ${id} not found`);
      }

      if (book.url) {
        const publicId = this.cloudinaryService.extractPublicId(book.url);
        await this.cloudinaryService.bulkDelete([publicId], 'podcast/book');
      }

      await this.bookModel.findByIdAndDelete(id).exec();

      return {
        statusCode: HttpStatus.OK,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}
