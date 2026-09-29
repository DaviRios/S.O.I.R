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

export async function listBlogPosts(params?: {
  title?: string;
  authorName?: string;
  language?: string;
}): Promise<BlogPostDTO[]> {
  console.log('[blog-posts] listBlogPosts → GET /blog-posts', params);
  try {
    const query = new URLSearchParams();
    if (params?.title) query.set('title', params.title);
    if (params?.authorName) query.set('authorName', params.authorName);
    if (params?.language) query.set('language', params.language);
    const qs = query.toString();
    return await httpClient.get<BlogPostDTO[]>(
      `blog-posts${qs ? `?${qs}` : ''}`,
    );
  } catch (err) {
    console.error('[blog-posts] listBlogPosts falhou', { params }, err);
    throw err;
  }
}

export async function createBlogPost(data: CreateBlogPostDTO): Promise<void> {
  console.log('[blog-posts] createBlogPost → POST /blog-posts', {
    title: data.title,
    authorId: data.authorId,
    language: data.language,
  });
  try {
    return await httpClient.post('blog-posts', JSON.stringify(data));
  } catch (err) {
    console.error('[blog-posts] createBlogPost falhou', { data }, err);
    throw err;
  }
}

export async function publishBlogPost(id: string): Promise<void> {
  console.log('[blog-posts] publishBlogPost → PATCH /blog-posts/:id/publish', {
    id,
  });
  try {
    return await httpClient.patch(`blog-posts/${id}/publish`);
  } catch (err) {
    console.error('[blog-posts] publishBlogPost falhou', { id }, err);
    throw err;
  }
}

export async function unpublishBlogPost(id: string): Promise<void> {
  console.log(
    '[blog-posts] unpublishBlogPost → PATCH /blog-posts/:id/unpublish',
    { id },
  );
  try {
    return await httpClient.patch(`blog-posts/${id}/unpublish`);
  } catch (err) {
    console.error('[blog-posts] unpublishBlogPost falhou', { id }, err);
    throw err;
  }
}

export async function updateBlogPost(
  id: string,
  data: CreateBlogPostDTO,
): Promise<void> {
  console.log('[blog-posts] updateBlogPost → PUT /blog-posts/:id', {
    id,
    title: data.title,
  });
  try {
    return await httpClient.put(`blog-posts/${id}`, JSON.stringify(data));
  } catch (err) {
    console.error('[blog-posts] updateBlogPost falhou', { id, data }, err);
    throw err;
  }
}

export async function deleteBlogPost(id: string): Promise<void> {
  console.log('[blog-posts] deleteBlogPost → DELETE /blog-posts/:id', { id });
  try {
    return await httpClient.delete(`blog-posts/${id}`);
  } catch (err) {
    console.error('[blog-posts] deleteBlogPost falhou', { id }, err);
    throw err;
  }
}
