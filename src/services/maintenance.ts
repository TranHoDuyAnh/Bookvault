import { createClient } from '@/lib/supabase/client';
import { computeNextDueDate, toISODate } from '@/lib/maintenance';
import type {
  MaintenanceCategory,
  MaintenanceIntervalUnit,
  MaintenanceItem,
  MaintenanceLog,
  MaintenanceRecurrenceMode,
} from '@/types/database';

export interface CreateMaintenanceItemInput {
  user_id: string;
  title: string;
  category: MaintenanceCategory;
  recurrence_mode: MaintenanceRecurrenceMode;
  interval_value: number;
  interval_unit: MaintenanceIntervalUnit;
  remind_before_days: number;
  last_done_at?: string | null;
  next_due_at: string;
  vehicle_name?: string | null;
  interval_km?: number | null;
  last_odo?: number | null;
  current_odo?: number | null;
  estimated_cost?: number | null;
  provider_name?: string | null;
  provider_contact?: string | null;
  auto_renew?: boolean;
  notes?: string | null;
  is_active?: boolean;
}

export async function getMaintenanceItems(userId: string): Promise<MaintenanceItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('maintenance_items')
    .select('*')
    .eq('user_id', userId)
    .order('next_due_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as MaintenanceItem[];
}

export async function getMaintenanceLogs(
  userId: string,
  itemId?: string
): Promise<MaintenanceLog[]> {
  const supabase = createClient();
  let query = supabase
    .from('maintenance_logs')
    .select('*')
    .eq('user_id', userId)
    .order('done_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (itemId) {
    query = query.eq('item_id', itemId);
  } else {
    query = query.limit(50);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as MaintenanceLog[];
}

export async function createMaintenanceItem(
  payload: CreateMaintenanceItemInput
): Promise<MaintenanceItem> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('maintenance_items')
    .insert(payload as never)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as MaintenanceItem;
}

export async function createMaintenanceItemsBulk(
  payloads: CreateMaintenanceItemInput[]
): Promise<MaintenanceItem[]> {
  if (payloads.length === 0) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from('maintenance_items')
    .insert(payloads as never)
    .select('*');

  if (error) throw new Error(error.message);
  return (data || []) as MaintenanceItem[];
}

export async function updateMaintenanceItem(
  id: string,
  updates: Partial<MaintenanceItem>
): Promise<MaintenanceItem> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('maintenance_items')
    .update(updates as never)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as MaintenanceItem;
}

export async function deleteMaintenanceItem(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('maintenance_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export interface CompleteMaintenanceInput {
  item: MaintenanceItem;
  userId: string;
  doneAt: string;
  cost?: number | null;
  odoAtDone?: number | null;
  providerName?: string | null;
  rating?: number | null;
  notes?: string | null;
}

export async function completeMaintenanceItem({
  item,
  userId,
  doneAt,
  cost,
  odoAtDone,
  providerName,
  rating,
  notes,
}: CompleteMaintenanceInput): Promise<{
  updatedItem: MaintenanceItem;
  log: MaintenanceLog;
}> {
  const supabase = createClient();

  // 1. Insert log
  const { data: logData, error: logError } = await supabase
    .from('maintenance_logs')
    .insert({
      user_id: userId,
      item_id: item.id,
      done_at: doneAt,
      cost: cost ?? null,
      odo_at_done: odoAtDone ?? null,
      provider_name: providerName ?? item.provider_name ?? null,
      rating: rating ?? null,
      notes: notes ?? null,
    } as never)
    .select('*')
    .single();

  if (logError) throw new Error(logError.message);

  // 2. Compute next due date and update item
  const nextDueAt = computeNextDueDate({
    recurrenceMode: item.recurrence_mode,
    intervalValue: item.interval_value,
    intervalUnit: item.interval_unit,
    doneAt,
    currentDueAt: item.next_due_at,
  });

  const itemUpdates: Partial<MaintenanceItem> = {
    last_done_at: doneAt,
    next_due_at: nextDueAt,
    snoozed_until: null,
  };

  if (odoAtDone !== undefined && odoAtDone !== null) {
    itemUpdates.last_odo = odoAtDone;
    itemUpdates.current_odo = Math.max(odoAtDone, item.current_odo ?? 0);
  }

  if (providerName && !item.provider_name) {
    itemUpdates.provider_name = providerName;
  }

  const { data: updatedData, error: updateError } = await supabase
    .from('maintenance_items')
    .update(itemUpdates as never)
    .eq('id', item.id)
    .select('*')
    .single();

  if (updateError) throw new Error(updateError.message);

  return {
    updatedItem: updatedData as MaintenanceItem,
    log: logData as MaintenanceLog,
  };
}

export async function snoozeMaintenanceItem(
  id: string,
  daysToSnooze: number
): Promise<MaintenanceItem> {
  const target = new Date();
  target.setDate(target.getDate() + daysToSnooze);
  return updateMaintenanceItem(id, { snoozed_until: toISODate(target) });
}
