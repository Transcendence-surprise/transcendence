import axios, { AxiosResponse } from 'axios';
import { SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
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

    const backendResp: AxiosResponse<OpenAPIObject> | null = await axios
      .get<OpenAPIObject>(backendDocsUrl)
      .catch(() => {
        console.warn(`Error fetching ${backendDocsUrl}:`);
        return null;
      });
    const authResp: AxiosResponse<OpenAPIObject> | null = await axios
      .get<OpenAPIObject>(authDocsUrl)
      .catch(() => {
        console.warn(`Error fetching ${authDocsUrl}:`);
        return null;
      });

    const mergedDocument: OpenAPIObject = {
      openapi: '3.0.0',
      info: { title: 'Transcendence Merged API', version: '1.0.0' },
      paths: {},
      components: {},
    } as OpenAPIObject;

    const mergePaths = (doc?: OpenAPIObject) => {
      if (!doc || !doc.paths) return;
      const paths = doc.paths as Record<string, unknown>;
      for (const [p, v] of Object.entries(paths)) {
        if ((mergedDocument.paths as Record<string, unknown>)[p]) {
          console.warn(
            `Duplicate path '${p}' found while merging; keeping first occurrence.`,
          );
          continue;
        }
        (mergedDocument.paths as Record<string, unknown>)[p] = v;
      }
    };

    const mergeComponents = (doc?: OpenAPIObject) => {
      if (!doc || !doc.components) return;
      const comps = doc.components as Record<string, Record<string, unknown>>;
      for (const compKey of Object.keys(comps)) {
        const compValue = comps[compKey];
        if (!(mergedDocument.components as Record<string, unknown>)[compKey]) {
          (mergedDocument.components as Record<string, unknown>)[compKey] = {};
        }
        Object.assign(
          (mergedDocument.components as Record<string, unknown>)[
            compKey
          ] as object,
          compValue,
        );
      }
    };

    if (backendResp) {
      mergePaths(backendResp.data);
      mergeComponents(backendResp.data);
      console.log(`Fetched backend OpenAPI from ${backendDocsUrl}`);
    } else {
      console.warn(`Could not fetch backend OpenAPI from ${backendDocsUrl}`);
    }

    if (authResp) {
      mergePaths(authResp.data);
      mergeComponents(authResp.data);
      console.log(`Fetched auth OpenAPI from ${authDocsUrl}`);
    } else {
      console.warn(`Could not fetch auth OpenAPI from ${authDocsUrl}`);
    }

    if (mergedDocument.paths && Object.keys(mergedDocument.paths).length > 0) {
      SwaggerModule.setup('api/docs', app, mergedDocument, {
        customSiteTitle: 'Transcendence Merged API Docs',
        swaggerOptions: {
          defaultModelsExpandDepth: -1,
          persistAuthorization: true,
        },
      });
      console.log('Merged Swagger docs available at /api/docs');
    } else {
      console.warn('No OpenAPI paths were merged; skipping Swagger setup.');
    }
  } catch (err) {
    console.warn('Error while merging OpenAPI docs:', String(err));
  }
}

export default setupMergedSwagger;
