import type { z } from 'zod';
import type {
  createAboutMediaSchema,
  createCareerSchema,
  createClientStorySchema,
  createPartnerSchema,
  createServiceItemSchema,
  updateAboutMediaSchema,
  updateCareerSchema,
  updateClientStorySchema,
  updatePartnerSchema,
  updateServiceItemSchema,
} from '@soir/contracts';
import type {
  AboutMedia,
  Career,
  ClientStory,
  MediaAsset,
  Partner,
  ServiceItem,
} from '../../generated/prisma/client';

export type CreateClientStoryInput = z.infer<typeof createClientStorySchema>;
export type UpdateClientStoryInput = z.infer<typeof updateClientStorySchema>;
export type CreateAboutMediaInput = z.infer<typeof createAboutMediaSchema>;
export type UpdateAboutMediaInput = z.infer<typeof updateAboutMediaSchema>;
export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;
export type CreateCareerInput = z.infer<typeof createCareerSchema>;
export type UpdateCareerInput = z.infer<typeof updateCareerSchema>;
export type CreateServiceItemInput = z.infer<typeof createServiceItemSchema>;
export type UpdateServiceItemInput = z.infer<typeof updateServiceItemSchema>;

export type AboutMediaWithAsset = AboutMedia & { media: MediaAsset };

export interface SiteContentRepository {
  findMedia(id: string): Promise<MediaAsset | null>;
  createClientStory(input: CreateClientStoryInput): Promise<ClientStory>;
  listClientStories(): Promise<ClientStory[]>;
  findClientStory(id: string): Promise<ClientStory | null>;
  updateClientStory(id: string, input: UpdateClientStoryInput): Promise<void>;
  setClientStoryPublished(id: string, published: boolean): Promise<void>;
  deleteClientStory(id: string): Promise<void>;
  createAboutMedia(input: CreateAboutMediaInput): Promise<AboutMediaWithAsset>;
  listAboutMedia(): Promise<AboutMediaWithAsset[]>;
  findAboutMedia(id: string): Promise<AboutMediaWithAsset | null>;
  updateAboutMedia(id: string, input: UpdateAboutMediaInput): Promise<void>;
  setAboutMediaPublished(id: string, published: boolean): Promise<void>;
  deleteAboutMedia(id: string): Promise<void>;
  createPartner(input: CreatePartnerInput): Promise<Partner>;
  listPartners(): Promise<Partner[]>;
  findPartner(id: string): Promise<Partner | null>;
  updatePartner(id: string, input: UpdatePartnerInput): Promise<void>;
  setPartnerPublished(id: string, published: boolean): Promise<void>;
  deletePartner(id: string): Promise<void>;
  createCareer(input: CreateCareerInput): Promise<Career>;
  listCareers(language?: 'ENGLISH' | 'PORTUGUESE'): Promise<Career[]>;
  findCareer(id: string): Promise<Career | null>;
  updateCareer(id: string, input: UpdateCareerInput): Promise<void>;
  setCareerPublished(id: string, published: boolean): Promise<void>;
  deleteCareer(id: string): Promise<void>;
  createServiceItem(input: CreateServiceItemInput): Promise<ServiceItem>;
  listServiceItems(language?: 'ENGLISH' | 'PORTUGUESE'): Promise<ServiceItem[]>;
  findServiceItem(id: string): Promise<ServiceItem | null>;
  updateServiceItem(id: string, input: UpdateServiceItemInput): Promise<void>;
  setServiceItemPublished(id: string, published: boolean): Promise<void>;
  deleteServiceItem(id: string): Promise<void>;
}
