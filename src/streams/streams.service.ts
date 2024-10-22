import { HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream, statSync } from 'fs';

@Injectable()
export class StreamsService {
  constructor() {}

  async streamPreviewAudio(path: string, headers: any, res: Response) {
    const { size } = statSync(String(path));
    const videoRange = headers.range;

    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', 'video/mp4');

    if (videoRange) {
      const parts = videoRange.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
      const chunksize = end - start + 1;

      const readStreamfile = createReadStream(path, {
        start,
        end,
        highWaterMark: 64 * 1024,
      });

      const head = {
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(HttpStatus.PARTIAL_CONTENT, head);
      readStreamfile.pipe(res);
    } else {
      const head = {
        'Content-Length': size,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(HttpStatus.OK, head);
      createReadStream(path).pipe(res);
    }
  }

  async streamPreviewImage(path: string, headers: any, res: Response) {
    const { size } = statSync(path);
    const imageRange = headers.range;

    res.setHeader('Accept-Ranges', 'bytes');

    const fileExtension = path.split('.').pop()?.toLowerCase();
    let contentType = 'image/jpeg';

    if (fileExtension === 'png') {
      contentType = 'image/png';
    } else if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
      contentType = 'image/jpeg';
    }

    res.setHeader('Content-Type', contentType);

    if (imageRange) {
      const parts = imageRange.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
      const chunksize = end - start + 1;

      const readStreamFile = createReadStream(path, {
        start,
        end,
        highWaterMark: 64 * 1024,
      });

      const head = {
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': chunksize,
        'Content-Type': contentType,
      };

      res.writeHead(HttpStatus.PARTIAL_CONTENT, head);
      readStreamFile.pipe(res);
    } else {
      const head = {
        'Content-Length': size,
        'Content-Type': contentType,
      };

      res.writeHead(HttpStatus.OK, head);
      createReadStream(path).pipe(res);
    }
  }
}
