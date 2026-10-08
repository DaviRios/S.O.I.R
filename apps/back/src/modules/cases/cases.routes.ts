import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import { z } from 'zod';
import {
  caseImageBatchSchema,
  caseImageSchema,
  caseQuerySchema,
  caseSchema,
  caseTestimonialParamsSchema,
  caseTestimonialSchema,
  createCaseSchema,
  createCaseTestimonialSchema,
  idParamsSchema,
  languageQuerySchema,
  updateCaseSchema,
} from '@soir/contracts';
import { requireAuth } from '../auth/auth.routes';
import type { AuthService } from '../auth/auth.service';
import type { CasesService } from './cases.service';

interface CasesRoutesOptions {
  service: CasesService;
  auth: AuthService;
}

export const casesRoutes: FastifyPluginAsync<CasesRoutesOptions> = async (
  app,
  { service, auth },
) => {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const authenticated = requireAuth(auth);
  server.post(
    '/cases',
    { preHandler: authenticated, schema: { body: createCaseSchema } },
    async (request, reply) => {
      const item = await service.create(request.body);
      return reply.header('Location', `/v1/cases/${item.id}`).code(201).send();
    },
  );
  server.get(
    '/cases',
    {
      preHandler: authenticated,
      schema: {
        querystring: caseQuerySchema,
        response: { 200: z.array(caseSchema) },
      },
    },
    (request) => service.list(request.query.title),
  );
  server.get(
    '/cases/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, response: { 200: caseSchema } },
    },
    (request) => service.get(request.params.id),
  );
  server.patch(
    '/cases/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, body: updateCaseSchema },
    },
    async (request, reply) => {
      await service.update(request.params.id, request.body);
      return reply.code(204).send();
    },
  );
  server.delete(
    '/cases/:id',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.delete(request.params.id);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/cases/:id/toggle',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.toggle(request.params.id);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/cases/:id/publish',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.publish(request.params.id);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/cases/:id/unpublish',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.unpublish(request.params.id);
      return reply.code(204).send();
    },
  );
  server.post(
    '/cases/:id/images',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, body: caseImageSchema },
    },
    async (request, reply) => {
      await service.addImages(request.params.id, [request.body.imageId]);
      return reply.code(204).send();
    },
  );
  server.post(
    '/cases/:id/images/batch',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, body: caseImageBatchSchema },
    },
    async (request, reply) => {
      await service.addImages(
        request.params.id,
        request.body.map((item) => item.imageId),
      );
      return reply.code(204).send();
    },
  );
  server.post(
    '/cases/:id/testimonials',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, body: createCaseTestimonialSchema },
    },
    async (request, reply) => {
      const item = await service.addTestimonial(
        request.params.id,
        request.body,
      );
      return reply
        .header(
          'Location',
          `/v1/cases/${request.params.id}/testimonials/${item.id}`,
        )
        .code(201)
        .send();
    },
  );
  server.get(
    '/cases/:id/testimonials',
    {
      preHandler: authenticated,
      schema: {
        params: idParamsSchema,
        querystring: languageQuerySchema,
        response: { 200: z.array(caseTestimonialSchema) },
      },
    },
    (request) =>
      service.listTestimonials(request.params.id, request.query.language),
  );
  server.patch(
    '/cases/:id/testimonials/:testimonialId/publish',
    {
      preHandler: authenticated,
      schema: { params: caseTestimonialParamsSchema },
    },
    async (request, reply) => {
      await service.setTestimonialPublished(
        request.params.id,
        request.params.testimonialId,
        true,
      );
      return reply.code(204).send();
    },
  );
  server.patch(
    '/cases/:id/testimonials/:testimonialId/unpublish',
    {
      preHandler: authenticated,
      schema: { params: caseTestimonialParamsSchema },
    },
    async (request, reply) => {
      await service.setTestimonialPublished(
        request.params.id,
        request.params.testimonialId,
        false,
      );
      return reply.code(204).send();
    },
  );
};
