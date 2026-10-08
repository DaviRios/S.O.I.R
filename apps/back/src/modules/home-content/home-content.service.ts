import { NotFoundError } from '../../core/errors';
import { lifecycleDto } from '../../core/lifecycle';
import type {
  CreateEcosystemInput,
  CreateHomeBlogLinkInput,
  CreatePopupInput,
  CreateSlideInput,
  HomeContentRepository,
  UpdateEcosystemInput,
  UpdateHomeBlogLinkInput,
  UpdatePopupInput,
  UpdateSlideInput,
} from './home-content.repository';

export class HomeContentService {
  constructor(private readonly repository: HomeContentRepository) {}

  async ensureImage(id: string) {
    if (!(await this.repository.imageExists(id)))
      throw new NotFoundError('Imagem');
  }

  async createSlide(input: CreateSlideInput) {
    await this.ensureImage(input.logoId);
    return lifecycleDto(await this.repository.createSlide(input));
  }
  async listSlides(language?: 'ENGLISH' | 'PORTUGUESE') {
    return (await this.repository.listSlides(language)).map(lifecycleDto);
  }
  async getSlide(id: string) {
    const item = await this.repository.findSlide(id);
    if (!item) throw new NotFoundError('Slide');
    return lifecycleDto(item);
  }
  async updateSlide(id: string, input: UpdateSlideInput) {
    await this.getSlide(id);
    if (input.logoId) await this.ensureImage(input.logoId);
    await this.repository.updateSlide(id, input);
  }
  async publishSlide(id: string) {
    await this.getSlide(id);
    await this.repository.publishSlide(id);
  }
  async unpublishSlide(id: string) {
    await this.getSlide(id);
    await this.repository.unpublishSlide(id);
  }
  async toggleSlide(id: string) {
    const item = await this.getSlide(id);
    return item.isPublished ? this.unpublishSlide(id) : this.publishSlide(id);
  }
  async deleteSlide(id: string) {
    await this.getSlide(id);
    await this.repository.deleteSlide(id);
  }

  async createPopup(input: CreatePopupInput) {
    return lifecycleDto(await this.repository.createPopup(input));
  }
  async listPopups(language?: 'ENGLISH' | 'PORTUGUESE') {
    return (await this.repository.listPopups(language)).map(lifecycleDto);
  }
  async getPopup(id: string) {
    const item = await this.repository.findPopup(id);
    if (!item) throw new NotFoundError('Popup');
    return lifecycleDto(item);
  }
  async updatePopup(id: string, input: UpdatePopupInput) {
    await this.getPopup(id);
    await this.repository.updatePopup(id, input);
  }
  async publishPopup(id: string) {
    await this.getPopup(id);
    await this.repository.publishPopup(id);
  }
  async unpublishPopup(id: string) {
    await this.getPopup(id);
    await this.repository.unpublishPopup(id);
  }
  async deletePopup(id: string) {
    await this.getPopup(id);
    await this.repository.deletePopup(id);
  }

  async createEcosystem(input: CreateEcosystemInput) {
    await this.ensureImage(input.imageId);
    return this.ecosystemDto(await this.repository.createEcosystem(input));
  }
  async listEcosystems() {
    return (await this.repository.listEcosystems()).map((item) =>
      this.ecosystemDto(item),
    );
  }
  async getEcosystem(id: string) {
    const item = await this.repository.findEcosystem(id);
    if (!item) throw new NotFoundError('Item de ecossistema');
    return this.ecosystemDto(item);
  }
  async updateEcosystem(id: string, input: UpdateEcosystemInput) {
    await this.getEcosystem(id);
    if (input.imageId) await this.ensureImage(input.imageId);
    await this.repository.updateEcosystem(id, input);
  }
  async publishEcosystem(id: string) {
    await this.getEcosystem(id);
    await this.repository.publishEcosystem(id);
  }
  async unpublishEcosystem(id: string) {
    await this.getEcosystem(id);
    await this.repository.unpublishEcosystem(id);
  }
  async toggleEcosystem(id: string) {
    const item = await this.getEcosystem(id);
    return item.isPublished
      ? this.unpublishEcosystem(id)
      : this.publishEcosystem(id);
  }
  async deleteEcosystem(id: string) {
    await this.getEcosystem(id);
    await this.repository.deleteEcosystem(id);
  }

  async createHomeBlogLink(input: CreateHomeBlogLinkInput) {
    return lifecycleDto(await this.repository.createHomeBlogLink(input));
  }
  async listHomeBlogLinks() {
    return (await this.repository.listHomeBlogLinks()).map(lifecycleDto);
  }
  async getHomeBlogLink(id: string) {
    const item = await this.repository.findHomeBlogLink(id);
    if (!item) throw new NotFoundError('Link do blog');
    return lifecycleDto(item);
  }
  async updateHomeBlogLink(id: string, input: UpdateHomeBlogLinkInput) {
    await this.getHomeBlogLink(id);
    await this.repository.updateHomeBlogLink(id, input);
  }
  async toggleHomeBlogLink(id: string) {
    const item = await this.getHomeBlogLink(id);
    return item.isPublished
      ? this.repository.unpublishHomeBlogLink(id)
      : this.repository.publishHomeBlogLink(id);
  }
  async deleteHomeBlogLink(id: string) {
    await this.getHomeBlogLink(id);
    await this.repository.deleteHomeBlogLink(id);
  }

  private ecosystemDto<
    T extends Parameters<typeof lifecycleDto>[0] & { imageId: string },
  >(item: T) {
    return { ...lifecycleDto(item), imageUrl: `/v1/images/${item.imageId}` };
  }
}
