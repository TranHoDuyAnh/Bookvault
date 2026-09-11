import { createClient } from '@/lib/supabase/client';
import type { Habit, HabitLog } from '@/types/database';

export async function getHabits(userId: string): Promise<Habit[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as Habit[];
}

export async function getHabitLogs(habitId: string, options?: { days?: number }): Promise<HabitLog[]> {
  const supabase = createClient();
  let query = supabase
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habitId)
    .order('completed_date', { ascending: false });
    
  if (options?.days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - options.days);
    query = query.gte('completed_date', cutoffDate.toISOString().split('T')[0]);
  }
  
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as HabitLog[];
}

export async function getHabitsWithLogs(userId: string) {
  const habits = await getHabits(userId);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  const supabase = createClient();
  const { data: logs, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('completed_date', cutoffStr);
    
  if (error) throw new Error(error.message);
  
  const logsMap: Record<string, HabitLog[]> = {};
  logs?.forEach(log => {
    if (!logsMap[log.habit_id]) logsMap[log.habit_id] = [];
    logsMap[log.habit_id].push(log as HabitLog);
  });
  
  return habits.map(habit => ({
    ...habit,
    recentLogs: logsMap[habit.id] || []
  }));
}

export async function getHabitStreak(habitId: string, userId: string): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habit_logs')
    .select('completed_date')
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .order('completed_date', { ascending: false });
    
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return 0;
  
  const dates = new Set(data.map(d => d.completed_date));
  let streak = 0;
  const todayStr = new Date().toISOString().split('T')[0];
  let currentDate = new Date(todayStr);
  
  // If today is not checked, check yesterday
  if (!dates.has(todayStr)) {
    currentDate.setDate(currentDate.getDate() - 1);
    const yesterdayStr = currentDate.toISOString().split('T')[0];
    if (!dates.has(yesterdayStr)) {
      return 0; // Not checked today nor yesterday
    }
  }
  
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (dates.has(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

export async function createHabit(payload: Partial<Habit>): Promise<Habit> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habits')
    .insert(payload as any)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Habit;
}

export async function updateHabit(id: string, updates: Partial<Habit>): Promise<Habit> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habits')
    .update(updates as any)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Habit;
}

export async function deleteHabit(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('habits').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function checkInHabit(payload: { habit_id: string, user_id: string, completed_date: string, note?: string }): Promise<HabitLog> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habit_logs')
    .upsert(payload as any, { onConflict: 'habit_id,completed_date' })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as HabitLog;
}

export async function uncheckHabit(habitId: string, userId: string, date: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('habit_logs')
    .delete()
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .eq('completed_date', date);
  if (error) throw new Error(error.message);
}
