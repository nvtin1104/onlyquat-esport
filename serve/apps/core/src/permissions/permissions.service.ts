import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService, getAllPermissionCodes, isValidPermissionCode } from '@app/common';
import { UserRole } from '@app/common';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Build flattened permission array for a user.
   * Logic: ROOT users get all permissions, others get (group perms) + (additional perms)
   */
  async buildUserPermissions(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) throw new Error('User not found');

    // ROOT users bypass - return all permissions
    if (user.role.includes(UserRole.ROOT)) {
      return getAllPermissionCodes();
    }

    // 1. Fetch user's GroupPermissions
    const userGroups = await this.prisma.userGroupPermission.findMany({
      where: { userId },
      include: {
        groupPermission: {
          select: { permissions: true, isActive: true },
        },
      },
    });

    const basePerms = new Set<string>();
    for (const ug of userGroups) {
      if (ug.groupPermission.isActive) {
        ug.groupPermission.permissions.forEach((p) => basePerms.add(p));
      }
    }

    // 2. Add additional permissions from UserPermission
    const userPerm = await this.prisma.userPermission.findUnique({
      where: { userId },
      select: { additionalPermissions: true },
    });

    if (userPerm?.additionalPermissions) {
      userPerm.additionalPermissions.forEach((p) => basePerms.add(p));
    }

    // 3. Sort and cache
    const permArray = Array.from(basePerms).sort();

    await this.prisma.userPermission.upsert({
      where: { userId },
      update: { cachedCodes: permArray },
      create: { userId, cachedCodes: permArray, additionalPermissions: [] },
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
    if (!isValidPermissionCode(permissionCode)) {
      throw new BadRequestException(`Invalid permission code: ${permissionCode}`);
    }

    const userPerm = await this.prisma.userPermission.upsert({
      where: { userId },
      update: {},
      create: { userId, cachedCodes: [], additionalPermissions: [] },
    });

    const current = userPerm.additionalPermissions || [];
    if (!current.includes(permissionCode)) {
      await this.prisma.userPermission.update({
        where: { userId },
        data: { additionalPermissions: [...current, permissionCode] },
      });
    }

    return this.buildUserPermissions(userId);
  }

  /** Revoke permission from user (removes from additionalPermissions) */
  async revokeCustom(userId: string, permissionCode: string): Promise<string[]> {
    const userPerm = await this.prisma.userPermission.findUnique({
      where: { userId },
      select: { additionalPermissions: true },
    });

    if (userPerm?.additionalPermissions) {
      const updated = userPerm.additionalPermissions.filter(
        (p) => p !== permissionCode,
      );
      await this.prisma.userPermission.update({
        where: { userId },
        data: { additionalPermissions: updated },
      });
    }

    return this.buildUserPermissions(userId);
  }

  /** Create a new GroupPermission */
  async createGroupPermission(data: {
    name: string;
    description?: string;
    permissions: string[];
    isSystem?: boolean;
  }) {
    // Validate all permission codes
    const invalid = data.permissions.filter((p) => !isValidPermissionCode(p));
    if (invalid.length > 0) {
      throw new BadRequestException(
        `Invalid permission codes: ${invalid.join(', ')}`,
      );
    }

    return this.prisma.groupPermission.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissions,
        isSystem: data.isSystem || false,
        isActive: true,
      },
    });
  }

  /** Update a GroupPermission */
  async updateGroupPermission(
    id: string,
    data: {
      name?: string;
      description?: string;
      permissions?: string[];
      isActive?: boolean;
    },
  ) {
    const group = await this.prisma.groupPermission.findUnique({
      where: { id },
    });
    if (!group) throw new Error('GroupPermission not found');

    // Validate permission codes if provided
    if (data.permissions) {
      const invalid = data.permissions.filter((p) => !isValidPermissionCode(p));
      if (invalid.length > 0) {
        throw new BadRequestException(
          `Invalid permission codes: ${invalid.join(', ')}`,
        );
      }
    }

    return this.prisma.groupPermission.update({
      where: { id },
      data,
    });
  }

  /** Delete a non-system GroupPermission */
  async deleteGroupPermission(id: string) {
    const group = await this.prisma.groupPermission.findUnique({
      where: { id },
    });
    if (!group) throw new Error('GroupPermission not found');
    if (group.isSystem) {
      throw new ForbiddenException('System groups cannot be deleted');
    }
    return this.prisma.groupPermission.delete({ where: { id } });
  }

  /** Assign a GroupPermission to a user */
  async assignGroupToUser(userId: string, groupPermissionId: string) {
    // Verify group exists
    const group = await this.prisma.groupPermission.findUnique({
      where: { id: groupPermissionId },
    });
    if (!group) throw new Error('GroupPermission not found');

    // Create junction record (idempotent via unique constraint)
    await this.prisma.userGroupPermission.upsert({
      where: {
        userId_groupPermissionId: { userId, groupPermissionId },
      },
      update: {},
      create: { userId, groupPermissionId },
    });

    // Rebuild cached permissions
    return this.buildUserPermissions(userId);
  }

  /** Remove a GroupPermission from a user */
  async removeGroupFromUser(userId: string, groupPermissionId: string) {
    await this.prisma.userGroupPermission.deleteMany({
      where: { userId, groupPermissionId },
    });

    // Rebuild cached permissions
    return this.buildUserPermissions(userId);
  }

  /** List all GroupPermissions */
  async findAll(activeOnly = false) {
    return this.prisma.groupPermission.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  /** Get all default groups (system groups) */
  async getRoleDefaults() {
    const systemGroups = await this.prisma.groupPermission.findMany({
      where: { isSystem: true, isActive: true },
      select: { id: true, name: true, permissions: true },
    });

    return systemGroups.map((g) => ({
      id: g.id,
      name: g.name,
      permissions: g.permissions,
    }));
  }

  /** Find group by ID */
  async findGroupById(id: string) {
    const group = await this.prisma.groupPermission.findUnique({
      where: { id },
    });
    if (!group) throw new Error('GroupPermission not found');
    return group;
  }

  /** Get user's permissions with details */
  async getUserPermissions(userId: string) {
    const cachedCodes = await this.getCachedPermissions(userId);

    // Fetch user's groups
    const userGroups = await this.prisma.userGroupPermission.findMany({
      where: { userId },
      include: {
        groupPermission: {
          select: { id: true, name: true, permissions: true },
        },
      },
    });

    // Fetch additional permissions
    const userPerm = await this.prisma.userPermission.findUnique({
      where: { userId },
      select: { additionalPermissions: true },
    });

    return {
      userId,
      effectivePermissions: cachedCodes,
      groups: userGroups.map((ug) => ({
        id: ug.groupPermission.id,
        name: ug.groupPermission.name,
        permissions: ug.groupPermission.permissions,
      })),
      additionalPermissions: userPerm?.additionalPermissions || [],
    };
  }
}
