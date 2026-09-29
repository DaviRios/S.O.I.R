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

export async function listAuthors(): Promise<AuthorDTO[]> {
  console.log('[authors] listAuthors → GET /authors');
  try {
    return await httpClient.get<AuthorDTO[]>('authors');
  } catch (err) {
    console.error('[authors] listAuthors falhou', err);
    throw err;
  }
}

export async function listAuthorsDropdown(): Promise<AuthorDTO[]> {
  console.log('[authors] listAuthorsDropdown → GET /authors/dropdown');
  try {
    return await httpClient.get<AuthorDTO[]>('authors/dropdown');
  } catch (err) {
    console.error('[authors] listAuthorsDropdown falhou', err);
    throw err;
  }
}

export async function createAuthor(data: CreateAuthorDTO): Promise<void> {
  console.log('[authors] createAuthor → POST /authors', { name: data.name });
  try {
    return await httpClient.post('authors', JSON.stringify(data));
  } catch (err) {
    console.error('[authors] createAuthor falhou', { data }, err);
    throw err;
  }
}
