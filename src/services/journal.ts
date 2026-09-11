import { createClient } from '@/lib/supabase/client';
import type { JournalEntry } from '@/types/database';

export async function getJournalEntries(userId: string, options?: { limit?: number; offset?: number }): Promise<JournalEntry[]> {
  const supabase = createClient();
  let query = supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (options?.limit !== undefined) {
    query = query.limit(options.limit);
  }
  if (options?.offset !== undefined) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as JournalEntry[];
}

export async function getJournalEntry(id: string): Promise<JournalEntry> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as JournalEntry;
}

export async function createJournalEntry(payload: Partial<JournalEntry>): Promise<JournalEntry> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('journal_entries')
    .insert(payload as any)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as JournalEntry;
}

export async function updateJournalEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('journal_entries')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as JournalEntry;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('journal_entries').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
