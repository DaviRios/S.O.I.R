import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import { z } from 'zod';
import {
  aboutMediaSchema,
  careerSchema,
  clientStorySchema,
  createAboutMediaSchema,
  createCareerSchema,
  createClientStorySchema,
  createPartnerSchema,
  createServiceItemSchema,
  idParamsSchema,
  languageQuerySchema,
  partnerSchema,
  serviceItemSchema,
  updateAboutMediaSchema,
  updateCareerSchema,
  updateClientStorySchema,
  updatePartnerSchema,
  updateServiceItemSchema,
} from '@soir/contracts';
import { requireAuth } from '../auth/auth.routes';
import type { AuthService } from '../auth/auth.service';
import type { SiteContentService } from './site-content.service';

interface SiteContentRoutesOptions {
  service: SiteContentService;
  auth: AuthService;
}

export const siteContentRoutes: FastifyPluginAsync<
  SiteContentRoutesOptions
> = async (app, { service, auth }) => {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const authenticated = requireAuth(auth);

  server.post(
    '/client-stories',
    { preHandler: authenticated, schema: { body: createClientStorySchema } },
    async (request, reply) => {
      const item = await service.createClientStory(request.body);
      return reply
        .header('Location', `/v1/client-stories/${item.id}`)
        .code(201)
        .send();
    },
  );
  server.get(
    '/client-stories',
    {
      preHandler: authenticated,
      schema: { response: { 200: z.array(clientStorySchema) } },
    },
    () => service.listClientStories(),
  );
  server.get(
    '/client-stories/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, response: { 200: clientStorySchema } },
    },
    (request) => service.getClientStory(request.params.id),
  );
  server.patch(
    '/client-stories/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, body: updateClientStorySchema },
    },
    async (request, reply) => {
      await service.updateClientStory(request.params.id, request.body);
      return reply.code(204).send();
    },
  );
  server.delete(
    '/client-stories/:id',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.deleteClientStory(request.params.id);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/client-stories/:id/toggle',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.toggleClientStory(request.params.id);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/client-stories/:id/publish',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.setClientStoryPublished(request.params.id, true);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/client-stories/:id/unpublish',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.setClientStoryPublished(request.params.id, false);
      return reply.code(204).send();
    },
  );

  server.post(
    '/about-media',
    { preHandler: authenticated, schema: { body: createAboutMediaSchema } },
    async (request, reply) => {
      const item = await service.createAboutMedia(request.body);
      return reply
        .header('Location', `/v1/about-media/${item.id}`)
        .code(201)
        .send();
    },
  );
  server.get(
    '/about-media',
    {
      preHandler: authenticated,
      schema: { response: { 200: z.array(aboutMediaSchema) } },
    },
    () => service.listAboutMedia(),
  );
  server.get(
    '/about-media/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, response: { 200: aboutMediaSchema } },
    },
    (request) => service.getAboutMedia(request.params.id),
  );
  server.patch(
    '/about-media/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, body: updateAboutMediaSchema },
    },
    async (request, reply) => {
      await service.updateAboutMedia(request.params.id, request.body);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/about-media/:id/toggle',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.toggleAboutMedia(request.params.id);
      return reply.code(204).send();
    },
  );
  server.delete(
    '/about-media/:id',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.deleteAboutMedia(request.params.id);
      return reply.code(204).send();
    },
  );

  server.post(
    '/partners',
    { preHandler: authenticated, schema: { body: createPartnerSchema } },
    async (request, reply) => {
      const item = await service.createPartner(request.body);
      return reply
        .header('Location', `/v1/partners/${item.id}`)
        .code(201)
        .send();
    },
  );
  server.get(
    '/partners',
    {
      preHandler: authenticated,
      schema: { response: { 200: z.array(partnerSchema) } },
    },
    () => service.listPartners(),
  );
  server.get(
    '/partners/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, response: { 200: partnerSchema } },
    },
    (request) => service.getPartner(request.params.id),
  );
  server.patch(
    '/partners/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, body: updatePartnerSchema },
    },
    async (request, reply) => {
      await service.updatePartner(request.params.id, request.body);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/partners/:id/publish',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.setPartnerPublished(request.params.id, true);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/partners/:id/unpublish',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.setPartnerPublished(request.params.id, false);
      return reply.code(204).send();
    },
  );
  server.delete(
    '/partners/:id',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.deletePartner(request.params.id);
      return reply.code(204).send();
    },
  );

  server.post(
    '/careers',
    { preHandler: authenticated, schema: { body: createCareerSchema } },
    async (request, reply) => {
      const item = await service.createCareer(request.body);
      return reply
        .header('Location', `/v1/careers/${item.id}`)
        .code(201)
        .send();
    },
  );
  server.get(
    '/careers',
    {
      preHandler: authenticated,
      schema: {
        querystring: languageQuerySchema,
        response: { 200: z.array(careerSchema) },
      },
    },
    (request) => service.listCareers(request.query.language),
  );
  server.get(
    '/careers/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, response: { 200: careerSchema } },
    },
    (request) => service.getCareer(request.params.id),
  );
  server.patch(
    '/careers/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, body: updateCareerSchema },
    },
    async (request, reply) => {
      await service.updateCareer(request.params.id, request.body);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/careers/:id/publish',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.setCareerPublished(request.params.id, true);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/careers/:id/unpublish',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.setCareerPublished(request.params.id, false);
      return reply.code(204).send();
    },
  );
  server.delete(
    '/careers/:id',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.deleteCareer(request.params.id);
      return reply.code(204).send();
    },
  );

  server.post(
    '/services',
    { preHandler: authenticated, schema: { body: createServiceItemSchema } },
    async (request, reply) => {
      const item = await service.createServiceItem(request.body);
      return reply
        .header('Location', `/v1/services/${item.id}`)
        .code(201)
        .send();
    },
  );
  server.get(
    '/services',
    {
      preHandler: authenticated,
      schema: {
        querystring: languageQuerySchema,
        response: { 200: z.array(serviceItemSchema) },
      },
    },
    (request) => service.listServiceItems(request.query.language),
  );
  server.get(
    '/services/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, response: { 200: serviceItemSchema } },
    },
    (request) => service.getServiceItem(request.params.id),
  );
  server.patch(
    '/services/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, body: updateServiceItemSchema },
    },
    async (request, reply) => {
      await service.updateServiceItem(request.params.id, request.body);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/services/:id/publish',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.setServiceItemPublished(request.params.id, true);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/services/:id/unpublish',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.setServiceItemPublished(request.params.id, false);
      return reply.code(204).send();
    },
  );
  server.delete(
    '/services/:id',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.deleteServiceItem(request.params.id);
      return reply.code(204).send();
    },
  );
};
