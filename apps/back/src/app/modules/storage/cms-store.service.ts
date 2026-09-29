import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { CmsData, emptyCmsData } from './cms.types';

@Injectable()
export class CmsStoreService implements OnModuleInit {
  private readonly logger = new Logger(CmsStoreService.name);
  private readonly filePath = resolve(
    process.env.CMS_DATA_FILE ?? join(process.cwd(), 'data', 'cms.json'),
  );
  private data: CmsData = emptyCmsData();
  private writeQueue: Promise<void> = Promise.resolve();

  async onModuleInit(): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    try {
      const stored = JSON.parse(await readFile(this.filePath, 'utf8')) as CmsData;
      this.data = this.normalize(stored);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
      await this.persist();
      this.logger.log(`Banco local criado em ${this.filePath}`);
    }
  }

  query<T>(reader: (data: Readonly<CmsData>) => T): T {
    return reader(this.data);
  }

  async mutate<T>(mutation: (data: CmsData) => T): Promise<T> {
    const result = mutation(this.data);
    await this.persist();
    return result;
  }

  private persist(): Promise<void> {
    const snapshot = JSON.stringify(this.data, null, 2);
    const temporaryPath = `${this.filePath}.tmp`;
    this.writeQueue = this.writeQueue
      .catch(() => undefined)
      .then(async () => {
        await writeFile(temporaryPath, snapshot, 'utf8');
        await rename(temporaryPath, this.filePath);
      });
    return this.writeQueue;
  }

  private normalize(value: Partial<CmsData>): CmsData {
    const empty = emptyCmsData();
    return {
      ...empty,
      version: 2,
      users: Array.isArray(value.users) ? value.users : [],
      authors: Array.isArray(value.authors) ? value.authors : [],
      blogPosts: Array.isArray(value.blogPosts) ? value.blogPosts : [],
      images: Array.isArray(value.images) ? value.images : [],
      videos: Array.isArray(value.videos) ? value.videos : [],
      files: Array.isArray(value.files) ? value.files : [],
      slides: Array.isArray(value.slides) ? value.slides : [],
      popups: Array.isArray(value.popups) ? value.popups : [],
      ecosystems: Array.isArray(value.ecosystems) ? value.ecosystems : [],
      homeBlogLinks: Array.isArray(value.homeBlogLinks) ? value.homeBlogLinks : [],
      clientStories: Array.isArray(value.clientStories) ? value.clientStories : [],
      cases: Array.isArray(value.cases) ? value.cases : [],
      caseImages: Array.isArray(value.caseImages) ? value.caseImages : [],
      caseTestimonials: Array.isArray(value.caseTestimonials)
        ? value.caseTestimonials
        : [],
      aboutMedia: Array.isArray(value.aboutMedia) ? value.aboutMedia : [],
      partners: Array.isArray(value.partners) ? value.partners : [],
      careers: Array.isArray(value.careers) ? value.careers : [],
      serviceItems: Array.isArray(value.serviceItems) ? value.serviceItems : [],
    };
  }
}
