import type { DatabaseClient } from '../../infrastructure/database/prisma';
import {
  publishData,
  softDeleteData,
  unpublishData,
} from '../../core/lifecycle';
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

export class PrismaHomeContentRepository implements HomeContentRepository {
  constructor(private readonly database: DatabaseClient) {}

  async imageExists(id: string): Promise<boolean> {
    return (
      (await this.database.mediaAsset.count({
        where: { id, kind: 'IMAGE', isActive: true },
      })) > 0
    );
  }

  createSlide(input: CreateSlideInput) {
    return this.database.slide.create({
      data: {
        logoId: input.logoId,
        text: input.text,
        buttonText: input.buttonText ?? '',
        buttonUrl: input.buttonUrl ?? '',
        language: input.language,
      },
    });
  }
  listSlides(language?: 'ENGLISH' | 'PORTUGUESE') {
    return this.database.slide.findMany({
      where: { isActive: true, ...(language ? { language } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }
  findSlide(id: string) {
    return this.database.slide.findFirst({ where: { id, isActive: true } });
  }
  async updateSlide(id: string, input: UpdateSlideInput) {
    await this.database.slide.update({ where: { id }, data: input });
  }
  async publishSlide(id: string) {
    await this.database.slide.update({ where: { id }, data: publishData() });
  }
  async unpublishSlide(id: string) {
    await this.database.slide.update({ where: { id }, data: unpublishData() });
  }
  async deleteSlide(id: string) {
    await this.database.slide.update({ where: { id }, data: softDeleteData() });
  }

  createPopup(input: CreatePopupInput) {
    return this.database.popup.create({
      data: {
        title: input.title,
        description: input.description ?? '',
        buttonText: input.buttonText ?? '',
        redirectUrl: input.redirectUrl ?? '',
        buttonText2: input.buttonText2 ?? '',
        redirectUrl2: input.redirectUrl2 ?? '',
        style: input.style,
        language: input.language,
      },
    });
  }
  listPopups(language?: 'ENGLISH' | 'PORTUGUESE') {
    return this.database.popup.findMany({
      where: { isActive: true, ...(language ? { language } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }
  findPopup(id: string) {
    return this.database.popup.findFirst({ where: { id, isActive: true } });
  }
  async updatePopup(id: string, input: UpdatePopupInput) {
    await this.database.popup.update({ where: { id }, data: input });
  }
  async publishPopup(id: string) {
    await this.database.popup.update({ where: { id }, data: publishData() });
  }
  async unpublishPopup(id: string) {
    await this.database.popup.update({ where: { id }, data: unpublishData() });
  }
  async deletePopup(id: string) {
    await this.database.popup.update({ where: { id }, data: softDeleteData() });
  }

  createEcosystem(input: CreateEcosystemInput) {
    return this.database.ecosystemItem.create({ data: input });
  }
  listEcosystems() {
    return this.database.ecosystemItem.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  findEcosystem(id: string) {
    return this.database.ecosystemItem.findFirst({
      where: { id, isActive: true },
    });
  }
  async updateEcosystem(id: string, input: UpdateEcosystemInput) {
    await this.database.ecosystemItem.update({ where: { id }, data: input });
  }
  async publishEcosystem(id: string) {
    await this.database.ecosystemItem.update({
      where: { id },
      data: publishData(),
    });
  }
  async unpublishEcosystem(id: string) {
    await this.database.ecosystemItem.update({
      where: { id },
      data: unpublishData(),
    });
  }
  async deleteEcosystem(id: string) {
    await this.database.ecosystemItem.update({
      where: { id },
      data: softDeleteData(),
    });
  }

  createHomeBlogLink(input: CreateHomeBlogLinkInput) {
    return this.database.homeBlogLink.create({
      data: { url: input.url, label: input.label ?? '' },
    });
  }
  listHomeBlogLinks() {
    return this.database.homeBlogLink.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  findHomeBlogLink(id: string) {
    return this.database.homeBlogLink.findFirst({
      where: { id, isActive: true },
    });
  }
  async updateHomeBlogLink(id: string, input: UpdateHomeBlogLinkInput) {
    await this.database.homeBlogLink.update({ where: { id }, data: input });
  }
  async publishHomeBlogLink(id: string) {
    await this.database.homeBlogLink.update({
      where: { id },
      data: publishData(),
    });
  }
  async unpublishHomeBlogLink(id: string) {
    await this.database.homeBlogLink.update({
      where: { id },
      data: unpublishData(),
    });
  }
  async deleteHomeBlogLink(id: string) {
    await this.database.homeBlogLink.update({
      where: { id },
      data: softDeleteData(),
    });
  }
}
