import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ImageTypeValidationPipe } from 'src/pipes/image-type-validation.pipe';
import { AudioTypeValidationPipe } from 'src/pipes/audio-type-validation.pipe';
import { extname } from 'path';

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
