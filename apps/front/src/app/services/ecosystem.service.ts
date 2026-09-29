import { httpClient } from '../factories/http-client.factory';

export interface EcosystemDTO {
  id: string;
  name: string;
  imageId: string;
  imageUrl: string;
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEcosystemDTO {
  name: string;
  imageId?: string;
}

export async function listEcosystemItems(): Promise<EcosystemDTO[]> {
  console.log('[ecosystem] listEcosystemItems → GET /ecosystems');
  try {
    return await httpClient.get<EcosystemDTO[]>('ecosystems');
  } catch (err) {
    console.error('[ecosystem] listEcosystemItems falhou', err);
    throw err;
  }
}

export async function createEcosystemItem(
  data: CreateEcosystemDTO,
): Promise<void> {
  console.log('[ecosystem] createEcosystemItem → POST /ecosystems', {
    name: data.name,
    imageId: data.imageId,
  });
  try {
    return await httpClient.post('ecosystems', JSON.stringify(data));
  } catch (err) {
    console.error('[ecosystem] createEcosystemItem falhou', { data }, err);
    throw err;
  }
}

export interface UpdateEcosystemDTO {
  name?: string;
  imageId?: string;
}

export async function updateEcosystemItem(
  id: string,
  data: UpdateEcosystemDTO,
): Promise<void> {
  console.log('[ecosystem] updateEcosystemItem → PATCH /ecosystems/:id', {
    id,
  });
  try {
    return await httpClient.patch(`ecosystems/${id}`, JSON.stringify(data));
  } catch (err) {
    console.error('[ecosystem] updateEcosystemItem falhou', { id, data }, err);
    throw err;
  }
}

export async function deleteEcosystemItem(id: string): Promise<void> {
  console.log('[ecosystem] deleteEcosystemItem → DELETE /ecosystems/:id', {
    id,
  });
  try {
    return await httpClient.delete(`ecosystems/${id}`);
  } catch (err) {
    console.error('[ecosystem] deleteEcosystemItem falhou', { id }, err);
    throw err;
  }
}

export async function toggleEcosystemItem(id: string): Promise<void> {
  console.log(
    '[ecosystem] toggleEcosystemItem → PATCH /ecosystems/:id/toggle',
    { id },
  );
  try {
    return await httpClient.patch(`ecosystems/${id}/toggle`);
  } catch (err) {
    console.error('[ecosystem] toggleEcosystemItem falhou', { id }, err);
    throw err;
  }
}

export async function publishEcosystemItem(id: string): Promise<void> {
  console.log(
    '[ecosystem] publishEcosystemItem → PATCH /ecosystems/:id/publish',
    { id },
  );
  try {
    return await httpClient.patch(`ecosystems/${id}/publish`);
  } catch (err) {
    console.error('[ecosystem] publishEcosystemItem falhou', { id }, err);
    throw err;
  }
}

export async function unpublishEcosystemItem(id: string): Promise<void> {
  console.log(
    '[ecosystem] unpublishEcosystemItem → PATCH /ecosystems/:id/unpublish',
    { id },
  );
  try {
    return await httpClient.patch(`ecosystems/${id}/unpublish`);
  } catch (err) {
    console.error('[ecosystem] unpublishEcosystemItem falhou', { id }, err);
    throw err;
  }
}
