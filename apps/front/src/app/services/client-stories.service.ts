import { httpClient } from '../factories/http-client.factory';

export interface ClientStoryDTO {
  id: string;
  imageId: string;
  imageUrl: string;
  shortTitle: string;
  longTitle: string;
  description: string;
  language: 'PORTUGUESE' | 'ENGLISH';
  isActive: boolean;
  isDraft: boolean;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientStoryDTO {
  imageId: string;
  shortTitle: string;
  longTitle: string;
  description: string;
  language: 'PORTUGUESE' | 'ENGLISH';
}

export async function listClientStories(
  signal?: AbortSignal,
): Promise<ClientStoryDTO[]> {
  return await httpClient.get<ClientStoryDTO[]>('client-stories', signal);
}

export async function createClientStory(
  data: CreateClientStoryDTO,
): Promise<void> {
  return await httpClient.post('client-stories', JSON.stringify(data));
}

export interface UpdateClientStoryDTO {
  imageId?: string;
  shortTitle?: string;
  longTitle?: string;
  description?: string;
}

export async function updateClientStory(
  id: string,
  data: UpdateClientStoryDTO,
): Promise<void> {
  return await httpClient.patch(`client-stories/${id}`, JSON.stringify(data));
}

export async function deleteClientStory(id: string): Promise<void> {
  return await httpClient.delete(`client-stories/${id}`);
}

export async function toggleClientStory(id: string): Promise<void> {
  return await httpClient.patch(`client-stories/${id}/toggle`);
}

export async function publishClientStory(id: string): Promise<void> {
  return await httpClient.patch(`client-stories/${id}/publish`);
}

export async function unpublishClientStory(id: string): Promise<void> {
  return await httpClient.patch(`client-stories/${id}/unpublish`);
}
