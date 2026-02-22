import { api } from './api';
import type { AdminFileUpload, FileUploadsListResponse } from '@/types/admin';

export interface GetUploadsParams {
  page?: number;
  limit?: number;
  folder?: string;
}

export async function getUploads(params: GetUploadsParams = {}): Promise<FileUploadsListResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.folder) query.set('folder', params.folder);
  const res = await api.get<FileUploadsListResponse>(`/uploads?${query.toString()}`);
  return res.data;
}

export async function uploadFile(file: File, folder?: string): Promise<AdminFileUpload> {
  const form = new FormData();
  form.append('file', file);
  const url = folder ? `/uploads?folder=${folder}` : '/uploads';
  const res = await api.post<AdminFileUpload>(url, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deleteUpload(id: string): Promise<{ message: string }> {
  const res = await api.delete<{ message: string }>(`/uploads/${id}`);
  return res.data;
}
