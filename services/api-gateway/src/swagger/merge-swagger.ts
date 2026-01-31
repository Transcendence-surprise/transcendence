/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  SwaggerModule,
  OpenAPIObject as NestOpenAPIObject,
} from '@nestjs/swagger';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

export default async function setupMergedSwagger(app: NestFastifyApplication) {
  try {
    if (!process.env.BACKEND_URL || !process.env.AUTH_SERVICE_URL) {
      throw new Error(
        'BACKEND_URL and AUTH_SERVICE_URL environment variables must be set',
      );
    }

    const backendUrl = process.env.BACKEND_URL.replace(/\/$/, '');
    const authUrl = process.env.AUTH_SERVICE_URL.replace(/\/$/, '');

    const backendDocsUrl = `${backendUrl}/api/docs-json`;
    const authDocsUrl = `${authUrl}/api/auth/docs-json`;

    const axios = await import('axios');

    async function fetchJson(url: string) {
      try {
        const res = await (axios as any).default.get(url, { timeout: 5000 });
        return res.data as Record<string, any> | null;
      } catch {
        return null;
      }
    }

    const [backendDoc, authDoc] = await Promise.all([
      fetchJson(backendDocsUrl),
      fetchJson(authDocsUrl),
    ]);

    if (!backendDoc && !authDoc) {
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

    mergeSimple(backendDoc);
    mergeSimple(authDoc);

    // include top-level info/version if available from one of the docs
    if (backendDoc && backendDoc.info) merged.info = backendDoc.info;
    else if (authDoc && authDoc.info) merged.info = authDoc.info;

    // expose merged spec via SwaggerModule
    const mergedSpec: NestOpenAPIObject =
      merged as unknown as NestOpenAPIObject;

    SwaggerModule.setup('api/docs', app, mergedSpec, {
      customSiteTitle: 'Transcendence Merged API Docs',
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    console.log(
      'Manual merged Swagger docs available at /api/docs and /api/docs-json',
    );
  } catch (err: unknown) {
    console.warn('Error while manually merging OpenAPI docs:', String(err));
  }
}
