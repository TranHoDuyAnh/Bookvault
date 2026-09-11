import { createClient } from '@/lib/supabase/client';
import type { MediaEntry, MediaType, MediaStatus } from '@/types/database';

export async function getMediaEntries(userId: string, filters?: { type?: MediaType | 'ALL'; status?: MediaStatus | 'ALL' }): Promise<MediaEntry[]> {
  const supabase = createClient();
  let query = supabase
    .from('media_entries')
    .select('*')
    .eq('user_id', userId);

  if (filters?.type && filters.type !== 'ALL') {
    query = query.eq('media_type', filters.type);
  }
  if (filters?.status && filters.status !== 'ALL') {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as MediaEntry[];
}

export async function createMediaEntry(payload: any): Promise<MediaEntry> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('media_entries')
    .insert(payload as any)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as MediaEntry;
}

export async function updateMediaEntry(id: string, updates: Partial<MediaEntry>): Promise<MediaEntry> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('media_entries')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as MediaEntry;
}

export async function deleteMediaEntry(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('media_entries').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getMediaStats(userId: string) {
  const entries = await getMediaEntries(userId);
  const total = entries.length;
  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let totalRating = 0;
  let ratedCount = 0;

  entries.forEach(entry => {
    byType[entry.media_type] = (byType[entry.media_type] || 0) + 1;
    byStatus[entry.status] = (byStatus[entry.status] || 0) + 1;
    if (entry.rating) {
      totalRating += entry.rating;
      ratedCount += 1;
    }
  });

  const avgRating = ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : null;

  return { total, byType, byStatus, avgRating };
}
