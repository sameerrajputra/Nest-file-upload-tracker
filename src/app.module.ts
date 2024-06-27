import { Module } from '@nestjs/common';
import { FileUploadController } from './app.controller';
import { AppService } from './app.service';
import { UploadService } from './upload.service';
import { FileUploadGateway } from './file-upload.gateway';

@Module({
  imports: [],
  controllers: [FileUploadController],
  providers: [UploadService, FileUploadGateway],
})
export class AppModule {}
