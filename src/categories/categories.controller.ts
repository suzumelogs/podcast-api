import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/common/gaurds/gaurd.access_token';
import { CollectionDto } from 'src/_dtos/input.dto';
import { Category } from 'src/_schemas/category.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCategoryDto } from 'src/_dtos/create_category.dto';
import { UpdateCategoryDto } from 'src/_dtos/update_category.dto';

@ApiTags('Categories')
@ApiBearerAuth('JWT-auth')
@UseGuards(AccessTokenGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(@Query() query: CollectionDto): Promise<{ data: Category[] }> {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.categoriesService.create(createCategoryDto, file);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }

  @Get('value-labels/category')
  async getCategoryValueLabels() {
    const valueLabels = await this.categoriesService.getCategoryValueLabels();
    return valueLabels;
  }

  @Get('all/no-pagination')
  async findAllNoPagination(): Promise<{ data: Category[] }> {
    return this.categoriesService.findAllNoPagination();
  }
}
