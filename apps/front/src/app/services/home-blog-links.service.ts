import { httpClient } from '../factories/http-client.factory';

export interface HomeBlogLinkDTO {
  id: string;
  url: string;
  label?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function listHomeBlogLinks(): Promise<HomeBlogLinkDTO[]> {
  console.log('[home-blog-links] listHomeBlogLinks → GET /home-blog-links');
  try {
    return await httpClient.get<HomeBlogLinkDTO[]>('home-blog-links');
  } catch (err) {
    console.error('[home-blog-links] listHomeBlogLinks falhou', err);
    throw err;
  }
}

export async function createHomeBlogLink(data: {
  url: string;
  label?: string;
}): Promise<void> {
  console.log('[home-blog-links] createHomeBlogLink → POST /home-blog-links', {
    url: data.url,
    label: data.label,
  });
  try {
    return await httpClient.post('home-blog-links', JSON.stringify(data));
  } catch (err) {
    console.error('[home-blog-links] createHomeBlogLink falhou', { data }, err);
    throw err;
  }
}

export async function toggleHomeBlogLink(id: string): Promise<void> {
  console.log(
    '[home-blog-links] toggleHomeBlogLink → PATCH /home-blog-links/:id/toggle',
    { id },
  );
  try {
    return await httpClient.patch(`home-blog-links/${id}/toggle`);
  } catch (err) {
    console.error('[home-blog-links] toggleHomeBlogLink falhou', { id }, err);
    throw err;
  }
}

export async function deleteHomeBlogLink(id: string): Promise<void> {
  console.log(
    '[home-blog-links] deleteHomeBlogLink → DELETE /home-blog-links/:id',
    { id },
  );
  try {
    return await httpClient.delete(`home-blog-links/${id}`);
  } catch (err) {
    console.error('[home-blog-links] deleteHomeBlogLink falhou', { id }, err);
    throw err;
  }
}
