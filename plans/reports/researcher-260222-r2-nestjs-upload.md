# Cloudflare R2 + NestJS File Upload Integration

**Date:** 2026-02-22
**Scope:** Production-grade file upload architecture for onlyquat-esport

---

## 1. Package Selection & Versions

**Recommendation: Use `@aws-sdk/client-s3` as primary, add `@aws-sdk/lib-storage` only for large files**

```json
{
  "@aws-sdk/client-s3": "^3.600+",
  "@aws-sdk/lib-storage": "^3.600+",
  "@aws-sdk/credential-providers": "^3.600+",
  "@nestjs/platform-express": "^10.3+",
  "multer": "^1.4.5-lts.1"
}
```

**Rationale:**
- `@aws-sdk/client-s3`: Lightweight, covers standard PutObject for typical uploads (< 5GB)
- `@aws-sdk/lib-storage`: Adds S3Upload abstraction (multipart, parallelization, retry) — worth including for resilience
- **Never** use deprecated `aws-sdk` v2; it's EOL
- Pin to v3.600+ for R2 endpoint compatibility fixes

**Decision Tree:**
- Small files (< 100MB): Use `PutObjectCommand` directly from `@aws-sdk/client-s3`
- Large files (>= 100MB): Use `Upload` class from `@aws-sdk/lib-storage`

---

## 2. NestJS Upload Pattern: Memory Storage → R2 Stream

**Module Setup:**

```typescript
// file-upload.module.ts
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';

@Module({
  controllers: [FileUploadController],
  providers: [
    FileUploadService,
    {
      provide: 'S3Client',
      useFactory: (configService: ConfigService) => {
        return new S3Client({
          region: 'auto',
          endpoint: configService.get('R2_ENDPOINT'),
          credentials: {
            accessKeyId: configService.get('R2_ACCESS_KEY'),
            secretAccessKey: configService.get('R2_SECRET_KEY'),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['S3Client'],
})
export class FileUploadModule {}
```

**Controller with Memory Multer:**

```typescript
// file-upload.controller.ts
import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FileUploadService } from './file-upload.service';

@Controller('files')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
      fileFilter: (req, file, cb) => {
        // Whitelist MIME types
        const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('File type not allowed'));
        }
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return this.fileUploadService.uploadToR2(file);
  }
}
```

**Service with Streaming Upload:**

```typescript
// file-upload.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileUploadService {
  constructor(
    @Inject('S3Client') private s3Client: S3Client,
    private configService: ConfigService,
  ) {}

  async uploadToR2(file: Express.Multer.File) {
    const key = `${Date.now()}-${file.originalname}`;
    const bucket = this.configService.get('R2_BUCKET_NAME');

    // Convert buffer to stream
    const stream = Readable.from(file.buffer);

    // Use lib-storage for robustness
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: stream,
        ContentType: file.mimetype,
        Metadata: { originalName: file.originalname },
      } as PutObjectCommandInput,
    });

    const result = await upload.done();

    // Construct public URL
    const publicUrl = `https://${this.configService.get('R2_CUSTOM_DOMAIN')}/${key}`;

    return {
      id: key,
      key,
      url: publicUrl,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }
}
```

---

## 3. R2 Configuration & Credentials

**Environment Variables (`serve/.env`):**

```env
# Cloudflare R2
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_ACCESS_KEY=<API_TOKEN_ACCESS_KEY>
R2_SECRET_KEY=<API_TOKEN_SECRET_KEY>
R2_BUCKET_NAME=onlyquat-files
R2_ACCOUNT_ID=<ACCOUNT_ID>
R2_CUSTOM_DOMAIN=files.onlyquat.io  # or use R2_ENDPOINT/<bucket>
```

**Credential Setup (Cloudflare Dashboard):**
1. Go to R2 → Bucket settings
2. Create API token with `s3:*` permissions
3. Copy `Access Key ID`, `Secret Access Key`, `Endpoint URL`
4. Account ID visible in Account Home → sidebar

**CORS Configuration (R2 Bucket):**

```bash
# Via wrangler CLI or Cloudflare dashboard
# Settings → CORS → Add

[
  {
    "allowedOrigins": ["http://localhost:5173", "http://localhost:3000", "https://onlyquat.io"],
    "allowedMethods": ["GET", "HEAD"],
    "allowedHeaders": ["*"],
    "maxAgeSeconds": 3600
  }
]
```

**Critical:** CORS only needed if browser requests R2 directly. For backend-only upload, not required.

---

## 4. Public URL Patterns

**Option A: Custom Domain (Recommended for production)**
```
https://files.onlyquat.io/<key>
```
- Set up CNAME: `files.onlyquat.io` → R2 bucket
- Cloudflare dashboard → R2 → Bucket settings → Custom domain
- Path-based, clean URLs, future-proof

**Option B: R2 Direct URL (Dev/testing)**
```
https://<ACCOUNT_ID>.r2.cloudflarestorage.com/<BUCKET>/<key>
```
- Works immediately, no DNS setup
- Exposes account ID (minor privacy concern)
- Fine for testing

**Signed URLs (for private files):**
```typescript
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const command = new GetObjectCommand({ Bucket, Key });
const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
```

---

## 5. File Metadata DB Schema

**Prisma Model:**

```prisma
model FileUpload {
  id        String   @id @default(cuid())
  key       String   @unique  // R2 object key
  url       String            // public URL
  originalName String
  mimeType  String
  size      Int             // bytes
  uploadedBy String
  user      User     @relation(fields: [uploadedBy], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([uploadedBy])
}
```

**Migration:**
```bash
cd serve
pnpm run prisma:migrate -- --name add_file_uploads
```

---

## 6. Security: Best Practices

| Concern | Implementation |
|---------|---|
| **File Type** | Whitelist MIME types in Multer `fileFilter` + validate magic bytes |
| **Size Limits** | Multer `limits.fileSize`: 500MB; enforce per user quotas in DB |
| **Access Control** | Only authenticated users via JWT; store `uploadedBy` userId |
| **Public vs Private** | Public bucket for CDN assets; signed URLs for user-specific files |
| **Malware** | Integrate ClamAV scan (defer to CI/CD for now) |

**Example: Size Quota Check:**
```typescript
async uploadToR2(file: Express.Multer.File, userId: string) {
  const monthlyUsage = await this.getMonthlyUsage(userId);
  const quota = 5 * 1024 * 1024 * 1024; // 5GB

  if (monthlyUsage + file.size > quota) {
    throw new BadRequestException('Monthly upload quota exceeded');
  }
  // ... proceed with upload
}
```

---

## Implementation Checklist

- [ ] Add packages: `@aws-sdk/client-s3@^3.600`, `@aws-sdk/lib-storage@^3.600`
- [ ] Create `FileUploadModule` in `serve/apps/gateway/src/modules/`
- [ ] Add R2 env vars to `.env.example`
- [ ] Add `FileUpload` model to Prisma schema
- [ ] Run migration: `prisma:migrate`
- [ ] Seed with one test file for validation
- [ ] Test upload via Postman/curl with auth header
- [ ] Verify file in R2 dashboard
- [ ] Set up custom domain (DNS CNAME)
- [ ] Test public URL access

---

## Unresolved Questions

1. **Virus scanning**: Should integrate ClamAV? Defer to CI/CD pipeline?
2. **CDN caching**: Use Cloudflare cache rules or rely on R2 native caching?
3. **Retention policy**: Auto-delete old uploads after 90 days?
4. **Analytics**: Log file access metrics (downloads, views)?
