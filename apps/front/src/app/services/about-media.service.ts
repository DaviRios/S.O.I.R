import { AuthService } from '../auth/auth';
import { httpClient } from '../factories/http-client.factory';

const BASE_URL = import.meta.env.VITE_API_CMS_URL ?? '/v1';

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

async function getAuthHeader(): Promise<Record<string, string>> {
  const user = await AuthService.getCurrentUser();
  return user?.accessToken
    ? { Authorization: `Bearer ${user.accessToken}` }
    : {};
}

export async function listAboutMedia(): Promise<AboutMediaDTO[]> {
  console.log('[about-media] listAboutMedia → GET /about-media');
  try {
    return await httpClient.get<AboutMediaDTO[]>('about-media');
  } catch (err) {
    console.error('[about-media] listAboutMedia falhou', err);
    throw err;
  }
}

export async function uploadAndCreateAboutMedia(
  file: File,
  caption?: string,
): Promise<void> {
  const isVideo = file.type.startsWith('video/');
  const endpoint = isVideo ? 'videos' : 'images';
  const mediaType: 'IMAGE' | 'VIDEO' = isVideo ? 'VIDEO' : 'IMAGE';

  console.log(
    `[about-media] uploadAndCreateAboutMedia → POST /${endpoint} + /about-media`,
    { fileName: file.name, fileSize: file.size, mediaType, caption },
  );

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name.replace(/\.[^.]+$/, ''));
    if (!isVideo) {
      formData.append('tags', 'about');
      formData.append('tags', 'institucional');
    }

    const uploadRes = await fetch(`${BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: await getAuthHeader(),
      body: formData,
    });

    if (!uploadRes.ok) {
      const body = await uploadRes.text().catch(() => '');
      console.error(
        `[about-media] upload falhou → HTTP`,
        uploadRes.status,
        uploadRes.statusText,
        { body },
      );
      throw new Error('Erro ao fazer upload da mídia.');
    }

    const location = uploadRes.headers.get('Location') ?? '';
    const imageId = location.split('/').pop() ?? '';
    if (!imageId) {
      console.error('[about-media] Location header ausente ou inválido', {
        location,
      });
      throw new Error('Erro ao obter ID da mídia enviada.');
    }

    console.log(
      `[about-media] mídia enviada → id: ${imageId}, mediaType: ${mediaType} → criando registro /about-media`,
    );
    return httpClient.post(
      'about-media',
      JSON.stringify({
        imageId,
        mediaType,
        caption: caption || undefined,
        sortOrder: 0,
      }),
    );
  } catch (err) {
    if (
      !(
        err instanceof Error &&
        (err.message === 'Erro ao fazer upload da mídia.' ||
          err.message === 'Erro ao obter ID da mídia enviada.')
      )
    ) {
      console.error(
        '[about-media] uploadAndCreateAboutMedia → erro inesperado',
        err,
      );
    }
    throw err;
  }
}

export async function toggleAboutMedia(id: string): Promise<void> {
  console.log(
    '[about-media] toggleAboutMedia → PATCH /about-media/:id/toggle',
    { id },
  );
  try {
    return await httpClient.patch(`about-media/${id}/toggle`);
  } catch (err) {
    console.error('[about-media] toggleAboutMedia falhou', { id }, err);
    throw err;
  }
}

export async function deleteAboutMedia(id: string): Promise<void> {
  console.log('[about-media] deleteAboutMedia → DELETE /about-media/:id', {
    id,
  });
  try {
    return await httpClient.delete(`about-media/${id}`);
  } catch (err) {
    console.error('[about-media] deleteAboutMedia falhou', { id }, err);
    throw err;
  }
}
