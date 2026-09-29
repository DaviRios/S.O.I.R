import { httpClient } from '../factories/http-client.factory';

export interface SlideDTO {
  id: string;
  logoId: string;
  text: string;
  buttonText: string;
  buttonUrl: string;
  isActive: boolean;
  language: 'ENGLISH' | 'PORTUGUESE';
  isDraft: boolean;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSlideDTO {
  text: string;
  buttonText?: string;
  buttonUrl?: string;
  logoId?: string;
  language: 'ENGLISH' | 'PORTUGUESE';
}

export async function listSlides(language?: string): Promise<SlideDTO[]> {
  console.log('[slides] listSlides → GET /slides', { language });
  try {
    const qs = language ? `?language=${language}` : '';
    return await httpClient.get<SlideDTO[]>(`slides${qs}`);
  } catch (err) {
    console.error('[slides] listSlides falhou', { language }, err);
    throw err;
  }
}

export async function createSlide(data: CreateSlideDTO): Promise<void> {
  console.log('[slides] createSlide → POST /slides', {
    language: data.language,
  });
  try {
    return await httpClient.post('slides', JSON.stringify(data));
  } catch (err) {
    console.error('[slides] createSlide falhou', { data }, err);
    throw err;
  }
}

export interface UpdateSlideDTO {
  text?: string;
  buttonText?: string;
  buttonUrl?: string;
  language?: 'ENGLISH' | 'PORTUGUESE';
}

export async function updateSlide(
  id: string,
  data: UpdateSlideDTO,
): Promise<void> {
  console.log('[slides] updateSlide → PATCH /slides/:id', { id });
  try {
    return await httpClient.patch(`slides/${id}`, JSON.stringify(data));
  } catch (err) {
    console.error('[slides] updateSlide falhou', { id, data }, err);
    throw err;
  }
}

export async function deleteSlide(id: string): Promise<void> {
  console.log('[slides] deleteSlide → DELETE /slides/:id', { id });
  try {
    return await httpClient.delete(`slides/${id}`);
  } catch (err) {
    console.error('[slides] deleteSlide falhou', { id }, err);
    throw err;
  }
}

export async function toggleSlide(id: string): Promise<void> {
  console.log('[slides] toggleSlide → PATCH /slides/:id/toggle', { id });
  try {
    return await httpClient.patch(`slides/${id}/toggle`);
  } catch (err) {
    console.error('[slides] toggleSlide falhou', { id }, err);
    throw err;
  }
}

export async function publishSlide(id: string): Promise<void> {
  console.log('[slides] publishSlide → PATCH /slides/:id/publish', { id });
  try {
    return await httpClient.patch(`slides/${id}/publish`);
  } catch (err) {
    console.error('[slides] publishSlide falhou', { id }, err);
    throw err;
  }
}

export async function unpublishSlide(id: string): Promise<void> {
  console.log('[slides] unpublishSlide → PATCH /slides/:id/unpublish', { id });
  try {
    return await httpClient.patch(`slides/${id}/unpublish`);
  } catch (err) {
    console.error('[slides] unpublishSlide falhou', { id }, err);
    throw err;
  }
}
