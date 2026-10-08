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
  return await httpClient.get<PartnerDTO[]>('partners');
}

export async function createPartner(data: CreatePartnerDTO): Promise<void> {
  return await httpClient.post('partners', JSON.stringify(data));
}
