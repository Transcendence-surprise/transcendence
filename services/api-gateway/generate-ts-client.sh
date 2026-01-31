#!/usr/bin/env bash

curl -sS -f -L http://localhost:8080/api/docs-json -o /tmp/merged-openapi.json

npx openapi --input /tmp/merged-openapi.json  \
  --output ../../test/ts-client \
  --client axios \
  --exportCore true \
  --exportServices true \
  --exportModels true \
  --exportSchemas true \
  --useOptions
