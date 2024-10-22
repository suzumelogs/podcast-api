import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AudioTypeValidationPipe } from 'src/pipes/audio-type-validation.pipe';
import { ImageTypeValidationPipe } from 'src/pipes/image-type-validation.pipe';

const storageConfig = (destinationPath: string) => ({
  storage: diskStorage({
    destination: destinationPath,
    filename: (req, file, callback) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension = extname(file.originalname);
      const filename = `${uniqueSuffix}${extension}`;
      callback(null, filename);
    },
  }),
});

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  @Post('image')
  @UseInterceptors(FileInterceptor('file', storageConfig('./storage/images/')))
  uploadImage(
    @UploadedFile(new ImageTypeValidationPipe())
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image upload failed');
    }
    return { path: file.path?.replace(/\\/g, '/') };
  }

  @Post('audio')
  @UseInterceptors(FileInterceptor('file', storageConfig('./storage/audios/')))
  uploadAudio(
    @UploadedFile(new AudioTypeValidationPipe())
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Audio upload failed');
    }
    return { path: file.path?.replace(/\\/g, '/') };
  }
}
