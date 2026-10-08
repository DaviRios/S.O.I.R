import 'dotenv/config';
import { buildApp } from './app';
import { loadEnv } from './config/env';

async function bootstrap() {
  const env = loadEnv();
  const app = await buildApp({ env });
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  app.log.info(`Soir CMS API disponível em http://localhost:${env.PORT}/v1`);
}

void bootstrap();
