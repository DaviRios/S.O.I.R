import { httpClient } from '../factories/http-client.factory';

export interface CareerDTO {
  id: string;
  title: string;
  description: string;
  location: string;
  isActive: boolean;
  language: 'ENGLISH' | 'PORTUGUESE';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCareerDTO {
  title: string;
  description?: string;
  location?: string;
  language: 'ENGLISH' | 'PORTUGUESE';
}

export async function listCareers(language?: string): Promise<CareerDTO[]> {
  const qs = language ? `?language=${language}` : '';
  return await httpClient.get<CareerDTO[]>(`careers${qs}`);
}

export async function createCareer(data: CreateCareerDTO): Promise<void> {
  return await httpClient.post('careers', JSON.stringify(data));
}
