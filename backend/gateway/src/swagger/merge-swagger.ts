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

    // Simple merge: copy schemas if name not present, merge paths and methods.
    function mergeSimple(doc: Record<string, any> | null) {
      if (!doc) return;

      const srcSchemas: Record<string, any> =
        (doc.components && doc.components.schemas) || {};
      for (const name of Object.keys(srcSchemas)) {
        if (!merged.components.schemas[name]) {
          merged.components.schemas[name] = srcSchemas[name];
        }
      }

      if (doc.paths) {
        for (const p of Object.keys(doc.paths)) {
          if (!merged.paths[p]) merged.paths[p] = doc.paths[p];
          else {
            for (const m of Object.keys(doc.paths[p])) {
              if (!merged.paths[p][m]) merged.paths[p][m] = doc.paths[p][m];
            }
          }
        }
      }
    }

    const baseConfig = new DocumentBuilder()
      .setTitle('Transcendence API')
      .setDescription('Server-driven web game with user managment')
      .setVersion('1.0.0')
      .addCookieAuth('access_token', {
        type: 'apiKey',
        name: 'access_token',
        in: 'cookie',
      }, 'JWT')
      .addApiKey({
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header'
      }, 'Api Key')
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

    // expose merged spec via SwaggerModule
    const mergedSpec: NestOpenAPIObject =
      merged as unknown as NestOpenAPIObject;

    SwaggerModule.setup('api/docs', app, mergedSpec, {
      customSiteTitle: 'Transcendence Merged API Docs',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
      },
    });

    console.log(
      'Manual merged Swagger docs available at /api/docs and /api/docs-json',
    );
  } catch (err: unknown) {
    console.warn('Error while manually merging OpenAPI docs:', String(err));
  }
}
