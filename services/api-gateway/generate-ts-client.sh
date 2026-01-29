#!/usr/bin/env bash

# Use --yes to avoid interactive npx prompt which breaks stdin parsing
npx openapi --input ./src/swagger/merged-openapi.json \
  --output ../../test/ts-client \
  --client axios \
  --exportCore true \
  --exportServices true \
  --exportModels true \
  --exportSchemas true \
  --useOptions

# Ensure merged-openapi.json has an `openapi` field (compatibility with codegen)
#node -e "const fs=require('fs');const p='./src/swagger/merged-openapi.json';if(fs.existsSync(p)){const j=JSON.parse(fs.readFileSync(p,'utf8'));if(!j.openapi){j.openapi=j.version||'3.0.0';delete j.version;fs.writeFileSync(p,JSON.stringify(j,null,2));console.log('Patched openapi property in',p);}}"
