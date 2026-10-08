import { z } from 'zod';
import { idSchema } from './common';

export const imageExtensionSchema = z.enum([
  'PNG',
  'JPEG',
  'GIF',
  'WEBP',
  'SVG',
]);

export const imageSearchQuerySchema = z.object({
  extension: imageExtensionSchema.optional(),
  query: z.string().trim().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
});

export const imageSearchResultSchema = z.object({
  id: idSchema,
  url: z.string(),
  name: z.string(),
  extension: imageExtensionSchema,
  size: z.number().int().nonnegative(),
  uploadDate: z.string(),
});

export const uploadBatchResponseSchema = z.array(z.string());

export type ImageSearchResult = z.infer<typeof imageSearchResultSchema>;
