import { createClient } from '@/lib/supabase/client';
import type { PersonalGoal, KeyResult, GoalStatus } from '@/types/database';

export async function getPersonalGoals(userId: string): Promise<PersonalGoal[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('personal_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as PersonalGoal[];
}

export async function createPersonalGoal(payload: Partial<PersonalGoal>): Promise<PersonalGoal> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('personal_goals')
    .insert(payload as any)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as PersonalGoal;
}

export async function updatePersonalGoal(id: string, updates: Partial<PersonalGoal>): Promise<PersonalGoal> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('personal_goals')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as PersonalGoal;
}

export async function deletePersonalGoal(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('personal_goals').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getKeyResults(goalId: string): Promise<KeyResult[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('key_results')
    .select('*')
    .eq('goal_id', goalId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []) as KeyResult[];
}

export async function createKeyResult(payload: Partial<KeyResult>): Promise<KeyResult> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('key_results')
    .insert(payload as any)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as KeyResult;
}

export async function updateKeyResult(id: string, updates: Partial<KeyResult>): Promise<KeyResult> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('key_results')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as KeyResult;
}

export async function deleteKeyResult(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('key_results').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getPersonalGoalsWithKeyResults(userId: string): Promise<(PersonalGoal & { key_results: KeyResult[], overall_progress: number })[]> {
  const supabase = createClient();
  const { data: goals, error: goalsError } = await supabase
    .from('personal_goals')
    .select('*, key_results(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (goalsError) throw new Error(goalsError.message);
  
  return (goals || []).map((goal: any) => {
    const krs = goal.key_results || [];
    let progressSum = 0;
    krs.forEach((kr: KeyResult) => {
      const p = kr.target_value > 0 ? Math.min(100, Math.max(0, (kr.current_value / kr.target_value) * 100)) : 0;
      progressSum += p;
    });
    const overall = krs.length > 0 ? progressSum / krs.length : 0;
    
    return {
      ...goal,
      key_results: krs.sort((a: KeyResult, b: KeyResult) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
      overall_progress: overall
    };
  }) as (PersonalGoal & { key_results: KeyResult[], overall_progress: number })[];
}
