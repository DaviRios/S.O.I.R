import type { DatabaseClient } from '../../infrastructure/database/prisma';
import {
  publishData,
  softDeleteData,
  unpublishData,
} from '../../core/lifecycle';
import type {
  CreateAboutMediaInput,
  CreateCareerInput,
  CreateClientStoryInput,
  CreatePartnerInput,
  CreateServiceItemInput,
  SiteContentRepository,
  UpdateAboutMediaInput,
  UpdateCareerInput,
  UpdateClientStoryInput,
  UpdatePartnerInput,
  UpdateServiceItemInput,
} from './site-content.repository';

const publicationData = (published: boolean) =>
  published ? publishData() : unpublishData();

export class PrismaSiteContentRepository implements SiteContentRepository {
  constructor(private readonly database: DatabaseClient) {}

  findMedia(id: string) {
    return this.database.mediaAsset.findFirst({
      where: { id, isActive: true },
    });
  }

  createClientStory(input: CreateClientStoryInput) {
    return this.database.clientStory.create({ data: input });
  }
  listClientStories() {
    return this.database.clientStory.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  findClientStory(id: string) {
    return this.database.clientStory.findFirst({
      where: { id, isActive: true },
    });
  }
  async updateClientStory(id: string, input: UpdateClientStoryInput) {
    await this.database.clientStory.update({ where: { id }, data: input });
  }
  async setClientStoryPublished(id: string, published: boolean) {
    await this.database.clientStory.update({
      where: { id },
      data: publicationData(published),
    });
  }
  async deleteClientStory(id: string) {
    await this.database.clientStory.update({
      where: { id },
      data: softDeleteData(),
    });
  }

  createAboutMedia(input: CreateAboutMediaInput) {
    return this.database.aboutMedia.create({
      data: {
        mediaId: input.imageId,
        mediaType: input.mediaType,
        caption: input.caption ?? '',
        sortOrder: input.sortOrder,
      },
      include: { media: true },
    });
  }
  listAboutMedia() {
    return this.database.aboutMedia.findMany({
      where: { isActive: true },
      include: { media: true },
      orderBy: { sortOrder: 'asc' },
    });
  }
  findAboutMedia(id: string) {
    return this.database.aboutMedia.findFirst({
      where: { id, isActive: true },
      include: { media: true },
    });
  }
  async updateAboutMedia(id: string, input: UpdateAboutMediaInput) {
    const { imageId, ...data } = input;
    await this.database.aboutMedia.update({
      where: { id },
      data: { ...data, ...(imageId ? { mediaId: imageId } : {}) },
    });
  }
  async setAboutMediaPublished(id: string, published: boolean) {
    await this.database.aboutMedia.update({
      where: { id },
      data: publicationData(published),
    });
  }
  async deleteAboutMedia(id: string) {
    await this.database.aboutMedia.update({
      where: { id },
      data: softDeleteData(),
    });
  }

  createPartner(input: CreatePartnerInput) {
    return this.database.partner.create({
      data: {
        name: input.name,
        logoId: input.logoId,
        website: input.website ?? '',
      },
    });
  }
  listPartners() {
    return this.database.partner.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  findPartner(id: string) {
    return this.database.partner.findFirst({ where: { id, isActive: true } });
  }
  async updatePartner(id: string, input: UpdatePartnerInput) {
    await this.database.partner.update({ where: { id }, data: input });
  }
  async setPartnerPublished(id: string, published: boolean) {
    await this.database.partner.update({
      where: { id },
      data: publicationData(published),
    });
  }
  async deletePartner(id: string) {
    await this.database.partner.update({
      where: { id },
      data: softDeleteData(),
    });
  }

  createCareer(input: CreateCareerInput) {
    return this.database.career.create({
      data: {
        title: input.title,
        description: input.description ?? '',
        location: input.location ?? '',
        language: input.language,
      },
    });
  }
  listCareers(language?: 'ENGLISH' | 'PORTUGUESE') {
    return this.database.career.findMany({
      where: { isActive: true, ...(language ? { language } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }
  findCareer(id: string) {
    return this.database.career.findFirst({ where: { id, isActive: true } });
  }
  async updateCareer(id: string, input: UpdateCareerInput) {
    await this.database.career.update({ where: { id }, data: input });
  }
  async setCareerPublished(id: string, published: boolean) {
    await this.database.career.update({
      where: { id },
      data: publicationData(published),
    });
  }
  async deleteCareer(id: string) {
    await this.database.career.update({
      where: { id },
      data: softDeleteData(),
    });
  }

  createServiceItem(input: CreateServiceItemInput) {
    return this.database.serviceItem.create({
      data: {
        name: input.name,
        description: input.description ?? '',
        language: input.language,
      },
    });
  }
  listServiceItems(language?: 'ENGLISH' | 'PORTUGUESE') {
    return this.database.serviceItem.findMany({
      where: { isActive: true, ...(language ? { language } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }
  findServiceItem(id: string) {
    return this.database.serviceItem.findFirst({
      where: { id, isActive: true },
    });
  }
  async updateServiceItem(id: string, input: UpdateServiceItemInput) {
    await this.database.serviceItem.update({ where: { id }, data: input });
  }
  async setServiceItemPublished(id: string, published: boolean) {
    await this.database.serviceItem.update({
      where: { id },
      data: publicationData(published),
    });
  }
  async deleteServiceItem(id: string) {
    await this.database.serviceItem.update({
      where: { id },
      data: softDeleteData(),
    });
  }
}
