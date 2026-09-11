import { createClient } from '@/lib/supabase/client';
import type { UtilityBill, UtilityType } from '@/types/database';

export interface UtilityFilters {
  utilityType?: UtilityType | 'ALL';
  isPaid?: boolean | 'ALL';
  billingPeriod?: string;
}

export async function getUtilityBills(
  userId: string,
  filters: UtilityFilters = {}
): Promise<UtilityBill[]> {
  const supabase = createClient();

  let query = supabase
    .from('utility_bills')
    .select('*')
    .eq('user_id', userId);

  if (filters.utilityType && filters.utilityType !== 'ALL') {
    query = query.eq('utility_type', filters.utilityType);
  }

  if (filters.isPaid !== undefined && filters.isPaid !== 'ALL') {
    query = query.eq('is_paid', filters.isPaid);
  }

  if (filters.billingPeriod) {
    query = query.eq('billing_period', filters.billingPeriod);
  }

  query = query.order('due_date', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching utility bills:', error);
    return [];
  }

  return (data || []) as UtilityBill[];
}

export async function createUtilityBill({
  userId,
  utilityType = 'ELECTRICITY',
  title,
  billingPeriod,
  dueDate,
  amount,
  meterReading,
  isPaid = false,
  paidAt,
  notes,
  receiptFile,
}: {
  userId: string;
  utilityType?: UtilityType;
  title: string;
  billingPeriod: string;
  dueDate: string;
  amount: number;
  meterReading?: string | null;
  isPaid?: boolean;
  paidAt?: string | null;
  notes?: string | null;
  receiptFile?: File | null;
}): Promise<UtilityBill> {
  const supabase = createClient();
  let receiptUrl: string | null = null;

  if (receiptFile) {
    const fileExt = receiptFile.name.split('.').pop() || 'jpg';
    const filePath = `${userId}/utilities/${Date.now()}_bill.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('book-images').upload(filePath, receiptFile, { upsert: false });
    if (!uploadError) {
      const { data: signed } = await supabase.storage.from('book-images').createSignedUrl(filePath, 60 * 60 * 24 * 30);
      receiptUrl = signed?.signedUrl || filePath;
    }
  }

  const payload = {
    user_id: userId,
    utility_type: utilityType,
    title: title.trim(),
    billing_period: billingPeriod.trim(),
    due_date: dueDate,
    amount,
    meter_reading: meterReading?.trim() || null,
    is_paid: isPaid,
    paid_at: isPaid ? paidAt || new Date().toISOString().split('T')[0] : null,
    receipt_url: receiptUrl,
    notes: notes?.trim() || null,
  };

  const { data, error } = await supabase
    .from('utility_bills')
    .insert(payload as any)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Thêm hoá đơn thất bại: ${error.message}`);
  }

  return data as UtilityBill;
}

export async function toggleUtilityPaid(
  billId: string,
  isPaid: boolean
): Promise<UtilityBill> {
  const supabase = createClient();
  const paidAt = isPaid ? new Date().toISOString().split('T')[0] : null;

  const { data, error } = await supabase
    .from('utility_bills')
    .update({
      is_paid: isPaid,
      paid_at: paidAt,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', billId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Cập nhật trạng thái hoá đơn thất bại: ${error.message}`);
  }

  return data as UtilityBill;
}

export async function updateUtilityBill(
  billId: string,
  updates: Partial<UtilityBill>
): Promise<UtilityBill> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('utility_bills')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', billId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Cập nhật hoá đơn thất bại: ${error.message}`);
  }

  return data as UtilityBill;
}

export async function deleteUtilityBill(billId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('utility_bills').delete().eq('id', billId);
  if (error) {
    throw new Error(`Xoá hoá đơn thất bại: ${error.message}`);
  }
}

export interface UtilityStats {
  totalBills: number;
  unpaidCount: number;
  unpaidTotalAmount: number;
  totalSpentThisMonth: number;
}

export async function getUtilityStats(userId: string): Promise<UtilityStats> {
  const bills = await getUtilityBills(userId);
  let unpaidCount = 0;
  let unpaidAmount = 0;
  let totalSpent = 0;

  bills.forEach((b) => {
    if (!b.is_paid) {
      unpaidCount++;
      unpaidAmount += Number(b.amount || 0);
    } else {
      totalSpent += Number(b.amount || 0);
    }
  });

  return {
    totalBills: bills.length,
    unpaidCount,
    unpaidTotalAmount: unpaidAmount,
    totalSpentThisMonth: totalSpent,
  };
}
