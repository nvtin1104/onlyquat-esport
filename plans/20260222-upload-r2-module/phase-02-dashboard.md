# Phase 2: Dashboard Implementation

## Step 1 -- Add TypeScript types

File: `dashboard/src/types/admin.ts`

Append:

```typescript
export interface AdminFileUpload {
  id: string;
  key: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  folder: string;
  uploadedById: string | null;
  createdAt: string;
}

export type UploadsListResponse = PaginatedResponse<AdminFileUpload>;
```

## Step 2 -- Create API layer

File: `dashboard/src/lib/uploads.api.ts` (new file)

Functions following `regions.api.ts` pattern:

```typescript
import { api } from './api';
import type { AdminFileUpload, UploadsListResponse } from '@/types/admin';

export interface GetUploadsParams {
  page?: number;
  limit?: number;
  folder?: string;
  mimeType?: string;
}

export async function getUploads(params: GetUploadsParams = {}): Promise<UploadsListResponse> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.folder) q.set('folder', params.folder);
  if (params.mimeType) q.set('mimeType', params.mimeType);
  const res = await api.get<UploadsListResponse>(`/uploads?${q.toString()}`);
  return res.data;
}

export async function uploadFile(file: File, folder?: string): Promise<AdminFileUpload> {
  const formData = new FormData();
  formData.append('file', file);
  const q = folder ? `?folder=${encodeURIComponent(folder)}` : '';
  const res = await api.post<AdminFileUpload>(`/uploads${q}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deleteUpload(id: string): Promise<void> {
  await api.delete(`/uploads/${id}`);
}
```

## Step 3 -- Create Zustand store

File: `dashboard/src/stores/uploadsStore.ts` (new file)

Following `regionsStore.ts` pattern:

State fields:
- `uploads: AdminFileUpload[]`, `total`, `page`, `limit`
- `isLoading`, `isUploading`, `error`
- Filter state: `folderFilter`, `mimeTypeFilter`

Actions:
- `fetchUploads(params?)` -- calls `getUploads`, updates state
- `upload(file: File, folder?: string)` -- calls `uploadFile`, prepends to list
- `removeUpload(id: string)` -- calls `deleteUpload`, removes from list
- `setPage(p)`, `setFolderFilter(f)`, `setMimeTypeFilter(m)`
- `clearError()`

## Step 4 -- Create uploads list page

File: `dashboard/src/pages/uploads/list.tsx` (new file)

UI composition:
- Page header: "Media" title + upload button
- Filter bar: folder dropdown, MIME type filter (images/docs/all), search by name
- Responsive table (`overflow-x-auto` wrapper) with columns:
  - Preview (thumbnail for images, icon for docs) -- `hidden sm:table-cell` on mobile
  - Original name
  - Folder
  - Size (formatted: KB/MB)
  - MIME type -- `hidden md:table-cell`
  - Created at -- `hidden md:table-cell`
  - Actions: copy URL button, delete button
- Pagination component from `src/components/ui/Pagination.tsx`
- Upload dialog/modal: file input with drag-and-drop, folder selector, preview before upload
- Delete confirmation via simple confirm or a small dialog
- Use `toast` from `sonner` for success/error notifications
- Icons from `lucide-react`: `Upload`, `Trash2`, `Copy`, `Image`, `File`

## Step 5 -- Add route

File: `dashboard/src/App.tsx`

Add import:

```typescript
import { UploadsPage } from './pages/uploads/list';
```

Add route inside the `<DashboardLayout>` block:

```tsx
<Route path="uploads" element={<UploadsPage />} />
```

## Step 6 -- Add sidebar entry

File: `dashboard/src/components/layout/Sidebar.tsx`

Add `ImageIcon` (or `Image`) to lucide-react imports.

Add to `navGroups` in the "He thong" group (last group), before "Cai dat":

```typescript
{ icon: Image, label: 'Media', to: '/uploads' },
```

## File Checklist

| File | Action |
|------|--------|
| `dashboard/src/types/admin.ts` | Add `AdminFileUpload` type |
| `dashboard/src/lib/uploads.api.ts` | New file |
| `dashboard/src/stores/uploadsStore.ts` | New file |
| `dashboard/src/pages/uploads/list.tsx` | New file |
| `dashboard/src/App.tsx` | Add `/uploads` route |
| `dashboard/src/components/layout/Sidebar.tsx` | Add Media nav item |
