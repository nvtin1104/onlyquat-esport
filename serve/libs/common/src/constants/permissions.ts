// Permission definition with metadata
export interface PermissionDefinition {
  code: string;
  module: string;
  action: string;
  name: string;
  description: string;
}

export const PERMISSIONS = {
  // USER
  USER_VIEW: 'user:view',
  USER_VIEW_DETAIL: 'user:view-detail',
  USER_MANAGE: 'user:manage',
  USER_CREATE: 'user:create',
  USER_UPDATE_ROLE: 'user:update-role',
  USER_BAN: 'user:ban',
  USER_DELETE: 'user:delete',

  // TOURNAMENT
  TOURNAMENT_VIEW: 'tournament:view',
  TOURNAMENT_CREATE: 'tournament:create',
  TOURNAMENT_UPDATE: 'tournament:update',
  TOURNAMENT_DELETE: 'tournament:delete',
  TOURNAMENT_MANAGE: 'tournament:manage',

  // MATCH
  MATCH_VIEW: 'match:view',
  MATCH_CREATE: 'match:create',
  MATCH_UPDATE: 'match:update',
  MATCH_DELETE: 'match:delete',
  MATCH_MANAGE: 'match:manage',

  // PLAYER
  PLAYER_VIEW: 'player:view',
  PLAYER_CREATE: 'player:create',
  PLAYER_UPDATE: 'player:update',
  PLAYER_DELETE: 'player:delete',
  PLAYER_MANAGE: 'player:manage',

  // TEAM
  TEAM_VIEW: 'team:view',
  TEAM_CREATE: 'team:create',
  TEAM_UPDATE: 'team:update',
  TEAM_DELETE: 'team:delete',
  TEAM_MANAGE: 'team:manage',

  // RATING
  RATING_VIEW: 'rating:view',
  RATING_CREATE: 'rating:create',
  RATING_MODERATE: 'rating:moderate',
  RATING_DELETE: 'rating:delete',
  RATING_MANAGE: 'rating:manage',

  // POINTS
  POINTS_VIEW: 'points:view',
  POINTS_GRANT: 'points:grant',
  POINTS_MANAGE: 'points:manage',

  // CONTENT
  CONTENT_VIEW: 'content:view',
  CONTENT_CREATE: 'content:create',
  CONTENT_MANAGE: 'content:manage',

  // REGION
  REGION_VIEW: 'region:view',
  REGION_CREATE: 'region:create',
  REGION_UPDATE: 'region:update',
  REGION_DELETE: 'region:delete',
  REGION_MANAGE: 'region:manage',

  // ORGANIZATION
  ORGANIZATION_VIEW: 'organization:view',
  ORGANIZATION_CREATE: 'organization:create',
  ORGANIZATION_UPDATE: 'organization:update',
  ORGANIZATION_DELETE: 'organization:delete',
  ORGANIZATION_MANAGE: 'organization:manage',

  // SYSTEM
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_LOGS: 'system:logs',
  SYSTEM_PERMISSIONS: 'system:permissions',
  SYSTEM_MANAGE: 'system:manage',
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Permission metadata for validation and documentation
export const PERMISSION_METADATA: PermissionDefinition[] = [
  // USER
  { code: 'user:view', module: 'user', action: 'view', name: 'Xem danh sách người dùng', description: 'Xem danh sách toàn bộ user' },
  { code: 'user:view-detail', module: 'user', action: 'view-detail', name: 'Xem chi tiết người dùng', description: 'Xem thông tin chi tiết 1 user' },
  { code: 'user:manage', module: 'user', action: 'manage', name: 'Quản lý người dùng', description: 'Tạo, sửa, xoá user' },
  { code: 'user:create', module: 'user', action: 'create', name: 'Tạo người dùng', description: 'Tạo tài khoản user mới (admin)' },
  { code: 'user:update-role', module: 'user', action: 'update-role', name: 'Đổi vai trò người dùng', description: 'Thay đổi role của user' },
  { code: 'user:ban', module: 'user', action: 'ban', name: 'Cấm người dùng', description: 'Ban/unban user' },
  { code: 'user:delete', module: 'user', action: 'delete', name: 'Xoá người dùng', description: 'Xoá/vô hiệu hoá tài khoản user' },

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

  // REGION
  { code: 'region:view',   module: 'region', action: 'view',   name: 'Xem khu vực',            description: 'Xem danh sách khu vực' },
  { code: 'region:create', module: 'region', action: 'create', name: 'Tạo khu vực',             description: 'Tạo khu vực mới' },
  { code: 'region:update', module: 'region', action: 'update', name: 'Sửa khu vực',             description: 'Chỉnh sửa khu vực' },
  { code: 'region:delete', module: 'region', action: 'delete', name: 'Xoá khu vực',             description: 'Xoá khu vực' },
  { code: 'region:manage', module: 'region', action: 'manage', name: 'Quản lý khu vực (Full)',  description: 'Toàn quyền khu vực' },

  // ORGANIZATION
  { code: 'organization:view',   module: 'organization', action: 'view',   name: 'Xem tổ chức',            description: 'Xem danh sách tổ chức' },
  { code: 'organization:create', module: 'organization', action: 'create', name: 'Tạo tổ chức',             description: 'Tạo tổ chức mới' },
  { code: 'organization:update', module: 'organization', action: 'update', name: 'Sửa tổ chức',             description: 'Chỉnh sửa thông tin tổ chức' },
  { code: 'organization:delete', module: 'organization', action: 'delete', name: 'Xoá tổ chức',             description: 'Xoá tổ chức' },
  { code: 'organization:manage', module: 'organization', action: 'manage', name: 'Quản lý tổ chức (Full)',  description: 'Toàn quyền tổ chức' },

  // SYSTEM
  { code: 'system:settings', module: 'system', action: 'settings', name: 'Cấu hình hệ thống', description: 'Thay đổi settings' },
  { code: 'system:logs', module: 'system', action: 'logs', name: 'Xem logs', description: 'Xem nhật ký hệ thống' },
  { code: 'system:permissions', module: 'system', action: 'permissions', name: 'Quản lý quyền hạn', description: 'CRUD permissions' },
  { code: 'system:manage', module: 'system', action: 'manage', name: 'Quản lý hệ thống (Full)', description: 'Toàn quyền hệ thống (wildcard)' },
];

// Helper: Get all valid permission codes
export function getAllPermissionCodes(): string[] {
  return PERMISSION_METADATA.map((p) => p.code);
}

// Helper: Validate permission code exists
export function isValidPermissionCode(code: string): boolean {
  return PERMISSION_METADATA.some((p) => p.code === code);
}

// Helper: Get permission metadata by code
export function getPermissionMetadata(code: string): PermissionDefinition | undefined {
  return PERMISSION_METADATA.find((p) => p.code === code);
}

// Helper: Get all permissions for a module
export function getModulePermissions(module: string): PermissionDefinition[] {
  return PERMISSION_METADATA.filter((p) => p.module === module);
}
