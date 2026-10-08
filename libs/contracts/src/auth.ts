import { z } from 'zod';
import { auditSchema, idSchema, userRoleSchema } from './common';

export const loginSchema = z
  .strictObject({
    email: z.email().optional(),
    username: z.string().trim().min(3).optional(),
    password: z.string().min(8),
  })
  .refine((value) => value.email || value.username, {
    message: 'Informe e-mail ou usuário',
    path: ['email'],
  });

export const publicUserSchema = auditSchema.extend({
  id: idSchema,
  username: z.string(),
  email: z.email(),
  name: z.string(),
  role: userRoleSchema,
  groups: z.array(z.string()),
  isActive: z.boolean(),
});

export const authenticatedUserSchema = z.object({
  sub: idSchema,
  username: z.string(),
  email: z.email(),
  name: z.string(),
  role: userRoleSchema,
  groups: z.array(z.string()),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export const authResponseSchema = z.object({
  user: publicUserSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;
export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;
