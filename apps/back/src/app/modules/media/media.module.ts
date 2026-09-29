import { Module } from '@nestjs/common';
import { FilesController, ImagesController, VideosController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  controllers: [ImagesController, VideosController, FilesController],
  providers: [MediaService],
})
export class MediaModule {}
