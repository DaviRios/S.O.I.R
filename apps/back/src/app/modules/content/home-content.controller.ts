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
  optionalString,
  requiredString,
} from '../../common/input';
import { AuthGuard } from '../auth/auth.guard';
import {
  EcosystemRecord,
  HomeBlogLinkRecord,
  Language,
  PopupRecord,
  PopupStyle,
  SlideRecord,
} from '../storage/cms.types';
import { ResourceService } from './resource.service';

const languages = ['ENGLISH', 'PORTUGUESE'] as const;
const popupStyles = [
  'ORANGE_WHITE',
  'WHITE_ORANGE',
  'PURPLE_WHITE',
  'WHITE_PURPLE',
] as const;

interface HeaderResponse {
  setHeader(name: string, value: string): void;
}

@UseGuards(AuthGuard)
@Controller('slides')
export class SlidesController {
  constructor(private readonly resources: ResourceService) {}

  @Post()
  async create(@Body() value: unknown, @Res({ passthrough: true }) response: HeaderResponse) {
    const input = asRecord(value);
    const logoId = requiredString(input, 'logoId', 'Image');
    this.resources.requireImage(logoId);
    const slide: SlideRecord = {
      id: this.resources.id(),
      logoId,
      text: requiredString(input, 'text', 'Text'),
      buttonText: optionalString(input, 'buttonText'),
      buttonUrl: optionalString(input, 'buttonUrl'),
      language: enumValue(input.language, languages, 'Language', 'PORTUGUESE'),
      isActive: false,
      isDraft: true,
      isPublished: false,
      publishedAt: null,
      ...this.resources.audit(),
    };
    await this.resources.insert('slides', slide);
    response.setHeader('Location', `/v1/slides/${slide.id}`);
  }

  @Get()
  list(@Query('language') language?: Language) {
    return this.resources
      .list<SlideRecord>('slides')
      .filter((slide) => !language || (slide.language === language && slide.isActive));
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.resources.get<SlideRecord>('slides', id, 'Slide');
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() value: unknown) {
    const input = asRecord(value);
    const logoId = optionalString(input, 'logoId');
    if (logoId) this.resources.requireImage(logoId);
    await this.resources.update<SlideRecord>('slides', id, 'Slide', (slide) => {
      slide.logoId = logoId || slide.logoId;
      slide.text = optionalString(input, 'text', slide.text) || slide.text;
      slide.buttonText = optionalString(input, 'buttonText', slide.buttonText);
      slide.buttonUrl = optionalString(input, 'buttonUrl', slide.buttonUrl);
      slide.language = enumValue(input.language, languages, 'Language', slide.language);
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) { return this.resources.remove('slides', id, 'Slide'); }

  @Patch(':id/toggle')
  @HttpCode(HttpStatus.NO_CONTENT)
  toggle(@Param('id') id: string) { return this.resources.toggle<SlideRecord>('slides', id, 'Slide'); }

  @Patch(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  publish(@Param('id') id: string) { return this.resources.publish<SlideRecord>('slides', id, 'Slide'); }

  @Patch(':id/unpublish')
  @HttpCode(HttpStatus.NO_CONTENT)
  unpublish(@Param('id') id: string) { return this.resources.unpublish<SlideRecord>('slides', id, 'Slide'); }
}

@UseGuards(AuthGuard)
@Controller('popups')
export class PopupsController {
  constructor(private readonly resources: ResourceService) {}

  @Post()
  async create(@Body() value: unknown, @Res({ passthrough: true }) response: HeaderResponse) {
    const input = asRecord(value);
    const popup: PopupRecord = {
      id: this.resources.id(),
      title: requiredString(input, 'title', 'Title'),
      description: optionalString(input, 'description'),
      buttonText: optionalString(input, 'buttonText'),
      redirectUrl: optionalString(input, 'redirectUrl'),
      buttonText2: optionalString(input, 'buttonText2'),
      redirectUrl2: optionalString(input, 'redirectUrl2'),
      style: enumValue(input.style, popupStyles, 'Style', 'ORANGE_WHITE'),
      language: enumValue(input.language, languages, 'Language', 'PORTUGUESE'),
      isActive: false,
      isDraft: true,
      isPublished: false,
      publishedAt: null,
      ...this.resources.audit(),
    };
    await this.resources.insert('popups', popup);
    response.setHeader('Location', `/v1/popups/${popup.id}`);
  }

  @Get()
  list(@Query('language') language?: Language) {
    return this.resources
      .list<PopupRecord>('popups')
      .filter((popup) => !language || (popup.language === language && popup.isActive));
  }

  @Get(':id')
  get(@Param('id') id: string) { return this.resources.get<PopupRecord>('popups', id, 'Popup'); }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() value: unknown) {
    const input = asRecord(value);
    await this.resources.update<PopupRecord>('popups', id, 'Popup', (popup) => {
      popup.title = optionalString(input, 'title', popup.title) || popup.title;
      popup.description = optionalString(input, 'description', popup.description);
      popup.buttonText = optionalString(input, 'buttonText', popup.buttonText);
      popup.redirectUrl = optionalString(input, 'redirectUrl', popup.redirectUrl);
      popup.buttonText2 = optionalString(input, 'buttonText2', popup.buttonText2);
      popup.redirectUrl2 = optionalString(input, 'redirectUrl2', popup.redirectUrl2);
      popup.style = enumValue(input.style, popupStyles, 'Style', popup.style) as PopupStyle;
      popup.language = enumValue(input.language, languages, 'Language', popup.language);
      popup.isActive = optionalBoolean(input, 'isActive', popup.isActive);
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) { return this.resources.remove('popups', id, 'Popup'); }

  @Patch(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  async publish(@Param('id') id: string) {
    await this.resources.publish<PopupRecord>('popups', id, 'Popup');
    await this.resources.update<PopupRecord>('popups', id, 'Popup', (popup) => { popup.isActive = true; });
  }

  @Patch(':id/unpublish')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unpublish(@Param('id') id: string) {
    await this.resources.unpublish<PopupRecord>('popups', id, 'Popup');
    await this.resources.update<PopupRecord>('popups', id, 'Popup', (popup) => { popup.isActive = false; });
  }
}

@UseGuards(AuthGuard)
@Controller('ecosystems')
export class EcosystemsController {
  constructor(private readonly resources: ResourceService) {}

  @Post()
  async create(@Body() value: unknown, @Res({ passthrough: true }) response: HeaderResponse) {
    const input = asRecord(value);
    const imageId = requiredString(input, 'imageId', 'Image');
    this.resources.requireImage(imageId);
    const item: EcosystemRecord = {
      id: this.resources.id(),
      name: requiredString(input, 'name', 'Name'),
      imageId,
      isActive: false,
      isPublished: false,
      ...this.resources.audit(),
    };
    await this.resources.insert('ecosystems', item);
    response.setHeader('Location', `/v1/ecosystems/${item.id}`);
  }

  @Get()
  list() { return this.resources.list<EcosystemRecord>('ecosystems').map((item) => ({ ...item, imageUrl: this.resources.imageUrl(item.imageId) })); }

  @Get(':id')
  get(@Param('id') id: string) {
    const item = this.resources.get<EcosystemRecord>('ecosystems', id, 'Ecosystem');
    return { ...item, imageUrl: this.resources.imageUrl(item.imageId) };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() value: unknown) {
    const input = asRecord(value);
    const imageId = optionalString(input, 'imageId');
    if (imageId) this.resources.requireImage(imageId);
    await this.resources.update<EcosystemRecord>('ecosystems', id, 'Ecosystem', (item) => {
      item.name = optionalString(input, 'name', item.name) || item.name;
      item.imageId = imageId || item.imageId;
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) { return this.resources.remove('ecosystems', id, 'Ecosystem'); }

  @Patch(':id/toggle')
  @HttpCode(HttpStatus.NO_CONTENT)
  toggle(@Param('id') id: string) { return this.resources.toggle<EcosystemRecord>('ecosystems', id, 'Ecosystem'); }

  @Patch(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  updatePublished(@Param('id') id: string) { return this.resources.update<EcosystemRecord>('ecosystems', id, 'Ecosystem', (item) => { item.isPublished = true; }); }

  @Patch(':id/unpublish')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateUnpublished(@Param('id') id: string) { return this.resources.update<EcosystemRecord>('ecosystems', id, 'Ecosystem', (item) => { item.isPublished = false; }); }
}

@UseGuards(AuthGuard)
@Controller('home-blog-links')
export class HomeBlogLinksController {
  constructor(private readonly resources: ResourceService) {}

  @Post()
  async create(@Body() value: unknown, @Res({ passthrough: true }) response: HeaderResponse) {
    const input = asRecord(value);
    const link: HomeBlogLinkRecord = {
      id: this.resources.id(),
      url: requiredString(input, 'url', 'URL'),
      label: optionalString(input, 'label'),
      isActive: true,
      ...this.resources.audit(),
    };
    await this.resources.insert('homeBlogLinks', link);
    response.setHeader('Location', `/v1/home-blog-links/${link.id}`);
  }

  @Get()
  list() { return this.resources.list<HomeBlogLinkRecord>('homeBlogLinks'); }

  @Get(':id')
  get(@Param('id') id: string) { return this.resources.get<HomeBlogLinkRecord>('homeBlogLinks', id, 'Home blog link'); }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  update(@Param('id') id: string, @Body() value: unknown) {
    const input = asRecord(value);
    return this.resources.update<HomeBlogLinkRecord>('homeBlogLinks', id, 'Home blog link', (link) => {
      link.url = optionalString(input, 'url', link.url) || link.url;
      link.label = optionalString(input, 'label', link.label);
    });
  }

  @Patch(':id/toggle')
  @HttpCode(HttpStatus.NO_CONTENT)
  toggle(@Param('id') id: string) { return this.resources.toggle<HomeBlogLinkRecord>('homeBlogLinks', id, 'Home blog link'); }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) { return this.resources.remove('homeBlogLinks', id, 'Home blog link'); }
}
