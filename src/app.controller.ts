import {
  Controller,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { createWriteStream } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { FileUploadGateway } from './file-upload.gateway';
import * as multer from 'multer';

@Controller('upload')
export class FileUploadController {
  constructor(private readonly fileUploadGateway: FileUploadGateway) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(), // Use memory storage to handle the file stream manually
    }),
  )
  async uploadFile(@UploadedFile() file, @Req() req: Request, @Res() res: Response) {
    const clientId = req.headers['client-id'] as string; // Ensure the client ID is sent with the request

    const filename = `${uuidv4()}${path.extname(file.originalname)}`;
    const uploadPath = path.join(__dirname, '..', 'uploads', filename);

    // Create a write stream to save the file
    const writeStream = createWriteStream(uploadPath);

    // Track progress
    let uploadedBytes = 0;
    const totalBytes = file.size;

    // Listen for data chunks and update progress
    writeStream.on('drain', () => {
      const progress = Math.round((uploadedBytes / totalBytes) * 100);
      this.fileUploadGateway.sendProgress(clientId, progress);
    });

    // Handle the stream manually
    writeStream.write(file.buffer, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('File upload failed');
      } else {
        uploadedBytes += file.buffer.length;
        writeStream.end(() => {
          const progress = Math.round((uploadedBytes / totalBytes) * 100);
          this.fileUploadGateway.sendProgress(clientId, progress);
          res.status(200).json({ message: 'File uploaded successfully', filename });
        });
      }
    });
  }
}
