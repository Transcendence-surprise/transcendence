#!/usr/bin/env bash

curl -sS -f -L http://localhost:8080/api/docs-json -o /tmp/merged-openapi.json

npx openapi --input /tmp/merged-openapi.json  \
  --output ../../common/ts-client/src \
  --client axios \
