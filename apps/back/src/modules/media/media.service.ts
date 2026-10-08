import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../core/errors';
import type { MediaKind } from '../../generated/prisma/client';
import type { ImageSearchResult } from '@soir/contracts';
import type { MediaRepository, SearchMediaInput } from './media.repository';
import type { MediaStorage } from './media-storage';

export interface UploadedMediaFile {
  filename: string;
  mimetype: string;
  buffer: Buffer;
}

const imageTypes: Record<string, string> = {
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/gif': 'GIF',
  'image/webp': 'WEBP',
  'image/svg+xml': 'SVG',
};
const videoTypes: Record<string, string> = {
  'video/mp4': 'MP4',
  'video/webm': 'WEBM',
  'video/ogg': 'OGG',
};

export class MediaService {
  constructor(
    private readonly repository: MediaRepository,
    private readonly storage: MediaStorage,
  ) {}

  async uploadImage(
    file: UploadedMediaFile,
    name?: string,
    tags: string[] = [],
  ) {
    const extension = imageTypes[file.mimetype];
    if (!extension)
      throw new ValidationError('Formato de imagem não suportado');
    return this.save('IMAGE', extension, file, name, tags);
  }

  async uploadVideo(file: UploadedMediaFile, name?: string) {
    const extension = videoTypes[file.mimetype];
    if (!extension) throw new ValidationError('Formato de vídeo não suportado');
    return this.save('VIDEO', extension, file, name);
  }

  async uploadFile(file: UploadedMediaFile) {
    if (file.mimetype !== 'application/pdf') {
      throw new ValidationError('Apenas arquivos PDF são permitidos');
    }
    return this.save('FILE', 'PDF', file, file.filename);
  }

  async searchImages(input: SearchMediaInput): Promise<ImageSearchResult[]> {
    const images = await this.repository.searchImages(input);
    return images.map((image) => ({
      id: image.id,
      url: `/v1/images/${image.id}`,
      name: image.name,
      extension: image.extension as ImageSearchResult['extension'],
      size: image.size,
      uploadDate: image.createdAt.toISOString().slice(0, 10),
    }));
  }

  async read(id: string, kind: MediaKind) {
    const asset = await this.repository.find(id, kind);
    if (!asset) throw new NotFoundError('Mídia');
    return { asset, contents: await this.storage.get(asset.storagePath) };
  }

  async remove(id: string, kind: MediaKind): Promise<void> {
    const asset = await this.repository.find(id, kind);
    if (!asset) throw new NotFoundError('Mídia');
    if ((await this.repository.countActiveReferences(id)) > 0) {
      throw new ConflictError('A mídia está sendo usada por um conteúdo ativo');
    }
    await this.repository.softDelete(id);
  }

  private async save(
    kind: MediaKind,
    extension: string,
    file: UploadedMediaFile,
    name?: string,
    tags: string[] = [],
  ) {
    const id = randomUUID();
    const directory =
      kind === 'IMAGE' ? 'images' : kind === 'VIDEO' ? 'videos' : 'files';
    const safeExtension =
      extension.toLowerCase() || extname(file.filename).slice(1);
    const storagePath = `${directory}/${id}.${safeExtension}`;
    await this.storage.put(storagePath, file.buffer, file.mimetype);
    return this.repository.create({
      id,
      kind,
      name: name?.trim() || file.filename,
      size: file.buffer.byteLength,
      extension,
      tags,
      storagePath,
      contentType: file.mimetype,
    });
  }
}
