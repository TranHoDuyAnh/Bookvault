import { createClient } from '@/lib/supabase/client';
import type { SavingsGoal, SavingsContribution } from '@/types/database';

export async function getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as SavingsGoal[];
}

export async function createSavingsGoal(payload: { userId: string, title: string, description?: string, target_amount: number, icon?: string, color?: string, deadline?: string }): Promise<SavingsGoal> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('savings_goals')
    .insert({
      user_id: payload.userId,
      title: payload.title,
      description: payload.description || '',
      target_amount: payload.target_amount,
      current_amount: 0,
      icon: payload.icon || '🎯',
      color: payload.color || '#1e3a2f',
      deadline: payload.deadline || null,
      status: 'IN_PROGRESS'
    } as any)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as SavingsGoal;
}

export async function updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('savings_goals')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as SavingsGoal;
}

export async function deleteSavingsGoal(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('savings_goals').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getContributions(goalId: string): Promise<SavingsContribution[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('savings_contributions')
    .select('*')
    .eq('goal_id', goalId)
    .order('contribution_date', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as SavingsContribution[];
}

export async function recalculateSavingsGoalAmount(goalId: string): Promise<void> {
  const supabase = createClient();
  const contributions = await getContributions(goalId);
  const total = contributions.reduce((sum, c) => sum + c.amount, 0);
  
  const { data: goal } = await supabase.from('savings_goals').select('target_amount').eq('id', goalId).single();
  const status = goal && total >= goal.target_amount ? 'COMPLETED' : 'IN_PROGRESS';

  const { error } = await supabase.from('savings_goals').update({ current_amount: total, status } as any).eq('id', goalId);
  if (error) throw new Error(error.message);
}

export async function addContribution(payload: { goalId: string, amount: number, contribution_date: string, note?: string }): Promise<SavingsContribution> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('savings_contributions')
    .insert({
      goal_id: payload.goalId,
      amount: payload.amount,
      contribution_date: payload.contribution_date,
      note: payload.note || ''
    } as any)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  
  await recalculateSavingsGoalAmount(payload.goalId);
  return data as SavingsContribution;
}

export async function deleteContribution(id: string, goalId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('savings_contributions').delete().eq('id', id);
  if (error) throw new Error(error.message);
  await recalculateSavingsGoalAmount(goalId);
}
