import { BadRequestException, Injectable } from '@nestjs/common';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { ResourceService } from '../content/resource.service';
import { FileRecord, ImageExtension, ImageRecord, VideoRecord } from '../storage/cms.types';

export interface UploadedMediaFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

const imageTypes: Record<string, ImageExtension> = {
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/gif': 'GIF',
  'image/webp': 'WEBP',
  'image/svg+xml': 'SVG',
};

const videoTypes: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/ogg': 'ogg',
};

@Injectable()
export class MediaService {
  private readonly uploadRoot = resolve(
    process.env.CMS_UPLOAD_DIR ?? join(process.cwd(), 'data', 'uploads'),
  );

  constructor(private readonly resources: ResourceService) {}

  async saveImage(file: UploadedMediaFile | undefined, name: string, tags: string[]): Promise<ImageRecord> {
    if (!file) throw new BadRequestException('File is required');
    const extension = imageTypes[file.mimetype];
    if (!extension) throw new BadRequestException('Unsupported image type');
    const id = this.resources.id();
    const storagePath = join('images', `${id}.${extension.toLowerCase()}`);
    await this.write(storagePath, file.buffer);
    const image: ImageRecord = {
      id,
      name: name?.trim() || file.originalname,
      size: file.size,
      extension,
      uploadDate: this.resources.now(),
      tags,
      storagePath,
      contentType: file.mimetype,
    };
    await this.resources.insert('images', image);
    return image;
  }

  async saveVideo(file: UploadedMediaFile | undefined, name: string): Promise<VideoRecord> {
    if (!file) throw new BadRequestException('File is required');
    const extension = videoTypes[file.mimetype];
    if (!extension) throw new BadRequestException('Unsupported video type');
    const id = this.resources.id();
    const storagePath = join('videos', `${id}.${extension}`);
    await this.write(storagePath, file.buffer);
    const video: VideoRecord = {
      id,
      name: name?.trim() || file.originalname,
      size: file.size,
      contentType: file.mimetype,
      uploadDate: this.resources.now(),
      storagePath,
    };
    await this.resources.insert('videos', video);
    return video;
  }

  async savePdf(file: UploadedMediaFile | undefined): Promise<FileRecord> {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado.');
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Apenas arquivos PDF são permitidos.');
    }
    const id = this.resources.id();
    const storagePath = join('pdfs', `${id}.pdf`);
    await this.write(storagePath, file.buffer);
    const record: FileRecord = {
      id,
      url: `/v1/files/${id}`,
      name: file.originalname,
      size: file.size,
      contentType: file.mimetype,
      storagePath,
      uploadDate: this.resources.now(),
    };
    await this.resources.insert('files', record);
    return record;
  }

  async read(storagePath: string): Promise<Buffer> {
    return readFile(this.absolute(storagePath));
  }

  async deleteImage(id: string): Promise<void> {
    const image = this.resources.requireImage(id);
    await this.deleteFile(image.storagePath);
    await this.resources.remove('images', id, 'Image');
  }

  async deleteVideo(id: string): Promise<void> {
    const video = this.resources.requireVideo(id);
    await this.deleteFile(video.storagePath);
    await this.resources.remove('videos', id, 'Video');
  }

  private async write(storagePath: string, data: Buffer): Promise<void> {
    const target = this.absolute(storagePath);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, data);
  }

  private async deleteFile(storagePath: string): Promise<void> {
    try {
      await unlink(this.absolute(storagePath));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }

  private absolute(storagePath: string): string {
    const target = resolve(this.uploadRoot, storagePath);
    const relativePath = relative(this.uploadRoot, target);
    if (relativePath.startsWith('..') || resolve(target) === resolve(this.uploadRoot)) {
      throw new BadRequestException('Invalid media path');
    }
    return target;
  }
}
