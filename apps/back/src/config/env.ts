import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    LOG_LEVEL: z
      .enum(['silent', 'fatal', 'error', 'warn', 'info', 'debug', 'trace'])
      .optional(),
    PORT: z.coerce.number().int().positive().default(3000),
    APP_ORIGIN: z.url().default('http://localhost:4200'),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(32),
    CMS_ADMIN_USER: z.string().trim().min(3).default('admin'),
    CMS_ADMIN_EMAIL: z.email().default('admin@soir.local'),
    CMS_ADMIN_PASSWORD: z.string().min(8),
    CMS_UPLOAD_DIR: z.string().default('data/uploads'),
    MEDIA_STORAGE: z.enum(['local', 's3']).default('local'),
    S3_REGION: z.string().default('us-east-1'),
    S3_BUCKET: z.string().optional(),
    S3_ENDPOINT: z.url().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_FORCE_PATH_STYLE: z
      .preprocess(
        (value) =>
          typeof value === 'string' ? value.toLowerCase() === 'true' : value,
        z.boolean(),
      )
      .default(false),
  })
  .superRefine((value, context) => {
    if (value.MEDIA_STORAGE === 's3' && !value.S3_BUCKET) {
      context.addIssue({
        code: 'custom',
        path: ['S3_BUCKET'],
        message: 'é obrigatório quando MEDIA_STORAGE=s3',
      });
    }
  });

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Configuração inválida: ${details}`);
  }
  return result.data;
}
