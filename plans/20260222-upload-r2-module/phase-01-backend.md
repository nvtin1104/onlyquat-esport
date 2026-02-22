# Phase 1: Backend Implementation

## Step 1 -- Install dependencies

```bash
cd serve && pnpm add @aws-sdk/client-s3 @aws-sdk/lib-storage
```

## Step 2 -- Add Prisma model

File: `serve/libs/common/prisma/schema.prisma`

Append after existing models:

```prisma
model FileUpload {
  id           String   @id @default(uuid())
  key          String   @unique          // R2 object key
  url          String                    // public URL
  originalName String
  mimeType     String
  size         Int
  folder       String   @default("general")
  uploadedById String?
  createdAt    DateTime @default(now())

  @@index([uploadedById])
  @@index([folder])
  @@map("file_uploads")
}
```

Then run:

```bash
cd serve && pnpm run prisma:migrate
```

## Step 3 -- Add upload permissions

File: `serve/libs/common/src/constants/permissions.ts`

Add to `PERMISSIONS` object (after CONTENT block):

```typescript
// UPLOAD
UPLOAD_VIEW: 'upload:view',
UPLOAD_DELETE: 'upload:delete',
UPLOAD_MANAGE: 'upload:manage',
```

Add to `PERMISSION_METADATA` array:

```typescript
// UPLOAD
{ code: 'upload:view',   module: 'upload', action: 'view',   name: 'Xem tập tin',            description: 'Xem danh sach tap tin da tai len' },
{ code: 'upload:delete', module: 'upload', action: 'delete', name: 'Xoa tap tin',             description: 'Xoa tap tin khoi he thong' },
{ code: 'upload:manage', module: 'upload', action: 'manage', name: 'Quan ly tap tin (Full)',  description: 'Toan quyen tap tin' },
```

## Step 4 -- Import PrismaModule in gateway AppModule

File: `serve/apps/gateway/src/app.module.ts`

Add import:

```typescript
import { PrismaModule } from '@app/common';
```

Add `PrismaModule` to the `imports` array. Since it's `@Global()`, this single import makes `PrismaService` injectable everywhere in gateway.

## Step 5 -- Create UploadsService

File: `serve/apps/gateway/src/uploads/uploads.service.ts`

Responsibilities:
- Initialize `S3Client` with R2 endpoint from `ConfigService`
- `upload(file: Express.Multer.File, folder: string, userId?: string)` -- generates key, uploads to R2 via `PutObjectCommand`, saves metadata to DB via `PrismaService`, returns `FileUpload`
- `findAll(params: { page, limit, folder?, mimeType? })` -- paginated query, returns `PaginatedResponse<FileUpload>`
- `findById(id: string)` -- single record lookup
- `remove(id: string)` -- `DeleteObjectCommand` on R2, then delete DB row

Key format: `{folder}/{uuid}-{sanitizedOriginalName}`

MIME validation (allowlist):

```typescript
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
```

S3Client config:

```typescript
new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});
```

## Step 6 -- Create UploadsController

File: `serve/apps/gateway/src/uploads/uploads.controller.ts`

```
@ApiTags('Uploads')
@Controller('uploads')
```

Endpoints:

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| `POST /uploads` | `@JwtAuth()` | Upload file. Uses `@UseInterceptors(FileInterceptor('file'))` with `memoryStorage()` and 10MB limit. Optional `@Query('folder')`. Gets userId from `req.user.userId`. |
| `GET /uploads` | `@Auth(PERMISSIONS.UPLOAD_VIEW)` | List uploads. `@Query('page', 'limit', 'folder', 'mimeType')`. Returns paginated response. |
| `GET /uploads/:id` | `@JwtAuth()` | Get single upload by ID. |
| `DELETE /uploads/:id` | `@Auth(PERMISSIONS.UPLOAD_DELETE)` | Delete from R2 + DB. |

Constructor injects `UploadsService`.

## Step 7 -- Register in AppModule

File: `serve/apps/gateway/src/app.module.ts`

- Import `UploadsController`
- Import `UploadsService`
- Add `UploadsController` to `controllers` array
- Add `UploadsService` to `providers` array

## Step 8 -- Add env vars

File: `serve/.env` (local only, do not commit)

```
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket
R2_PUBLIC_URL=https://your-public-domain.com
```

## File Checklist

| File | Action |
|------|--------|
| `serve/libs/common/prisma/schema.prisma` | Add `FileUpload` model |
| `serve/libs/common/src/constants/permissions.ts` | Add UPLOAD permissions + metadata |
| `serve/apps/gateway/src/app.module.ts` | Import `PrismaModule`, add controller + service |
| `serve/apps/gateway/src/uploads/uploads.service.ts` | New file |
| `serve/apps/gateway/src/uploads/uploads.controller.ts` | New file |
| `serve/.env` | Add R2 env vars |
