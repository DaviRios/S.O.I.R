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
  UseGuards,
} from '@nestjs/common';
import {
  asRecord,
  enumValue,
  optionalBoolean,
  optionalNumber,
  optionalString,
  requiredString,
} from '../../common/input';
import { AuthGuard } from '../auth/auth.guard';
import {
  AboutMediaRecord,
  CareerRecord,
  ClientStoryRecord,
  Language,
  PartnerRecord,
  ServiceItemRecord,
} from '../storage/cms.types';
import { ResourceService } from './resource.service';

const languages = ['ENGLISH', 'PORTUGUESE'] as const;
const mediaTypes = ['IMAGE', 'VIDEO'] as const;

interface HeaderResponse {
  setHeader(name: string, value: string): void;
}

@UseGuards(AuthGuard)
@Controller('client-stories')
export class ClientStoriesController {
  constructor(private readonly resources: ResourceService) {}

  @Post()
  async create(@Body() value: unknown, @Res({ passthrough: true }) response: HeaderResponse) {
    const input = asRecord(value);
    const imageId = requiredString(input, 'imageId', 'Image');
    this.resources.requireImage(imageId);
    const story: ClientStoryRecord = {
      id: this.resources.id(),
      imageId,
      shortTitle: requiredString(input, 'shortTitle', 'Short title'),
      longTitle: requiredString(input, 'longTitle', 'Long title'),
      description: requiredString(input, 'description', 'Description'),
      language: enumValue(input.language, languages, 'Language', 'PORTUGUESE'),
      isActive: true,
      isDraft: true,
      isPublished: false,
      publishedAt: null,
      ...this.resources.audit(),
    };
    await this.resources.insert('clientStories', story);
    response.setHeader('Location', `/v1/client-stories/${story.id}`);
  }

  @Get()
  list() { return this.resources.list<ClientStoryRecord>('clientStories').map((story) => this.toDto(story)); }

  @Get(':id')
  get(@Param('id') id: string) { return this.toDto(this.resources.get<ClientStoryRecord>('clientStories', id, 'Client story')); }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() value: unknown) {
    const input = asRecord(value);
    const imageId = optionalString(input, 'imageId');
    if (imageId) this.resources.requireImage(imageId);
    await this.resources.update<ClientStoryRecord>('clientStories', id, 'Client story', (story) => {
      story.imageId = imageId || story.imageId;
      story.shortTitle = optionalString(input, 'shortTitle', story.shortTitle) || story.shortTitle;
      story.longTitle = optionalString(input, 'longTitle', story.longTitle) || story.longTitle;
      story.description = optionalString(input, 'description', story.description) || story.description;
      story.language = enumValue(input.language, languages, 'Language', story.language);
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) { return this.resources.remove('clientStories', id, 'Client story'); }

  @Patch(':id/toggle')
  @HttpCode(HttpStatus.NO_CONTENT)
  toggle(@Param('id') id: string) { return this.resources.toggle<ClientStoryRecord>('clientStories', id, 'Client story'); }

  @Patch(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  publish(@Param('id') id: string) { return this.resources.publish<ClientStoryRecord>('clientStories', id, 'Client story'); }

  @Patch(':id/unpublish')
  @HttpCode(HttpStatus.NO_CONTENT)
  unpublish(@Param('id') id: string) { return this.resources.unpublish<ClientStoryRecord>('clientStories', id, 'Client story'); }

  private toDto(story: ClientStoryRecord) {
    return { ...story, imageUrl: this.resources.imageUrl(story.imageId) };
  }
}

@UseGuards(AuthGuard)
@Controller('about-media')
export class AboutMediaController {
  constructor(private readonly resources: ResourceService) {}

  @Post()
  async create(@Body() value: unknown, @Res({ passthrough: true }) response: HeaderResponse) {
    const input = asRecord(value);
    const imageId = requiredString(input, 'imageId', 'imageId');
    const mediaType = enumValue(input.mediaType, mediaTypes, 'Media type', 'IMAGE');
    if (mediaType === 'VIDEO') this.resources.requireVideo(imageId);
    else this.resources.requireImage(imageId);
    const media: AboutMediaRecord = {
      id: this.resources.id(),
      imageId,
      mediaType,
      caption: optionalString(input, 'caption'),
      sortOrder: optionalNumber(input, 'sortOrder', 0),
      isActive: true,
      ...this.resources.audit(),
    };
    await this.resources.insert('aboutMedia', media);
    response.setHeader('Location', `/v1/about-media/${media.id}`);
  }

  @Get()
  list() { return this.resources.list<AboutMediaRecord>('aboutMedia').sort((a, b) => a.sortOrder - b.sortOrder).map((media) => this.toDto(media)); }

  @Get(':id')
  get(@Param('id') id: string) { return this.toDto(this.resources.get<AboutMediaRecord>('aboutMedia', id, 'About media')); }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  update(@Param('id') id: string, @Body() value: unknown) {
    const input = asRecord(value);
    return this.resources.update<AboutMediaRecord>('aboutMedia', id, 'About media', (media) => {
      media.caption = optionalString(input, 'caption', media.caption);
      media.sortOrder = optionalNumber(input, 'sortOrder', media.sortOrder);
      media.isActive = optionalBoolean(input, 'isActive', media.isActive);
    });
  }

  @Patch(':id/toggle')
  @HttpCode(HttpStatus.NO_CONTENT)
  toggle(@Param('id') id: string) { return this.resources.toggle<AboutMediaRecord>('aboutMedia', id, 'About media'); }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) { return this.resources.remove('aboutMedia', id, 'About media'); }

  private toDto(media: AboutMediaRecord) {
    return {
      ...media,
      imageUrl: media.mediaType === 'VIDEO'
        ? this.resources.videoUrl(media.imageId)
        : this.resources.imageUrl(media.imageId),
    };
  }
}

@UseGuards(AuthGuard)
@Controller('partners')
export class PartnersController {
  constructor(private readonly resources: ResourceService) {}

  @Post()
  async create(@Body() value: unknown, @Res({ passthrough: true }) response: HeaderResponse) {
    const input = asRecord(value);
    const logoId = optionalString(input, 'logoId') || null;
    if (logoId) this.resources.requireImage(logoId);
    const partner: PartnerRecord = {
      id: this.resources.id(),
      name: requiredString(input, 'name', 'Name'),
      logoId,
      website: optionalString(input, 'website'),
      isActive: optionalBoolean(input, 'isActive', true),
      ...this.resources.audit(),
    };
    await this.resources.insert('partners', partner);
    response.setHeader('Location', `/v1/partners/${partner.id}`);
  }

  @Get()
  list() { return this.resources.list<PartnerRecord>('partners'); }

  @Get(':id')
  get(@Param('id') id: string) { return this.resources.get<PartnerRecord>('partners', id, 'Partner'); }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  update(@Param('id') id: string, @Body() value: unknown) {
    const input = asRecord(value);
    const logoId = optionalString(input, 'logoId');
    if (logoId) this.resources.requireImage(logoId);
    return this.resources.update<PartnerRecord>('partners', id, 'Partner', (partner) => {
      partner.name = optionalString(input, 'name', partner.name) || partner.name;
      partner.logoId = logoId || partner.logoId;
      partner.website = optionalString(input, 'website', partner.website);
      partner.isActive = optionalBoolean(input, 'isActive', partner.isActive);
    });
  }
}

@UseGuards(AuthGuard)
@Controller('careers')
export class CareersController {
  constructor(private readonly resources: ResourceService) {}

  @Post()
  async create(@Body() value: unknown, @Res({ passthrough: true }) response: HeaderResponse) {
    const input = asRecord(value);
    const career: CareerRecord = {
      id: this.resources.id(),
      title: requiredString(input, 'title', 'Title'),
      description: optionalString(input, 'description'),
      location: optionalString(input, 'location'),
      isActive: optionalBoolean(input, 'isActive', true),
      language: enumValue(input.language, languages, 'Language', 'PORTUGUESE'),
      ...this.resources.audit(),
    };
    await this.resources.insert('careers', career);
    response.setHeader('Location', `/v1/careers/${career.id}`);
  }

  @Get()
  list(@Query('language') language?: Language) { return this.resources.list<CareerRecord>('careers').filter((item) => !language || (item.language === language && item.isActive)); }

  @Get(':id')
  get(@Param('id') id: string) { return this.resources.get<CareerRecord>('careers', id, 'Career'); }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  update(@Param('id') id: string, @Body() value: unknown) {
    const input = asRecord(value);
    return this.resources.update<CareerRecord>('careers', id, 'Career', (career) => {
      career.title = optionalString(input, 'title', career.title) || career.title;
      career.description = optionalString(input, 'description', career.description);
      career.location = optionalString(input, 'location', career.location);
      career.isActive = optionalBoolean(input, 'isActive', career.isActive);
      career.language = enumValue(input.language, languages, 'Language', career.language);
    });
  }
}

@UseGuards(AuthGuard)
@Controller('services')
export class ServiceItemsController {
  constructor(private readonly resources: ResourceService) {}

  @Post()
  async create(@Body() value: unknown, @Res({ passthrough: true }) response: HeaderResponse) {
    const input = asRecord(value);
    const item: ServiceItemRecord = {
      id: this.resources.id(),
      name: requiredString(input, 'name', 'Name'),
      description: optionalString(input, 'description'),
      isActive: optionalBoolean(input, 'isActive', true),
      language: enumValue(input.language, languages, 'Language', 'PORTUGUESE'),
      ...this.resources.audit(),
    };
    await this.resources.insert('serviceItems', item);
    response.setHeader('Location', `/v1/services/${item.id}`);
  }

  @Get()
  list(@Query('language') language?: Language) { return this.resources.list<ServiceItemRecord>('serviceItems').filter((item) => !language || (item.language === language && item.isActive)); }

  @Get(':id')
  get(@Param('id') id: string) { return this.resources.get<ServiceItemRecord>('serviceItems', id, 'Service'); }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  update(@Param('id') id: string, @Body() value: unknown) {
    const input = asRecord(value);
    return this.resources.update<ServiceItemRecord>('serviceItems', id, 'Service', (item) => {
      item.name = optionalString(input, 'name', item.name) || item.name;
      item.description = optionalString(input, 'description', item.description);
      item.isActive = optionalBoolean(input, 'isActive', item.isActive);
      item.language = enumValue(input.language, languages, 'Language', item.language);
    });
  }
}
