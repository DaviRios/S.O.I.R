import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { ResourceService } from '../content/resource.service';
import { FileRecord, ImageExtension, ImageRecord } from '../storage/cms.types';
import { MediaService, UploadedMediaFile } from './media.service';

interface HeaderResponse {
  setHeader(name: string, value: string): void;
}

function asList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

@Controller('images')
export class ImagesController {
  constructor(
    private readonly media: MediaService,
    private readonly resources: ResourceService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: UploadedMediaFile | undefined,
    @Body('name') name: string,
    @Body('tags') tags: string | string[] | undefined,
    @Res({ passthrough: true }) response: HeaderResponse,
  ) {
    const image = await this.media.saveImage(file, name, asList(tags));
    response.setHeader('Location', `/v1/images/${image.id}`);
  }

  @Post('batch')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files', 20))
  async uploadBatch(
    @UploadedFiles() files: UploadedMediaFile[],
    @Body('name') names: string | string[] | undefined,
    @Body('tags') tags: string | string[] | undefined,
  ) {
    const nameList = asList(names);
    const results: string[] = [];
    for (let index = 0; index < files.length; index += 1) {
      const image = await this.media.saveImage(
        files[index],
        nameList[index] ?? files[index].originalname,
        asList(tags),
      );
      results.push(`/v1/images/${image.id}`);
    }
    return results;
  }

  @Get()
  search(
    @Query('extension') extension?: ImageExtension,
    @Query('query') query?: string,
    @Query('tags') tags?: string | string[],
  ) {
    const wantedTags = asList(tags);
    return this.resources
      .list<ImageRecord>('images')
      .filter((image) => !extension || image.extension === extension.toUpperCase())
      .filter((image) => !query || image.name.toLowerCase().includes(query.toLowerCase()))
      .filter((image) => wantedTags.length === 0 || wantedTags.every((tag) => image.tags.includes(tag)))
      .map((image) => ({
        id: image.id,
        url: this.resources.imageUrl(image.id),
        name: image.name,
        extension: image.extension,
        size: image.size,
        uploadDate: image.uploadDate.slice(0, 10),
      }));
  }

  @Get(':id')
  async get(@Param('id') id: string, @Res() response: Response) {
    const image = this.resources.requireImage(id);
    response.type(image.contentType).send(await this.media.read(image.storagePath));
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) { return this.media.deleteImage(id); }
}

@Controller('videos')
export class VideosController {
  constructor(
    private readonly media: MediaService,
    private readonly resources: ResourceService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: UploadedMediaFile | undefined,
    @Body('name') name: string,
    @Res({ passthrough: true }) response: HeaderResponse,
  ) {
    const video = await this.media.saveVideo(file, name);
    response.setHeader('Location', `/v1/videos/${video.id}`);
  }

  @Get(':id')
  async get(@Param('id') id: string, @Res() response: Response) {
    const video = this.resources.requireVideo(id);
    response.type(video.contentType).send(await this.media.read(video.storagePath));
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) { return this.media.deleteVideo(id); }
}

@Controller('files')
export class FilesController {
  constructor(
    private readonly media: MediaService,
    private readonly resources: ResourceService,
  ) {}

  @Post('upload')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: UploadedMediaFile | undefined) {
    await this.media.savePdf(file);
    return 'Arquivo enviado com sucesso.';
  }

  @Get(':id')
  async get(@Param('id') id: string, @Res() response: Response) {
    const file = this.resources.get<FileRecord>('files', id, 'File');
    response.type(file.contentType).send(await this.media.read(file.storagePath));
  }
}
