# Phase 1: Cai dat Dependencies va Cap nhat Config

## Context Links

- [plan.md](./plan.md)
- [research/researcher-01-report.md](./research/researcher-01-report.md)
- Current: `serve/package.json`, `serve/nest-cli.json`, `serve/.env.example`

## Tong quan

Cai dat cac package can thiet cho JWT auth va bcrypt, cap nhat nest-cli.json de nhan dien project "core", them script build/start cho core service, bo sung bien moi truong JWT_REFRESH_SECRET.

## Key Insights

- nest-cli.json hien chi co `api-gateway`, `identity-service`, `esports-service` - thieu entry cho `core`
- package.json scripts van tham chieu identity-service cu - can thay bang core
- `.env.example` da co JWT_SECRET nhung chua co JWT_REFRESH_SECRET

## Requirements

1. Cai dat runtime deps: `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt`
2. Cai dat dev deps: `@types/bcrypt`, `@types/passport-jwt`
3. Them project "core" vao nest-cli.json
4. Xoa hoac giu project "identity-service" cu (giu de backward compat, danh dau deprecated)
5. Cap nhat package.json scripts
6. Them JWT_REFRESH_SECRET vao .env.example

## Architecture

Khong thay doi kien truc - chi la config/setup.

## Related Code Files

| File | Hanh dong |
|------|-----------|
| `serve/package.json` | Them dependencies + scripts |
| `serve/nest-cli.json` | Them project entry "core" |
| `serve/.env.example` | Them JWT_REFRESH_SECRET |

## Implementation Steps

### Step 1: Cai dat dependencies

```bash
cd serve
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
pnpm add -D @types/bcrypt @types/passport-jwt
```

### Step 2: Cap nhat nest-cli.json

Them entry "core" moi, giu cac entry cu:

```json
{
  "projects": {
    "gateway": {
      "type": "application",
      "root": "apps/gateway",
      "entryFile": "main",
      "sourceRoot": "apps/gateway/src",
      "compilerOptions": {
        "tsConfigPath": "apps/gateway/tsconfig.app.json"
      }
    },
    "core": {
      "type": "application",
      "root": "apps/core",
      "entryFile": "main",
      "sourceRoot": "apps/core/src",
      "compilerOptions": {
        "tsConfigPath": "apps/core/tsconfig.app.json"
      }
    }
  }
}
```

**Luu y:** Giu nguyen `api-gateway`, `identity-service`, `esports-service` entries cu de khong break build cu. Them `gateway`, `core`, `esports` entries moi.

### Step 3: Cap nhat package.json scripts

Them cac scripts moi (giu scripts cu de backward compat):

```json
{
  "scripts": {
    "build:core": "nest build core",
    "build:gateway": "nest build gateway",
    "start:core": "nest start core",
    "start:gateway": "nest start gateway",
    "start:dev:core": "nest start core --watch",
    "start:dev:gateway": "nest start gateway --watch",
    "start:all": "concurrently -n \"gw,core,esp\" -c \"blue,magenta,green\" \"pnpm run start:dev:gateway\" \"pnpm run start:dev:core\" \"pnpm run start:dev:esports-service\""
  }
}
```

### Step 4: Cap nhat .env.example

Them dong:
```
JWT_REFRESH_SECRET=your-refresh-secret-key-here
```

## Todo List

- [ ] Chay `pnpm add` cho runtime dependencies
- [ ] Chay `pnpm add -D` cho dev dependencies
- [ ] Them "core" va "gateway" project entries vao nest-cli.json
- [ ] Them build/start scripts cho core va gateway
- [ ] Them JWT_REFRESH_SECRET vao .env.example
- [ ] Verify `pnpm run build:core` chay thanh cong

## Success Criteria

- `pnpm run build:core` va `pnpm run build:gateway` chay khong loi
- `import { JwtModule } from '@nestjs/jwt'` resolve duoc
- `import * as bcrypt from 'bcrypt'` resolve duoc
- .env.example co ca JWT_SECRET va JWT_REFRESH_SECRET

## Risk Assessment

| Rui ro | Muc do | Giai phap |
|--------|--------|-----------|
| bcrypt native build fail tren Windows | Trung binh | Dung `bcryptjs` thay the neu can |
| nest-cli conflict giua entries cu va moi | Thap | Giu ca hai, test build |

## Security Considerations

- Khong commit .env file thuc te, chi .env.example
- JWT_SECRET va JWT_REFRESH_SECRET phai khac nhau trong production

## Next Steps

Sau khi hoan thanh -> chuyen sang Phase 2 (Shared DTOs)
