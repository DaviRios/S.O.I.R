import Fastify, {
  type FastifyInstance,
  type FastifyServerOptions,
} from 'fastify';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from '@fastify/type-provider-zod';
import type { AppEnv } from './config/env';
import { AppError } from './core/errors';
import {
  createDatabase,
  type DatabaseClient,
} from './infrastructure/database/prisma';
import {
  createLoggerOptions,
  ResponseOnlyLogController,
} from './infrastructure/logging/http-logging';
import { AuthService } from './modules/auth/auth.service';
import { PrismaAuthRepository } from './modules/auth/prisma-auth.repository';
import { authRoutes } from './modules/auth/auth.routes';
import { CasesService } from './modules/cases/cases.service';
import { PrismaCasesRepository } from './modules/cases/prisma-cases.repository';
import { casesRoutes } from './modules/cases/cases.routes';
import { EditorialService } from './modules/editorial/editorial.service';
import { PrismaEditorialRepository } from './modules/editorial/prisma-editorial.repository';
import { editorialRoutes } from './modules/editorial/editorial.routes';
import { HomeContentService } from './modules/home-content/home-content.service';
import { PrismaHomeContentRepository } from './modules/home-content/prisma-home-content.repository';
import { homeContentRoutes } from './modules/home-content/home-content.routes';
import { LocalMediaStorage } from './modules/media/local-media-storage';
import { MediaService } from './modules/media/media.service';
import { PrismaMediaRepository } from './modules/media/prisma-media.repository';
import { mediaRoutes } from './modules/media/media.routes';
import { S3MediaStorage } from './modules/media/s3-media-storage';
import { PrismaPublicPagesRepository } from './modules/public-pages/prisma-public-pages.repository';
import { PublicPagesService } from './modules/public-pages/public-pages.service';
import { publicPagesRoutes } from './modules/public-pages/public-pages.routes';
import { PrismaSiteContentRepository } from './modules/site-content/prisma-site-content.repository';
import { SiteContentService } from './modules/site-content/site-content.service';
import { siteContentRoutes } from './modules/site-content/site-content.routes';

export interface BuildAppOptions {
  env: AppEnv;
  database?: DatabaseClient;
  logger?: FastifyServerOptions['logger'];
  connectDatabase?: boolean;
}

export async function buildApp(
  options: BuildAppOptions,
): Promise<FastifyInstance> {
  const { env } = options;
  const database = options.database ?? createDatabase(env.DATABASE_URL);
  const logController = new ResponseOnlyLogController();
  const app = Fastify({
    logger: options.logger ?? createLoggerOptions(env),
    logController,
    trustProxy: true,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await app.register(cookie);
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: 'soir_access_token', signed: false },
  });
  await app.register(multipart, {
    limits: { files: 20, fileSize: 25 * 1024 * 1024, parts: 60 },
  });
  await app.register(swagger, {
    openapi: { info: { title: 'Soir CMS API', version: '1.0.0' } },
    transform: jsonSchemaTransform,
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  app.addHook('onRequest', async (request) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return;
    const origin = request.headers.origin;
    if (origin && origin !== env.APP_ORIGIN) {
      throw new AppError(403, 'ORIGIN_NOT_ALLOWED', 'Origem não permitida');
    }
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
        requestId: request.id,
      });
    }
    const validation = (
      error as {
        validation?: Array<{
          instancePath?: string;
          schemaPath?: string;
          message?: string;
        }>;
      }
    ).validation;
    if (validation) {
      return reply.code(400).send({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        requestId: request.id,
        issues: validation.map((issue) => ({
          path: issue.instancePath || issue.schemaPath,
          message: issue.message ?? 'Valor inválido',
        })),
      });
    }
    logController.captureError(request, error);
    return reply.code(500).send({
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor',
      requestId: request.id,
    });
  });

  const auth = new AuthService(new PrismaAuthRepository(database));
  const editorial = new EditorialService(
    new PrismaEditorialRepository(database),
  );
  const homeContent = new HomeContentService(
    new PrismaHomeContentRepository(database),
  );
  const cases = new CasesService(new PrismaCasesRepository(database));
  const siteContent = new SiteContentService(
    new PrismaSiteContentRepository(database),
  );
  const publicPages = new PublicPagesService(
    new PrismaPublicPagesRepository(database),
  );
  const storage =
    env.MEDIA_STORAGE === 's3'
      ? new S3MediaStorage({
          region: env.S3_REGION,
          bucket: env.S3_BUCKET as string,
          endpoint: env.S3_ENDPOINT,
          accessKeyId: env.S3_ACCESS_KEY_ID,
          secretAccessKey: env.S3_SECRET_ACCESS_KEY,
          forcePathStyle: env.S3_FORCE_PATH_STYLE,
        })
      : new LocalMediaStorage(env.CMS_UPLOAD_DIR);
  const media = new MediaService(new PrismaMediaRepository(database), storage);

  await app.register(authRoutes, { prefix: '/v1', service: auth, env });
  await app.register(editorialRoutes, {
    prefix: '/v1',
    service: editorial,
    auth,
  });
  await app.register(homeContentRoutes, {
    prefix: '/v1',
    service: homeContent,
    auth,
  });
  await app.register(casesRoutes, { prefix: '/v1', service: cases, auth });
  await app.register(siteContentRoutes, {
    prefix: '/v1',
    service: siteContent,
    auth,
  });
  await app.register(mediaRoutes, { prefix: '/v1', service: media, auth });
  await app.register(publicPagesRoutes, {
    prefix: '/v1',
    service: publicPages,
  });

  app.get('/v1/health', async () => {
    await database.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  });

  if (options.connectDatabase !== false) {
    await database.$connect();
    await auth.bootstrapAdmin({
      username: env.CMS_ADMIN_USER,
      email: env.CMS_ADMIN_EMAIL,
      password: env.CMS_ADMIN_PASSWORD,
    });
  }
  app.addHook('onClose', async () => database.$disconnect());
  return app;
}
