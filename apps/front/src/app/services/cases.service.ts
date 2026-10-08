import { httpClient } from '../factories/http-client.factory';

const BASE_URL =
  (import.meta.env.VITE_API_CMS_URL ?? '/v1').replace(/\/$/, '') + '/';

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

export async function listCases(
  title?: string,
  signal?: AbortSignal,
): Promise<CaseContentDTO[]> {
  const qs = title ? `?title=${encodeURIComponent(title)}` : '';
  return await httpClient.get<CaseContentDTO[]>(`cases${qs}`, signal);
}

export async function createCase(data: CreateCaseDTO): Promise<string> {
  const response = await httpClient.raw('POST', 'cases', JSON.stringify(data));
  const location = response.headers.get('Location') ?? '';
  return location.split('/').pop() ?? '';
}

export async function addCaseImages(
  caseId: string,
  imageIds: string[],
): Promise<void> {
  return await httpClient.post(
    `cases/${caseId}/images/batch`,
    JSON.stringify(imageIds.map((imageId) => ({ imageId }))),
  );
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
  return await httpClient.patch(`cases/${id}`, JSON.stringify(data));
}

export async function deleteCase(id: string): Promise<void> {
  return await httpClient.delete(`cases/${id}`);
}

export async function toggleCase(id: string): Promise<void> {
  return await httpClient.patch(`cases/${id}/toggle`);
}

export async function publishCase(id: string): Promise<void> {
  return await httpClient.patch(`cases/${id}/publish`);
}

export async function unpublishCase(id: string): Promise<void> {
  return await httpClient.patch(`cases/${id}/unpublish`);
}
