import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { CloudinaryResponse } from './cloudinary-response';

@Injectable()
export class CloudinaryService {
  private async uploadFileToFolder(
    file: Express.Multer.File,
    folder: string,
    resourceType: 'image' | 'video' = 'image',
  ): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    resourceType: 'image' | 'video' = 'image',
  ): Promise<CloudinaryResponse> {
    return this.uploadFileToFolder(file, folder, resourceType);
  }

  uploadImageBook(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return this.uploadFile(file, 'podcast/book');
  }

  uploadImageChapter(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return this.uploadFile(file, 'podcast/chapter');
  }

  uploadImageEpisodes(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return this.uploadFile(file, 'podcast/episodes');
  }

  uploadVideo(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return this.uploadFile(file, 'podcast/video', 'video');
  }

  async bulkDelete(publicIds: string[], folder: string): Promise<any[]> {
    const deletePromises = publicIds.map(async (publicId) => {
      const fullPublicId = `${folder}/${publicId}`;
      try {
        const result = await cloudinary.uploader.destroy(fullPublicId, {
          invalidate: true,
        });
        return { publicId: fullPublicId, result };
      } catch (error) {
        return { publicId: fullPublicId, error };
      }
    });

    return Promise.all(deletePromises);
  }

  extractPublicId(imageUrl: string): string {
    const urlParts = imageUrl.split('/');
    const lastPart = urlParts.pop();
    return lastPart ? lastPart.split('.')[0] : '';
  }
}
