import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { UserRole } from '@app/common';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Build flattened permission array for a user.
   * Logic: (role defaults) + (custom granted) - (custom revoked)
   */
  async buildUserPermissions(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) throw new Error('User not found');

    // 1. Union of all role-based defaults
    const rolePerms = await this.prisma.rolePermission.findMany({
      where: { role: { in: user.role as UserRole[] } },
      include: { permission: { select: { code: true, isActive: true } } },
    });
    const basePerms = new Set(
      rolePerms
        .filter((rp) => rp.permission.isActive)
        .map((rp) => rp.permission.code),
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

  /** Fast path — read from cache, build on miss */
  async getCachedPermissions(userId: string): Promise<string[]> {
    const cached = await this.prisma.userPermission.findUnique({
      where: { userId },
      select: { cachedCodes: true },
    });
    if (cached?.cachedCodes?.length) return cached.cachedCodes;
    return this.buildUserPermissions(userId);
  }

  /** Grant extra permission to a specific user */
  async grantCustom(userId: string, permissionCode: string): Promise<string[]> {
    const perm = await this.prisma.permission.findUnique({
      where: { code: permissionCode },
    });
    if (!perm) throw new Error(`Permission '${permissionCode}' not found`);

    const up = await this.prisma.userPermission.upsert({
      where: { userId },
      update: {},
      create: { userId, cachedCodes: [] },
    });

    await this.prisma.userPermissionItem.upsert({
      where: {
        userPermissionId_permissionId: {
          userPermissionId: up.id,
          permissionId: perm.id,
        },
      },
      update: { granted: true },
      create: {
        userPermissionId: up.id,
        permissionId: perm.id,
        granted: true,
      },
    });

    return this.buildUserPermissions(userId);
  }

  /** Revoke permission from user (overrides role defaults) */
  async revokeCustom(userId: string, permissionCode: string): Promise<string[]> {
    const perm = await this.prisma.permission.findUnique({
      where: { code: permissionCode },
    });
    if (!perm) throw new Error(`Permission '${permissionCode}' not found`);

    const up = await this.prisma.userPermission.upsert({
      where: { userId },
      update: {},
      create: { userId, cachedCodes: [] },
    });

    await this.prisma.userPermissionItem.upsert({
      where: {
        userPermissionId_permissionId: {
          userPermissionId: up.id,
          permissionId: perm.id,
        },
      },
      update: { granted: false },
      create: {
        userPermissionId: up.id,
        permissionId: perm.id,
        granted: false,
      },
    });

    return this.buildUserPermissions(userId);
  }

  /** Delete a non-system permission */
  async deletePermission(id: string) {
    const perm = await this.prisma.permission.findUnique({ where: { id } });
    if (!perm) throw new Error('Permission not found');
    if (perm.isSystem) {
      throw new ForbiddenException('System permissions cannot be deleted');
    }
    return this.prisma.permission.delete({ where: { id } });
  }

  async findAll(module?: string) {
    return this.prisma.permission.findMany({
      where: module ? { module } : undefined,
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });
  }

  async getRoleDefaults() {
    const rolePerms = await this.prisma.rolePermission.findMany({
      include: { permission: { select: { code: true, module: true } } },
      orderBy: [{ role: 'asc' }],
    });

    const grouped: Record<string, string[]> = {};
    for (const rp of rolePerms) {
      if (!grouped[rp.role]) grouped[rp.role] = [];
      grouped[rp.role].push(rp.permission.code);
    }
    return grouped;
  }

  async getUserPermissions(userId: string) {
    const cachedCodes = await this.getCachedPermissions(userId);
    const customItems = await this.prisma.userPermissionItem.findMany({
      where: { userPermission: { userId } },
      include: { permission: { select: { code: true } } },
    });
    return {
      userId,
      permissions: cachedCodes,
      customOverrides: customItems.map((i) => ({
        code: i.permission.code,
        granted: i.granted,
      })),
    };
  }
}
