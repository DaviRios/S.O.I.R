import type { DatabaseClient } from '../../infrastructure/database/prisma';
import {
  publishData,
  softDeleteData,
  unpublishData,
} from '../../core/lifecycle';
import type {
  CreateAuthorInput,
  CreateBlogPostInput,
  EditorialRepository,
  UpdateAuthorInput,
  UpdateBlogPostInput,
} from './editorial.repository';

export class PrismaEditorialRepository implements EditorialRepository {
  constructor(private readonly database: DatabaseClient) {}

  createAuthor(input: CreateAuthorInput) {
    return this.database.author.create({
      data: {
        name: input.name,
        bio: input.bio ?? '',
        imageUrl: input.imageUrl ?? '',
      },
    });
  }

  listAuthors() {
    return this.database.author.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAuthor(id: string) {
    return this.database.author.findFirst({ where: { id, isActive: true } });
  }

  updateAuthor(id: string, input: UpdateAuthorInput) {
    return this.database.author.update({ where: { id }, data: input });
  }

  countActivePostsByAuthor(authorId: string) {
    return this.database.blogPost.count({
      where: { authorId, isActive: true },
    });
  }

  async softDeleteAuthor(id: string): Promise<void> {
    await this.database.author.update({
      where: { id },
      data: softDeleteData(),
    });
  }

  createPost(input: CreateBlogPostInput) {
    return this.database.blogPost.create({
      data: {
        title: input.title,
        url: input.url,
        description: input.description ?? '',
        imageUrl: input.imageUrl ?? '',
        authorId: input.authorId,
        language: input.language,
      },
      include: { author: true },
    });
  }

  listPosts(filters: {
    title?: string;
    authorName?: string;
    language?: 'ENGLISH' | 'PORTUGUESE';
  }) {
    return this.database.blogPost.findMany({
      where: {
        isActive: true,
        ...(filters.title
          ? { title: { contains: filters.title, mode: 'insensitive' as const } }
          : {}),
        ...(filters.language ? { language: filters.language } : {}),
        ...(filters.authorName
          ? {
              author: {
                name: {
                  contains: filters.authorName,
                  mode: 'insensitive' as const,
                },
              },
            }
          : {}),
      },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findPost(id: string) {
    return this.database.blogPost.findFirst({
      where: { id, isActive: true },
      include: { author: true },
    });
  }

  updatePost(id: string, input: UpdateBlogPostInput) {
    return this.database.blogPost.update({
      where: { id },
      data: input,
      include: { author: true },
    });
  }

  async publishPost(id: string): Promise<void> {
    await this.database.blogPost.update({ where: { id }, data: publishData() });
  }

  async unpublishPost(id: string): Promise<void> {
    await this.database.blogPost.update({
      where: { id },
      data: unpublishData(),
    });
  }

  async softDeletePost(id: string): Promise<void> {
    await this.database.blogPost.update({
      where: { id },
      data: softDeleteData(),
    });
  }
}
