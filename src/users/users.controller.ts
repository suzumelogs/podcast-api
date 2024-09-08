import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from '../common/gaurds/gaurd.access_token';
import { CreateUserDto } from '../_dtos/create_user.dto';
import { UpdateUserDto } from '../_dtos/update_user.dto';
import { User } from '../_schemas/user.schema';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CollectionDto } from 'src/_dtos/input.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(AccessTokenGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(@Query() query: CollectionDto): Promise<{ data: User[] }> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':userId/favorite/:episodeId')
  markAsFavorite(
    @Param('userId') userId: string,
    @Param('episodeId') episodeId: string,
  ): Promise<{ statusCode: number; message: string }> {
    return this.usersService.markAsFavorite(userId, episodeId);
  }
}
