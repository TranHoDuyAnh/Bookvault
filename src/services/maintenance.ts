import { createClient } from '@/lib/supabase/client';
import type { HomeMaintenanceRecord, MaintenanceStatus } from '@/types/database';

export interface MaintenanceFilters {
  category?: string;
  status?: MaintenanceStatus | 'ALL';
  search?: string;
}

export async function getMaintenanceRecords(
  userId: string,
  filters: MaintenanceFilters = {}
): Promise<HomeMaintenanceRecord[]> {
  const supabase = createClient();

  let query = supabase
    .from('home_maintenance_records')
    .select('*')
    .eq('user_id', userId);

  if (filters.category && filters.category !== 'ALL') {
    query = query.eq('category', filters.category);
  }

  if (filters.status && filters.status !== 'ALL') {
    query = query.eq('status', filters.status);
  }

  if (filters.search && filters.search.trim()) {
    const term = filters.search.trim();
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,contractor_name.ilike.%${term}%`);
  }

  query = query.order('performed_date', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching maintenance records:', error);
    return [];
  }

  return (data || []) as HomeMaintenanceRecord[];
}

export async function createMaintenanceRecord({
  userId,
  category = 'Điện nước',
  title,
  description,
  cost = 0,
  performedDate = new Date().toISOString().split('T')[0],
  contractorName,
  contractorPhone,
  warrantyUntil,
  status = 'COMPLETED',
  notes,
  beforeImageFile,
  afterImageFile,
}: {
  userId: string;
  category: string;
  title: string;
  description?: string | null;
  cost: number;
  performedDate?: string;
  contractorName?: string | null;
  contractorPhone?: string | null;
  warrantyUntil?: string | null;
  status?: MaintenanceStatus;
  notes?: string | null;
  beforeImageFile?: File | null;
  afterImageFile?: File | null;
}): Promise<HomeMaintenanceRecord> {
  const supabase = createClient();
  let beforeUrl: string | null = null;
  let afterUrl: string | null = null;

  if (beforeImageFile) {
    const fileExt = beforeImageFile.name.split('.').pop() || 'jpg';
    const filePath = `${userId}/maintenance/before_${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('book-images').upload(filePath, beforeImageFile, { upsert: false });
    if (!error) {
      const { data: signed } = await supabase.storage.from('book-images').createSignedUrl(filePath, 60 * 60 * 24 * 30);
      beforeUrl = signed?.signedUrl || filePath;
    }
  }

  if (afterImageFile) {
    const fileExt = afterImageFile.name.split('.').pop() || 'jpg';
    const filePath = `${userId}/maintenance/after_${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('book-images').upload(filePath, afterImageFile, { upsert: false });
    if (!error) {
      const { data: signed } = await supabase.storage.from('book-images').createSignedUrl(filePath, 60 * 60 * 24 * 30);
      afterUrl = signed?.signedUrl || filePath;
    }
  }

  const payload = {
    user_id: userId,
    category,
    title: title.trim(),
    description: description?.trim() || null,
    cost,
    performed_date: performedDate,
    contractor_name: contractorName?.trim() || null,
    contractor_phone: contractorPhone?.trim() || null,
    warranty_until: warrantyUntil || null,
    status,
    before_image_url: beforeUrl,
    after_image_url: afterUrl,
    notes: notes?.trim() || null,
  };

  const { data, error } = await supabase
    .from('home_maintenance_records')
    .insert(payload as any)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Thêm nhật ký sửa chữa thất bại: ${error.message}`);
  }

  return data as HomeMaintenanceRecord;
}

export async function updateMaintenanceRecord(
  recordId: string,
  updates: Partial<HomeMaintenanceRecord>
): Promise<HomeMaintenanceRecord> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('home_maintenance_records')
    .update(updates as any)
    .eq('id', recordId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Cập nhật nhật ký thất bại: ${error.message}`);
  }

  return data as HomeMaintenanceRecord;
}

export async function deleteMaintenanceRecord(recordId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('home_maintenance_records').delete().eq('id', recordId);
  if (error) {
    throw new Error(`Xoá nhật ký thất bại: ${error.message}`);
  }
}

export interface MaintenanceStats {
  totalRecords: number;
  totalCost: number;
  activeWarrantyCount: number;
}

export async function getMaintenanceStats(userId: string): Promise<MaintenanceStats> {
  const records = await getMaintenanceRecords(userId);
  const today = new Date();
  let totalCost = 0;
  let activeW = 0;

  records.forEach((r) => {
    totalCost += Number(r.cost || 0);
    if (r.warranty_until && new Date(r.warranty_until) >= today) {
      activeW++;
    }
  });

  return {
    totalRecords: records.length,
    totalCost,
    activeWarrantyCount: activeW,
  };
}
