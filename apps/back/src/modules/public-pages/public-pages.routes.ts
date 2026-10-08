import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import { languageQuerySchema } from '@soir/contracts';
import type { PublicPagesService } from './public-pages.service';

interface PublicPagesRoutesOptions {
  service: PublicPagesService;
}

export const publicPagesRoutes: FastifyPluginAsync<
  PublicPagesRoutesOptions
> = async (app, { service }) => {
  const server = app.withTypeProvider<ZodTypeProvider>();
  server.get(
    '/public/pages/home',
    { schema: { querystring: languageQuerySchema } },
    (request) => service.home(request.query.language),
  );
  server.get(
    '/public/pages/cases',
    { schema: { querystring: languageQuerySchema } },
    (request) => service.cases(request.query.language),
  );
  server.get('/public/pages/about', () => service.about());
  server.get(
    '/public/pages/blog',
    { schema: { querystring: languageQuerySchema } },
    (request) => service.blog(request.query.language),
  );
};
