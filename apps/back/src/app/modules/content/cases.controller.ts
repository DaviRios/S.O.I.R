import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  NotFoundException,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import {
  asRecord,
  enumValue,
  optionalString,
  requiredString,
} from '../../common/input';
import { AuthGuard } from '../auth/auth.guard';
import {
  CaseContentRecord,
  CaseImageRecord,
  CaseTestimonialRecord,
  Language,
} from '../storage/cms.types';
import { ResourceService } from './resource.service';

const languages = ['ENGLISH', 'PORTUGUESE'] as const;

interface HeaderResponse {
  setHeader(name: string, value: string): void;
}

@UseGuards(AuthGuard)
@Controller('cases')
export class CasesController {
  constructor(private readonly resources: ResourceService) {}

  @Post()
  async create(@Body() value: unknown, @Res({ passthrough: true }) response: HeaderResponse) {
    const input = asRecord(value);
    const logoId = optionalString(input, 'logoId') || null;
    if (logoId) this.resources.requireImage(logoId);
    const currentCase: CaseContentRecord = {
      id: this.resources.id(),
      title: requiredString(input, 'title', 'Title'),
      shortTitle: optionalString(input, 'shortTitle'),
      subtitle: optionalString(input, 'subtitle'),
      content: optionalString(input, 'content'),
      industry: optionalString(input, 'industry'),
      country: optionalString(input, 'country'),
      tag: optionalString(input, 'tag'),
      logoId,
      language: enumValue(input.language, languages, 'Language', 'PORTUGUESE'),
      active: true,
      isDraft: true,
      isPublished: false,
      publishedAt: null,
      ...this.resources.audit(),
    };
    await this.resources.insert('cases', currentCase);
    response.setHeader('Location', `/v1/cases/${currentCase.id}`);
  }

  @Get()
  list(@Query('title') title?: string) {
    return this.resources
      .list<CaseContentRecord>('cases')
      .filter((item) => !title || item.title.toLowerCase().includes(title.toLowerCase()))
      .map((item) => this.toDto(item));
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.toDto(this.resources.get<CaseContentRecord>('cases', id, 'Case'));
  }

  @Post(':id/images')
  async addImage(
    @Param('id') id: string,
    @Body() value: unknown,
    @Res({ passthrough: true }) response: HeaderResponse,
  ) {
    await this.addImages(id, [asRecord(value)]);
    response.setHeader('Location', `/v1/cases/${id}`);
  }

  @Post(':id/images/batch')
  async addImageBatch(
    @Param('id') id: string,
    @Body() value: unknown,
    @Res({ passthrough: true }) response: HeaderResponse,
  ) {
    if (!Array.isArray(value)) throw new UnprocessableEntityException('Images must be an array');
    await this.addImages(id, value.map(asRecord));
    response.setHeader('Location', `/v1/cases/${id}`);
  }

  @Post(':id/testimonials')
  async addTestimonial(
    @Param('id') id: string,
    @Body() value: unknown,
    @Res({ passthrough: true }) response: HeaderResponse,
  ) {
    this.resources.get<CaseContentRecord>('cases', id, 'Case');
    const input = asRecord(value);
    const testimonial: CaseTestimonialRecord = {
      id: this.resources.id(),
      caseId: id,
      authorName: requiredString(input, 'authorName', 'Author name'),
      role: optionalString(input, 'role'),
      company: optionalString(input, 'company'),
      content: requiredString(input, 'content', 'Content'),
      isActive: true,
      language: enumValue(input.language, languages, 'Language', 'PORTUGUESE'),
      isDraft: true,
      isPublished: false,
      publishedAt: null,
      ...this.resources.audit(),
    };
    await this.resources.insert('caseTestimonials', testimonial);
    response.setHeader('Location', `/v1/cases/${id}`);
  }

  @Get(':id/testimonials')
  testimonials(@Param('id') id: string, @Query('language') language?: Language) {
    this.resources.get<CaseContentRecord>('cases', id, 'Case');
    return this.resources
      .list<CaseTestimonialRecord>('caseTestimonials')
      .filter((item) => item.caseId === id && (!language || item.language === language));
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() value: unknown) {
    const input = asRecord(value);
    const logoId = optionalString(input, 'logoId');
    if (logoId) this.resources.requireImage(logoId);
    await this.resources.update<CaseContentRecord>('cases', id, 'Case', (item) => {
      item.title = optionalString(input, 'title', item.title) || item.title;
      item.shortTitle = optionalString(input, 'shortTitle', item.shortTitle);
      item.subtitle = optionalString(input, 'subtitle', item.subtitle);
      item.content = optionalString(input, 'content', item.content);
      item.industry = optionalString(input, 'industry', item.industry);
      item.country = optionalString(input, 'country', item.country);
      item.tag = optionalString(input, 'tag', item.tag);
      item.logoId = logoId || item.logoId;
      item.language = enumValue(input.language, languages, 'Language', item.language);
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.resources.get<CaseContentRecord>('cases', id, 'Case');
    for (const image of this.resources.list<CaseImageRecord>('caseImages').filter((item) => item.caseId === id)) {
      await this.resources.remove('caseImages', image.id, 'Case image');
    }
    for (const testimonial of this.resources.list<CaseTestimonialRecord>('caseTestimonials').filter((item) => item.caseId === id)) {
      await this.resources.remove('caseTestimonials', testimonial.id, 'Testimonial');
    }
    await this.resources.remove('cases', id, 'Case');
  }

  @Patch(':id/toggle')
  @HttpCode(HttpStatus.NO_CONTENT)
  toggle(@Param('id') id: string) {
    return this.resources.update<CaseContentRecord>('cases', id, 'Case', (item) => { item.active = !item.active; });
  }

  @Patch(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  publish(@Param('id') id: string) { return this.resources.publish<CaseContentRecord>('cases', id, 'Case'); }

  @Patch(':id/unpublish')
  @HttpCode(HttpStatus.NO_CONTENT)
  unpublish(@Param('id') id: string) { return this.resources.unpublish<CaseContentRecord>('cases', id, 'Case'); }

  @Patch(':id/testimonials/:testimonialId/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  publishTestimonial(@Param('id') caseId: string, @Param('testimonialId') testimonialId: string) {
    this.assertTestimonial(caseId, testimonialId);
    return this.resources.publish<CaseTestimonialRecord>('caseTestimonials', testimonialId, 'Testimonial');
  }

  @Patch(':id/testimonials/:testimonialId/unpublish')
  @HttpCode(HttpStatus.NO_CONTENT)
  unpublishTestimonial(@Param('id') caseId: string, @Param('testimonialId') testimonialId: string) {
    this.assertTestimonial(caseId, testimonialId);
    return this.resources.unpublish<CaseTestimonialRecord>('caseTestimonials', testimonialId, 'Testimonial');
  }

  private async addImages(caseId: string, values: Record<string, unknown>[]) {
    this.resources.get<CaseContentRecord>('cases', caseId, 'Case');
    const existing = this.resources.list<CaseImageRecord>('caseImages').filter((item) => item.caseId === caseId);
    if (existing.length + values.length > 3) {
      throw new UnprocessableEntityException('Adding these images would exceed the limit of 3 images per case');
    }
    for (const input of values) {
      const imageId = requiredString(input, 'imageId', 'Image');
      this.resources.requireImage(imageId);
      await this.resources.insert<CaseImageRecord>('caseImages', {
        id: this.resources.id(),
        caseId,
        imageId,
        position: existing.length + values.indexOf(input) + 1,
        createdAt: this.resources.now(),
      });
    }
  }

  private assertTestimonial(caseId: string, testimonialId: string) {
    this.resources.get<CaseContentRecord>('cases', caseId, 'Case');
    const testimonial = this.resources.get<CaseTestimonialRecord>('caseTestimonials', testimonialId, 'Testimonial');
    if (testimonial.caseId !== caseId) throw new NotFoundException('Testimonial not found');
  }

  private toDto(item: CaseContentRecord) {
    const imageIds = this.resources
      .list<CaseImageRecord>('caseImages')
      .filter((image) => image.caseId === item.id)
      .sort((a, b) => a.position - b.position)
      .map((image) => image.imageId);
    const dto = { ...item } as Record<string, unknown>;
    delete dto.active;
    return { ...dto, isActive: item.active, imageIds };
  }
}
