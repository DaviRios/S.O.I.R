import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import {
  AboutMediaRecord,
  AuthorRecord,
  BlogPostRecord,
  CaseContentRecord,
  CaseImageRecord,
  ClientStoryRecord,
  EcosystemRecord,
  HomeBlogLinkRecord,
  Language,
  PopupRecord,
  SlideRecord,
} from '../storage/cms.types';
import { ResourceService } from './resource.service';

@Controller('public/pages')
export class PagesController {
  constructor(private readonly resources: ResourceService) {}

  @Get('home')
  home(@Query('language') language?: Language) {
    const slides = this.resources
      .list<SlideRecord>('slides')
      .filter((item) => item.isActive && (!language || item.language === language));
    const clientStories = this.resources
      .list<ClientStoryRecord>('clientStories')
      .filter((item) => item.isPublished)
      .map((item) => ({ ...item, imageUrl: this.resources.imageUrl(item.imageId) }));
    const ecosystemItems = this.resources
      .list<EcosystemRecord>('ecosystems')
      .filter((item) => item.isActive)
      .map((item) => ({ ...item, imageUrl: this.resources.imageUrl(item.imageId) }));
    const activePopup = this.resources
      .list<PopupRecord>('popups')
      .find((item) => item.isActive && item.isPublished && (!language || item.language === language)) ?? null;
    const blogLinks = this.resources
      .list<HomeBlogLinkRecord>('homeBlogLinks')
      .filter((item) => item.isActive);
    return { slides, clientStories, ecosystemItems, activePopup, blogLinks };
  }

  @Get('cases')
  cases() {
    const caseImages = this.resources.list<CaseImageRecord>('caseImages');
    const cases = this.resources
      .list<CaseContentRecord>('cases')
      .filter((item) => item.isPublished)
      .map((item) => {
        const dto = { ...item } as Record<string, unknown>;
        delete dto.active;
        return {
        ...dto,
        isActive: item.active,
        imageIds: caseImages
          .filter((image) => image.caseId === item.id)
          .sort((a, b) => a.position - b.position)
          .map((image) => image.imageId),
        };
      });
    return { cases };
  }

  @Get('about')
  about(@Req() request: Request) {
    const origin = `${request.protocol}://${request.get('host') ?? ''}`;
    const media = this.resources
      .list<AboutMediaRecord>('aboutMedia')
      .filter((item) => item.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({
        ...item,
        imageUrl: item.mediaType === 'VIDEO'
          ? this.resources.videoUrl(item.imageId, origin)
          : this.resources.imageUrl(item.imageId, origin),
      }));
    return { media };
  }

  @Get('blog')
  blog(@Query('language') language?: Language) {
    const authors = this.resources
      .list<AuthorRecord>('authors')
      .filter((item) => item.isActive);
    const posts = this.resources
      .list<BlogPostRecord>('blogPosts')
      .filter((item) => item.isPublished && (!language || item.language === language))
      .map((item) => ({
        ...item,
        authorName: authors.find((author) => author.id === item.authorId)?.name ?? null,
      }));
    return { posts, authors };
  }
}
