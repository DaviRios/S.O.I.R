import { NotFoundError } from '../../core/errors';
import { lifecycleDto } from '../../core/lifecycle';
import type {
  CasesRepository,
  CaseWithImages,
  CreateCaseInput,
  CreateCaseTestimonialInput,
  UpdateCaseInput,
} from './cases.repository';

export class CasesService {
  constructor(private readonly repository: CasesRepository) {}

  async create(input: CreateCaseInput) {
    if (input.logoId) await this.requireImage(input.logoId);
    return this.toDto(await this.repository.createCase(input));
  }
  async list(title?: string) {
    return (await this.repository.listCases(title)).map((item) =>
      this.toDto(item),
    );
  }
  async get(id: string) {
    const item = await this.repository.findCase(id);
    if (!item) throw new NotFoundError('Case');
    return this.toDto(item);
  }
  async update(id: string, input: UpdateCaseInput) {
    await this.get(id);
    if (input.logoId) await this.requireImage(input.logoId);
    await this.repository.updateCase(id, input);
  }
  async publish(id: string) {
    await this.get(id);
    await this.repository.setCasePublished(id, true);
  }
  async unpublish(id: string) {
    await this.get(id);
    await this.repository.setCasePublished(id, false);
  }
  async toggle(id: string) {
    const item = await this.get(id);
    await this.repository.setCasePublished(id, !item.isPublished);
  }
  async delete(id: string) {
    await this.get(id);
    await this.repository.deleteCase(id);
  }
  async addImages(id: string, imageIds: string[]) {
    await this.get(id);
    for (const imageId of imageIds) await this.requireImage(imageId);
    await this.repository.addImages(id, imageIds);
  }
  async addTestimonial(id: string, input: CreateCaseTestimonialInput) {
    await this.get(id);
    return lifecycleDto(await this.repository.createTestimonial(id, input));
  }
  async listTestimonials(id: string, language?: 'ENGLISH' | 'PORTUGUESE') {
    await this.get(id);
    return (await this.repository.listTestimonials(id, language)).map(
      lifecycleDto,
    );
  }
  async setTestimonialPublished(
    caseId: string,
    id: string,
    published: boolean,
  ) {
    const item = await this.repository.findTestimonial(caseId, id);
    if (!item) throw new NotFoundError('Depoimento');
    await this.repository.setTestimonialPublished(id, published);
  }

  private async requireImage(id: string) {
    if (!(await this.repository.imageExists(id)))
      throw new NotFoundError('Imagem');
  }
  private toDto(item: CaseWithImages) {
    const { images, ...record } = item;
    return {
      ...lifecycleDto(record),
      imageIds: images.map((image) => image.imageId),
    };
  }
}
