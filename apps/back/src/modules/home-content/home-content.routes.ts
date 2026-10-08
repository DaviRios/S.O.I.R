import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import { z } from 'zod';
import {
  createEcosystemSchema,
  createHomeBlogLinkSchema,
  createPopupSchema,
  createSlideSchema,
  ecosystemSchema,
  homeBlogLinkSchema,
  idParamsSchema,
  languageQuerySchema,
  popupSchema,
  slideSchema,
  updateEcosystemSchema,
  updateHomeBlogLinkSchema,
  updatePopupSchema,
  updateSlideSchema,
} from '@soir/contracts';
import type { AuthService } from '../auth/auth.service';
import { requireAuth } from '../auth/auth.routes';
import type { HomeContentService } from './home-content.service';

interface HomeContentRoutesOptions {
  service: HomeContentService;
  auth: AuthService;
}

export const homeContentRoutes: FastifyPluginAsync<
  HomeContentRoutesOptions
> = async (app, { service, auth }) => {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const authenticated = requireAuth(auth);

  server.post(
    '/slides',
    { preHandler: authenticated, schema: { body: createSlideSchema } },
    async (request, reply) => {
      const item = await service.createSlide(request.body);
      return reply.header('Location', `/v1/slides/${item.id}`).code(201).send();
    },
  );
  server.get(
    '/slides',
    {
      preHandler: authenticated,
      schema: {
        querystring: languageQuerySchema,
        response: { 200: z.array(slideSchema) },
      },
    },
    (request) => service.listSlides(request.query.language),
  );
  server.get(
    '/slides/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, response: { 200: slideSchema } },
    },
    (request) => service.getSlide(request.params.id),
  );
  server.patch(
    '/slides/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, body: updateSlideSchema },
    },
    async (request, reply) => {
      await service.updateSlide(request.params.id, request.body);
      return reply.code(204).send();
    },
  );
  server.delete(
    '/slides/:id',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.deleteSlide(request.params.id);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/slides/:id/toggle',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.toggleSlide(request.params.id);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/slides/:id/publish',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.publishSlide(request.params.id);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/slides/:id/unpublish',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.unpublishSlide(request.params.id);
      return reply.code(204).send();
    },
  );

  server.post(
    '/popups',
    { preHandler: authenticated, schema: { body: createPopupSchema } },
    async (request, reply) => {
      const item = await service.createPopup(request.body);
      return reply.header('Location', `/v1/popups/${item.id}`).code(201).send();
    },
  );
  server.get(
    '/popups',
    {
      preHandler: authenticated,
      schema: {
        querystring: languageQuerySchema,
        response: { 200: z.array(popupSchema) },
      },
    },
    (request) => service.listPopups(request.query.language),
  );
  server.get(
    '/popups/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, response: { 200: popupSchema } },
    },
    (request) => service.getPopup(request.params.id),
  );
  server.patch(
    '/popups/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, body: updatePopupSchema },
    },
    async (request, reply) => {
      await service.updatePopup(request.params.id, request.body);
      return reply.code(204).send();
    },
  );
  server.delete(
    '/popups/:id',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.deletePopup(request.params.id);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/popups/:id/publish',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.publishPopup(request.params.id);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/popups/:id/unpublish',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.unpublishPopup(request.params.id);
      return reply.code(204).send();
    },
  );

  server.post(
    '/ecosystems',
    { preHandler: authenticated, schema: { body: createEcosystemSchema } },
    async (request, reply) => {
      const item = await service.createEcosystem(request.body);
      return reply
        .header('Location', `/v1/ecosystems/${item.id}`)
        .code(201)
        .send();
    },
  );
  server.get(
    '/ecosystems',
    {
      preHandler: authenticated,
      schema: { response: { 200: z.array(ecosystemSchema) } },
    },
    () => service.listEcosystems(),
  );
  server.get(
    '/ecosystems/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, response: { 200: ecosystemSchema } },
    },
    (request) => service.getEcosystem(request.params.id),
  );
  server.patch(
    '/ecosystems/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, body: updateEcosystemSchema },
    },
    async (request, reply) => {
      await service.updateEcosystem(request.params.id, request.body);
      return reply.code(204).send();
    },
  );
  server.delete(
    '/ecosystems/:id',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.deleteEcosystem(request.params.id);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/ecosystems/:id/toggle',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.toggleEcosystem(request.params.id);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/ecosystems/:id/publish',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.publishEcosystem(request.params.id);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/ecosystems/:id/unpublish',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.unpublishEcosystem(request.params.id);
      return reply.code(204).send();
    },
  );

  server.post(
    '/home-blog-links',
    { preHandler: authenticated, schema: { body: createHomeBlogLinkSchema } },
    async (request, reply) => {
      const item = await service.createHomeBlogLink(request.body);
      return reply
        .header('Location', `/v1/home-blog-links/${item.id}`)
        .code(201)
        .send();
    },
  );
  server.get(
    '/home-blog-links',
    {
      preHandler: authenticated,
      schema: { response: { 200: z.array(homeBlogLinkSchema) } },
    },
    () => service.listHomeBlogLinks(),
  );
  server.get(
    '/home-blog-links/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, response: { 200: homeBlogLinkSchema } },
    },
    (request) => service.getHomeBlogLink(request.params.id),
  );
  server.patch(
    '/home-blog-links/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, body: updateHomeBlogLinkSchema },
    },
    async (request, reply) => {
      await service.updateHomeBlogLink(request.params.id, request.body);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/home-blog-links/:id/toggle',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.toggleHomeBlogLink(request.params.id);
      return reply.code(204).send();
    },
  );
  server.delete(
    '/home-blog-links/:id',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.deleteHomeBlogLink(request.params.id);
      return reply.code(204).send();
    },
  );
};
