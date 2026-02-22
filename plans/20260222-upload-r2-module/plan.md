# Cloudflare R2 File Upload Module

## Goal

Add file upload capability to the platform using Cloudflare R2 (S3-compatible). Upload logic lives entirely in gateway (no NATS needed). Dashboard gets a media management page.

## Phases

| # | Phase | Status | Files |
|---|-------|--------|-------|
| 1 | Backend | pending | [phase-01-backend.md](./phase-01-backend.md) |
| 2 | Dashboard | pending | [phase-02-dashboard.md](./phase-02-dashboard.md) |

## Architecture Decision

- Upload module is gateway-only: controller + service + PrismaService for metadata
- No microservice involvement -- R2 is an external service, file metadata is stored in PostgreSQL
- Multer `memoryStorage()` receives file, service uploads buffer to R2 via `@aws-sdk/client-s3`
- `PrismaModule` (already `@Global()`) needs to be imported in gateway `AppModule`

## Dependencies

- `@aws-sdk/client-s3` -- S3 client for R2
- `@aws-sdk/lib-storage` -- managed multipart uploads
- `@nestjs/platform-express` -- already present (Multer types)

## Env Vars (serve/.env)

```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

## Key Constraints

- Max file size: 10 MB (configurable via `ConfigService`)
- Allowed MIME types: images (`image/*`), PDF, common docs
- R2 key format: `{folder}/{uuid}-{sanitized-original-name}`
- Gateway already has `@JwtAuth()` and `@Auth(PERMISSION)` decorators
- Controllers in gateway are standalone (no feature modules) -- follows existing pattern
- `PrismaModule` is `@Global()` but not yet imported in gateway `AppModule`

## Unresolved Questions

None.
