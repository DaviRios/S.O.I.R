import type { DatabaseClient } from '../../infrastructure/database/prisma';
import {
  publishData,
  softDeleteData,
  unpublishData,
} from '../../core/lifecycle';
import type {
  CasesRepository,
  CreateCaseInput,
  CreateCaseTestimonialInput,
  UpdateCaseInput,
} from './cases.repository';

const publicationData = (published: boolean) =>
  published ? publishData() : unpublishData();

export class PrismaCasesRepository implements CasesRepository {
  constructor(private readonly database: DatabaseClient) {}

  async imageExists(id: string): Promise<boolean> {
    return (
      (await this.database.mediaAsset.count({
        where: { id, kind: 'IMAGE', isActive: true },
      })) > 0
    );
  }
  createCase(input: CreateCaseInput) {
    return this.database.case.create({
      data: {
        title: input.title,
        shortTitle: input.shortTitle ?? '',
        subtitle: input.subtitle ?? '',
        content: input.content ?? '',
        industry: input.industry ?? '',
        country: input.country ?? '',
        tag: input.tag ?? '',
        logoId: input.logoId,
        language: input.language,
      },
      include: {
        images: { where: { isActive: true }, orderBy: { position: 'asc' } },
      },
    });
  }
  listCases(title?: string) {
    return this.database.case.findMany({
      where: {
        isActive: true,
        ...(title
          ? { title: { contains: title, mode: 'insensitive' as const } }
          : {}),
      },
      include: {
        images: { where: { isActive: true }, orderBy: { position: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  findCase(id: string) {
    return this.database.case.findFirst({
      where: { id, isActive: true },
      include: {
        images: { where: { isActive: true }, orderBy: { position: 'asc' } },
      },
    });
  }
  async updateCase(id: string, input: UpdateCaseInput) {
    await this.database.case.update({ where: { id }, data: input });
  }
  async setCasePublished(id: string, published: boolean) {
    await this.database.case.update({
      where: { id },
      data: publicationData(published),
    });
  }
  async deleteCase(id: string) {
    await this.database.case.update({ where: { id }, data: softDeleteData() });
  }
  async addImages(caseId: string, imageIds: string[]) {
    const current = await this.database.caseImage.count({
      where: { caseId, isActive: true },
    });
    await this.database.caseImage.createMany({
      data: imageIds.map((imageId, index) => ({
        caseId,
        imageId,
        position: current + index,
      })),
      skipDuplicates: true,
    });
  }
  createTestimonial(caseId: string, input: CreateCaseTestimonialInput) {
    return this.database.caseTestimonial.create({
      data: {
        caseId,
        authorName: input.authorName,
        role: input.role ?? '',
        company: input.company ?? '',
        content: input.content,
        language: input.language,
      },
    });
  }
  listTestimonials(caseId: string, language?: 'ENGLISH' | 'PORTUGUESE') {
    return this.database.caseTestimonial.findMany({
      where: { caseId, isActive: true, ...(language ? { language } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }
  findTestimonial(caseId: string, id: string) {
    return this.database.caseTestimonial.findFirst({
      where: { caseId, id, isActive: true },
    });
  }
  async setTestimonialPublished(id: string, published: boolean) {
    await this.database.caseTestimonial.update({
      where: { id },
      data: publicationData(published),
    });
  }
}
