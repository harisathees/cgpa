import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { listRoutes, printRoutes } from './common/route-explorer.js';

const GLOBAL_PREFIX = 'api';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.enableCors({
    origin: config.get<string>('FRONTEND_URL', 'http://localhost:3000'),
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);

  // Print the full list of registered API routes on startup.
  printRoutes(listRoutes(app, GLOBAL_PREFIX));
  console.log(`🚀 Backend ready at http://localhost:${port}/${GLOBAL_PREFIX}`);
}
void bootstrap();
