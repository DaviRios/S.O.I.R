export interface LifecycleRecord {
  publicationStatus: 'DRAFT' | 'PUBLISHED';
  isActive: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export function lifecycleDto<T extends LifecycleRecord>(record: T) {
  const { publicationStatus, ...data } = record;
  return {
    ...data,
    isDraft: publicationStatus === 'DRAFT',
    isPublished: publicationStatus === 'PUBLISHED',
    publishedAt: record.publishedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function auditDto<T extends { createdAt: Date; updatedAt: Date }>(
  record: T,
) {
  return {
    ...record,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export const publishData = () => ({
  publicationStatus: 'PUBLISHED' as const,
  publishedAt: new Date(),
});

export const unpublishData = () => ({
  publicationStatus: 'DRAFT' as const,
  publishedAt: null,
});

export const softDeleteData = () => ({
  isActive: false,
  deletedAt: new Date(),
});
