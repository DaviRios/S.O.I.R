import type { DatabaseClient } from '../../infrastructure/database/prisma';
import type { PublicPagesRepository } from './public-pages.repository';

const published = { isActive: true, publicationStatus: 'PUBLISHED' as const };

export class PrismaPublicPagesRepository implements PublicPagesRepository {
  constructor(private readonly database: DatabaseClient) {}

  listSlides(language?: 'ENGLISH' | 'PORTUGUESE') {
    return this.database.slide.findMany({
      where: { ...published, ...(language ? { language } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }
  listClientStories(language?: 'ENGLISH' | 'PORTUGUESE') {
    return this.database.clientStory.findMany({
      where: { ...published, ...(language ? { language } : {}) },
      include: { image: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  listEcosystems() {
    return this.database.ecosystemItem.findMany({
      where: published,
      include: { image: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  findPopup(language?: 'ENGLISH' | 'PORTUGUESE') {
    return this.database.popup.findFirst({
      where: { ...published, ...(language ? { language } : {}) },
      orderBy: { publishedAt: 'desc' },
    });
  }
  listBlogLinks() {
    return this.database.homeBlogLink.findMany({
      where: published,
      orderBy: { createdAt: 'desc' },
    });
  }
  listCases(language?: 'ENGLISH' | 'PORTUGUESE') {
    return this.database.case.findMany({
      where: { ...published, ...(language ? { language } : {}) },
      include: {
        images: { where: { isActive: true }, orderBy: { position: 'asc' } },
      },
      orderBy: { publishedAt: 'desc' },
    });
  }
  listAboutMedia() {
    return this.database.aboutMedia.findMany({
      where: published,
      include: { media: true },
      orderBy: { sortOrder: 'asc' },
    });
  }
  listPosts(language?: 'ENGLISH' | 'PORTUGUESE') {
    return this.database.blogPost.findMany({
      where: { ...published, ...(language ? { language } : {}) },
      include: { author: true },
      orderBy: { publishedAt: 'desc' },
    });
  }
  listAuthors() {
    return this.database.author.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}
