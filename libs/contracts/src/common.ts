import { z } from 'zod';

export const idSchema = z.uuid();
export const languageSchema = z.enum(['ENGLISH', 'PORTUGUESE']);
export const publicationStatusSchema = z.enum(['DRAFT', 'PUBLISHED']);
export const userRoleSchema = z.enum(['ADMIN', 'EDITOR']);
export const popupStyleSchema = z.enum([
  'ORANGE_WHITE',
  'WHITE_ORANGE',
  'PURPLE_WHITE',
  'WHITE_PURPLE',
]);

export const auditSchema = z.object({
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const lifecycleSchema = auditSchema.extend({
  isActive: z.boolean(),
  isDraft: z.boolean(),
  isPublished: z.boolean(),
  publishedAt: z.string().nullable(),
});

export const idParamsSchema = z.object({ id: idSchema });
export const languageQuerySchema = z.object({
  language: languageSchema.optional(),
});

export const apiErrorSchema = z.object({
  statusCode: z.number().int(),
  code: z.string(),
  message: z.string(),
  requestId: z.string(),
  issues: z
    .array(z.object({ path: z.string(), message: z.string() }))
    .optional(),
});

export type Language = z.infer<typeof languageSchema>;
export type PublicationStatus = z.infer<typeof publicationStatusSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type PopupStyle = z.infer<typeof popupStyleSchema>;
