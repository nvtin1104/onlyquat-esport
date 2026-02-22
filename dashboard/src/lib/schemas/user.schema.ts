import { z } from 'zod';
import type { UserRole } from '@/types/admin';

export const PUBLIC_ROLES: { value: UserRole; label: string; hint: string }[] = [
    { value: 'ORGANIZER', label: 'Organizer', hint: 'Tổ chức giải đấu' },
    { value: 'CREATOR', label: 'Creator', hint: 'Nhà sáng tạo nội dung' },
    { value: 'PARTNER', label: 'Partner', hint: 'Đối tác' },
    { value: 'PLAYER', label: 'Player', hint: 'Tuyển thủ (được claim profile)' },
    { value: 'USER', label: 'User', hint: 'Người dùng thông thường' },
];

export const ADMIN_ROLES: { value: UserRole; label: string; hint: string }[] = [
    { value: 'ROOT', label: 'Root', hint: 'Toàn quyền hệ thống' },
    { value: 'ADMIN', label: 'Admin', hint: 'Quản trị toàn hệ thống' },
    { value: 'STAFF', label: 'Staff', hint: 'Nhân viên' },
];

const ALL_ROLES = [...PUBLIC_ROLES, ...ADMIN_ROLES].map((r) => r.value) as [UserRole, ...UserRole[]];

// ── Create User (Admin) ────────────────────────────────────────────────────────
export const createUserSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    username: z
        .string()
        .min(3, 'Username tối thiểu 3 ký tự')
        .max(32, 'Username tối đa 32 ký tự')
        .regex(/^[a-zA-Z0-9_]+$/, 'Chỉ được dùng chữ cái, số và dấu _'),
    password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
    name: z.string().max(64, 'Tên tối đa 64 ký tự').optional().or(z.literal('')),
    roles: z.array(z.enum(ALL_ROLES)).min(1, 'Phải chọn ít nhất 1 role'),
    accountType: z.union([z.literal(0), z.literal(1)]),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

// ── Update Role ────────────────────────────────────────────────────────────────
export const updateRoleSchema = z.object({
    roles: z
        .array(z.enum(ALL_ROLES))
        .min(1, 'Phải chọn ít nhất 1 role'),
});

export type UpdateRoleFormValues = z.infer<typeof updateRoleSchema>;

// ── Ban Reason ─────────────────────────────────────────────────────────────────
export const banUserSchema = z.object({
    reason: z.string().min(1, 'Vui lòng nhập lý do').max(200, 'Tối đa 200 ký tự'),
});

export type BanUserFormValues = z.infer<typeof banUserSchema>;
