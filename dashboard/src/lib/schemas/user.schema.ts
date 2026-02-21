import { z } from 'zod';
import type { UserRole } from '@/types/admin';

const USER_ROLES: [UserRole, ...UserRole[]] = ['ROOT', 'ADMIN', 'STAFF', 'USER'];

// ── Create User (Admin) ────────────────────────────────────────────────────────
export const createUserSchema = z
    .object({
        email: z.string().email('Email không hợp lệ'),
        username: z
            .string()
            .min(3, 'Username tối thiểu 3 ký tự')
            .max(32, 'Username tối đa 32 ký tự')
            .regex(/^[a-zA-Z0-9_]+$/, 'Chỉ được dùng chữ cái, số và dấu _'),
        password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
        confirmPassword: z.string(),
        name: z.string().max(64, 'Tên tối đa 64 ký tự').optional().or(z.literal('')),
        roles: z
            .array(z.enum(USER_ROLES))
            .min(1, 'Phải chọn ít nhất 1 role'),
        accountType: z.union([z.literal(0), z.literal(1)]),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Mật khẩu không khớp',
        path: ['confirmPassword'],
    });

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

// ── Update Role ────────────────────────────────────────────────────────────────
export const updateRoleSchema = z.object({
    roles: z
        .array(z.enum(USER_ROLES))
        .min(1, 'Phải chọn ít nhất 1 role'),
});

export type UpdateRoleFormValues = z.infer<typeof updateRoleSchema>;

// ── Ban Reason ─────────────────────────────────────────────────────────────────
export const banUserSchema = z.object({
    reason: z.string().min(1, 'Vui lòng nhập lý do').max(200, 'Tối đa 200 ký tự'),
});

export type BanUserFormValues = z.infer<typeof banUserSchema>;
