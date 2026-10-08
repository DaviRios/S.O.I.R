import { httpClient } from '../factories/http-client.factory';

export interface HomeBlogLinkDTO {
  id: string;
  url: string;
  label?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function listHomeBlogLinks(
  signal?: AbortSignal,
): Promise<HomeBlogLinkDTO[]> {
  return await httpClient.get<HomeBlogLinkDTO[]>('home-blog-links', signal);
}

export async function createHomeBlogLink(data: {
  url: string;
  label?: string;
}): Promise<void> {
  return await httpClient.post('home-blog-links', JSON.stringify(data));
}

export async function toggleHomeBlogLink(id: string): Promise<void> {
  return await httpClient.patch(`home-blog-links/${id}/toggle`);
}

export async function deleteHomeBlogLink(id: string): Promise<void> {
  return await httpClient.delete(`home-blog-links/${id}`);
}
