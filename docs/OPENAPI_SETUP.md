# OpenAPI Documentation Setup Guide

Guide for setting up **Swagger UI** and **Redoc** to serve interactive API documentation from the OpenAPI specifications.

---

## Overview

The API has two OpenAPI specifications:
- `apps/api/openapi.yaml` - Main API (profiles, masks, CV components)
- `apps/api/openapi-hunter.yaml` - Hunter Protocol (job search automation)

This guide shows how to serve these specs with interactive documentation tools.

---

## Option 1: Fastify OpenAPI Plugin (Recommended)

### Installation

```bash
cd apps/api
pnpm add @fastify/swagger @fastify/swagger-ui
```

### Implementation

**File: `apps/api/src/plugins/swagger.ts`**

```typescript
import { FastifyPluginAsync } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

export const swaggerPlugin: FastifyPluginAsync = async (fastify) => {
  // Load OpenAPI specs
  const mainSpec = yaml.load(
    readFileSync(join(__dirname, '../../openapi.yaml'), 'utf8')
  );
  const hunterSpec = yaml.load(
    readFileSync(join(__dirname, '../../openapi-hunter.yaml'), 'utf8')
  );

  // Register main API docs
  await fastify.register(fastifySwagger, {
    mode: 'static',
    specification: {
      document: mainSpec,
    },
  });

  // Register Swagger UI
  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      displayOperationId: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      tryItOutEnabled: true,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  // Serve OpenAPI YAML files
  fastify.get('/openapi.yaml', async (request, reply) => {
    reply.type('text/yaml');
    return readFileSync(join(__dirname, '../../openapi.yaml'), 'utf8');
  });

  fastify.get('/openapi-hunter.yaml', async (request, reply) => {
    reply.type('text/yaml');
    return readFileSync(join(__dirname, '../../openapi-hunter.yaml'), 'utf8');
  });

  // Redoc alternative (lighter weight)
  fastify.get('/redoc', async (request, reply) => {
    reply.type('text/html');
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>In Midst My Life API</title>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
          <style>
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          <redoc spec-url="/openapi.yaml"></redoc>
          <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
        </body>
      </html>
    `;
  });

  // Hunter Protocol Redoc
  fastify.get('/redoc-hunter', async (request, reply) => {
    reply.type('text/html');
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hunter Protocol API</title>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
          <style>
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          <redoc spec-url="/openapi-hunter.yaml"></redoc>
          <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
        </body>
      </html>
    `;
  });
};
```

**File: `apps/api/src/index.ts`**

```typescript
import Fastify from 'fastify';
import { swaggerPlugin } from './plugins/swagger';

const fastify = Fastify({
  logger: true,
});

// Register Swagger plugin
await fastify.register(swaggerPlugin);

// ... rest of your routes

await fastify.listen({ port: 3001, host: '0.0.0.0' });
```

### Access Documentation

- **Swagger UI**: http://localhost:3001/docs
- **Redoc (Main)**: http://localhost:3001/redoc
- **Redoc (Hunter)**: http://localhost:3001/redoc-hunter
- **Raw YAML (Main)**: http://localhost:3001/openapi.yaml
- **Raw YAML (Hunter)**: http://localhost:3001/openapi-hunter.yaml

---

## Option 2: Static HTML Files

For simpler setup without Fastify plugins.

### Swagger UI

**File: `apps/api/public/swagger-ui.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>In Midst My Life API</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; padding:0; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "/openapi.yaml",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        requestInterceptor: (req) => {
          // Add auth header if needed (allow-secret - example code)
          const token = localStorage.getItem('jwt_token'); // allow-secret
          if (token) {
            req.headers['Authorization'] = `Bearer ${token}`;
          }
          return req;
        }
      });
    };
  </script>
</body>
</html>
```

### Redoc

**File: `apps/api/public/redoc.html`**

```html
<!DOCTYPE html>
<html>
<head>
  <title>In Midst My Life API</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
  <style>
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  <redoc spec-url="/openapi.yaml"></redoc>
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
</body>
</html>
```

### Serve Static Files

```typescript
// apps/api/src/index.ts
import fastifyStatic from '@fastify/static';
import { join } from 'path';

await fastify.register(fastifyStatic, {
  root: join(__dirname, '../public'),
  prefix: '/docs/',
});

// Serve OpenAPI specs
fastify.get('/openapi.yaml', async (request, reply) => {
  reply.sendFile('openapi.yaml', join(__dirname, '..'));
});
```

---

## Option 3: External Hosting

### Swagger Editor

Upload your OpenAPI spec to Swagger Editor:

1. Go to https://editor.swagger.io/
2. File → Import URL
3. Enter: `http://localhost:3001/openapi.yaml`

### Redoc Cloud

Generate static Redoc site:

```bash
# Install Redoc CLI
npm install -g @redocly/cli

# Generate HTML
redocly build-docs apps/api/openapi.yaml -o docs/api-reference.html

# Preview
redocly preview-docs apps/api/openapi.yaml
```

---

## Option 4: Docker with Swagger UI

**File: `docker-compose.docs.yml`**

```yaml
version: "3.9"

services:
  swagger-ui:
    image: swaggerapi/swagger-ui:latest
    ports:
      - "8080:8080"
    environment:
      SWAGGER_JSON: /openapi/openapi.yaml
      BASE_URL: /docs
    volumes:
      - ./apps/api/openapi.yaml:/openapi/openapi.yaml

  redoc:
    image: redocly/redoc:latest
    ports:
      - "8081:80"
    environment:
      SPEC_URL: /openapi.yaml
    volumes:
      - ./apps/api/openapi.yaml:/usr/share/nginx/html/openapi.yaml
```

**Run:**

```bash
docker-compose -f docker-compose.docs.yml up

# Access:
# Swagger UI: http://localhost:8080
# Redoc: http://localhost:8081
```

---

## Customization

### Swagger UI Theme

```javascript
SwaggerUIBundle({
  // ... other config
  theme: {
    primaryColor: '#4F46E5',
    fontFamily: 'Inter, sans-serif',
  },
});
```

### Redoc Theme

```html
<redoc 
  spec-url="/openapi.yaml"
  theme='{
    "colors": {
      "primary": { "main": "#4F46E5" }
    },
    "typography": {
      "fontSize": "16px",
      "fontFamily": "Inter, sans-serif"
    }
  }'
></redoc>
```

### Authentication in Swagger UI

Add OAuth2/Bearer token support:

```javascript
SwaggerUIBundle({
  // ... other config
  persistAuthorization: true,
  onComplete: () => {
    ui.preauthorizeApiKey('bearerAuth', 'Bearer YOUR_TOKEN_HERE');
  },
});
```

---

## Testing the Documentation

### Validate OpenAPI Spec

```bash
# Install validator
npm install -g @apidevtools/swagger-cli

# Validate
swagger-cli validate apps/api/openapi.yaml
swagger-cli validate apps/api/openapi-hunter.yaml
```

### Test "Try it out" Functionality

1. Open Swagger UI: http://localhost:3001/docs
2. Click "Authorize" button
3. Enter JWT token (if required)
4. Select an endpoint
5. Click "Try it out"
6. Fill in parameters
7. Click "Execute"
8. Verify response

---

## Deployment Considerations

### Production Setup

1. **Serve over HTTPS** (use reverse proxy)
2. **Authentication** (protect `/docs` endpoint if needed)
3. **Rate limiting** (prevent abuse of "Try it out")
4. **CORS** (allow docs domain to access API)

### Kubernetes Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-docs
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  rules:
  - host: api.inmidstmylife.com
    http:
      paths:
      - path: /docs
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 3001
```

### Environment-Specific Servers

Update `openapi.yaml`:

```yaml
servers:
  - url: http://localhost:3001
    description: Local development
  - url: https://api-staging.inmidstmylife.com
    description: Staging
  - url: https://api.inmidstmylife.com
    description: Production
```

---

## Maintenance

### Keeping Docs in Sync

1. **Update OpenAPI spec** when adding/changing endpoints
2. **Validate spec** before committing
3. **Test "Try it out"** for new endpoints
4. **Update examples** with realistic data
5. **Document errors** thoroughly

### Automated Validation

Add to CI/CD pipeline:

```yaml
# .github/workflows/validate-openapi.yml
name: Validate OpenAPI

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate OpenAPI specs
        uses: char0n/swagger-editor-validate@v1
        with:
          definition-file: apps/api/openapi.yaml
      - name: Validate Hunter spec
        uses: char0n/swagger-editor-validate@v1
        with:
          definition-file: apps/api/openapi-hunter.yaml
```

---

## References

- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [Redoc Documentation](https://redocly.com/docs/redoc/)
- [@fastify/swagger](https://github.com/fastify/fastify-swagger)
- [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.3)
- [API_REFERENCE.md](./API_REFERENCE.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
