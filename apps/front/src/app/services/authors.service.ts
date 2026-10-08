import { httpClient } from '../factories/http-client.factory';

export interface AuthorDTO {
  id: string;
  name: string;
  bio: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAuthorDTO {
  name: string;
  bio?: string;
}

export async function listAuthors(signal?: AbortSignal): Promise<AuthorDTO[]> {
  return await httpClient.get<AuthorDTO[]>('authors', signal);
}

export async function listAuthorsDropdown(
  signal?: AbortSignal,
): Promise<AuthorDTO[]> {
  return await httpClient.get<AuthorDTO[]>('authors/dropdown', signal);
}

export async function createAuthor(data: CreateAuthorDTO): Promise<void> {
  return await httpClient.post('authors', JSON.stringify(data));
}
