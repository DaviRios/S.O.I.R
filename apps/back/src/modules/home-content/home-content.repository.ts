import type { z } from 'zod';
import type {
  createEcosystemSchema,
  createHomeBlogLinkSchema,
  createPopupSchema,
  createSlideSchema,
  updateEcosystemSchema,
  updateHomeBlogLinkSchema,
  updatePopupSchema,
  updateSlideSchema,
} from '@soir/contracts';
import type {
  EcosystemItem,
  HomeBlogLink,
  Popup,
  Slide,
} from '../../generated/prisma/client';

export type CreateSlideInput = z.infer<typeof createSlideSchema>;
export type UpdateSlideInput = z.infer<typeof updateSlideSchema>;
export type CreatePopupInput = z.infer<typeof createPopupSchema>;
export type UpdatePopupInput = z.infer<typeof updatePopupSchema>;
export type CreateEcosystemInput = z.infer<typeof createEcosystemSchema>;
export type UpdateEcosystemInput = z.infer<typeof updateEcosystemSchema>;
export type CreateHomeBlogLinkInput = z.infer<typeof createHomeBlogLinkSchema>;
export type UpdateHomeBlogLinkInput = z.infer<typeof updateHomeBlogLinkSchema>;

export interface HomeContentRepository {
  imageExists(id: string): Promise<boolean>;
  createSlide(input: CreateSlideInput): Promise<Slide>;
  listSlides(language?: 'ENGLISH' | 'PORTUGUESE'): Promise<Slide[]>;
  findSlide(id: string): Promise<Slide | null>;
  updateSlide(id: string, input: UpdateSlideInput): Promise<void>;
  publishSlide(id: string): Promise<void>;
  unpublishSlide(id: string): Promise<void>;
  deleteSlide(id: string): Promise<void>;
  createPopup(input: CreatePopupInput): Promise<Popup>;
  listPopups(language?: 'ENGLISH' | 'PORTUGUESE'): Promise<Popup[]>;
  findPopup(id: string): Promise<Popup | null>;
  updatePopup(id: string, input: UpdatePopupInput): Promise<void>;
  publishPopup(id: string): Promise<void>;
  unpublishPopup(id: string): Promise<void>;
  deletePopup(id: string): Promise<void>;
  createEcosystem(input: CreateEcosystemInput): Promise<EcosystemItem>;
  listEcosystems(): Promise<EcosystemItem[]>;
  findEcosystem(id: string): Promise<EcosystemItem | null>;
  updateEcosystem(id: string, input: UpdateEcosystemInput): Promise<void>;
  publishEcosystem(id: string): Promise<void>;
  unpublishEcosystem(id: string): Promise<void>;
  deleteEcosystem(id: string): Promise<void>;
  createHomeBlogLink(input: CreateHomeBlogLinkInput): Promise<HomeBlogLink>;
  listHomeBlogLinks(): Promise<HomeBlogLink[]>;
  findHomeBlogLink(id: string): Promise<HomeBlogLink | null>;
  updateHomeBlogLink(id: string, input: UpdateHomeBlogLinkInput): Promise<void>;
  publishHomeBlogLink(id: string): Promise<void>;
  unpublishHomeBlogLink(id: string): Promise<void>;
  deleteHomeBlogLink(id: string): Promise<void>;
}
