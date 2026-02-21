# 🔐 ARCADE ARENA — Permission System Implementation Prompt

## NestJS Microservices (Gateway + Core + Esports) — Prisma + NATS + JWT

---

### CURRENT ARCHITECTURE

```
Stack:         NestJS monorepo (apps/gateway, apps/core, apps/esports)
Transport:     NATS (core ↔ esports), HTTP (gateway)
Auth:          JWT (access 15m + refresh 7d), bcrypt
ORM:           Prisma
Database:      PostgreSQL
User Roles:    UserRole enum (ADMIN, STAFF, ORGANIZER, CREATOR, PARTNER, PLAYER, USER)
Current Issue: Roles exist in schema but NO authorization guard enforced anywhere
```

### GOALS

1. Create `Permission` table in DB — format `module:action` (e.g. `tournament:manage`)
2. Seed default permissions with `isSystem` flag (editable but NOT deletable)
3. Create `UserPermission` (1-to-1 per user) with role defaults + custom overrides array
4. Re-sign JWT with flattened permission array, validate at gateway middleware
5. Swagger documentation showing required permissions per endpoint

---

## STEP 1: Prisma Schema

```prisma
// ═══════════════════════════════════════════
// PERMISSION SYSTEM
// ═══════════════════════════════════════════

model Permission {
  id          String   @id @default(cuid())
  code        String   @unique                  // "tournament:manage", "user:view"
  module      String                             // "tournament", "user", "match"
  action      String                             // "manage", "view", "create", "update", "delete"
  name        String                             // Display name: "Quản lý giải đấu"
  description String?
  isSystem    Boolean  @default(false)           // true = seed default, cannot delete
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  roleDefaults RolePermission[]
  userPerms    UserPermissionItem[]

  @@index([module])
  @@index([code])
  @@map("permissions")
}

// Role → Permission defaults (ADMIN gets X, ORGANIZER gets Y...)
model RolePermission {
  id           String     @id @default(cuid())
  role         UserRole
  permissionId String
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  createdAt    DateTime   @default(now())

  @@unique([role, permissionId])
  @@map("role_permissions")
}

// 1-to-1: each User has one UserPermission record
model UserPermission {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  customItems UserPermissionItem[]

  // Flattened cache — rebuilt on role/custom change, used for fast JWT signing
  cachedCodes String[] @default([])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("user_permissions")
}

// Custom per-user grant/revoke (overrides role defaults)
model UserPermissionItem {
  id               String         @id @default(cuid())
  userPermissionId String
  userPermission   UserPermission @relation(fields: [userPermissionId], references: [id], onDelete: Cascade)
  permissionId     String
  permission       Permission     @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  granted          Boolean        @default(true)  // true = add, false = revoke
  createdAt        DateTime       @default(now())

  @@unique([userPermissionId, permissionId])
  @@map("user_permission_items")
}

// UPDATE User model — add relation:
model User {
  // ...existing fields...
  permission UserPermission?
}
```

### ER Diagram

```
User (1) ──── (1) UserPermission
                      │
                      ├── cachedCodes: String[]       ← flattened for JWT
                      │
                      └── customItems: UserPermissionItem[]
                               │
                               └── Permission (granted: true/false)

UserRole (enum) ──── RolePermission[] ──── Permission[]
                     (default mapping)     (master list, isSystem flag)
```

---

## STEP 2: Permission Code Convention

```typescript
// libs/common/src/constants/permissions.ts

export const PERMISSIONS = {
  // ══════ USER ══════
  USER_VIEW:           'user:view',
  USER_VIEW_DETAIL:    'user:view-detail',
  USER_MANAGE:         'user:manage',
  USER_UPDATE_ROLE:    'user:update-role',
  USER_BAN:            'user:ban',

  // ══════ TOURNAMENT ══════
  TOURNAMENT_VIEW:     'tournament:view',
  TOURNAMENT_CREATE:   'tournament:create',
  TOURNAMENT_UPDATE:   'tournament:update',
  TOURNAMENT_DELETE:   'tournament:delete',
  TOURNAMENT_MANAGE:   'tournament:manage',

  // ══════ MATCH ══════
  MATCH_VIEW:          'match:view',
  MATCH_CREATE:        'match:create',
  MATCH_UPDATE:        'match:update',
  MATCH_DELETE:        'match:delete',
  MATCH_MANAGE:        'match:manage',

  // ══════ PLAYER ══════
  PLAYER_VIEW:         'player:view',
  PLAYER_CREATE:       'player:create',
  PLAYER_UPDATE:       'player:update',
  PLAYER_DELETE:       'player:delete',
  PLAYER_MANAGE:       'player:manage',

  // ══════ TEAM ══════
  TEAM_VIEW:           'team:view',
  TEAM_CREATE:         'team:create',
  TEAM_UPDATE:         'team:update',
  TEAM_DELETE:         'team:delete',
  TEAM_MANAGE:         'team:manage',

  // ══════ RATING ══════
  RATING_VIEW:         'rating:view',
  RATING_CREATE:       'rating:create',
  RATING_MODERATE:     'rating:moderate',
  RATING_DELETE:       'rating:delete',

  // ══════ POINTS ══════
  POINTS_VIEW:         'points:view',
  POINTS_GRANT:        'points:grant',
  POINTS_MANAGE:       'points:manage',

  // ══════ CONTENT ══════
  CONTENT_VIEW:        'content:view',
  CONTENT_CREATE:      'content:create',
  CONTENT_MANAGE:      'content:manage',

  // ══════ SYSTEM ══════
  SYSTEM_SETTINGS:     'system:settings',
  SYSTEM_LOGS:         'system:logs',
  SYSTEM_PERMISSIONS:  'system:permissions',
} as const;

export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS];
```

---

## STEP 3: Seed Script

```typescript
// prisma/seeds/permissions.seed.ts

import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const PERMISSION_SEED = [
  // USER
  { code: 'user:view',         module: 'user',       action: 'view',         name: 'Xem danh sách người dùng',    description: 'Xem danh sách toàn bộ user' },
  { code: 'user:view-detail',  module: 'user',       action: 'view-detail',  name: 'Xem chi tiết người dùng',     description: 'Xem thông tin chi tiết 1 user' },
  { code: 'user:manage',       module: 'user',       action: 'manage',       name: 'Quản lý người dùng',          description: 'Tạo, sửa, xoá user' },
  { code: 'user:update-role',  module: 'user',       action: 'update-role',  name: 'Đổi vai trò người dùng',      description: 'Thay đổi role của user' },
  { code: 'user:ban',          module: 'user',       action: 'ban',          name: 'Cấm người dùng',              description: 'Ban/unban user' },
  // TOURNAMENT
  { code: 'tournament:view',   module: 'tournament', action: 'view',         name: 'Xem giải đấu',                description: 'Xem danh sách giải đấu' },
  { code: 'tournament:create', module: 'tournament', action: 'create',       name: 'Tạo giải đấu',                description: 'Tạo giải đấu mới' },
  { code: 'tournament:update', module: 'tournament', action: 'update',       name: 'Sửa giải đấu',                description: 'Chỉnh sửa giải đấu' },
  { code: 'tournament:delete', module: 'tournament', action: 'delete',       name: 'Xoá giải đấu',                description: 'Xoá giải đấu' },
  { code: 'tournament:manage', module: 'tournament', action: 'manage',       name: 'Quản lý giải đấu (Full)',     description: 'Toàn quyền giải đấu' },
  // MATCH
  { code: 'match:view',        module: 'match',      action: 'view',         name: 'Xem trận đấu',                description: 'Xem danh sách trận đấu' },
  { code: 'match:create',      module: 'match',      action: 'create',       name: 'Tạo trận đấu',                description: 'Tạo trận đấu mới' },
  { code: 'match:update',      module: 'match',      action: 'update',       name: 'Cập nhật trận đấu',           description: 'Cập nhật kết quả trận' },
  { code: 'match:delete',      module: 'match',      action: 'delete',       name: 'Xoá trận đấu',                description: 'Xoá trận đấu' },
  { code: 'match:manage',      module: 'match',      action: 'manage',       name: 'Quản lý trận đấu (Full)',     description: 'Toàn quyền trận đấu' },
  // PLAYER
  { code: 'player:view',       module: 'player',     action: 'view',         name: 'Xem tuyển thủ',               description: 'Xem danh sách tuyển thủ' },
  { code: 'player:create',     module: 'player',     action: 'create',       name: 'Thêm tuyển thủ',              description: 'Thêm tuyển thủ mới' },
  { code: 'player:update',     module: 'player',     action: 'update',       name: 'Sửa tuyển thủ',               description: 'Chỉnh sửa tuyển thủ' },
  { code: 'player:delete',     module: 'player',     action: 'delete',       name: 'Xoá tuyển thủ',               description: 'Xoá tuyển thủ' },
  { code: 'player:manage',     module: 'player',     action: 'manage',       name: 'Quản lý tuyển thủ (Full)',    description: 'Toàn quyền tuyển thủ' },
  // TEAM
  { code: 'team:view',         module: 'team',       action: 'view',         name: 'Xem đội tuyển',               description: 'Xem danh sách đội' },
  { code: 'team:create',       module: 'team',       action: 'create',       name: 'Tạo đội tuyển',               description: 'Tạo đội mới' },
  { code: 'team:update',       module: 'team',       action: 'update',       name: 'Sửa đội tuyển',               description: 'Chỉnh sửa đội' },
  { code: 'team:delete',       module: 'team',       action: 'delete',       name: 'Xoá đội tuyển',               description: 'Xoá đội' },
  { code: 'team:manage',       module: 'team',       action: 'manage',       name: 'Quản lý đội tuyển (Full)',    description: 'Toàn quyền đội tuyển' },
  // RATING
  { code: 'rating:view',       module: 'rating',     action: 'view',         name: 'Xem đánh giá',                description: 'Xem danh sách đánh giá' },
  { code: 'rating:create',     module: 'rating',     action: 'create',       name: 'Gửi đánh giá',                description: 'Gửi đánh giá tuyển thủ' },
  { code: 'rating:moderate',   module: 'rating',     action: 'moderate',     name: 'Duyệt đánh giá',              description: 'Duyệt/từ chối đánh giá' },
  { code: 'rating:delete',     module: 'rating',     action: 'delete',       name: 'Xoá đánh giá',                description: 'Xoá đánh giá' },
  // POINTS
  { code: 'points:view',       module: 'points',     action: 'view',         name: 'Xem điểm thưởng',             description: 'Xem lịch sử điểm' },
  { code: 'points:grant',      module: 'points',     action: 'grant',        name: 'Tặng điểm',                   description: 'Tặng điểm cho user' },
  { code: 'points:manage',     module: 'points',     action: 'manage',       name: 'Quản lý điểm (Full)',         description: 'Toàn quyền điểm thưởng' },
  // CONTENT
  { code: 'content:view',      module: 'content',    action: 'view',         name: 'Xem nội dung',                description: 'Xem bài viết, tin tức' },
  { code: 'content:create',    module: 'content',    action: 'create',       name: 'Tạo nội dung',                description: 'Tạo bài viết mới' },
  { code: 'content:manage',    module: 'content',    action: 'manage',       name: 'Quản lý nội dung (Full)',     description: 'Toàn quyền nội dung' },
  // SYSTEM
  { code: 'system:settings',    module: 'system',    action: 'settings',     name: 'Cấu hình hệ thống',           description: 'Thay đổi settings' },
  { code: 'system:logs',        module: 'system',    action: 'logs',         name: 'Xem logs',                    description: 'Xem nhật ký hệ thống' },
  { code: 'system:permissions', module: 'system',    action: 'permissions',  name: 'Quản lý quyền hạn',           description: 'CRUD permissions' },
];

// Role → default permission codes
const ROLE_DEFAULTS: Record<string, string[]> = {
  ADMIN: ['*'], // All permissions

  STAFF: [
    'user:view', 'user:view-detail', 'user:ban',
    'tournament:view', 'tournament:manage',
    'match:view', 'match:manage',
    'player:view', 'player:manage',
    'team:view', 'team:manage',
    'rating:view', 'rating:moderate', 'rating:delete',
    'points:view', 'points:grant',
    'content:view', 'content:manage',
    'system:logs',
  ],

  ORGANIZER: [
    'tournament:view', 'tournament:create', 'tournament:update',
    'match:view', 'match:create', 'match:update',
    'player:view', 'team:view', 'rating:view',
    'content:view', 'content:create',
  ],

  CREATOR: [
    'tournament:view', 'match:view', 'player:view', 'team:view',
    'rating:view', 'content:view', 'content:create', 'content:manage',
  ],

  PARTNER: [
    'tournament:view', 'match:view', 'player:view',
    'team:view', 'rating:view', 'content:view',
  ],

  PLAYER: [
    'tournament:view', 'match:view', 'player:view', 'team:view',
    'rating:view', 'rating:create', 'points:view',
  ],

  USER: [
    'tournament:view', 'match:view', 'player:view', 'team:view',
    'rating:view', 'rating:create', 'points:view',
  ],
};

export async function seedPermissions() {
  console.log('🔐 Seeding permissions...');

  // 1. Upsert all permissions (isSystem = true)
  for (const p of PERMISSION_SEED) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: { module: p.module, action: p.action, name: p.name, description: p.description },
      create: { ...p, isSystem: true },
    });
  }
  console.log(`  ✅ ${PERMISSION_SEED.length} permissions seeded`);

  // 2. Seed role defaults
  const allPerms = await prisma.permission.findMany();
  const permMap = new Map(allPerms.map(p => [p.code, p.id]));

  for (const [role, codes] of Object.entries(ROLE_DEFAULTS)) {
    const resolved = codes.includes('*') ? allPerms.map(p => p.code) : codes;

    for (const code of resolved) {
      const permId = permMap.get(code);
      if (!permId) continue;

      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role: role as UserRole, permissionId: permId } },
        update: {},
        create: { role: role as UserRole, permissionId: permId },
      });
    }
    console.log(`  ✅ ${role}: ${resolved.length} permissions`);
  }

  console.log('🔐 Seed complete!');
}
```

---

## STEP 4: Permission Service — Build & Cache

```typescript
// apps/core/src/permissions/permissions.service.ts

import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Build flattened permission array for a user.
   * Logic: (role defaults) + (custom granted) - (custom revoked)
   * Called on: login, role change, custom perm change, token refresh
   */
  async buildUserPermissions(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, roles: true },
    });
    if (!user) throw new Error('User not found');

    // 1. Union of all role-based defaults
    const rolePerms = await this.prisma.rolePermission.findMany({
      where: { role: { in: user.roles } },
      include: { permission: { select: { code: true, isActive: true } } },
    });
    const basePerms = new Set(
      rolePerms
        .filter(rp => rp.permission.isActive)
        .map(rp => rp.permission.code)
    );

    // 2. Apply custom overrides
    const userPerm = await this.prisma.userPermission.findUnique({
      where: { userId },
      include: {
        customItems: {
          include: { permission: { select: { code: true } } },
        },
      },
    });

    if (userPerm?.customItems) {
      for (const item of userPerm.customItems) {
        if (item.granted) {
          basePerms.add(item.permission.code);
        } else {
          basePerms.delete(item.permission.code);
        }
      }
    }

    // 3. Sort and cache
    const permArray = Array.from(basePerms).sort();

    await this.prisma.userPermission.upsert({
      where: { userId },
      update: { cachedCodes: permArray },
      create: { userId, cachedCodes: permArray },
    });

    return permArray;
  }

  /** Fast path — read from cache */
  async getCachedPermissions(userId: string): Promise<string[]> {
    const cached = await this.prisma.userPermission.findUnique({
      where: { userId },
      select: { cachedCodes: true },
    });
    if (cached?.cachedCodes?.length) return cached.cachedCodes;
    return this.buildUserPermissions(userId);
  }

  /** Grant extra permission to specific user */
  async grantCustom(userId: string, permissionCode: string) {
    const perm = await this.prisma.permission.findUnique({ where: { code: permissionCode } });
    if (!perm) throw new Error(`Permission ${permissionCode} not found`);

    const up = await this.prisma.userPermission.upsert({
      where: { userId },
      update: {},
      create: { userId, cachedCodes: [] },
    });

    await this.prisma.userPermissionItem.upsert({
      where: { userPermissionId_permissionId: { userPermissionId: up.id, permissionId: perm.id } },
      update: { granted: true },
      create: { userPermissionId: up.id, permissionId: perm.id, granted: true },
    });

    return this.buildUserPermissions(userId);
  }

  /** Revoke permission from specific user (even if role grants it) */
  async revokeCustom(userId: string, permissionCode: string) {
    const perm = await this.prisma.permission.findUnique({ where: { code: permissionCode } });
    if (!perm) throw new Error(`Permission ${permissionCode} not found`);

    const up = await this.prisma.userPermission.upsert({
      where: { userId },
      update: {},
      create: { userId, cachedCodes: [] },
    });

    await this.prisma.userPermissionItem.upsert({
      where: { userPermissionId_permissionId: { userPermissionId: up.id, permissionId: perm.id } },
      update: { granted: false },
      create: { userPermissionId: up.id, permissionId: perm.id, granted: false },
    });

    return this.buildUserPermissions(userId);
  }

  /** isSystem permissions cannot be deleted */
  async deletePermission(id: string) {
    const perm = await this.prisma.permission.findUnique({ where: { id } });
    if (perm?.isSystem) throw new ForbiddenException('System permissions cannot be deleted');
    return this.prisma.permission.delete({ where: { id } });
  }

  async findAll(module?: string) {
    return this.prisma.permission.findMany({
      where: module ? { module } : undefined,
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });
  }
}
```

---

## STEP 5: Re-sign JWT with Permissions

```typescript
// apps/core/src/auth/auth.service.ts — UPDATE generateTokens()

private async generateTokens(userId: string, email: string, roles: UserRole[]) {
  const permissions = await this.permissionsService.getCachedPermissions(userId);

  const payload = {
    sub: userId,
    email,
    roles,
    permissions,  // ← ["tournament:view", "match:manage", ...]
  };

  const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
  const refreshToken = this.jwtService.sign(
    { sub: userId, email },  // Refresh token lightweight — no permissions
    { secret: this.configService.get('JWT_REFRESH_SECRET'), expiresIn: '7d' },
  );

  return { accessToken, refreshToken };
}

// UPDATE refresh() — rebuild permissions on refresh
async refresh(refreshToken: string) {
  const decoded = this.jwtService.verify(refreshToken, {
    secret: this.configService.get('JWT_REFRESH_SECRET'),
  });
  const user = await this.prisma.user.findUnique({
    where: { id: decoded.sub },
    select: { id: true, email: true, roles: true },
  });
  if (!user) throw new UnauthorizedException();

  // Rebuild permissions (picks up changes since last login)
  await this.permissionsService.buildUserPermissions(user.id);
  return this.generateTokens(user.id, user.email, user.roles);
}
```

---

## STEP 6: JWT Strategy — Extract Permissions

```typescript
// apps/gateway/src/strategies/jwt.strategy.ts

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles ?? [],
      permissions: payload.permissions ?? [],
    };
  }
}
```

---

## STEP 7: Permission Guard & Decorator

### 7.1 `@RequirePermissions()` Decorator

```typescript
// libs/common/src/decorators/permissions.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { PermissionCode } from '../constants/permissions';

export const PERMISSIONS_KEY = 'required_permissions';

/**
 * Decorator to mark endpoint with required permissions.
 * Supports `:manage` wildcard — if user has `tournament:manage`, it covers
 * `tournament:create`, `tournament:update`, `tournament:delete`.
 *
 * @example
 * @RequirePermissions('tournament:create')
 * @RequirePermissions('user:manage', 'user:ban')  // needs ALL listed
 */
export const RequirePermissions = (...permissions: PermissionCode[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
```

### 7.2 `PermissionsGuard`

```typescript
// libs/common/src/guards/permissions.guard.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No permissions required → allow
    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user?.permissions) {
      throw new ForbiddenException('No permissions found in token');
    }

    const userPerms = new Set<string>(user.permissions);

    // Check: user must have ALL required permissions
    // `:manage` acts as wildcard for its module (tournament:manage covers tournament:*)
    const hasAll = required.every((perm) => {
      if (userPerms.has(perm)) return true;

      // Check if user has `module:manage` which covers all actions in that module
      const [module] = perm.split(':');
      return userPerms.has(`${module}:manage`);
    });

    if (!hasAll) {
      throw new ForbiddenException({
        message: 'Insufficient permissions',
        required,
        userPermissions: user.permissions,
      });
    }

    return true;
  }
}
```

### 7.3 Combined Guard Helper

```typescript
// libs/common/src/decorators/auth.decorator.ts

import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from './permissions.decorator';
import { PermissionCode } from '../constants/permissions';
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

/**
 * Combined decorator: JWT auth + permission check + Swagger docs
 *
 * @example
 * @Auth('tournament:create')
 * @Post('tournaments')
 * async create() {}
 */
export function Auth(...permissions: PermissionCode[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, PermissionsGuard),
    RequirePermissions(...permissions),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' }),
    ApiForbiddenResponse({ description: `Required permissions: ${permissions.join(', ')}` }),
  );
}
```

---

## STEP 8: Apply to Controllers

### 8.1 Tournament Controller

```typescript
// apps/gateway/src/app.controller.ts

import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Auth } from '@app/common/decorators/auth.decorator';
import { PERMISSIONS } from '@app/common/constants/permissions';

@ApiTags('Tournaments')
@Controller('tournaments')
export class TournamentController {
  constructor(private readonly client: ClientProxy) {}

  @Get()
  @ApiOperation({
    summary: 'List all tournaments',
    description: 'Public endpoint — no auth required',
  })
  findAll() {
    return this.client.send('tournament.findAll', {});
  }

  @Post()
  @Auth(PERMISSIONS.TOURNAMENT_CREATE)   // ← JWT + permission check
  @ApiOperation({
    summary: 'Create tournament',
    description: 'Requires: `tournament:create`',
  })
  create(@Body() dto: CreateTournamentDto) {
    return this.client.send('tournament.create', dto);
  }

  @Patch(':id')
  @Auth(PERMISSIONS.TOURNAMENT_UPDATE)
  @ApiOperation({
    summary: 'Update tournament',
    description: 'Requires: `tournament:update`',
  })
  update(@Param('id') id: string, @Body() dto: UpdateTournamentDto) {
    return this.client.send('tournament.update', { id, ...dto });
  }

  @Delete(':id')
  @Auth(PERMISSIONS.TOURNAMENT_DELETE)
  @ApiOperation({
    summary: 'Delete tournament',
    description: 'Requires: `tournament:delete`',
  })
  delete(@Param('id') id: string) {
    return this.client.send('tournament.delete', { id });
  }
}
```

### 8.2 Users Controller (Fixed Critical Vulnerabilities)

```typescript
// apps/gateway/src/users/users.controller.ts

import { Auth } from '@app/common/decorators/auth.decorator';
import { PERMISSIONS } from '@app/common/constants/permissions';

@ApiTags('Users')
@Controller('users')
export class UsersController {

  @Get()
  @Auth(PERMISSIONS.USER_VIEW)                    // ← WAS: any logged-in user
  @ApiOperation({
    summary: 'List all users',
    description: 'Requires: `user:view`',
  })
  findAll() { ... }

  @Patch(':id/role')
  @Auth(PERMISSIONS.USER_UPDATE_ROLE)             // ← WAS: any logged-in user!
  @ApiOperation({
    summary: 'Update user role',
    description: 'Requires: `user:update-role` (ADMIN only by default)',
  })
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) { ... }

  @Patch(':id/ban')
  @Auth(PERMISSIONS.USER_BAN)
  @ApiOperation({
    summary: 'Ban/unban user',
    description: 'Requires: `user:ban`',
  })
  banUser(@Param('id') id: string) { ... }

  // /users/me — only needs JWT, no special permission
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMe(@Req() req) { ... }
}
```

### 8.3 Full Endpoint → Permission Mapping

```
┌──────────────────────────────┬──────────┬──────────────────────────┐
│ Endpoint                     │ Method   │ Permission Required      │
├──────────────────────────────┼──────────┼──────────────────────────┤
│ /auth/register               │ POST     │ — (public)               │
│ /auth/login                  │ POST     │ — (public)               │
│ /auth/admin/login            │ POST     │ — (public, check acctType│
│ /auth/refresh                │ POST     │ — (public)               │
│                              │          │                          │
│ /users/me                    │ GET      │ JWT only                 │
│ /users/me                    │ PATCH    │ JWT only                 │
│ /users/me/password           │ PATCH    │ JWT only                 │
│ /users                       │ GET      │ user:view                │
│ /users/:id                   │ GET      │ user:view-detail         │
│ /users/:id/role              │ PATCH    │ user:update-role         │
│ /users/:id/ban               │ PATCH    │ user:ban                 │
│                              │          │                          │
│ /tournaments                 │ GET      │ — (public)               │
│ /tournaments                 │ POST     │ tournament:create        │
│ /tournaments/:id             │ PATCH    │ tournament:update        │
│ /tournaments/:id             │ DELETE   │ tournament:delete        │
│                              │          │                          │
│ /matches                     │ GET      │ — (public)               │
│ /matches                     │ POST     │ match:create             │
│ /matches/:id/result          │ PATCH    │ match:update             │
│                              │          │                          │
│ /players                     │ GET      │ — (public)               │
│ /players                     │ POST     │ player:create            │
│ /players/:slug               │ PATCH    │ player:update            │
│                              │          │                          │
│ /ratings/:playerSlug         │ POST     │ rating:create            │
│ /ratings/pending             │ GET      │ rating:moderate          │
│ /ratings/:id/approve         │ PATCH    │ rating:moderate          │
│                              │          │                          │
│ /points/grant                │ POST     │ points:grant             │
│                              │          │                          │
│ /admin/permissions           │ GET      │ system:permissions       │
│ /admin/permissions/:userId   │ PATCH    │ system:permissions       │
│ /admin/settings              │ PATCH    │ system:settings          │
│ /admin/logs                  │ GET      │ system:logs              │
└──────────────────────────────┴──────────┴──────────────────────────┘
```

---

## STEP 9: Swagger Setup

```bash
pnpm add @nestjs/swagger
```

```typescript
// apps/gateway/src/main.ts

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // ═══════════════════════════════════════════
  // SWAGGER SETUP
  // ═══════════════════════════════════════════
  const config = new DocumentBuilder()
    .setTitle('Arcade Arena API')
    .setDescription(`
## E-sports Rating Platform API

### Authentication
All protected endpoints require a JWT Bearer token.

### Permission System
Permissions follow the format \`module:action\`:
- \`tournament:view\` — View tournaments
- \`tournament:create\` — Create tournaments
- \`tournament:manage\` — Full CRUD (covers create/update/delete)

### Default Role Permissions
| Role | Permissions |
|------|-----------|
| **ADMIN** | All permissions |
| **STAFF** | Manage content, moderate ratings, manage players/teams/matches |
| **ORGANIZER** | Create/update tournaments and matches |
| **CREATOR** | Create/manage content |
| **PLAYER** | View + rate |
| **USER** | View + rate |
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token',
      },
      'access-token',
    )
    .addTag('Auth', 'Registration, login, token refresh')
    .addTag('Users', 'User management and profiles')
    .addTag('Tournaments', 'Tournament CRUD')
    .addTag('Matches', 'Match management and results')
    .addTag('Players', 'Player profiles')
    .addTag('Teams', 'Team management')
    .addTag('Ratings', 'Rating submission and moderation')
    .addTag('Points', 'Points and rewards system')
    .addTag('Admin', 'System administration')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Arcade Arena API Docs',
    customCss: `
      .swagger-ui .topbar { background-color: #121212; }
      .swagger-ui .topbar .link { color: #CCFF00; }
    `,
    swaggerOptions: {
      persistAuthorization: true,     // Keep token after reload
      docExpansion: 'list',
      filter: true,
      tagsSorter: 'alpha',
    },
  });

  await app.listen(3333);
  console.log('🎮 Gateway running on http://localhost:3333');
  console.log('📖 Swagger docs: http://localhost:3333/api/docs');
}
bootstrap();
```

### 9.2 DTO Swagger Examples

```typescript
// apps/gateway/src/dto/create-tournament.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateTournamentDto {
  @ApiProperty({
    example: 'VCS Mùa Xuân 2026',
    description: 'Tournament name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Giải đấu Liên Minh Huyền Thoại chuyên nghiệp Việt Nam',
    description: 'Tournament description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '2026-03-01T00:00:00.000Z',
    description: 'Start date (ISO 8601)',
  })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({
    example: '2026-05-15T00:00:00.000Z',
    description: 'End date (ISO 8601)',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
```

```typescript
// apps/gateway/src/dto/update-role.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateRoleDto {
  @ApiProperty({
    example: ['ORGANIZER', 'CREATOR'],
    description: 'Array of roles to assign',
    enum: UserRole,
    isArray: true,
  })
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];
}
```

### 9.3 Swagger Response Decorator for Permissions

```typescript
// libs/common/src/decorators/api-permission.decorator.ts

import { applyDecorators } from '@nestjs/common';
import { ApiHeader, ApiResponse } from '@nestjs/swagger';

/**
 * Documents permission requirements in Swagger UI.
 * Shows which permissions are needed in the endpoint description.
 */
export function ApiPermission(...permissions: string[]) {
  return applyDecorators(
    ApiResponse({
      status: 403,
      description: `Forbidden — requires permissions: \`${permissions.join('`, `')}\``,
      schema: {
        example: {
          statusCode: 403,
          message: 'Insufficient permissions',
          required: permissions,
        },
      },
    }),
  );
}
```

Usage:

```typescript
@Post()
@Auth(PERMISSIONS.TOURNAMENT_CREATE)
@ApiPermission(PERMISSIONS.TOURNAMENT_CREATE)    // Shows in Swagger 403 response
@ApiOperation({ summary: 'Create tournament' })
create(@Body() dto: CreateTournamentDto) {}
```

---

## STEP 10: Permission Management Endpoints (Admin)

```typescript
// apps/gateway/src/admin/permissions.controller.ts

@ApiTags('Admin')
@Controller('admin/permissions')
export class AdminPermissionsController {

  @Get()
  @Auth(PERMISSIONS.SYSTEM_PERMISSIONS)
  @ApiOperation({
    summary: 'List all permissions',
    description: 'Returns master permission list grouped by module. Requires: `system:permissions`',
  })
  async findAll(@Query('module') module?: string) {
    return this.client.send('permissions.findAll', { module });
  }

  @Get('roles')
  @Auth(PERMISSIONS.SYSTEM_PERMISSIONS)
  @ApiOperation({
    summary: 'Get role → permission defaults',
    description: 'Returns default permission mapping per role',
  })
  async getRoleDefaults() {
    return this.client.send('permissions.roleDefaults', {});
  }

  @Get('user/:userId')
  @Auth(PERMISSIONS.SYSTEM_PERMISSIONS)
  @ApiOperation({
    summary: 'Get user permissions (resolved)',
    description: 'Returns flattened permission list for a specific user',
  })
  async getUserPermissions(@Param('userId') userId: string) {
    return this.client.send('permissions.userPermissions', { userId });
  }

  @Post('user/:userId/grant')
  @Auth(PERMISSIONS.SYSTEM_PERMISSIONS)
  @ApiOperation({
    summary: 'Grant custom permission to user',
    description: 'Adds a permission beyond role defaults. Requires: `system:permissions`',
  })
  @ApiBody({
    schema: { example: { permissionCode: 'tournament:manage' } },
  })
  async grantCustom(@Param('userId') userId: string, @Body('permissionCode') code: string) {
    return this.client.send('permissions.grantCustom', { userId, code });
  }

  @Post('user/:userId/revoke')
  @Auth(PERMISSIONS.SYSTEM_PERMISSIONS)
  @ApiOperation({
    summary: 'Revoke permission from user',
    description: 'Removes a permission even if role grants it. Requires: `system:permissions`',
  })
  @ApiBody({
    schema: { example: { permissionCode: 'tournament:create' } },
  })
  async revokeCustom(@Param('userId') userId: string, @Body('permissionCode') code: string) {
    return this.client.send('permissions.revokeCustom', { userId, code });
  }
}
```

---

## FLOW DIAGRAMS

### Login → JWT with Permissions

```
User login (email + password)
        │
        ▼
  [Validate credentials]
        │
        ▼
  [Get user.roles]  →  [ADMIN, ORGANIZER]
        │
        ▼
  [permissionsService.getCachedPermissions(userId)]
        │
        ├── Cache hit → return cachedCodes
        │
        └── Cache miss → buildUserPermissions()
                │
                ├── Query RolePermission (ADMIN defaults + ORGANIZER defaults)
                ├── Query UserPermissionItem (custom grants/revokes)
                ├── Merge: (role defaults) + (granted) - (revoked)
                ├── Save to cachedCodes
                └── Return flattened array
        │
        ▼
  [Sign JWT]
  payload = {
    sub: "user-123",
    email: "admin@arena.vn",
    roles: ["ADMIN", "ORGANIZER"],
    permissions: ["tournament:manage", "match:manage", "user:manage", ...]
  }
        │
        ▼
  Return { accessToken, refreshToken }
```

### Request → Gateway Permission Check

```
Client request: POST /tournaments
Header: Authorization: Bearer <JWT>
        │
        ▼
  [JwtAuthGuard]
  Extract + verify JWT → inject user into request
        │
        ▼
  [PermissionsGuard]
  Read @RequirePermissions('tournament:create') from handler metadata
        │
        ├── Check: user.permissions includes 'tournament:create'?
        │   OR user.permissions includes 'tournament:manage'?
        │
        ├── YES → next()
        └── NO  → 403 { message: 'Insufficient permissions', required: ['tournament:create'] }
```

---

## FILE SUMMARY

```
CREATE:
  prisma/seeds/permissions.seed.ts                    ← Seed script
  libs/common/src/constants/permissions.ts            ← Permission codes
  libs/common/src/guards/permissions.guard.ts         ← Gateway guard
  libs/common/src/decorators/permissions.decorator.ts ← @RequirePermissions()
  libs/common/src/decorators/auth.decorator.ts        ← @Auth() combined
  libs/common/src/decorators/api-permission.decorator.ts ← Swagger helper
  apps/core/src/permissions/permissions.service.ts    ← Build/cache logic
  apps/core/src/permissions/permissions.module.ts     ← Module
  apps/gateway/src/admin/permissions.controller.ts    ← Admin CRUD

MODIFY:
  prisma/schema.prisma          ← Add 4 new models
  prisma/seed.ts                ← Import seedPermissions
  apps/core/src/auth/auth.service.ts  ← JWT payload + permissions
  apps/gateway/src/strategies/jwt.strategy.ts  ← Extract permissions
  apps/gateway/src/main.ts      ← Swagger setup
  apps/gateway/src/app.controller.ts  ← Add @Auth() to tournaments
  apps/gateway/src/users/users.controller.ts ← Fix critical auth holes
  All DTOs                      ← Add @ApiProperty examples
```