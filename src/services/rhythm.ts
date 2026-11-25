import { format, subDays } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import type {
  RhythmColor,
  RhythmHabit,
  RhythmLog,
  RhythmLogStatus,
} from '@/types/database';

export async function getRhythmHabits(userId: string): Promise<RhythmHabit[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rhythm_habits')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as RhythmHabit[];
}

export async function getRhythmLogs(
  userId: string,
  daysBack: number = 370
): Promise<RhythmLog[]> {
  const supabase = createClient();
  const fromDate = format(subDays(new Date(), daysBack), 'yyyy-MM-dd');

  const { data, error } = await supabase
    .from('rhythm_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', fromDate)
    .order('log_date', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as RhythmLog[];
}

export async function createRhythmHabit(payload: {
  user_id: string;
  title: string;
  weekly_target: number;
  color: RhythmColor;
}): Promise<RhythmHabit> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rhythm_habits')
    .insert(payload as never)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as RhythmHabit;
}

export async function createRhythmHabitsBulk(
  payloads: Array<{
    user_id: string;
    title: string;
    weekly_target: number;
    color: RhythmColor;
    sort_order: number;
  }>
): Promise<RhythmHabit[]> {
  if (payloads.length === 0) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rhythm_habits')
    .insert(payloads as never)
    .select('*');

  if (error) throw new Error(error.message);
  return (data || []) as RhythmHabit[];
}

export async function updateRhythmHabit(
  id: string,
  updates: Partial<RhythmHabit>
): Promise<RhythmHabit> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rhythm_habits')
    .update(updates as never)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as RhythmHabit;
}

export async function deleteRhythmHabit(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('rhythm_habits').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function setRhythmLogStatus(params: {
  userId: string;
  habitId: string;
  logDate: string;
  status: RhythmLogStatus | null;
}): Promise<void> {
  const supabase = createClient();
  const { userId, habitId, logDate, status } = params;

  if (status === null) {
    const { error } = await supabase
      .from('rhythm_logs')
      .delete()
      .eq('user_id', userId)
      .eq('habit_id', habitId)
      .eq('log_date', logDate);

    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from('rhythm_logs').upsert(
    {
      user_id: userId,
      habit_id: habitId,
      log_date: logDate,
      status,
    } as never,
    { onConflict: 'habit_id,log_date' }
  );

  if (error) throw new Error(error.message);
}
