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
  console.log('[service-items] listServiceItems → GET /services', { language });
  try {
    const qs = language ? `?language=${language}` : '';
    return await httpClient.get<ServiceItemDTO[]>(`services${qs}`);
  } catch (err) {
    console.error('[service-items] listServiceItems falhou', { language }, err);
    throw err;
  }
}

export async function createServiceItem(
  data: CreateServiceItemDTO,
): Promise<void> {
  console.log('[service-items] createServiceItem → POST /services', {
    name: data.name,
    language: data.language,
  });
  try {
    return await httpClient.post('services', JSON.stringify(data));
  } catch (err) {
    console.error('[service-items] createServiceItem falhou', { data }, err);
    throw err;
  }
}
