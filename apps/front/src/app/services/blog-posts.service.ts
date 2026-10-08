import { httpClient } from '../factories/http-client.factory';

export interface BlogPostDTO {
  id: string;
  title: string;
  url: string;
  description: string;
  imageUrl: string;
  authorId: string;
  authorName: string;
  language: 'ENGLISH' | 'PORTUGUESE';
  isActive: boolean;
  isDraft: boolean;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogPostDTO {
  title: string;
  url: string;
  description?: string;
  imageUrl?: string;
  authorId: string;
  language: 'ENGLISH' | 'PORTUGUESE';
}

export async function listBlogPosts(
  params?: {
    title?: string;
    authorName?: string;
    language?: string;
  },
  signal?: AbortSignal,
): Promise<BlogPostDTO[]> {
  const query = new URLSearchParams();
  if (params?.title) query.set('title', params.title);
  if (params?.authorName) query.set('authorName', params.authorName);
  if (params?.language) query.set('language', params.language);
  const qs = query.toString();
  return await httpClient.get<BlogPostDTO[]>(
    `blog-posts${qs ? `?${qs}` : ''}`,
    signal,
  );
}

export async function createBlogPost(data: CreateBlogPostDTO): Promise<void> {
  return await httpClient.post('blog-posts', JSON.stringify(data));
}

export async function publishBlogPost(id: string): Promise<void> {
  return await httpClient.patch(`blog-posts/${id}/publish`);
}

export async function unpublishBlogPost(id: string): Promise<void> {
  return await httpClient.patch(`blog-posts/${id}/unpublish`);
}

export async function updateBlogPost(
  id: string,
  data: CreateBlogPostDTO,
): Promise<void> {
  return await httpClient.put(`blog-posts/${id}`, JSON.stringify(data));
}

export async function deleteBlogPost(id: string): Promise<void> {
  return await httpClient.delete(`blog-posts/${id}`);
}
