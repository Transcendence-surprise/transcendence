import {
  SwaggerModule,
  OpenAPIObject as NestOpenAPIObject,
} from '@nestjs/swagger';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

export async function setupMergedSwagger(app: NestFastifyApplication) {
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

    const config = {
      version: '3.0.0',
      info: { title: 'Transcendence Merged API', version: '1.0.0' },
      apis: [{ url: backendDocsUrl }, { url: authDocsUrl }],
    };

    type OpenAPIObject = {
      openapi?: string;
      swagger?: string;
      info?: { title?: string; version?: string };
      paths?: Record<string, Record<string, any>>;
      components?: Record<string, any>;
    };

    type SwaggerCombineFn = (
      config: unknown,
      opts?: unknown,
    ) => Promise<unknown>;

    // dynamic import + narrow the exported function to avoid interop/type issues
    const mod: unknown = await import('swagger-combine');
    let swaggerCombine: SwaggerCombineFn;
    if (typeof mod === 'function') {
      swaggerCombine = mod as unknown as SwaggerCombineFn;
    } else if (typeof mod === 'object' && mod !== null && 'default' in mod) {
      const def = (mod as { default: unknown }).default;
      if (typeof def === 'function') {
        swaggerCombine = def as SwaggerCombineFn;
      } else {
        throw new Error('swagger-combine default export is not a function');
      }
    } else {
      throw new Error('swagger-combine module not found');
    }

    const combinedRaw: unknown = await swaggerCombine(config as any, {
      verbose: false,
    });
    const merged: OpenAPIObject =
      typeof combinedRaw === 'string'
        ? (JSON.parse(combinedRaw) as OpenAPIObject)
        : (combinedRaw as OpenAPIObject);

    // Normalize required fields for Nest's OpenAPIObject type
    if (merged) {
      if (!merged.openapi && merged.swagger) merged.openapi = merged.swagger;
      if (!merged.openapi) merged.openapi = '3.0.0';
    }

    const mergedSpec: NestOpenAPIObject = {
      openapi: merged.openapi ?? '3.0.0',
      info: {
        title: merged.info?.title ?? 'Transcendence Merged API',
        version: merged.info?.version ?? '1.0.0',
      },
      paths: merged.paths ?? {},
      components: merged.components ?? {},
    };

    // Let SwaggerModule expose the UI and the JSON at /api/docs and /api/docs-json
    SwaggerModule.setup('api/docs', app, mergedSpec, {
      customSiteTitle: 'Transcendence Merged API Docs',
      swaggerOptions: {
        defaultModelsExpandDepth: -1,
        persistAuthorization: true,
      },
    });

    console.log(
      'Merged Swagger docs available at /api/docs and /api/docs-json',
    );
  } catch (err: unknown) {
    console.warn('Error while merging OpenAPI docs:', String(err));
  }
}

export default setupMergedSwagger;
