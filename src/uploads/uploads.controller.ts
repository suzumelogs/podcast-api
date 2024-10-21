import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ImageTypeValidationPipe } from 'src/pipes/image-type-validation.pipe';
import { AudioTypeValidationPipe } from 'src/pipes/audio-type-validation.pipe';

@Controller('uploads')
export class UploadsController {
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './storage/images/',
        filename: (req, file, callback) => {
          const filename = Date.now() + '-' + file.originalname;
          callback(null, filename);
        },
      }),
    }),
  )
  uploadImage(
    @UploadedFile(new ImageTypeValidationPipe())
    file: Express.Multer.File,
  ) {
    return file.path?.replace('\\', '/');
  }

  @Post('audio')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './storage/audios',
        filename: (req, file, callback) => {
          const filename = Date.now() + '-' + file.originalname;
          callback(null, filename);
        },
      }),
    }),
  )
  uploadAudio(
    @UploadedFile(new AudioTypeValidationPipe())
    file: Express.Multer.File,
  ) {
    return file.path?.replace('\\', '/');
  }
}
