# NestJS i18n in Microservice Architecture — Research Report

**Date:** 2026-02-22
**Scope:** @nestjs/i18n integration, language propagation, validation i18n, gateway pattern
**Languages:** Vietnamese (vi), English (en)

---

## Executive Summary

**Recommended Approach:** Hybrid pattern — handle language resolution + validation i18n at **gateway layer**, pass `lang` context via NATS metadata on microservice calls. Translating business error messages at microservice layer is reasonable for service-specific logic.

**Why:** Minimizes cross-cutting i18n concerns, keeps microservices language-agnostic, centralizes validation error translation, reduces NATS message payload complexity.

---

## Package & Versions

| Package | Version | Notes |
|---------|---------|-------|
| `nestjs-i18n` | ^10.6.0+ | Latest (3mo old). Removed I18nRequestScopeService; uses async_hooks. |
| `class-validator` | ^0.14.0 | Already in your project; works with i18nValidationMessage helper. |
| `class-transformer` | ^0.5.1 | Already installed. |

**Installation:**
```bash
pnpm add nestjs-i18n
```

---

## Setup (Gateway Only)

### 1. Module Registration (app.module.ts)

```typescript
import { I18nModule, AcceptLanguageResolver, QueryResolver } from 'nestjs-i18n';
import path from 'path';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true, // hot reload in dev
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] }, // ?lang=vi
        AcceptLanguageResolver, // Accept-Language header
      ],
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

### 2. Translation File Structure

```
serve/apps/gateway/src/i18n/
├── en/
│   ├── validation.json
│   ├── errors.json
│   └── messages.json
└── vi/
    ├── validation.json
    ├── errors.json
    └── messages.json
```

**Example: `i18n/en/validation.json`**
```json
{
  "NOT_EMPTY": "{property} cannot be empty",
  "IS_EMAIL": "{property} must be a valid email",
  "IS_STRING": "{property} must be a string",
  "MIN_LENGTH": "{property} must be at least {constraints.0} characters"
}
```

**Example: `i18n/vi/validation.json`**
```json
{
  "NOT_EMPTY": "{property} không được để trống",
  "IS_EMAIL": "{property} phải là email hợp lệ",
  "IS_STRING": "{property} phải là chuỗi",
  "MIN_LENGTH": "{property} phải có ít nhất {constraints.0} ký tự"
}
```

**Example: `i18n/en/errors.json`**
```json
{
  "USER_NOT_FOUND": "User not found",
  "TOURNAMENT_CLOSED": "Tournament registration is closed",
  "INVALID_TEAM_SIZE": "Team size must be between {min} and {max}"
}
```

### 3. Global Validation Pipe (main.ts)

```typescript
import { I18nValidationPipe } from 'nestjs-i18n';

app.useGlobalPipes(
  new I18nValidationPipe({
    transform: true,
    whitelist: true,
  })
);

// Keep existing exception filter
app.useGlobalFilters(new RpcToHttpExceptionFilter());
```

### 4. DTOs with i18n Messages

```typescript
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') })
  name: string;

  @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
  email: string;

  @MinLength(8, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  password: string;
}
```

---

## Language Propagation Through NATS

**Key Pattern:** Pass language via NATS metadata or message envelope.

### Option 1: NATS Metadata (Recommended)

Modify microservice calls to include language:

```typescript
// In gateway service
async callMicroservice(pattern: string, payload: any, lang: string) {
  const langContext = { lang, headers: { 'accept-language': lang } };

  return this.userServiceClient.send(pattern, {
    payload,
    meta: langContext,
  });
}
```

In microservices, extract via context:

```typescript
@MessagePattern('user.create')
async createUser(@Payload() msg: any) {
  const lang = msg.meta?.lang ?? 'en'; // fallback

  // Pass lang to service
  return this.userService.create(msg.payload, lang);
}
```

### Option 2: Custom I18nContext Resolver (Advanced)

In microservices, use a resolver that detects language from message metadata:

```typescript
// Not recommended for microservices — adds complexity
// Services should remain language-agnostic
```

**Verdict:** Stick with Option 1 for clarity and separation of concerns.

---

## Translating Class-Validator Errors

**Already handled by I18nValidationPipe** (installed globally).

1. Define validation messages in DTOs using `i18nValidationMessage(key)`
2. Place translation files in `i18n/` folder
3. I18nValidationExceptionFilter automatically translates errors based on detected language

**Example Response** (vi):
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": [
    {
      "field": "email",
      "message": "email phải là email hợp lệ"
    }
  ]
}
```

---

## Translating Business Logic Errors

**Pattern:** Services throw descriptive errors with **translation keys**, not hardcoded strings.

### In Microservice (core/esports):

```typescript
// user.service.ts
async createUser(dto: CreateUserDto): Promise<User> {
  const existing = await this.prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (existing) {
    // Throw with key, not message
    throw new HttpException(
      { messageKey: 'USER_ALREADY_EXISTS', email: dto.email },
      HttpStatus.CONFLICT
    );
  }

  return this.prisma.user.create({ data: dto });
}
```

### In Gateway (Translate Before Returning):

```typescript
// user.controller.ts
import { I18n, I18nContext } from 'nestjs-i18n';

@Post('users')
async createUser(
  @Body() dto: CreateUserDto,
  @I18n() i18n: I18nContext
) {
  try {
    return await this.userServiceClient
      .send('user.create', dto)
      .pipe(firstValueFrom());
  } catch (error) {
    // error.getResponse() may contain { messageKey: 'USER_ALREADY_EXISTS' }
    const response = error.getResponse();
    if (typeof response === 'object' && response.messageKey) {
      throw new HttpException(
        {
          statusCode: error.getStatus(),
          message: i18n.t(`errors.${response.messageKey}`, {
            args: response, // interpolate variables
          }),
        },
        error.getStatus()
      );
    }
    throw error;
  }
}
```

**Why this pattern:**
- Microservices remain language-agnostic
- Gateway controls final user-facing messages
- Translation keys are lightweight in NATS payloads
- Supports future i18n backend (Lokalise, Crowdin) easily

---

## Summary Table: What Translates Where

| Component | Translator | Method |
|-----------|------------|--------|
| **Validation errors** | Gateway | I18nValidationPipe |
| **Business errors** | Gateway (receives key from service) | i18n.t() in catch block |
| **Service messages** | Service (optional) | Hardcoded keys only, no full translation |
| **Language detection** | Gateway | QueryResolver + AcceptLanguageResolver |
| **Language propagation** | Gateway → Microservice | NATS metadata envelope |

---

## Code Examples

### Gateway Exception Filter (Enhanced)

```typescript
// Integrate with RpcToHttpExceptionFilter
catch(exception: any, host: ArgumentsHost) {
  const ctx = host.switchToHttp();
  const response = ctx.getResponse();
  const i18n = ctx.switchToHttp().getRequest().i18n;

  const rpcData = this.extractRpcData(exception);

  // If error contains messageKey, translate it
  if (rpcData.messageKey && i18n) {
    rpcData.message = i18n.t(`errors.${rpcData.messageKey}`, {
      args: rpcData.args,
    });
  }

  return response.status(rpcData.statusCode).json({
    statusCode: rpcData.statusCode,
    message: rpcData.message,
  });
}
```

### Microservice Call with Language Context

```typescript
// gateway user.service.ts
async createUser(dto: CreateUserDto, lang: string) {
  return this.userServiceClient
    .send('user.create', {
      payload: dto,
      meta: { lang },
    })
    .pipe(firstValueFrom());
}
```

### Extract Language in Microservice Handler

```typescript
// core/user.controller.ts
@MessagePattern('user.create')
async createUser(@Payload() msg: { payload: CreateUserDto; meta: any }) {
  // Optionally log lang for debugging
  const lang = msg.meta?.lang ?? 'en';
  console.log(`Creating user (lang: ${lang})`);

  return this.userService.create(msg.payload);
}
```

---

## Implementation Checklist

- [ ] Install `nestjs-i18n` in `serve/package.json`
- [ ] Create `serve/apps/gateway/src/i18n/` with en/, vi/ folders
- [ ] Add `validation.json`, `errors.json` for both languages
- [ ] Register I18nModule in gateway `app.module.ts`
- [ ] Add I18nValidationPipe in `main.ts`
- [ ] Update DTOs to use `i18nValidationMessage()`
- [ ] Modify RpcToHttpExceptionFilter to translate messageKey
- [ ] Update gateway service to pass `meta: { lang }` in NATS calls
- [ ] Update microservice handlers to accept `meta` in payload
- [ ] Test with `?lang=vi` and Accept-Language header

---

## Unresolved Notes

- JWT claim storage for user's preferred language (out of scope but recommended for user preferences)
- Backend translation sync workflow (Lokalise/Crowdin integration — future)
- Hot reload testing in production

---

## Sources

- [nestjs-i18n npm](https://www.npmjs.com/package/nestjs-i18n)
- [nestjs-i18n documentation](https://nestjs-i18n.com/quick-start)
- [Global validation guide](https://nestjs-i18n.com/guides/dto_validation/global-validation)
- [NestJS microservices NATS](https://docs.nestjs.com/microservices/nats)
- [NestJS microservice boilerplate i18n guide](https://github.com/mikemajesty/nestjs-microservice-boilerplate-api/blob/master/guides/libs/i18n.md)
