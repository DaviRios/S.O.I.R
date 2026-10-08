import type { z } from 'zod';
import type {
  createAuthorSchema,
  createBlogPostSchema,
  updateAuthorSchema,
  updateBlogPostSchema,
} from '@soir/contracts';
import type { Author, BlogPost } from '../../generated/prisma/client';

export type CreateAuthorInput = z.infer<typeof createAuthorSchema>;
export type UpdateAuthorInput = z.infer<typeof updateAuthorSchema>;
export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;

export type BlogPostWithAuthor = BlogPost & { author: Author };

export interface EditorialRepository {
  createAuthor(input: CreateAuthorInput): Promise<Author>;
  listAuthors(): Promise<Author[]>;
  findAuthor(id: string): Promise<Author | null>;
  updateAuthor(id: string, input: UpdateAuthorInput): Promise<Author>;
  countActivePostsByAuthor(authorId: string): Promise<number>;
  softDeleteAuthor(id: string): Promise<void>;
  createPost(input: CreateBlogPostInput): Promise<BlogPostWithAuthor>;
  listPosts(filters: {
    title?: string;
    authorName?: string;
    language?: 'ENGLISH' | 'PORTUGUESE';
  }): Promise<BlogPostWithAuthor[]>;
  findPost(id: string): Promise<BlogPostWithAuthor | null>;
  updatePost(
    id: string,
    input: UpdateBlogPostInput,
  ): Promise<BlogPostWithAuthor>;
  publishPost(id: string): Promise<void>;
  unpublishPost(id: string): Promise<void>;
  softDeletePost(id: string): Promise<void>;
}
