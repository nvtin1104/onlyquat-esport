# Dashboard Scout Report - 260222

Key files found in dashboard/src/:

1. App.tsx - Router config
2. Sidebar.tsx - Navigation menu
3. DashboardLayout.tsx - Layout wrapper
4. usersStore.ts - Zustand store pattern
5. users.api.ts - API layer pattern
6. admin.ts - Types/interfaces
7. Pages: users (list, create, detail)
8. Components: Table, Pagination, Button, Input, Select, Dialog
9. Shared: PageHeader, SearchInput, EmptyState


## Detailed Scout Report - Dashboard Structure

### 1. Sidebar Navigation (/dashboard/src/components/layout/Sidebar.tsx)
- NavGroups array: 4 groups (Overview, Competitions, Activities, System)
- Thi Dau group contains: Teams, Players, Matches
- System group has nested User submenu with: User List, Create User, Permissions, Permission Groups
- Features: Collapsible groups, badges for counts, responsive collapse
- To add organization/region: Add items to Thi Dau group

### 2. Router Setup (/dashboard/src/App.tsx)
- Pattern: ProtectedRoute > DashboardLayout > page via Outlet
- Dynamic params with :id for detail/edit routes
- Separate routes for create (new) and edit

### 3. Users Page - Reference Pattern (/pages/users/)
Files:
- list.tsx - pagination table with filters
- create.tsx - form with react-hook-form + Zod validation
- detail.tsx - detail view
- components/UsersTable.tsx - reusable table
- components/ChangeRoleDialog.tsx, BanUserDialog.tsx - modals

List page structure:
1. PageHeader with create button
2. Error banner
3. Filters: SearchInput + Select dropdowns + Refresh
4. Table or loading state
5. Pagination

### 4. Zustand Store Pattern (/stores/usersStore.ts)
State: users[], total, page, limit, selectedUser, isLoading, isSubmitting, error, filters
Actions: fetchUsers, fetchUserById, createUser, updateRole, toggleBan, removeUser, setters
Pattern: Set loading flag, await API, set data, catch errors with message extraction

### 5. API Layer Pattern (/lib/users.api.ts, /lib/api.ts)
- api instance: axios with BASE_URL, bearer token interceptor, 401 refresh queue
- Resource functions: getUsers, getUserById, adminCreateUser, updateUserRole, banUser, deleteUser
- Use URLSearchParams for query params
- Return typed responses

### 6. Types (/types/admin.ts)
- AdminUser: id, email, username, name, role[], status, accountType, createdAt, updatedAt
- PaginatedResponse<T>: data[], meta{ total, page, limit, totalPages }
- Enums: UserRole, UserStatus, etc

### 7. UI Components Available
Core:
- Table (TableHeader, TableBody, TableRow, TableHead, TableCell)
- Pagination (smart page numbers with dots)
- Button (variants: primary|secondary|ghost|destructive|outline, sizes: sm|md|lg|icon)
- Input, Select, Textarea, Checkbox, Switch
- Dialog, DropdownMenu

Shared:
- PageHeader (title, description, actions)
- SearchInput (debounced 300ms)
- EmptyState (icon, title, description, action)
- StatusBadge, TierBadge, GameBadge, Avatar, Badge
- ConfirmDialog

### 8. Form/Schema Pattern (/lib/schemas/user.schema.ts)
- Define role options array with value, label, hint
- Create Zod schema with Vietnamese messages
- Export inferred types
- Use Controller for complex fields (multiselect, conditional)

### 9. Layout (/components/layout/DashboardLayout.tsx)
- Flex layout: sidebar + (header + main)
- Desktop sidebar: hidden lg:flex w-64/w-16
- Mobile sidebar: lg:hidden overlay with backdrop
- Main: flex-1 overflow-y-auto with Outlet

---

## Implementation Template for Organization/Region

### Step 1: Create Types (admin.ts)
```
AdminOrganization interface
AdminRegion interface
OrganizationType enum
OrganizationStatus enum
```

### Step 2: Create Schemas
- organization.schema.ts with create/update/delete schemas
- region.schema.ts with create/update/delete schemas

### Step 3: Create API Layer
- organizations.api.ts with CRUD functions
- regions.api.ts with CRUD functions

### Step 4: Create Stores
- organizationsStore.ts following usersStore pattern
- regionsStore.ts following usersStore pattern

### Step 5: Create Pages
Create /pages/organizations/ with:
- list.tsx (page with table, filters, pagination)
- create.tsx (form page)
- detail.tsx (detail view/edit)
- components/OrganizationsTable.tsx
- components/OrganizationForm.tsx
- components/delete/edit dialogs

Repeat for /pages/regions/

### Step 6: Update Router (App.tsx)
8 new routes:
- /organizations, /organizations/create, /organizations/:id, /organizations/:id/edit
- /regions, /regions/create, /regions/:id, /regions/:id/edit

### Step 7: Update Sidebar (Sidebar.tsx)
Add to Thi Dau group:
- Building2 icon + "Tổ chức" + /organizations
- Globe icon + "Khu vực" + /regions

---

## Key Files - Absolute Paths

App.tsx:                          /c/project/onlyquat-esport/dashboard/src/App.tsx
Sidebar.tsx:                      /c/project/onlyquat-esport/dashboard/src/components/layout/Sidebar.tsx
DashboardLayout.tsx:              /c/project/onlyquat-esport/dashboard/src/components/layout/DashboardLayout.tsx
usersStore.ts:                    /c/project/onlyquat-esport/dashboard/src/stores/usersStore.ts
api.ts:                           /c/project/onlyquat-esport/dashboard/src/lib/api.ts
users.api.ts:                     /c/project/onlyquat-esport/dashboard/src/lib/users.api.ts
admin.ts types:                   /c/project/onlyquat-esport/dashboard/src/types/admin.ts
user.schema.ts:                   /c/project/onlyquat-esport/dashboard/src/lib/schemas/user.schema.ts
Users list page:                  /c/project/onlyquat-esport/dashboard/src/pages/users/list.tsx
Users create page:                /c/project/onlyquat-esport/dashboard/src/pages/users/create.tsx
Users detail page:                /c/project/onlyquat-esport/dashboard/src/pages/users/detail.tsx
UsersTable component:             /c/project/onlyquat-esport/dashboard/src/pages/users/components/UsersTable.tsx
Table component:                  /c/project/onlyquat-esport/dashboard/src/components/ui/Table.tsx
Pagination component:             /c/project/onlyquat-esport/dashboard/src/components/ui/Pagination.tsx
Button component:                 /c/project/onlyquat-esport/dashboard/src/components/ui/Button.tsx
Input component:                  /c/project/onlyquat-esport/dashboard/src/components/ui/Input.tsx
Select component:                 /c/project/onlyquat-esport/dashboard/src/components/ui/Select.tsx
Dialog component:                 /c/project/onlyquat-esport/dashboard/src/components/ui/Dialog.tsx
DropdownMenu component:           /c/project/onlyquat-esport/dashboard/src/components/ui/DropdownMenu.tsx
Badge component:                  /c/project/onlyquat-esport/dashboard/src/components/ui/Badge.tsx
Avatar component:                 /c/project/onlyquat-esport/dashboard/src/components/ui/Avatar.tsx
PageHeader component:             /c/project/onlyquat-esport/dashboard/src/components/shared/PageHeader.tsx
SearchInput component:            /c/project/onlyquat-esport/dashboard/src/components/shared/SearchInput.tsx
EmptyState component:             /c/project/onlyquat-esport/dashboard/src/components/shared/EmptyState.tsx
ConfirmDialog component:          /c/project/onlyquat-esport/dashboard/src/components/shared/ConfirmDialog.tsx
StatusBadge component:            /c/project/onlyquat-esport/dashboard/src/components/shared/StatusBadge.tsx

---

Generated: 2026-02-22
Scout completed all requested sections.

