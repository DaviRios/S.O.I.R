import type { MediaAsset, MediaKind } from '../../generated/prisma/client';

export interface CreateMediaInput {
  id: string;
  kind: MediaKind;
  name: string;
  size: number;
  extension: string;
  tags: string[];
  storagePath: string;
  contentType: string;
}

export interface SearchMediaInput {
  extension?: string;
  query?: string;
  tags?: string[];
}

export interface MediaRepository {
  create(input: CreateMediaInput): Promise<MediaAsset>;
  find(id: string, kind?: MediaKind): Promise<MediaAsset | null>;
  searchImages(input: SearchMediaInput): Promise<MediaAsset[]>;
  countActiveReferences(id: string): Promise<number>;
  softDelete(id: string): Promise<void>;
}
