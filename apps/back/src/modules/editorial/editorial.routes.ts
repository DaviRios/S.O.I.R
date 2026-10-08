import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import {
  authorSchema,
  blogPostQuerySchema,
  blogPostSchema,
  createAuthorSchema,
  createBlogPostSchema,
  idParamsSchema,
  updateAuthorSchema,
  updateBlogPostSchema,
} from '@soir/contracts';
import { z } from 'zod';
import type { AuthService } from '../auth/auth.service';
import { requireAuth } from '../auth/auth.routes';
import type { EditorialService } from './editorial.service';

interface EditorialRoutesOptions {
  service: EditorialService;
  auth: AuthService;
}

export const editorialRoutes: FastifyPluginAsync<
  EditorialRoutesOptions
> = async (app, { service, auth }) => {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const authenticated = requireAuth(auth);

  server.post(
    '/authors',
    {
      preHandler: authenticated,
      schema: { body: createAuthorSchema },
    },
    async (request, reply) => {
      const author = await service.createAuthor(request.body);
      return reply
        .header('Location', `/v1/authors/${author.id}`)
        .code(201)
        .send();
    },
  );
  server.get(
    '/authors',
    {
      preHandler: authenticated,
      schema: { response: { 200: z.array(authorSchema) } },
    },
    () => service.listAuthors(),
  );
  server.get(
    '/authors/dropdown',
    {
      preHandler: authenticated,
      schema: { response: { 200: z.array(authorSchema) } },
    },
    () => service.listAuthors(),
  );
  server.get(
    '/authors/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, response: { 200: authorSchema } },
    },
    (request) => service.getAuthor(request.params.id),
  );
  server.patch(
    '/authors/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, body: updateAuthorSchema },
    },
    async (request, reply) => {
      await service.updateAuthor(request.params.id, request.body);
      return reply.code(204).send();
    },
  );
  server.delete(
    '/authors/:id',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.deleteAuthor(request.params.id);
      return reply.code(204).send();
    },
  );

  server.post(
    '/blog-posts',
    { preHandler: authenticated, schema: { body: createBlogPostSchema } },
    async (request, reply) => {
      const post = await service.createPost(request.body);
      return reply
        .header('Location', `/v1/blog-posts/${post.id}`)
        .code(201)
        .send();
    },
  );
  server.get(
    '/blog-posts',
    {
      preHandler: authenticated,
      schema: {
        querystring: blogPostQuerySchema,
        response: { 200: z.array(blogPostSchema) },
      },
    },
    (request) => service.listPosts(request.query),
  );
  server.get(
    '/blog-posts/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, response: { 200: blogPostSchema } },
    },
    (request) => service.getPost(request.params.id),
  );
  server.put(
    '/blog-posts/:id',
    {
      preHandler: authenticated,
      schema: { params: idParamsSchema, body: updateBlogPostSchema },
    },
    async (request, reply) => {
      await service.updatePost(request.params.id, request.body);
      return reply.code(204).send();
    },
  );
  server.delete(
    '/blog-posts/:id',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.deletePost(request.params.id);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/blog-posts/:id/publish',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.publishPost(request.params.id);
      return reply.code(204).send();
    },
  );
  server.patch(
    '/blog-posts/:id/unpublish',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.unpublishPost(request.params.id);
      return reply.code(204).send();
    },
  );
};
