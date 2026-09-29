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

export async function listClientStories(): Promise<ClientStoryDTO[]> {
  console.log('[client-stories] listClientStories → GET /client-stories');
  try {
    return await httpClient.get<ClientStoryDTO[]>('client-stories');
  } catch (err) {
    console.error('[client-stories] listClientStories falhou', err);
    throw err;
  }
}

export async function createClientStory(
  data: CreateClientStoryDTO,
): Promise<void> {
  console.log('[client-stories] createClientStory → POST /client-stories', {
    shortTitle: data.shortTitle,
    imageId: data.imageId,
  });
  try {
    return await httpClient.post('client-stories', JSON.stringify(data));
  } catch (err) {
    console.error('[client-stories] createClientStory falhou', { data }, err);
    throw err;
  }
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
  console.log(
    '[client-stories] updateClientStory → PATCH /client-stories/:id',
    { id },
  );
  try {
    return await httpClient.patch(`client-stories/${id}`, JSON.stringify(data));
  } catch (err) {
    console.error(
      '[client-stories] updateClientStory falhou',
      { id, data },
      err,
    );
    throw err;
  }
}

export async function deleteClientStory(id: string): Promise<void> {
  console.log(
    '[client-stories] deleteClientStory → DELETE /client-stories/:id',
    { id },
  );
  try {
    return await httpClient.delete(`client-stories/${id}`);
  } catch (err) {
    console.error('[client-stories] deleteClientStory falhou', { id }, err);
    throw err;
  }
}

export async function toggleClientStory(id: string): Promise<void> {
  console.log(
    '[client-stories] toggleClientStory → PATCH /client-stories/:id/toggle',
    { id },
  );
  try {
    return await httpClient.patch(`client-stories/${id}/toggle`);
  } catch (err) {
    console.error('[client-stories] toggleClientStory falhou', { id }, err);
    throw err;
  }
}

export async function publishClientStory(id: string): Promise<void> {
  console.log(
    '[client-stories] publishClientStory → PATCH /client-stories/:id/publish',
    { id },
  );
  try {
    return await httpClient.patch(`client-stories/${id}/publish`);
  } catch (err) {
    console.error('[client-stories] publishClientStory falhou', { id }, err);
    throw err;
  }
}

export async function unpublishClientStory(id: string): Promise<void> {
  console.log(
    '[client-stories] unpublishClientStory → PATCH /client-stories/:id/unpublish',
    { id },
  );
  try {
    return await httpClient.patch(`client-stories/${id}/unpublish`);
  } catch (err) {
    console.error('[client-stories] unpublishClientStory falhou', { id }, err);
    throw err;
  }
}
