# Phase 2: Tao Shared DTOs trong libs/common

## Context Links

- [plan.md](./plan.md)
- [research/researcher-02-report.md](./research/researcher-02-report.md)
- Current: `libs/common/src/dtos/create-user.dto.ts`, `libs/common/src/dtos/index.ts`

## Tong quan

Them cac DTO moi vao `libs/common/src/dtos/` de phuc vu Auth module va User module. Giu nguyen CreateUserDto hien tai.

## Key Insights

- CreateUserDto da co va dung tot - khong can sua
- Can them LoginDto, UpdateUserDto, ChangePasswordDto, TokenResponseDto
- UpdateUserDto dung PartialType tu @nestjs/mapped-types de ke thua tu CreateUserDto
- class-validator da co trong project, chi can dung decorators

## Requirements

1. **LoginDto** - email + password
2. **UpdateUserDto** - optional fields: username, firstName, lastName, avatar (KHONG co password, email, role)
3. **ChangePasswordDto** - oldPassword + newPassword
4. **UpdateRoleDto** - role field (chi admin dung)
5. **TokenResponseDto** - accessToken, refreshToken, user info
6. Cap nhat `libs/common/src/dtos/index.ts` de export tat ca

## Architecture

```
libs/common/src/dtos/
  |-- create-user.dto.ts     (giu nguyen)
  |-- login.dto.ts            (MOI)
  |-- update-user.dto.ts      (MOI)
  |-- change-password.dto.ts  (MOI)
  |-- update-role.dto.ts      (MOI)
  |-- token-response.dto.ts   (MOI)
  |-- create-tournament.dto.ts (giu nguyen)
  |-- index.ts                (cap nhat)
```

## Related Code Files

| File | Hanh dong |
|------|-----------|
| `libs/common/src/dtos/login.dto.ts` | Tao moi |
| `libs/common/src/dtos/update-user.dto.ts` | Tao moi |
| `libs/common/src/dtos/change-password.dto.ts` | Tao moi |
| `libs/common/src/dtos/update-role.dto.ts` | Tao moi |
| `libs/common/src/dtos/token-response.dto.ts` | Tao moi |
| `libs/common/src/dtos/index.ts` | Cap nhat exports |

## Implementation Steps

### Step 1: Tao login.dto.ts

```typescript
// libs/common/src/dtos/login.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
```

### Step 2: Tao update-user.dto.ts

```typescript
// libs/common/src/dtos/update-user.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}
```

**Luu y:** Khong cho phep doi email, password, role qua DTO nay. Email doi can verify flow rieng. Password doi qua ChangePasswordDto. Role doi qua UpdateRoleDto (admin only).

### Step 3: Tao change-password.dto.ts

```typescript
// libs/common/src/dtos/change-password.dto.ts
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
```

### Step 4: Tao update-role.dto.ts

```typescript
// libs/common/src/dtos/update-role.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateRoleDto {
  @IsEnum(['player', 'organizer', 'admin'])
  @IsNotEmpty()
  role: string;
}
```

### Step 5: Tao token-response.dto.ts

```typescript
// libs/common/src/dtos/token-response.dto.ts
export class TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}
```

### Step 6: Cap nhat index.ts

```typescript
// libs/common/src/dtos/index.ts
export * from './create-user.dto';
export * from './create-tournament.dto';
export * from './login.dto';
export * from './update-user.dto';
export * from './change-password.dto';
export * from './update-role.dto';
export * from './token-response.dto';
```

## Todo List

- [ ] Tao `login.dto.ts`
- [ ] Tao `update-user.dto.ts`
- [ ] Tao `change-password.dto.ts`
- [ ] Tao `update-role.dto.ts`
- [ ] Tao `token-response.dto.ts`
- [ ] Cap nhat `dtos/index.ts`
- [ ] Verify import tu `@app/common` hoat dong

## Success Criteria

- Tat ca DTO import duoc tu `@app/common`
- `pnpm run build:core` thanh cong (khong loi TypeScript)
- class-validator decorators dung cho moi field

## Risk Assessment

| Rui ro | Muc do | Giai phap |
|--------|--------|-----------|
| @nestjs/mapped-types khong co | Thap | Khong dung PartialType, viet manual |
| Conflict voi CreateUserDto hien tai | Khong | Giu nguyen, khong sua |

## Security Considerations

- UpdateUserDto khong cho phep doi role, email, password - ngan privilege escalation
- ChangePasswordDto bat buoc oldPassword de xac nhan
- TokenResponseDto khong bao gio chua password

## Next Steps

Sau khi hoan thanh -> chuyen sang Phase 3 (Auth Module) va Phase 4 (User Module) - co the lam song song
