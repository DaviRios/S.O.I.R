import {
  LogController,
  type FastifyReply,
  type FastifyRequest,
  type FastifyServerOptions,
} from 'fastify';
import type { AppEnv } from '../../config/env';

export function createLoggerOptions(
  env: AppEnv,
): FastifyServerOptions['logger'] {
  if (env.NODE_ENV === 'test') return false;

  const level =
    env.LOG_LEVEL ?? (env.NODE_ENV === 'development' ? 'warn' : 'info');

  if (env.NODE_ENV !== 'development') return { level };

  return {
    level,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        singleLine: true,
        translateTime: 'SYS:HH:MM:ss.l',
      },
    },
  };
}

export class ResponseOnlyLogController extends LogController {
  private readonly errors = new WeakMap<FastifyRequest, Error>();

  captureError(request: FastifyRequest, error: unknown): void {
    this.errors.set(
      request,
      error instanceof Error ? error : new Error(String(error)),
    );
  }

  override incomingRequest(): void {
    // A single summary is emitted when the response finishes.
  }

  override routeNotFound(): void {
    // The final 404 response is logged by requestCompleted.
  }

  override defaultErrorLog(error: Error, request: FastifyRequest): void {
    this.captureError(request, error);
  }

  override requestCompleted(
    responseError: Error | null | undefined,
    request: FastifyRequest,
    reply: FastifyReply,
  ): void {
    const error = responseError ?? this.errors.get(request);
    this.errors.delete(request);

    const responseTimeMs = Number(reply.elapsedTime.toFixed(2));
    const message = `${request.method} ${request.url} ${reply.statusCode} ${responseTimeMs}ms`;
    const context = {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTimeMs,
      ...(error ? { err: error } : {}),
    };

    if (error || reply.statusCode >= 500) {
      reply.log.error(context, message);
    } else if (reply.statusCode >= 400) {
      reply.log.warn(context, message);
    } else {
      reply.log.info(context, message);
    }
  }
}
