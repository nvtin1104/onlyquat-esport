import { z } from 'zod';

export const groupPermissionSchema = z.object({
    name: z.string().min(3, 'Tên nhóm tối thiểu 3 ký tự').max(50, 'Tên nhóm tối đa 50 ký tự'),
    description: z.string().max(200, 'Mô tả tối đa 200 ký tự').optional(),
    permissions: z.array(z.string()).min(1, 'Chọn ít nhất 1 quyền'),
    isActive: z.boolean(),
});

export type GroupPermissionFormValues = z.infer<typeof groupPermissionSchema>;
