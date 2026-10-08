import { z } from 'zod';
import {
  auditSchema,
  idParamsSchema,
  idSchema,
  languageSchema,
  lifecycleSchema,
  popupStyleSchema,
} from './common';

const optionalText = z.string().trim().optional();
const requiredText = z.string().trim().min(1);

export const authorSchema = auditSchema.extend({
  id: idSchema,
  name: z.string(),
  bio: z.string(),
  imageUrl: z.string(),
  isActive: z.boolean(),
});
export const createAuthorSchema = z.strictObject({
  name: requiredText,
  bio: optionalText,
  imageUrl: optionalText,
});
export const updateAuthorSchema = createAuthorSchema.partial();

export const blogPostSchema = lifecycleSchema.extend({
  id: idSchema,
  title: z.string(),
  url: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  authorId: idSchema,
  authorName: z.string().nullable(),
  language: languageSchema,
});
export const createBlogPostSchema = z.strictObject({
  title: requiredText,
  url: requiredText,
  description: optionalText,
  imageUrl: optionalText,
  authorId: idSchema,
  language: languageSchema.default('PORTUGUESE'),
});
export const updateBlogPostSchema = createBlogPostSchema.partial();
export const blogPostQuerySchema = z.object({
  title: optionalText,
  authorName: optionalText,
  language: languageSchema.optional(),
});

export const slideSchema = lifecycleSchema.extend({
  id: idSchema,
  logoId: idSchema,
  text: z.string(),
  buttonText: z.string(),
  buttonUrl: z.string(),
  language: languageSchema,
});
export const createSlideSchema = z.strictObject({
  logoId: idSchema,
  text: requiredText,
  buttonText: optionalText,
  buttonUrl: optionalText,
  language: languageSchema.default('PORTUGUESE'),
});
export const updateSlideSchema = createSlideSchema.partial();

export const popupSchema = lifecycleSchema.extend({
  id: idSchema,
  title: z.string(),
  description: z.string(),
  buttonText: z.string(),
  redirectUrl: z.string(),
  buttonText2: z.string(),
  redirectUrl2: z.string(),
  style: popupStyleSchema,
  language: languageSchema,
});
export const createPopupSchema = z.strictObject({
  title: requiredText,
  description: optionalText,
  buttonText: optionalText,
  redirectUrl: optionalText,
  buttonText2: optionalText,
  redirectUrl2: optionalText,
  style: popupStyleSchema.default('ORANGE_WHITE'),
  language: languageSchema.default('PORTUGUESE'),
});
export const updatePopupSchema = createPopupSchema.partial();

export const ecosystemSchema = lifecycleSchema.extend({
  id: idSchema,
  name: z.string(),
  imageId: idSchema,
  imageUrl: z.string(),
});
export const createEcosystemSchema = z.strictObject({
  name: requiredText,
  imageId: idSchema,
});
export const updateEcosystemSchema = createEcosystemSchema.partial();

export const homeBlogLinkSchema = lifecycleSchema.extend({
  id: idSchema,
  url: z.string(),
  label: z.string(),
});
export const createHomeBlogLinkSchema = z.strictObject({
  url: requiredText,
  label: optionalText,
});
export const updateHomeBlogLinkSchema = createHomeBlogLinkSchema.partial();

export const clientStorySchema = lifecycleSchema.extend({
  id: idSchema,
  imageId: idSchema,
  imageUrl: z.string(),
  shortTitle: z.string(),
  longTitle: z.string(),
  description: z.string(),
  language: languageSchema,
});
export const createClientStorySchema = z.strictObject({
  imageId: idSchema,
  shortTitle: requiredText,
  longTitle: requiredText,
  description: requiredText,
  language: languageSchema.default('PORTUGUESE'),
});
export const updateClientStorySchema = createClientStorySchema.partial();

export const caseSchema = lifecycleSchema.extend({
  id: idSchema,
  title: z.string(),
  shortTitle: z.string(),
  subtitle: z.string(),
  content: z.string(),
  industry: z.string(),
  country: z.string(),
  tag: z.string(),
  logoId: idSchema.nullable(),
  imageIds: z.array(idSchema),
  language: languageSchema,
});
export const createCaseSchema = z.strictObject({
  title: requiredText,
  shortTitle: optionalText,
  subtitle: optionalText,
  content: optionalText,
  industry: optionalText,
  country: optionalText,
  tag: optionalText,
  logoId: idSchema.optional(),
  language: languageSchema.default('PORTUGUESE'),
});
export const updateCaseSchema = createCaseSchema.partial();
export const caseQuerySchema = z.object({ title: optionalText });
export const caseImageSchema = z.strictObject({ imageId: idSchema });
export const caseImageBatchSchema = z.array(caseImageSchema).max(20);

export const caseTestimonialSchema = lifecycleSchema.extend({
  id: idSchema,
  caseId: idSchema,
  authorName: z.string(),
  role: z.string(),
  company: z.string(),
  content: z.string(),
  language: languageSchema,
});
export const createCaseTestimonialSchema = z.strictObject({
  authorName: requiredText,
  role: optionalText,
  company: optionalText,
  content: requiredText,
  language: languageSchema.default('PORTUGUESE'),
});
export const caseTestimonialParamsSchema = idParamsSchema.extend({
  testimonialId: idSchema,
});

export const aboutMediaSchema = lifecycleSchema.extend({
  id: idSchema,
  imageId: idSchema,
  imageUrl: z.string(),
  mediaType: z.enum(['IMAGE', 'VIDEO']),
  caption: z.string(),
  sortOrder: z.number().int(),
});
export const createAboutMediaSchema = z.strictObject({
  imageId: idSchema,
  mediaType: z.enum(['IMAGE', 'VIDEO']),
  caption: optionalText,
  sortOrder: z.number().int().default(0),
});
export const updateAboutMediaSchema = createAboutMediaSchema.partial();

export const partnerSchema = lifecycleSchema.extend({
  id: idSchema,
  name: z.string(),
  logoId: idSchema.nullable(),
  website: z.string(),
});
export const createPartnerSchema = z.strictObject({
  name: requiredText,
  logoId: idSchema.optional(),
  website: optionalText,
});
export const updatePartnerSchema = createPartnerSchema.partial();

export const careerSchema = lifecycleSchema.extend({
  id: idSchema,
  title: z.string(),
  description: z.string(),
  location: z.string(),
  language: languageSchema,
});
export const createCareerSchema = z.strictObject({
  title: requiredText,
  description: optionalText,
  location: optionalText,
  language: languageSchema.default('PORTUGUESE'),
});
export const updateCareerSchema = createCareerSchema.partial();

export const serviceItemSchema = lifecycleSchema.extend({
  id: idSchema,
  name: z.string(),
  description: z.string(),
  language: languageSchema,
});
export const createServiceItemSchema = z.strictObject({
  name: requiredText,
  description: optionalText,
  language: languageSchema.default('PORTUGUESE'),
});
export const updateServiceItemSchema = createServiceItemSchema.partial();

export type AuthorDto = z.infer<typeof authorSchema>;
export type BlogPostDto = z.infer<typeof blogPostSchema>;
export type SlideDto = z.infer<typeof slideSchema>;
export type PopupDto = z.infer<typeof popupSchema>;
export type EcosystemDto = z.infer<typeof ecosystemSchema>;
export type HomeBlogLinkDto = z.infer<typeof homeBlogLinkSchema>;
export type ClientStoryDto = z.infer<typeof clientStorySchema>;
export type CaseDto = z.infer<typeof caseSchema>;
