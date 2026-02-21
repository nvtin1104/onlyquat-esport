import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from '../../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

const PERMISSION_SEED = [
  // USER
  { code: 'user:view', module: 'user', action: 'view', name: 'Xem danh sách người dùng', description: 'Xem danh sách toàn bộ user' },
  { code: 'user:view-detail', module: 'user', action: 'view-detail', name: 'Xem chi tiết người dùng', description: 'Xem thông tin chi tiết 1 user' },
  { code: 'user:manage', module: 'user', action: 'manage', name: 'Quản lý người dùng', description: 'Tạo, sửa, xoá user' },
  { code: 'user:update-role', module: 'user', action: 'update-role', name: 'Đổi vai trò người dùng', description: 'Thay đổi role của user' },
  { code: 'user:ban', module: 'user', action: 'ban', name: 'Cấm người dùng', description: 'Ban/unban user' },
  // TOURNAMENT
  { code: 'tournament:view', module: 'tournament', action: 'view', name: 'Xem giải đấu', description: 'Xem danh sách giải đấu' },
  { code: 'tournament:create', module: 'tournament', action: 'create', name: 'Tạo giải đấu', description: 'Tạo giải đấu mới' },
  { code: 'tournament:update', module: 'tournament', action: 'update', name: 'Sửa giải đấu', description: 'Chỉnh sửa giải đấu' },
  { code: 'tournament:delete', module: 'tournament', action: 'delete', name: 'Xoá giải đấu', description: 'Xoá giải đấu' },
  { code: 'tournament:manage', module: 'tournament', action: 'manage', name: 'Quản lý giải đấu (Full)', description: 'Toàn quyền giải đấu' },
  // MATCH
  { code: 'match:view', module: 'match', action: 'view', name: 'Xem trận đấu', description: 'Xem danh sách trận đấu' },
  { code: 'match:create', module: 'match', action: 'create', name: 'Tạo trận đấu', description: 'Tạo trận đấu mới' },
  { code: 'match:update', module: 'match', action: 'update', name: 'Cập nhật trận đấu', description: 'Cập nhật kết quả trận' },
  { code: 'match:delete', module: 'match', action: 'delete', name: 'Xoá trận đấu', description: 'Xoá trận đấu' },
  { code: 'match:manage', module: 'match', action: 'manage', name: 'Quản lý trận đấu (Full)', description: 'Toàn quyền trận đấu' },
  // PLAYER
  { code: 'player:view', module: 'player', action: 'view', name: 'Xem tuyển thủ', description: 'Xem danh sách tuyển thủ' },
  { code: 'player:create', module: 'player', action: 'create', name: 'Thêm tuyển thủ', description: 'Thêm tuyển thủ mới' },
  { code: 'player:update', module: 'player', action: 'update', name: 'Sửa tuyển thủ', description: 'Chỉnh sửa tuyển thủ' },
  { code: 'player:delete', module: 'player', action: 'delete', name: 'Xoá tuyển thủ', description: 'Xoá tuyển thủ' },
  { code: 'player:manage', module: 'player', action: 'manage', name: 'Quản lý tuyển thủ (Full)', description: 'Toàn quyền tuyển thủ' },
  // TEAM
  { code: 'team:view', module: 'team', action: 'view', name: 'Xem đội tuyển', description: 'Xem danh sách đội' },
  { code: 'team:create', module: 'team', action: 'create', name: 'Tạo đội tuyển', description: 'Tạo đội mới' },
  { code: 'team:update', module: 'team', action: 'update', name: 'Sửa đội tuyển', description: 'Chỉnh sửa đội' },
  { code: 'team:delete', module: 'team', action: 'delete', name: 'Xoá đội tuyển', description: 'Xoá đội' },
  { code: 'team:manage', module: 'team', action: 'manage', name: 'Quản lý đội tuyển (Full)', description: 'Toàn quyền đội tuyển' },
  // RATING
  { code: 'rating:view', module: 'rating', action: 'view', name: 'Xem đánh giá', description: 'Xem danh sách đánh giá' },
  { code: 'rating:create', module: 'rating', action: 'create', name: 'Gửi đánh giá', description: 'Gửi đánh giá tuyển thủ' },
  { code: 'rating:moderate', module: 'rating', action: 'moderate', name: 'Duyệt đánh giá', description: 'Duyệt/từ chối đánh giá' },
  { code: 'rating:delete', module: 'rating', action: 'delete', name: 'Xoá đánh giá', description: 'Xoá đánh giá' },
  { code: 'rating:manage', module: 'rating', action: 'manage', name: 'Quản lý đánh giá (Full)', description: 'Toàn quyền đánh giá' },
  // POINTS
  { code: 'points:view', module: 'points', action: 'view', name: 'Xem điểm thưởng', description: 'Xem lịch sử điểm' },
  { code: 'points:grant', module: 'points', action: 'grant', name: 'Tặng điểm', description: 'Tặng điểm cho user' },
  { code: 'points:manage', module: 'points', action: 'manage', name: 'Quản lý điểm (Full)', description: 'Toàn quyền điểm thưởng' },
  // CONTENT
  { code: 'content:view', module: 'content', action: 'view', name: 'Xem nội dung', description: 'Xem bài viết, tin tức' },
  { code: 'content:create', module: 'content', action: 'create', name: 'Tạo nội dung', description: 'Tạo bài viết mới' },
  { code: 'content:manage', module: 'content', action: 'manage', name: 'Quản lý nội dung (Full)', description: 'Toàn quyền nội dung' },
  // SYSTEM
  { code: 'system:settings', module: 'system', action: 'settings', name: 'Cấu hình hệ thống', description: 'Thay đổi settings' },
  { code: 'system:logs', module: 'system', action: 'logs', name: 'Xem logs', description: 'Xem nhật ký hệ thống' },
  { code: 'system:permissions', module: 'system', action: 'permissions', name: 'Quản lý quyền hạn', description: 'CRUD permissions' },
  { code: 'system:manage', module: 'system', action: 'manage', name: 'Quản lý hệ thống (Full)', description: 'Toàn quyền hệ thống (wildcard)' },
];

const ROLE_DEFAULTS: Record<string, string[]> = {
  ADMIN: ['*'],
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

  for (const p of PERMISSION_SEED) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: { module: p.module, action: p.action, name: p.name, description: p.description },
      create: { ...p, isSystem: true },
    });
  }
  console.log(`  ✅ ${PERMISSION_SEED.length} permissions seeded`);

  const allPerms = await prisma.permission.findMany();
  const permMap = new Map(allPerms.map((p) => [p.code, p.id]));

  for (const [role, codes] of Object.entries(ROLE_DEFAULTS)) {
    const resolved = codes.includes('*') ? allPerms.map((p) => p.code) : codes;

    for (const code of resolved) {
      const permId = permMap.get(code);
      if (!permId) continue;

      await prisma.rolePermission.upsert({
        where: {
          role_permissionId: { role: role as UserRole, permissionId: permId },
        },
        update: {},
        create: { role: role as UserRole, permissionId: permId },
      });
    }
    console.log(`  ✅ ${role}: ${resolved.length} permissions`);
  }

  console.log('🔐 Permission seed complete!');
}

// Run directly if called as script
if (require.main === module) {
  seedPermissions()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
