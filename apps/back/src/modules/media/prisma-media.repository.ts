import type { DatabaseClient } from '../../infrastructure/database/prisma';
import { softDeleteData } from '../../core/lifecycle';
import type {
  CreateMediaInput,
  MediaRepository,
  SearchMediaInput,
} from './media.repository';

export class PrismaMediaRepository implements MediaRepository {
  constructor(private readonly database: DatabaseClient) {}

  create(input: CreateMediaInput) {
    return this.database.mediaAsset.create({ data: input });
  }

  find(id: string, kind?: 'IMAGE' | 'VIDEO' | 'FILE') {
    return this.database.mediaAsset.findFirst({
      where: { id, isActive: true, ...(kind ? { kind } : {}) },
    });
  }

  searchImages(input: SearchMediaInput) {
    return this.database.mediaAsset.findMany({
      where: {
        kind: 'IMAGE',
        isActive: true,
        ...(input.extension
          ? { extension: input.extension.toUpperCase() }
          : {}),
        ...(input.query
          ? { name: { contains: input.query, mode: 'insensitive' as const } }
          : {}),
        ...(input.tags?.length ? { tags: { hasEvery: input.tags } } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countActiveReferences(id: string): Promise<number> {
    const counts = await Promise.all([
      this.database.slide.count({ where: { logoId: id, isActive: true } }),
      this.database.ecosystemItem.count({
        where: { imageId: id, isActive: true },
      }),
      this.database.clientStory.count({
        where: { imageId: id, isActive: true },
      }),
      this.database.case.count({ where: { logoId: id, isActive: true } }),
      this.database.caseImage.count({ where: { imageId: id, isActive: true } }),
      this.database.aboutMedia.count({
        where: { mediaId: id, isActive: true },
      }),
      this.database.partner.count({ where: { logoId: id, isActive: true } }),
    ]);
    return counts.reduce((total, count) => total + count, 0);
  }

  async softDelete(id: string): Promise<void> {
    await this.database.mediaAsset.update({
      where: { id },
      data: softDeleteData(),
    });
  }
}
