import { httpClient } from '../factories/http-client.factory';

const BASE_URL =
  (import.meta.env.VITE_API_CMS_URL ?? '/v1').replace(/\/$/, '') + '/';

export interface UploadedImage {
  id: string;
  url: string;
  name: string;
}

export interface ImageSearchResult {
  id: string;
  url: string;
  name: string;
  extension: string;
  size: number;
  uploadDate: string;
}

export async function uploadImage(
  file: File,
  name: string,
  tags: string[] = [],
): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name);
  tags.forEach((tag) => formData.append('tags', tag));

  const response = await httpClient.raw('POST', 'images', formData);

  if (!response.ok) {
    throw new Error('Erro ao fazer upload da imagem.');
  }

  const location = response.headers.get('Location') ?? '';
  const id = location.split('/').pop() ?? '';
  return { id, url: `${BASE_URL}images/${id}`, name };
}

export async function uploadImagesBatch(
  files: File[],
  names: string[],
  tags: string[] = [],
): Promise<UploadedImage[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  names.forEach((n) => formData.append('name', n));
  tags.forEach((tag) => formData.append('tags', tag));

  const response = await httpClient.raw('POST', 'images/batch', formData);

  if (!response.ok) {
    throw new Error('Erro ao fazer upload das imagens.');
  }

  const uris: string[] = await response.json();
  return uris.map((uri, i) => {
    const id = uri.toString().split('/').pop() ?? '';
    return {
      id,
      url: `${BASE_URL}images/${id}`,
      name: names[i] ?? `Logo ${i + 1}`,
    };
  });
}

export async function deleteImage(id: string): Promise<void> {
  return await httpClient.delete(`images/${id}`);
}

export async function listImages(
  query?: string,
  extension?: string,
  tags?: string[],
  signal?: AbortSignal,
): Promise<ImageSearchResult[]> {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (extension) params.set('extension', extension);
  if (tags?.length) tags.forEach((t) => params.append('tags', t));
  const qs = params.toString();
  return await httpClient.get<ImageSearchResult[]>(
    `images${qs ? `?${qs}` : ''}`,
    signal,
  );
}
