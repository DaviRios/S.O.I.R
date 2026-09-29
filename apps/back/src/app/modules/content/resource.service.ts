import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CmsStoreService } from '../storage/cms-store.service';
import { CmsData, ImageRecord, VideoRecord } from '../storage/cms.types';

export type CmsArrayKey = Exclude<keyof CmsData, 'version'>;

interface Identified {
  id: string;
}

interface Audited extends Identified {
  createdAt: string;
  updatedAt: string;
}

interface Publishable extends Audited {
  isDraft: boolean;
  isPublished: boolean;
  publishedAt: string | null;
}

@Injectable()
export class ResourceService {
  constructor(private readonly store: CmsStoreService) {}

  now(): string {
    return new Date().toISOString();
  }

  id(): string {
    return randomUUID();
  }

  audit(): Pick<Audited, 'createdAt' | 'updatedAt'> {
    const now = this.now();
    return { createdAt: now, updatedAt: now };
  }

  list<T>(collection: CmsArrayKey): T[] {
    return this.store.query((data) => [
      ...((data[collection] as unknown) as T[]),
    ]);
  }

  get<T extends Identified>(
    collection: CmsArrayKey,
    id: string,
    label: string,
  ): T {
    const item = this.store.query((data) =>
      ((data[collection] as unknown) as T[]).find((entry) => entry.id === id),
    );
    if (!item) throw new NotFoundException(`${label} not found`);
    return item;
  }

  async insert<T>(collection: CmsArrayKey, item: T): Promise<T> {
    await this.store.mutate((data) => {
      ((data[collection] as unknown) as T[]).push(item);
    });
    return item;
  }

  async update<T extends Identified>(
    collection: CmsArrayKey,
    id: string,
    label: string,
    change: (item: T) => void,
  ): Promise<T> {
    const item = this.get<T>(collection, id, label);
    await this.store.mutate(() => {
      change(item);
      if ('updatedAt' in item) {
        (item as T & { updatedAt: string }).updatedAt = this.now();
      }
    });
    return item;
  }

  async remove(collection: CmsArrayKey, id: string, label: string): Promise<void> {
    this.get(collection, id, label);
    await this.store.mutate((data) => {
      const records = (data[collection] as unknown) as Identified[];
      const index = records.findIndex((entry) => entry.id === id);
      records.splice(index, 1);
    });
  }

  async toggle<T extends Audited & { isActive: boolean }>(
    collection: CmsArrayKey,
    id: string,
    label: string,
  ): Promise<void> {
    await this.update<T>(collection, id, label, (item) => {
      item.isActive = !item.isActive;
    });
  }

  async publish<T extends Publishable>(
    collection: CmsArrayKey,
    id: string,
    label: string,
  ): Promise<void> {
    await this.update<T>(collection, id, label, (item) => {
      item.isDraft = false;
      item.isPublished = true;
      item.publishedAt = this.now();
    });
  }

  async unpublish<T extends Publishable>(
    collection: CmsArrayKey,
    id: string,
    label: string,
  ): Promise<void> {
    await this.update<T>(collection, id, label, (item) => {
      item.isPublished = false;
      item.publishedAt = null;
    });
  }

  requireImage(id: string): ImageRecord {
    return this.get<ImageRecord>('images', id, 'Image');
  }

  requireVideo(id: string): VideoRecord {
    return this.get<VideoRecord>('videos', id, 'Video');
  }

  imageUrl(id: string, origin = ''): string {
    return `${origin}/v1/images/${id}`;
  }

  videoUrl(id: string, origin = ''): string {
    return `${origin}/v1/videos/${id}`;
  }
}

