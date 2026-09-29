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
  console.log('[careers] listCareers → GET /careers', { language });
  try {
    const qs = language ? `?language=${language}` : '';
    return await httpClient.get<CareerDTO[]>(`careers${qs}`);
  } catch (err) {
    console.error('[careers] listCareers falhou', { language }, err);
    throw err;
  }
}

export async function createCareer(data: CreateCareerDTO): Promise<void> {
  console.log('[careers] createCareer → POST /careers', {
    title: data.title,
    language: data.language,
  });
  try {
    return await httpClient.post('careers', JSON.stringify(data));
  } catch (err) {
    console.error('[careers] createCareer falhou', { data }, err);
    throw err;
  }
}
