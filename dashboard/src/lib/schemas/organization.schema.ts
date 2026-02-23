import { z } from 'zod';
import type { OrganizationType } from '@/types/admin';

export const updateOrganizationSchema = z.object({
    name: z.string().min(1, 'Tên tổ chức không được để trống'),
    shortName: z.string().optional(),
    logo: z.string().optional(),
    website: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
    description: z.string().optional(),
    descriptionI18n: z
        .object({
            en: z.string().optional(),
            vi: z.string().optional(),
        })
        .optional(),
    roles: z.array(z.string()).min(1, 'Chọn ít nhất một vai trò'),
    regionId: z.string().optional(),
    ownerId: z.string().min(1, 'Chủ sở hữu không được để trống'),
    managerId: z.string().nullable().optional(),
});

export type UpdateOrganizationFormData = z.infer<typeof updateOrganizationSchema> & {
    roles: unknown; // override the generic string to OrganizationType later if needed
};
