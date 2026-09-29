import { httpClient } from '../factories/http-client.factory';

export type PopupStyle =
  | 'ORANGE_WHITE'
  | 'WHITE_ORANGE'
  | 'PURPLE_WHITE'
  | 'WHITE_PURPLE';

export const POPUP_STYLE_LABELS: Record<PopupStyle, string> = {
  ORANGE_WHITE: 'Laranja e branco',
  WHITE_ORANGE: 'Branco e laranja',
  PURPLE_WHITE: 'Roxo e branco',
  WHITE_PURPLE: 'Branco e roxo',
};

export const POPUP_STYLE_COLORS: Record<PopupStyle, [string, string]> = {
  ORANGE_WHITE: ['#F97316', '#FFFFFF'],
  WHITE_ORANGE: ['#FFFFFF', '#F97316'],
  PURPLE_WHITE: ['#7C3AED', '#FFFFFF'],
  WHITE_PURPLE: ['#FFFFFF', '#7C3AED'],
};

export interface PopupDTO {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  redirectUrl: string;
  buttonText2: string | null;
  redirectUrl2: string | null;
  isActive: boolean;
  style: PopupStyle;
  language: 'ENGLISH' | 'PORTUGUESE';
  isDraft: boolean;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePopupDTO {
  title: string;
  description?: string;
  buttonText?: string;
  redirectUrl?: string;
  buttonText2?: string;
  redirectUrl2?: string;
  style: PopupStyle;
  language: 'ENGLISH' | 'PORTUGUESE';
}

export async function listPopups(language?: string): Promise<PopupDTO[]> {
  console.log('[popups] listPopups → GET /popups', { language });
  try {
    const qs = language ? `?language=${language}` : '';
    return await httpClient.get<PopupDTO[]>(`popups${qs}`);
  } catch (err) {
    console.error('[popups] listPopups falhou', { language }, err);
    throw err;
  }
}

export async function createPopup(data: CreatePopupDTO): Promise<void> {
  console.log('[popups] createPopup → POST /popups', {
    title: data.title,
    language: data.language,
  });
  try {
    return await httpClient.post('popups', JSON.stringify(data));
  } catch (err) {
    console.error('[popups] createPopup falhou', { data }, err);
    throw err;
  }
}

export interface UpdatePopupDTO {
  title?: string;
  description?: string;
  buttonText?: string;
  redirectUrl?: string;
  buttonText2?: string;
  redirectUrl2?: string;
  style?: PopupStyle;
  language?: 'ENGLISH' | 'PORTUGUESE';
}

export async function updatePopup(
  id: string,
  data: UpdatePopupDTO,
): Promise<void> {
  console.log('[popups] updatePopup → PATCH /popups/:id', { id });
  try {
    return await httpClient.patch(`popups/${id}`, JSON.stringify(data));
  } catch (err) {
    console.error('[popups] updatePopup falhou', { id, data }, err);
    throw err;
  }
}

export async function deletePopup(id: string): Promise<void> {
  console.log('[popups] deletePopup → DELETE /popups/:id', { id });
  try {
    return await httpClient.delete(`popups/${id}`);
  } catch (err) {
    console.error('[popups] deletePopup falhou', { id }, err);
    throw err;
  }
}

export async function publishPopup(id: string): Promise<void> {
  console.log('[popups] publishPopup → PATCH /popups/:id/publish', { id });
  try {
    return await httpClient.patch(`popups/${id}/publish`);
  } catch (err) {
    console.error('[popups] publishPopup falhou', { id }, err);
    throw err;
  }
}

export async function unpublishPopup(id: string): Promise<void> {
  console.log('[popups] unpublishPopup → PATCH /popups/:id/unpublish', { id });
  try {
    return await httpClient.patch(`popups/${id}/unpublish`);
  } catch (err) {
    console.error('[popups] unpublishPopup falhou', { id }, err);
    throw err;
  }
}
