import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // TEMPORARY DEBUG — remove once the connection issue is confirmed fixed.
  // Masks the password so it's safe to screenshot.
  const uri = process.env.MONGODB_URI || '(not set — using localhost fallback)';
  Logger.log(`Using MONGODB_URI: ${uri.replace(/:([^@:]+)@/, ':***@')}`);


  // Needed so the Angular dev server (localhost:4200) can call this API
  // and so the SSE stream in ProjectsController works cross-origin.
  app.enableCors({ origin: true, credentials: true });

  // Enforces the class-validator rules on GenerateProjectDto / PatchNodeDto
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
