import type { z } from 'zod';
import type {
  createCaseSchema,
  createCaseTestimonialSchema,
  updateCaseSchema,
} from '@soir/contracts';
import type {
  Case,
  CaseImage,
  CaseTestimonial,
} from '../../generated/prisma/client';

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
export type CreateCaseTestimonialInput = z.infer<
  typeof createCaseTestimonialSchema
>;
export type CaseWithImages = Case & { images: CaseImage[] };

export interface CasesRepository {
  imageExists(id: string): Promise<boolean>;
  createCase(input: CreateCaseInput): Promise<CaseWithImages>;
  listCases(title?: string): Promise<CaseWithImages[]>;
  findCase(id: string): Promise<CaseWithImages | null>;
  updateCase(id: string, input: UpdateCaseInput): Promise<void>;
  setCasePublished(id: string, published: boolean): Promise<void>;
  deleteCase(id: string): Promise<void>;
  addImages(caseId: string, imageIds: string[]): Promise<void>;
  createTestimonial(
    caseId: string,
    input: CreateCaseTestimonialInput,
  ): Promise<CaseTestimonial>;
  listTestimonials(
    caseId: string,
    language?: 'ENGLISH' | 'PORTUGUESE',
  ): Promise<CaseTestimonial[]>;
  findTestimonial(caseId: string, id: string): Promise<CaseTestimonial | null>;
  setTestimonialPublished(id: string, published: boolean): Promise<void>;
}
