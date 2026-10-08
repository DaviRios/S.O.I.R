import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AppEnv } from '../../config/env';
import { createLoggerOptions, ResponseOnlyLogController } from './http-logging';

function makeRequest(method = 'GET', url = '/v1/posts') {
  return { method, url } as FastifyRequest;
}

function makeReply(statusCode: number) {
  const log = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
  return {
    reply: {
      statusCode,
      elapsedTime: 12.345,
      log,
    } as unknown as FastifyReply,
    log,
  };
}

describe('HTTP logging', () => {
  it.each([
    [200, 'info'],
    [404, 'warn'],
    [500, 'error'],
  ] as const)('logs status %s once at %s level', (statusCode, level) => {
    const controller = new ResponseOnlyLogController();
    const request = makeRequest();
    const { reply, log } = makeReply(statusCode);

    controller.requestCompleted(undefined, request, reply);

    expect(log[level]).toHaveBeenCalledTimes(1);
    expect(log[level]).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: '/v1/posts',
        statusCode,
        responseTimeMs: 12.35,
      }),
      `GET /v1/posts ${statusCode} 12.35ms`,
    );
    expect(
      log.info.mock.calls.length +
        log.warn.mock.calls.length +
        log.error.mock.calls.length,
    ).toBe(1);
  });

  it('includes a captured error in the response log', () => {
    const controller = new ResponseOnlyLogController();
    const request = makeRequest('POST', '/v1/posts');
    const { reply, log } = makeReply(500);
    const error = new Error('database unavailable');

    controller.captureError(request, error);
    controller.requestCompleted(undefined, request, reply);

    expect(log.error).toHaveBeenCalledWith(
      expect.objectContaining({ err: error }),
      'POST /v1/posts 500 12.35ms',
    );
  });

  it('uses warn and single-line pretty logs in development by default', () => {
    const logger = createLoggerOptions({
      NODE_ENV: 'development',
    } as AppEnv);

    expect(logger).toMatchObject({
      level: 'warn',
      transport: {
        target: 'pino-pretty',
        options: { singleLine: true },
      },
    });
  });

  it('accepts an environment log level and keeps production structured', () => {
    const development = createLoggerOptions({
      NODE_ENV: 'development',
      LOG_LEVEL: 'debug',
    } as AppEnv);
    const production = createLoggerOptions({
      NODE_ENV: 'production',
      LOG_LEVEL: 'info',
    } as AppEnv);

    expect(development).toMatchObject({ level: 'debug' });
    expect(production).toEqual({ level: 'info' });
  });
});
