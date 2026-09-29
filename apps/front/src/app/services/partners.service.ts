import { httpClient } from '../factories/http-client.factory';

export interface PartnerDTO {
  id: string;
  name: string;
  logoId: string;
  website: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartnerDTO {
  name: string;
  website?: string;
  logoId?: string;
}

export async function listPartners(): Promise<PartnerDTO[]> {
  console.log('[partners] listPartners → GET /partners');
  try {
    return await httpClient.get<PartnerDTO[]>('partners');
  } catch (err) {
    console.error('[partners] listPartners falhou', err);
    throw err;
  }
}

export async function createPartner(data: CreatePartnerDTO): Promise<void> {
  console.log('[partners] createPartner → POST /partners', {
    name: data.name,
    website: data.website,
  });
  try {
    return await httpClient.post('partners', JSON.stringify(data));
  } catch (err) {
    console.error('[partners] createPartner falhou', { data }, err);
    throw err;
  }
}
