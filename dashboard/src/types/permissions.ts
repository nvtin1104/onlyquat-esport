export interface GroupPermission {
    id: string;
    name: string;
    description: string | null;
    isSystem: boolean;
    isActive: boolean;
    permissions: string[];
    createdAt: string;
    updatedAt: string;
}

export interface UserPermissionsResponse {
    userId: string;
    effectivePermissions: string[];
    groups: {
        id: string;
        name: string;
        permissions: string[];
    }[];
    additionalPermissions: string[];
}

export interface PermissionDefinition {
    code: string;
    module: string;
    action: string;
    name: string;
    description: string;
}

export interface RoleDefaultsResponse {
    id: string;
    name: string;
    permissions: string[];
}
