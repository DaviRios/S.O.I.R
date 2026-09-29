import { AuthService } from '../auth/auth';
import { httpClient } from '../factories/http-client.factory';

const BASE_URL =
  (import.meta.env.VITE_API_CMS_URL ?? '/v1').replace(/\/$/, '') + '/';

async function getAuthHeader(): Promise<Record<string, string>> {
  const user = await AuthService.getCurrentUser();
  return user?.accessToken
    ? { Authorization: `Bearer ${user.accessToken}` }
    : {};
}

export interface CaseContentDTO {
  id: string;
  title: string;
  subtitle: string;
  shortTitle: string;
  content: string;
  industry: string;
  country: string;
  tag: string;
  language: 'PORTUGUESE' | 'ENGLISH';
  logoId: string;
  imageIds: string[];
  isActive: boolean;
  isDraft: boolean;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCaseDTO {
  title: string;
  subtitle?: string;
  shortTitle?: string;
  content?: string;
  industry?: string;
  country?: string;
  tag?: string;
  language: 'PORTUGUESE' | 'ENGLISH';
}

export function caseImageUrl(imageId: string): string {
  return `${BASE_URL}images/${imageId}`;
}

export async function listCases(title?: string): Promise<CaseContentDTO[]> {
  console.log('[cases] listCases → GET /cases', { title });
  try {
    const qs = title ? `?title=${encodeURIComponent(title)}` : '';
    return await httpClient.get<CaseContentDTO[]>(`cases${qs}`);
  } catch (err) {
    console.error('[cases] listCases falhou', { title }, err);
    throw err;
  }
}

export async function createCase(data: CreateCaseDTO): Promise<string> {
  console.log('[cases] createCase → POST /cases', { title: data.title });
  try {
    const response = await fetch(`${BASE_URL}cases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await getAuthHeader()),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Erro ao salvar caso.');
    }
    const location = response.headers.get('Location') ?? '';
    return location.split('/').pop() ?? '';
  } catch (err) {
    console.error('[cases] createCase falhou', { data }, err);
    throw err;
  }
}

export async function addCaseImages(
  caseId: string,
  imageIds: string[],
): Promise<void> {
  console.log('[cases] addCaseImages → POST /cases/:id/images/batch', {
    caseId,
    count: imageIds.length,
  });
  try {
    const body = imageIds.map((imageId) => ({ imageId }));
    return await httpClient.post(
      `cases/${caseId}/images/batch`,
      JSON.stringify(body),
    );
  } catch (err) {
    console.error('[cases] addCaseImages falhou', { caseId, imageIds }, err);
    throw err;
  }
}

export interface UpdateCaseDTO {
  title?: string;
  subtitle?: string;
  shortTitle?: string;
  content?: string;
  industry?: string;
  country?: string;
  tag?: string;
}

export async function updateCase(
  id: string,
  data: UpdateCaseDTO,
): Promise<void> {
  console.log('[cases] updateCase → PATCH /cases/:id', { id });
  try {
    return await httpClient.patch(`cases/${id}`, JSON.stringify(data));
  } catch (err) {
    console.error('[cases] updateCase falhou', { id, data }, err);
    throw err;
  }
}

export async function deleteCase(id: string): Promise<void> {
  console.log('[cases] deleteCase → DELETE /cases/:id', { id });
  try {
    return await httpClient.delete(`cases/${id}`);
  } catch (err) {
    console.error('[cases] deleteCase falhou', { id }, err);
    throw err;
  }
}

export async function toggleCase(id: string): Promise<void> {
  console.log('[cases] toggleCase → PATCH /cases/:id/toggle', { id });
  try {
    return await httpClient.patch(`cases/${id}/toggle`);
  } catch (err) {
    console.error('[cases] toggleCase falhou', { id }, err);
    throw err;
  }
}

export async function publishCase(id: string): Promise<void> {
  console.log('[cases] publishCase → PATCH /cases/:id/publish', { id });
  try {
    return await httpClient.patch(`cases/${id}/publish`);
  } catch (err) {
    console.error('[cases] publishCase falhou', { id }, err);
    throw err;
  }
}

export async function unpublishCase(id: string): Promise<void> {
  console.log('[cases] unpublishCase → PATCH /cases/:id/unpublish', { id });
  try {
    return await httpClient.patch(`cases/${id}/unpublish`);
  } catch (err) {
    console.error('[cases] unpublishCase falhou', { id }, err);
    throw err;
  }
}
