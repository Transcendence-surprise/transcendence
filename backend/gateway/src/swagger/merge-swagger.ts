/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  SwaggerModule,
  OpenAPIObject as NestOpenAPIObject,
} from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

export default async function setupMergedSwagger(app: NestFastifyApplication) {
  try {
    if (!process.env.CORE_URL ||
        !process.env.AUTH_URL ||
        !process.env.GAME_URL)
    {
      throw new Error('ALL URLS environment variables must be set');
    }

    const coreUrl = process.env.CORE_URL;
    const authUrl = process.env.AUTH_URL;
    const gameUrl = process.env.GAME_URL;

    const coreDocsUrl = `${coreUrl}/api/docs-json`;
    const authDocsUrl = `${authUrl}/api/auth/docs-json`;
    const gameDocsUrl = `${gameUrl}/api/game/docs-json`;

    const axios = await import('axios');

    async function fetchJson(url: string) {
      try {
        const res = await (axios as any).default.get(url, { timeout: 5000 });
        return res.data as Record<string, any> | null;
      } catch {
        return null;
      }
    }

    const [coreDoc, authDoc, gameDoc] = await Promise.all([
      fetchJson(coreDocsUrl),
      fetchJson(authDocsUrl),
      fetchJson(gameDocsUrl),
    ]);

    if (!coreDoc && !authDoc && !gameDoc) {
      throw new Error('Could not fetch any upstream docs');
    }

    const merged: Record<string, any> = {
      openapi: '3.0.0',
      info: { title: 'Transcendence Merged API', version: '1.0.0' },
      paths: {},
      components: { schemas: {} },
    };

    const mergeSchemas = (src: Record<string, any> | undefined) => {
      if (!src) return;
      for (const [name, schema] of Object.entries(src)) {
        merged.components.schemas[name] ??= schema;
      }
    };

    const mergePaths = (src: Record<string, any> | undefined) => {
      if (!src) return;
      for (const [path, methods] of Object.entries(src)) {
        merged.paths[path] ??= {};
        for (const [method, operation] of Object.entries(methods)) {
          merged.paths[path][method] ??= operation;
        }
      }
    };

    const mergeSimple = (doc: Record<string, any> | null) => {
      if (!doc) return;
      mergeSchemas(doc.components?.schemas);
      mergePaths(doc.paths);
    };

    const baseConfig = new DocumentBuilder()
      .setTitle('Transcendence API')
      .setDescription('Server-driven web game with user managment')
      .setVersion('1.0.0')
      .addCookieAuth('access_token', {
        type: 'apiKey',
        name: 'access_token',
        in: 'cookie',
      }, 'JWT')
      .addSecurity('API Key', {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
      })
      .build();

    const gatewayDoc = SwaggerModule.createDocument(app, baseConfig);

    mergeSimple(coreDoc);
    mergeSimple(authDoc);
    mergeSimple(gameDoc);
    mergeSimple(gatewayDoc);

    if (
      !baseConfig.info ||
      !baseConfig.tags ||
      !baseConfig.components?.securitySchemes
    ) {
      throw new Error('DocumentBuilder produced incomplete OpenAPI config');
    }

    merged.info = baseConfig.info;
    merged.tags = baseConfig.tags;
    merged.components.securitySchemes = baseConfig.components.securitySchemes;

    const mergedSpec = merged as unknown as NestOpenAPIObject;

    SwaggerModule.setup('api/docs', app, mergedSpec, {
      customSiteTitle: 'Transcendence Merged API Docs',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
      },
    });

  } catch (err: unknown) {
    console.error('Error while manually merging OpenAPI docs:', String(err));
  }
}
