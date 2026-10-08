import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';
import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import { z } from 'zod';
import {
  idParamsSchema,
  imageSearchQuerySchema,
  imageSearchResultSchema,
  uploadBatchResponseSchema,
} from '@soir/contracts';
import { ValidationError } from '../../core/errors';
import type { AuthService } from '../auth/auth.service';
import { requireAuth } from '../auth/auth.routes';
import type { MediaService, UploadedMediaFile } from './media.service';

interface MediaRoutesOptions {
  service: MediaService;
  auth: AuthService;
}

interface ParsedMultipart {
  files: UploadedMediaFile[];
  fields: Map<string, string[]>;
}

async function parseMultipart(
  request: FastifyRequest,
): Promise<ParsedMultipart> {
  if (!request.isMultipart())
    throw new ValidationError('Envie multipart/form-data');
  const files: UploadedMediaFile[] = [];
  const fields = new Map<string, string[]>();
  for await (const part of request.parts()) {
    if (part.type === 'file') {
      files.push(await toUploadedFile(part));
      continue;
    }
    const values = fields.get(part.fieldname) ?? [];
    values.push(String(part.value));
    fields.set(part.fieldname, values);
  }
  return { files, fields };
}

async function toUploadedFile(part: MultipartFile): Promise<UploadedMediaFile> {
  return {
    filename: part.filename,
    mimetype: part.mimetype,
    buffer: await part.toBuffer(),
  };
}

function first(fields: Map<string, string[]>, key: string): string | undefined {
  return fields.get(key)?.[0];
}

export const mediaRoutes: FastifyPluginAsync<MediaRoutesOptions> = async (
  app,
  { service, auth },
) => {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const authenticated = requireAuth(auth);

  server.post(
    '/images',
    { preHandler: authenticated },
    async (request, reply) => {
      const form = await parseMultipart(request);
      const file = form.files[0];
      if (!file) throw new ValidationError('Arquivo obrigatório');
      const image = await service.uploadImage(
        file,
        first(form.fields, 'name'),
        form.fields.get('tags') ?? [],
      );
      return reply
        .header('Location', `/v1/images/${image.id}`)
        .code(201)
        .send();
    },
  );

  server.post(
    '/images/batch',
    {
      preHandler: authenticated,
      schema: { response: { 201: uploadBatchResponseSchema } },
    },
    async (request, reply) => {
      const form = await parseMultipart(request);
      if (form.files.length === 0)
        throw new ValidationError('Arquivo obrigatório');
      if (form.files.length > 20)
        throw new ValidationError('Limite de 20 arquivos');
      const names = form.fields.get('name') ?? [];
      const tags = form.fields.get('tags') ?? [];
      const locations: string[] = [];
      for (const [index, file] of form.files.entries()) {
        const image = await service.uploadImage(file, names[index], tags);
        locations.push(`/v1/images/${image.id}`);
      }
      return reply.code(201).send(locations);
    },
  );

  server.get(
    '/images',
    {
      preHandler: authenticated,
      schema: {
        querystring: imageSearchQuerySchema,
        response: { 200: z.array(imageSearchResultSchema) },
      },
    },
    (request) =>
      service.searchImages({
        extension: request.query.extension,
        query: request.query.query,
        tags: request.query.tags
          ? Array.isArray(request.query.tags)
            ? request.query.tags
            : [request.query.tags]
          : undefined,
      }),
  );

  server.get(
    '/images/:id',
    { schema: { params: idParamsSchema } },
    async (request, reply) => {
      const result = await service.read(request.params.id, 'IMAGE');
      return reply.type(result.asset.contentType).send(result.contents);
    },
  );
  server.delete(
    '/images/:id',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.remove(request.params.id, 'IMAGE');
      return reply.code(204).send();
    },
  );

  server.post(
    '/videos',
    { preHandler: authenticated },
    async (request, reply) => {
      const form = await parseMultipart(request);
      const file = form.files[0];
      if (!file) throw new ValidationError('Arquivo obrigatório');
      const video = await service.uploadVideo(file, first(form.fields, 'name'));
      return reply
        .header('Location', `/v1/videos/${video.id}`)
        .code(201)
        .send();
    },
  );
  server.get(
    '/videos/:id',
    { schema: { params: idParamsSchema } },
    async (request, reply) => {
      const result = await service.read(request.params.id, 'VIDEO');
      return reply.type(result.asset.contentType).send(result.contents);
    },
  );
  server.delete(
    '/videos/:id',
    { preHandler: authenticated, schema: { params: idParamsSchema } },
    async (request, reply) => {
      await service.remove(request.params.id, 'VIDEO');
      return reply.code(204).send();
    },
  );

  server.post(
    '/files/upload',
    { preHandler: authenticated },
    async (request, reply) => {
      const form = await parseMultipart(request);
      const file = form.files[0];
      if (!file) throw new ValidationError('Arquivo obrigatório');
      const saved = await service.uploadFile(file);
      return reply
        .header('Location', `/v1/files/${saved.id}`)
        .code(201)
        .send('Arquivo enviado com sucesso.');
    },
  );
  server.get(
    '/files/:id',
    { schema: { params: idParamsSchema } },
    async (request, reply) => {
      const result = await service.read(request.params.id, 'FILE');
      return reply.type(result.asset.contentType).send(result.contents);
    },
  );
};
