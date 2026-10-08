import { NotFoundError } from '../../core/errors';
import { lifecycleDto } from '../../core/lifecycle';
import type {
  AboutMediaWithAsset,
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

export class SiteContentService {
  constructor(private readonly repository: SiteContentRepository) {}

  private async requireMedia(id: string, kind?: 'IMAGE' | 'VIDEO') {
    const media = await this.repository.findMedia(id);
    if (!media || (kind && media.kind !== kind))
      throw new NotFoundError('Mídia');
    return media;
  }

  async createClientStory(input: CreateClientStoryInput) {
    await this.requireMedia(input.imageId, 'IMAGE');
    return this.clientStoryDto(await this.repository.createClientStory(input));
  }
  async listClientStories() {
    return (await this.repository.listClientStories()).map((item) =>
      this.clientStoryDto(item),
    );
  }
  async getClientStory(id: string) {
    const item = await this.repository.findClientStory(id);
    if (!item) throw new NotFoundError('História de cliente');
    return this.clientStoryDto(item);
  }
  async updateClientStory(id: string, input: UpdateClientStoryInput) {
    await this.getClientStory(id);
    if (input.imageId) await this.requireMedia(input.imageId, 'IMAGE');
    await this.repository.updateClientStory(id, input);
  }
  async setClientStoryPublished(id: string, published: boolean) {
    await this.getClientStory(id);
    await this.repository.setClientStoryPublished(id, published);
  }
  async toggleClientStory(id: string) {
    const item = await this.getClientStory(id);
    await this.setClientStoryPublished(id, !item.isPublished);
  }
  async deleteClientStory(id: string) {
    await this.getClientStory(id);
    await this.repository.deleteClientStory(id);
  }

  async createAboutMedia(input: CreateAboutMediaInput) {
    await this.requireMedia(input.imageId, input.mediaType);
    return this.aboutMediaDto(await this.repository.createAboutMedia(input));
  }
  async listAboutMedia() {
    return (await this.repository.listAboutMedia()).map((item) =>
      this.aboutMediaDto(item),
    );
  }
  async getAboutMedia(id: string) {
    const item = await this.repository.findAboutMedia(id);
    if (!item) throw new NotFoundError('Mídia institucional');
    return this.aboutMediaDto(item);
  }
  async updateAboutMedia(id: string, input: UpdateAboutMediaInput) {
    await this.getAboutMedia(id);
    if (input.imageId) await this.requireMedia(input.imageId, input.mediaType);
    await this.repository.updateAboutMedia(id, input);
  }
  async toggleAboutMedia(id: string) {
    const item = await this.getAboutMedia(id);
    await this.repository.setAboutMediaPublished(id, !item.isPublished);
  }
  async deleteAboutMedia(id: string) {
    await this.getAboutMedia(id);
    await this.repository.deleteAboutMedia(id);
  }

  async createPartner(input: CreatePartnerInput) {
    if (input.logoId) await this.requireMedia(input.logoId, 'IMAGE');
    return lifecycleDto(await this.repository.createPartner(input));
  }
  async listPartners() {
    return (await this.repository.listPartners()).map(lifecycleDto);
  }
  async getPartner(id: string) {
    const item = await this.repository.findPartner(id);
    if (!item) throw new NotFoundError('Parceiro');
    return lifecycleDto(item);
  }
  async updatePartner(id: string, input: UpdatePartnerInput) {
    await this.getPartner(id);
    if (input.logoId) await this.requireMedia(input.logoId, 'IMAGE');
    await this.repository.updatePartner(id, input);
  }
  async setPartnerPublished(id: string, published: boolean) {
    await this.getPartner(id);
    await this.repository.setPartnerPublished(id, published);
  }
  async deletePartner(id: string) {
    await this.getPartner(id);
    await this.repository.deletePartner(id);
  }

  async createCareer(input: CreateCareerInput) {
    return lifecycleDto(await this.repository.createCareer(input));
  }
  async listCareers(language?: 'ENGLISH' | 'PORTUGUESE') {
    return (await this.repository.listCareers(language)).map(lifecycleDto);
  }
  async getCareer(id: string) {
    const item = await this.repository.findCareer(id);
    if (!item) throw new NotFoundError('Vaga');
    return lifecycleDto(item);
  }
  async updateCareer(id: string, input: UpdateCareerInput) {
    await this.getCareer(id);
    await this.repository.updateCareer(id, input);
  }
  async setCareerPublished(id: string, published: boolean) {
    await this.getCareer(id);
    await this.repository.setCareerPublished(id, published);
  }
  async deleteCareer(id: string) {
    await this.getCareer(id);
    await this.repository.deleteCareer(id);
  }

  async createServiceItem(input: CreateServiceItemInput) {
    return lifecycleDto(await this.repository.createServiceItem(input));
  }
  async listServiceItems(language?: 'ENGLISH' | 'PORTUGUESE') {
    return (await this.repository.listServiceItems(language)).map(lifecycleDto);
  }
  async getServiceItem(id: string) {
    const item = await this.repository.findServiceItem(id);
    if (!item) throw new NotFoundError('Serviço');
    return lifecycleDto(item);
  }
  async updateServiceItem(id: string, input: UpdateServiceItemInput) {
    await this.getServiceItem(id);
    await this.repository.updateServiceItem(id, input);
  }
  async setServiceItemPublished(id: string, published: boolean) {
    await this.getServiceItem(id);
    await this.repository.setServiceItemPublished(id, published);
  }
  async deleteServiceItem(id: string) {
    await this.getServiceItem(id);
    await this.repository.deleteServiceItem(id);
  }

  private clientStoryDto<
    T extends {
      imageId: string;
      publicationStatus: 'DRAFT' | 'PUBLISHED';
      isActive: boolean;
      publishedAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    },
  >(item: T) {
    return { ...lifecycleDto(item), imageUrl: `/v1/images/${item.imageId}` };
  }
  private aboutMediaDto(item: AboutMediaWithAsset) {
    const dto = lifecycleDto(item);
    const { media, mediaId, ...data } = dto;
    const endpoint = item.mediaType === 'VIDEO' ? 'videos' : 'images';
    return {
      ...data,
      imageId: mediaId,
      imageUrl: `/v1/${endpoint}/${media.id}`,
    };
  }
}
