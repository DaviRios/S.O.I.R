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

export async function listEcosystemItems(
  signal?: AbortSignal,
): Promise<EcosystemDTO[]> {
  return await httpClient.get<EcosystemDTO[]>('ecosystems', signal);
}

export async function createEcosystemItem(
  data: CreateEcosystemDTO,
): Promise<void> {
  return await httpClient.post('ecosystems', JSON.stringify(data));
}

export interface UpdateEcosystemDTO {
  name?: string;
  imageId?: string;
}

export async function updateEcosystemItem(
  id: string,
  data: UpdateEcosystemDTO,
): Promise<void> {
  return await httpClient.patch(`ecosystems/${id}`, JSON.stringify(data));
}

export async function deleteEcosystemItem(id: string): Promise<void> {
  return await httpClient.delete(`ecosystems/${id}`);
}

export async function toggleEcosystemItem(id: string): Promise<void> {
  return await httpClient.patch(`ecosystems/${id}/toggle`);
}

export async function publishEcosystemItem(id: string): Promise<void> {
  return await httpClient.patch(`ecosystems/${id}/publish`);
}

export async function unpublishEcosystemItem(id: string): Promise<void> {
  return await httpClient.patch(`ecosystems/${id}/unpublish`);
}
