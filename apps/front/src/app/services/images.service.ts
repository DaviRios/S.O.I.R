import { AuthService } from '../auth/auth';
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

async function getAuthHeader(): Promise<Record<string, string>> {
  const user = await AuthService.getCurrentUser();
  return user?.accessToken
    ? { Authorization: `Bearer ${user.accessToken}` }
    : {};
}

export async function uploadImage(
  file: File,
  name: string,
  tags: string[] = [],
): Promise<UploadedImage> {
  console.log('[images] uploadImage → POST /images', {
    name,
    tags,
    fileName: file.name,
    fileSize: file.size,
  });
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    tags.forEach((tag) => formData.append('tags', tag));

    const response = await fetch(`${BASE_URL}images`, {
      method: 'POST',
      headers: await getAuthHeader(),
      body: formData,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error(
        '[images] uploadImage falhou → HTTP',
        response.status,
        response.statusText,
        { name, body },
      );
      throw new Error('Erro ao fazer upload da imagem.');
    }

    const location = response.headers.get('Location') ?? '';
    const id = location.split('/').pop() ?? '';
    console.log('[images] uploadImage bem-sucedido → id:', id);
    return { id, url: `${BASE_URL}images/${id}`, name };
  } catch (err) {
    if (
      !(
        err instanceof Error &&
        err.message === 'Erro ao fazer upload da imagem.'
      )
    ) {
      console.error('[images] uploadImage → erro inesperado', err);
    }
    throw err;
  }
}

export async function uploadImagesBatch(
  files: File[],
  names: string[],
  tags: string[] = [],
): Promise<UploadedImage[]> {
  console.log('[images] uploadImagesBatch → POST /images/batch', {
    count: files.length,
    names,
    tags,
  });
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    names.forEach((n) => formData.append('name', n));
    tags.forEach((tag) => formData.append('tags', tag));

    const response = await fetch(`${BASE_URL}images/batch`, {
      method: 'POST',
      headers: await getAuthHeader(),
      body: formData,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error(
        '[images] uploadImagesBatch falhou → HTTP',
        response.status,
        response.statusText,
        { body },
      );
      throw new Error('Erro ao fazer upload das imagens.');
    }

    const uris: string[] = await response.json();
    console.log(
      '[images] uploadImagesBatch bem-sucedido →',
      uris.length,
      'imagens',
    );
    return uris.map((uri, i) => {
      const id = uri.toString().split('/').pop() ?? '';
      return {
        id,
        url: `${BASE_URL}images/${id}`,
        name: names[i] ?? `Logo ${i + 1}`,
      };
    });
  } catch (err) {
    if (
      !(
        err instanceof Error &&
        err.message === 'Erro ao fazer upload das imagens.'
      )
    ) {
      console.error('[images] uploadImagesBatch → erro inesperado', err);
    }
    throw err;
  }
}

export async function deleteImage(id: string): Promise<void> {
  console.log('[images] deleteImage → DELETE /images/:id', { id });
  try {
    return await httpClient.delete(`images/${id}`);
  } catch (err) {
    console.error('[images] deleteImage falhou', { id }, err);
    throw err;
  }
}

export async function listImages(
  query?: string,
  extension?: string,
  tags?: string[],
): Promise<ImageSearchResult[]> {
  console.log('[images] listImages → GET images', { query, extension, tags });
  try {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (extension) params.set('extension', extension);
    if (tags?.length) tags.forEach((t) => params.append('tags', t));
    const qs = params.toString();
    return await httpClient.get<ImageSearchResult[]>(
      `images${qs ? `?${qs}` : ''}`,
    );
  } catch (err) {
    console.error(
      '[images] listImages falhou',
      { query, extension, tags },
      err,
    );
    throw err;
  }
}
