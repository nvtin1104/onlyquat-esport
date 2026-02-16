# Phase 5: Cap nhat Core AppModule

## Context Links

- [plan.md](./plan.md)
- Phu thuoc: Phase 3 (AuthModule), Phase 4 (UsersModule)
- Current: `apps/core/src/app.module.ts`, `apps/core/src/main.ts`

## Tong quan

Rewire `apps/core/src/app.module.ts` de import AuthModule va UsersModule thay vi IdentityController/IdentityService cu. Xoa file identity cu. Cap nhat main.ts log message.

## Key Insights

- AppModule hien tai import truc tiep MongooseModule.forFeature va dung IdentityController - can xoa
- AuthModule da import UsersModule ben trong -> AppModule chi can import AuthModule va UsersModule
- MongooseModule.forFeature da nam trong UsersModule -> AppModule khong can import lai
- DatabaseModule (MongoDB connection) van can o AppModule level
- main.ts khong can thay doi logic, chi cap nhat log message

## Requirements

1. Cap nhat `app.module.ts` - import AuthModule + UsersModule, xoa IdentityController/IdentityService
2. Cap nhat `main.ts` - doi log message
3. Xoa `identity.controller.ts` va `identity.service.ts`

## Architecture

```
apps/core/src/
  |-- main.ts              (cap nhat log)
  |-- app.module.ts         (rewire imports)
  |-- auth/                 (tu Phase 3)
  |   |-- auth.module.ts
  |   |-- auth.controller.ts
  |   |-- auth.service.ts
  |-- users/                (tu Phase 4)
  |   |-- users.module.ts
  |   |-- users.controller.ts
  |   |-- users.service.ts
  |-- identity.controller.ts  (XOA)
  |-- identity.service.ts     (XOA)
```

## Related Code Files

| File | Hanh dong |
|------|-----------|
| `apps/core/src/app.module.ts` | Cap nhat imports |
| `apps/core/src/main.ts` | Cap nhat log message |
| `apps/core/src/identity.controller.ts` | XOA |
| `apps/core/src/identity.service.ts` | XOA |

## Implementation Steps

### Step 1: Cap nhat app.module.ts

```typescript
// apps/core/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
```

**Thay doi so voi truoc:**
- Xoa: `MongooseModule.forFeature` (da co trong UsersModule)
- Xoa: `IdentityController`, `IdentityService` imports
- Them: `AuthModule`, `UsersModule`
- AppModule khong con co controllers hay providers rieng

### Step 2: Cap nhat main.ts

```typescript
// apps/core/src/main.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL || 'nats://localhost:4223'],
    },
  });
  await app.listen();
  console.log('Core Service is running (NATS) - Auth + Users modules loaded');
}
bootstrap();
```

### Step 3: Xoa file cu

```bash
rm apps/core/src/identity.controller.ts
rm apps/core/src/identity.service.ts
```

## Todo List

- [ ] Cap nhat `app.module.ts` voi AuthModule + UsersModule
- [ ] Cap nhat `main.ts` log message
- [ ] Xoa `identity.controller.ts`
- [ ] Xoa `identity.service.ts`
- [ ] Verify `pnpm run build:core` thanh cong
- [ ] Verify khong con import nao tham chieu identity files

## Success Criteria

- `pnpm run build:core` pass khong loi
- Khong con file `identity.controller.ts` hay `identity.service.ts`
- Tat ca message patterns (auth.* va user.*) duoc register dung
- Core service start duoc va connect NATS thanh cong

## Risk Assessment

| Rui ro | Muc do | Giai phap |
|--------|--------|-----------|
| Gateway van goi message pattern cu | Cao | Phase 6 cap nhat gateway cung luc |
| Import path sai sau khi xoa identity files | Thap | Build check se bat loi |
| DatabaseModule khong connect | Thap | Khong thay doi - van dung config cu |

## Security Considerations

- Khong co thay doi bao mat moi - chi la rewiring

## Next Steps

Sau khi hoan thanh -> chuyen sang Phase 6 (Gateway Update) - **QUAN TRONG**: phai deploy Phase 5 + Phase 6 cung luc vi message patterns thay doi
