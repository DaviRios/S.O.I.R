import { httpClient } from '../factories/http-client.factory';

export interface AboutMediaDTO {
  id: string;
  imageId: string;
  imageUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  caption?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function listAboutMedia(): Promise<AboutMediaDTO[]> {
  return await httpClient.get<AboutMediaDTO[]>('about-media');
}

export async function uploadAndCreateAboutMedia(
  file: File,
  caption?: string,
): Promise<void> {
  const isVideo = file.type.startsWith('video/');
  const endpoint = isVideo ? 'videos' : 'images';
  const mediaType: 'IMAGE' | 'VIDEO' = isVideo ? 'VIDEO' : 'IMAGE';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', file.name.replace(/\.[^.]+$/, ''));
  if (!isVideo) {
    formData.append('tags', 'about');
    formData.append('tags', 'institucional');
  }

  const uploadRes = await httpClient.raw('POST', endpoint, formData);

  if (!uploadRes.ok) {
    throw new Error('Erro ao fazer upload da mídia.');
  }

  const location = uploadRes.headers.get('Location') ?? '';
  const imageId = location.split('/').pop() ?? '';
  if (!imageId) {
    throw new Error('Erro ao obter ID da mídia enviada.');
  }
  return httpClient.post(
    'about-media',
    JSON.stringify({
      imageId,
      mediaType,
      caption: caption || undefined,
      sortOrder: 0,
    }),
  );
}

export async function toggleAboutMedia(id: string): Promise<void> {
  return await httpClient.patch(`about-media/${id}/toggle`);
}

export async function deleteAboutMedia(id: string): Promise<void> {
  return await httpClient.delete(`about-media/${id}`);
}
