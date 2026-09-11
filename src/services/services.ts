import { createClient } from '@/lib/supabase/client';
import type { ServiceRecord } from '@/types/database';

export const SERVICE_CATEGORIES = [
  'Bảo dưỡng xe',
  'Vệ sinh máy lạnh',
  'Cắt tóc & Spa',
  'Sửa điện thoại / Laptop',
  'Vệ sinh & Dọn dẹp nhà',
  'Khám sức khoẻ & Nha khoa',
  'Giặt hấp chăn rèm / Sofa',
  'Dịch vụ khác',
];

export async function getServiceRecords(
  userId: string,
  category?: string
): Promise<ServiceRecord[]> {
  const supabase = createClient();

  let query = supabase
    .from('service_history')
    .select('*')
    .eq('user_id', userId);

  if (category && category !== 'ALL') {
    query = query.eq('service_category', category);
  }

  query = query.order('service_date', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching service records:', error);
    return [];
  }

  return (data || []) as ServiceRecord[];
}

export async function createServiceRecord({
  userId,
  serviceCategory,
  title,
  serviceDate = new Date().toISOString().split('T')[0],
  cost = 0,
  providerName,
  providerPhone,
  providerAddress,
  rating,
  nextServiceRecommendedDate,
  notes,
  receiptFile,
}: {
  userId: string;
  serviceCategory: string;
  title: string;
  serviceDate?: string;
  cost: number;
  providerName?: string | null;
  providerPhone?: string | null;
  providerAddress?: string | null;
  rating?: number | null;
  nextServiceRecommendedDate?: string | null;
  notes?: string | null;
  receiptFile?: File | null;
}): Promise<ServiceRecord> {
  const supabase = createClient();
  let receiptUrl: string | null = null;

  if (receiptFile) {
    const fileExt = receiptFile.name.split('.').pop() || 'jpg';
    const filePath = `${userId}/services/${Date.now()}_receipt.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('book-images').upload(filePath, receiptFile, { upsert: false });
    if (!uploadError) {
      const { data: signed } = await supabase.storage.from('book-images').createSignedUrl(filePath, 60 * 60 * 24 * 30);
      receiptUrl = signed?.signedUrl || filePath;
    }
  }

  const payload = {
    user_id: userId,
    service_category: serviceCategory.trim(),
    title: title.trim(),
    service_date: serviceDate,
    cost,
    provider_name: providerName?.trim() || null,
    provider_phone: providerPhone?.trim() || null,
    provider_address: providerAddress?.trim() || null,
    rating: rating || null,
    next_service_recommended_date: nextServiceRecommendedDate || null,
    receipt_url: receiptUrl,
    notes: notes?.trim() || null,
  };

  const { data, error } = await supabase
    .from('service_history')
    .insert(payload as any)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Thêm lịch sử dịch vụ thất bại: ${error.message}`);
  }

  return data as ServiceRecord;
}

export async function deleteServiceRecord(recordId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('service_history').delete().eq('id', recordId);
  if (error) {
    throw new Error(`Xoá lịch sử dịch vụ thất bại: ${error.message}`);
  }
}

export interface ServiceStats {
  totalRecords: number;
  totalSpent: number;
  distinctProviders: number;
}

export async function getServiceStats(userId: string): Promise<ServiceStats> {
  const records = await getServiceRecords(userId);
  let totalSpent = 0;
  const providers = new Set<string>();

  records.forEach((r) => {
    totalSpent += Number(r.cost || 0);
    if (r.provider_name) providers.add(r.provider_name.toLowerCase());
  });

  return {
    totalRecords: records.length,
    totalSpent,
    distinctProviders: providers.size,
  };
}
