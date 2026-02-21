# Code Review Summary

## Scope
- **Files reviewed:** 15 files as specified
- **Lines of code analyzed:** ~700
- **Review focus:** Permission system implementation — security, architecture, correctness

---

## Overall Assessment

The permission system is well-structured overall. The three-layer model (role defaults + custom grants/revokes + JWT cache) is sound. The NATS wiring is correct and the seed upsert key is valid. Several issues exist, ranging from a critical hardcoded JWT fallback secret to medium-priority gaps in input validation and wildcard coverage.

---

## Critical Issues

### [CRITICAL] Hardcoded JWT fallback secret in `jwt.strategy.ts`

**File:** `apps/gateway/src/strategies/jwt.strategy.ts:19`

```ts
secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret',
```

If `JWT_SECRET` env var is missing or empty, the strategy silently falls back to `'fallback-secret'`. Any attacker knowing this string can forge valid JWTs for any user with any permissions. **There must be no fallback** — the app should fail fast on startup if the secret is absent.

**Fix:** Throw on missing secret.
```ts
const secret = configService.get<string>('JWT_SECRET');
if (!secret) throw new Error('JWT_SECRET environment variable is required');
secretOrKey: secret,
```

---

## High Priority Findings

### [WARN] JWT payload bloat for ADMIN role — all 33 permissions embedded

**File:** `apps/core/src/auth/auth.service.ts:150`

```ts
const payload = { sub: userId, email, roles, permissions };
const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
```

ADMIN users get all 33 permission strings in every access token. At ~12 avg chars per permission code, this adds ~400 bytes minimum before Base64 encoding — manageable today but will grow as permissions increase. More importantly, the 15-minute-lived token carries a stale snapshot: if permissions are changed via `grantCustom`/`revokeCustom`, the user's token will not reflect this until they log in again or refresh.

**Options (pick one):**
- Strip permissions from the JWT for ADMIN (check role server-side instead).
- Use a DB lookup on each protected request rather than embedding in JWT.
- Keep current approach but document the staleness explicitly and ensure `refresh` rebuilds them (it does — see `auth.service.ts:117`).

### [WARN] `validateToken` returns raw JWT payload fields without sanitization

**File:** `apps/core/src/auth/auth.service.ts:135-145`

```ts
async validateToken(token: string): Promise<{ valid: boolean; payload?: any }> {
  try {
    const payload = this.jwtService.verify(token);
    return {
      valid: true,
      payload: { userId: payload.sub, email: payload.email },  // OK
    };
  }
```

This is fine as written — only `sub` and `email` are returned. However, the return type is `payload?: any`, which is a type-safety hole. If a caller uses `payload` directly without the field picks, internal JWT structure leaks. Minor but worth tightening the return type.

### [WARN] `system:manage` does not exist — wildcard fallback is a dead path for `system` module

**File:** `apps/gateway/src/guards/permissions.guard.ts:31-35`

The guard's wildcard logic for `module:manage`:
```ts
const [module] = perm.split(':');
return userPerms.has(`${module}:manage`);
```

For `system:settings`, `system:logs`, `system:permissions` — the fallback checks `system:manage`, which does **not exist** in the permission constants or seed. This means no user can satisfy a system permission via wildcard — they must hold the exact permission code. This is likely intentional for system-level perms, but it is undocumented and inconsistent with the wildcard pattern applied to other modules.

Similarly, the `rating` module has no `rating:manage` constant — `rating:moderate` and `rating:delete` cannot be satisfied by wildcard.

**Action:** Either add `system:manage` and `rating:manage` to the constants and seed (and assign to ADMIN), or document that those modules intentionally skip wildcard support.

### [WARN] No input validation on `permissionCode` body param

**File:** `apps/gateway/src/admin/permissions.controller.ts:68,84`

```ts
async grantCustom(
  @Param('userId') userId: string,
  @Body('permissionCode') code: string,  // raw string, no DTO
)
```

`code` is passed to `permissions.grantCustom` NATS message without validation. The service does check the DB for the code's existence (throwing if not found), but there is no format validation at the HTTP layer. A malformed or excessively long string reaches the microservice. `ParseUUIDPipe` is also absent on `userId` params throughout this controller.

**Fix:** Introduce a simple DTO:
```ts
class PermissionCodeDto {
  @IsString()
  @Matches(/^[a-z]+:[a-z-]+$/)
  permissionCode: string;
}
```
And add `ParseUUIDPipe` to `@Param('userId')`.

---

## Medium Priority Improvements

### [WARN] `getCachedPermissions` — cache stampede risk

**File:** `apps/core/src/permissions/permissions.service.ts:64-71`

```ts
if (cached?.cachedCodes?.length) return cached.cachedCodes;
return this.buildUserPermissions(userId);
```

If the cache is empty (first login or invalidated), multiple concurrent requests will all miss the cache and all call `buildUserPermissions` simultaneously, each issuing 2 DB queries and an upsert. Under load, this creates N redundant writes. Acceptable at current scale, but worth noting.

### [WARN] `buildUserPermissions` — two separate DB queries where one join suffices

**File:** `apps/core/src/permissions/permissions.service.ts:21-48`

Two separate `findMany` calls (rolePermissions, then userPermission) where a single query with include could work. Functional but adds latency.

### [WARN] `manage:manage` wildcard self-reference is redundant (not a bug, just wasteful)

When the required permission is `x:manage` and the user lacks it, the fallback also checks `x:manage` — identical to the first check. Not incorrect but burns a Set lookup unnecessarily.

### [INFO] Seed: N+1 upsert loop — no `createMany` batch

**File:** `libs/common/prisma/seeds/permissions.seed.ts:97-125`

The seed loops and issues individual upserts per permission and per role-permission pair. At current count (~33 permissions x 7 roles = up to 231 upserts), this is slow on cold runs but not a production concern. Fine for a seed script.

### [INFO] `UserStatus.UNACTIVE` typo in schema

**File:** `libs/common/prisma/schema.prisma:26`

```prisma
UNACTIVE  // should be INACTIVE
```

Cosmetic, but inconsistent with standard English and will appear in API responses.

---

## Low Priority Suggestions

- **[INFO]** `PermissionsGuard` is registered as a provider in `app.module.ts` but is NOT applied globally (`APP_GUARD`). It is applied per-route via `@Auth()`. This is correct and intentional — confirmed no unintended global application.
- **[INFO]** `Auth()` decorator signature description in Swagger (`ApiForbiddenResponse`) is computed at decoration time, not at runtime — the permissions list in the description will be accurate. Good.
- **[INFO]** `PERMISSIONS` constant uses `as const` — `PermissionCode` union type is correctly derived. Type-safe usage at call sites (e.g., `RequirePermissions(...permissions: PermissionCode[])`) is correct.
- **[INFO]** `Permission.@@index([code])` is redundant — `code` already has `@unique` which implies an index. Minor schema bloat.

---

## Positive Observations

- **Seed unique key is correct.** The `role_permissionId` compound unique key used in `permissions.seed.ts:118` matches the Prisma-generated `RolePermissionWhereUniqueInput.role_permissionId` — confirmed against generated client.
- **NATS message pattern wiring is correct.** All 6 patterns in `permissions.controller.ts` (`permissions.findAll`, `permissions.roleDefaults`, `permissions.userPermissions`, `permissions.grantCustom`, `permissions.revokeCustom`, `permissions.buildCache`) are matched by corresponding `identityClient.send()` calls in the gateway controllers.
- **Wildcard logic is architecturally correct** for modules that have a `:manage` permission. `user:manage` will satisfy `user:view`, `user:ban`, etc. The guard correctly applies `every()` — all required perms must pass.
- **`deletePermission` correctly guards `isSystem` permissions** from deletion.
- **`refresh` rebuilds permissions from DB** (`buildUserPermissions`) rather than re-reading from the old token — correct behavior that prevents stale grant escalation.
- **`adminLogin` checks `accountType === 0`** as a secondary gate separate from the role/permission system — good defense-in-depth.
- **Core service is NATS-only** (no HTTP listener) — the permissions microservice endpoints are not directly accessible from outside the cluster.
- **CORS configured in gateway** with explicit origin list, not wildcard `*`.

---

## Recommended Actions

1. **[CRITICAL — fix now]** Remove the `|| 'fallback-secret'` in `jwt.strategy.ts`. Throw if `JWT_SECRET` is absent.
2. **[HIGH]** Add DTO validation for `permissionCode` body and `ParseUUIDPipe` for `userId` params in `AdminPermissionsController`.
3. **[HIGH]** Add `system:manage` and `rating:manage` to `PERMISSIONS` constant + seed + ADMIN role defaults, OR add a comment in `permissions.guard.ts` explicitly noting which modules opt out of wildcard.
4. **[MEDIUM]** Tighten `validateToken` return type from `payload?: any` to a typed interface.
5. **[LOW]** Fix `UNACTIVE` -> `INACTIVE` in schema (requires migration).
6. **[LOW]** Remove redundant `@@index([code])` from `Permission` model (already covered by `@unique`).

---

## Metrics
- **Type Coverage:** Strong — `PermissionCode` union, `JwtPayload` interface, `UserRole[]` typed throughout. One `any` leak in `validateToken`.
- **Test Coverage:** No tests observed in reviewed files.
- **Linting Issues:** 0 structural, 1 `any` type usage.
- **Seed correctness:** Confirmed correct against generated Prisma client types.

---

## Unresolved Questions

- Is the stale-permission window (up to 15 minutes after grant/revoke) acceptable for this use case? If permissions can be revoked for security reasons (e.g., revoking a banned user's perms), the 15-minute window is a risk window.
- Should `rating:moderate` be satisfiable by `rating:manage` wildcard? Currently it cannot be, as `rating:manage` does not exist.
