#!/usr/bin/env node
/*
  Script: export-merged-openapi.js
  Purpose: Merge service OpenAPI docs using swagger-combine and write
  the merged JSON to `src/swagger/merged-openapi.json`.
*/
const path = require('path');
const fs = require('fs');

async function main() {
  const backendUrl = (process.env.BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  const authUrl = (process.env.AUTH_SERVICE_URL || 'http://localhost:3001').replace(/\/$/, '');

  const backendDocsUrl = `${backendUrl}/api/docs-json`;
  const authDocsUrl = `${authUrl}/api/auth/docs-json`;

  const config = {
    version: '3.0.0',
    info: { title: 'Transcendence Merged API', version: '1.0.0' },
    apis: [{ url: backendDocsUrl }, { url: authDocsUrl }],
  };

  const swaggerCombine = require('swagger-combine');
  try {
    const merged = await swaggerCombine(config, { verbose: false });
    const mergedObj = typeof merged === 'string' ? JSON.parse(merged) : merged;

    // Ensure correct OpenAPI version field name
    if (!mergedObj.openapi) {
      if (mergedObj.version) {
        mergedObj.openapi = mergedObj.version;
        delete mergedObj.version;
      } else {
        mergedObj.openapi = '3.0.0';
      }
    }

    // ensure output dir
    const outPath = path.join(__dirname, '..', 'src', 'swagger', 'merged-openapi.json');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(mergedObj, null, 2));
    console.log('Wrote merged OpenAPI to', outPath);
  } catch (err) {
    console.error('Failed to generate merged OpenAPI:', err && err.message ? err.message : err);
    process.exitCode = 2;
  }
}

main();
