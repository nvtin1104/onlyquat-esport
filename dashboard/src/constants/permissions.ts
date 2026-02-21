import type { PermissionDefinition } from '@/types/permissions';

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

    // SYSTEM
    { code: 'system:settings', module: 'system', action: 'settings', name: 'Cấu hình hệ thống', description: 'Thay đổi settings' },
    { code: 'system:logs', module: 'system', action: 'logs', name: 'Xem logs', description: 'Xem nhật ký hệ thống' },
    { code: 'system:permissions', module: 'system', action: 'permissions', name: 'Quản lý quyền hạn', description: 'CRUD permissions' },
    { code: 'system:manage', module: 'system', action: 'manage', name: 'Quản lý hệ thống (Full)', description: 'Toàn quyền hệ thống (wildcard)' },
];

export const PERMISSION_MODULES = [
    { id: 'user', name: 'Người dùng' },
    { id: 'tournament', name: 'Giải đấu' },
    { id: 'match', name: 'Trận đấu' },
    { id: 'player', name: 'Tuyển thủ' },
    { id: 'team', name: 'Đội tuyển' },
    { id: 'rating', name: 'Đánh giá' },
    { id: 'points', name: 'Điểm thưởng' },
    { id: 'content', name: 'Nội dung' },
    { id: 'system', name: 'Hệ thống' },
];
