# Plan: Tach module Core thanh Auth + User Management

**Ngay:** 2026-02-16 | **Trang thai:** PLANNING

## Tong quan

Tach service `apps/core` (hien tai la monolith IdentityService) thanh 2 module rieng biet:
- **AuthModule** - Xu ly JWT, bcrypt, dang nhap/dang ky/refresh token
- **UsersModule** - CRUD nguoi dung, doi mat khau, quan ly role

Dong thoi cap nhat Gateway de tach controller va them JWT guard cho route bao mat.

## Kien truc muc tieu

```
Gateway (HTTP :3000)
  |-- AuthController (public routes)
  |-- UsersController (protected by JwtAuthGuard)
  |
  |--- NATS ---> Core Service
                   |-- AuthModule (auth.register, auth.login, auth.refresh, auth.validate-token)
                   |-- UsersModule (user.create, user.findAll, user.findById, user.findByEmail, user.update, user.delete, user.changePassword, user.updateRole)
```

## Cac phase

| # | Phase | File | Status |
|---|-------|------|--------|
| 1 | Cai dat dependencies va cap nhat config | `phase-01-dependencies-config.md` | TODO |
| 2 | Tao shared DTOs moi trong libs/common | `phase-02-shared-dtos.md` | TODO |
| 3 | Tao Auth module | `phase-03-auth-module.md` | TODO |
| 4 | Tao User module | `phase-04-user-module.md` | TODO |
| 5 | Cap nhat Core AppModule | `phase-05-core-app-module.md` | TODO |
| 6 | Cap nhat Gateway (controllers + guards) | `phase-06-gateway-update.md` | TODO |

## Dependency moi can cai

```
@nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
@types/bcrypt @types/passport-jwt (devDependencies)
```

## File se bi xoa sau khi hoan thanh

- `apps/core/src/identity.controller.ts`
- `apps/core/src/identity.service.ts`

## Rui ro chinh

- Password plaintext hien tai can migration strategy (hash existing passwords)
- NATS message pattern thay doi can dong bo gateway + core cung luc
- JWT secret phai config dung trong ca gateway va core service

## Thu tu thuc hien

Phase 1 -> 2 -> 3 + 4 (song song) -> 5 -> 6
