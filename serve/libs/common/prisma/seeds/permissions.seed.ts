import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from '../../generated/prisma/client';
import { getAllPermissionCodes } from '../../src/constants/permissions';

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter } as any);
}

// GroupPermission seed data - default permission groups for each role
const GROUP_PERMISSION_SEED = [
  {
    name: 'Root Default',
    description: 'Quyền mặc định cho Root - Toàn quyền hệ thống',
    isSystem: true,
    permissions: getAllPermissionCodes(), // All permissions
  },
  {
    name: 'Admin Default',
    description: 'Quyền mặc định cho Admin - Toàn quyền hệ thống',
    isSystem: true,
    permissions: getAllPermissionCodes(), // All permissions
  },
  {
    name: 'Staff Default',
    description: 'Quyền mặc định cho Staff - Quản lý nội dung và người dùng',
    isSystem: true,
    permissions: [
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
  },
  {
    name: 'Organizer Default',
    description: 'Quyền mặc định cho Organizer - Tổ chức giải đấu',
    isSystem: true,
    permissions: [
      'tournament:view', 'tournament:create', 'tournament:update',
      'match:view', 'match:create', 'match:update',
      'player:view', 'team:view', 'rating:view',
      'content:view', 'content:create',
    ],
  },
  {
    name: 'Creator Default',
    description: 'Quyền mặc định cho Creator - Tạo và quản lý nội dung',
    isSystem: true,
    permissions: [
      'tournament:view', 'match:view', 'player:view', 'team:view',
      'rating:view', 'content:view', 'content:create', 'content:manage',
    ],
  },
  {
    name: 'Partner Default',
    description: 'Quyền mặc định cho Partner - Xem thông tin',
    isSystem: true,
    permissions: [
      'tournament:view', 'match:view', 'player:view',
      'team:view', 'rating:view', 'content:view',
    ],
  },
  {
    name: 'Player Default',
    description: 'Quyền mặc định cho Player - Xem và đánh giá',
    isSystem: true,
    permissions: [
      'tournament:view', 'match:view', 'player:view', 'team:view',
      'rating:view', 'rating:create', 'points:view',
    ],
  },
  {
    name: 'User Default',
    description: 'Quyền mặc định cho User - Fan/người dùng thông thường',
    isSystem: true,
    permissions: [
      'tournament:view', 'match:view', 'player:view', 'team:view',
      'rating:view', 'rating:create', 'points:view',
    ],
  },
];

// Mapping role to group name
const ROLE_TO_GROUP: Record<UserRole, string> = {
  ROOT: 'Root Default',
  ADMIN: 'Admin Default',
  STAFF: 'Staff Default',
  ORGANIZER: 'Organizer Default',
  CREATOR: 'Creator Default',
  PARTNER: 'Partner Default',
  PLAYER: 'Player Default',
  USER: 'User Default',
};

export async function seedPermissions(externalClient?: PrismaClient) {
  const prisma = externalClient ?? createPrismaClient();
  const isStandalone = !externalClient;

  console.log('🔐 Seeding permission groups...');

  // Create GroupPermissions
  const groupMap = new Map<string, string>(); // name -> id

  for (const group of GROUP_PERMISSION_SEED) {
    const created = await prisma.groupPermission.upsert({
      where: { name: group.name },
      update: {
        description: group.description,
        permissions: group.permissions,
        isActive: true,
      },
      create: {
        name: group.name,
        description: group.description,
        isSystem: group.isSystem,
        isActive: true,
        permissions: group.permissions,
      },
    });
    groupMap.set(group.name, created.id);
    console.log(`  ✅ ${group.name}: ${group.permissions.length} permissions`);
  }

  // Assign default groups to existing users based on their roles
  const users = await prisma.user.findMany({
    select: { id: true, role: true },
  });

  for (const user of users) {
    // Create UserPermission if not exists
    await prisma.userPermission.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        cachedCodes: [],
        additionalPermissions: [],
      },
    });

    // Assign groups based on user roles
    for (const role of user.role) {
      const groupName = ROLE_TO_GROUP[role as UserRole];
      const groupId = groupMap.get(groupName);

      if (groupId) {
        await prisma.userGroupPermission.upsert({
          where: {
            userId_groupPermissionId: {
              userId: user.id,
              groupPermissionId: groupId,
            },
          },
          update: {},
          create: {
            userId: user.id,
            groupPermissionId: groupId,
          },
        });
      }
    }
  }

  console.log(`  ✅ Assigned groups to ${users.length} existing users`);
  console.log('🔐 Permission seed complete!');

  if (isStandalone) {
    await prisma.$disconnect();
  }
}

// Run directly if called as script
if (require.main === module) {
  seedPermissions()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
