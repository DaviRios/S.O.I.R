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

export async function listSlides(
  language?: string,
  signal?: AbortSignal,
): Promise<SlideDTO[]> {
  const qs = language ? `?language=${language}` : '';
  return await httpClient.get<SlideDTO[]>(`slides${qs}`, signal);
}

export async function createSlide(data: CreateSlideDTO): Promise<void> {
  return await httpClient.post('slides', JSON.stringify(data));
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
  return await httpClient.patch(`slides/${id}`, JSON.stringify(data));
}

export async function deleteSlide(id: string): Promise<void> {
  return await httpClient.delete(`slides/${id}`);
}

export async function toggleSlide(id: string): Promise<void> {
  return await httpClient.patch(`slides/${id}/toggle`);
}

export async function publishSlide(id: string): Promise<void> {
  return await httpClient.patch(`slides/${id}/publish`);
}

export async function unpublishSlide(id: string): Promise<void> {
  return await httpClient.patch(`slides/${id}/unpublish`);
}
