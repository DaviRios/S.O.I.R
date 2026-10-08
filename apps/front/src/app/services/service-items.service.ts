import { httpClient } from '../factories/http-client.factory';

export interface ServiceItemDTO {
  id: string;
  name: string;
  language: 'ENGLISH' | 'PORTUGUESE';
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceItemDTO {
  name: string;
  description?: string;
  language: 'ENGLISH' | 'PORTUGUESE';
}

export async function listServiceItems(
  language?: string,
): Promise<ServiceItemDTO[]> {
  const qs = language ? `?language=${language}` : '';
  return await httpClient.get<ServiceItemDTO[]>(`services${qs}`);
}

export async function createServiceItem(
  data: CreateServiceItemDTO,
): Promise<void> {
  return await httpClient.post('services', JSON.stringify(data));
}
