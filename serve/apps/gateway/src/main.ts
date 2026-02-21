import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') ?? [
      'http://localhost:5173', // dashboard (Vite)
      'http://localhost:3000', // client (Next.js)
    ],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // ─── Swagger ─────────────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Arcade Arena API')
    .setDescription(
      `## Esports Rating Platform API

### Authentication
All protected endpoints require a JWT Bearer token obtained from \`/auth/login\`.

### Permission System
Permissions follow the format \`module:action\`:
- \`tournament:create\` — Create tournaments
- \`tournament:manage\` — Full CRUD (wildcard — covers create/update/delete)

### Default Role Permissions
| Role | Scope |
|------|-------|
| **ADMIN** | All permissions |
| **STAFF** | Manage content, moderate, manage players/teams/matches |
| **ORGANIZER** | Create/update tournaments and matches |
| **CREATOR** | Create/manage content |
| **PLAYER** | View + rate |
| **USER** | View + rate |`,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT access token from /auth/login',
      },
      'access-token',
    )
    .addTag('Auth', 'Registration, login, token refresh')
    .addTag('Users', 'User management and profiles')
    .addTag('Tournaments', 'Tournament CRUD')
    .addTag('Matches', 'Match management and results')
    .addTag('Players', 'Player profiles')
    .addTag('Teams', 'Team management')
    .addTag('Ratings', 'Rating submission and moderation')
    .addTag('Admin', 'System administration — requires system:permissions')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Arcade Arena API Docs',
    customCss: `.swagger-ui .topbar { background-color: #0f0f0f; }`,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      tagsSorter: 'alpha',
    },
  });

  await app.listen(3333);
  console.log('API Gateway running on: http://localhost:3333');
  console.log('Swagger docs:           http://localhost:3333/api/docs');
}
bootstrap();
