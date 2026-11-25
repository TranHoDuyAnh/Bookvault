import { createClient } from '@/lib/supabase/client';
import type {
  BudgetEnvelope,
  BudgetExpense,
  EnvelopeWithSpent,
  SavingsGoal,
  SavingsTransaction,
  WeeklyBudget,
} from '@/types/database';

const STARTER_ENVELOPES = [
  { name: 'Ăn sáng', allocated_amount: 50_000 },
  { name: 'Cơm trưa công ty', allocated_amount: 175_000 },
  { name: 'Đi chợ tự nấu', allocated_amount: 270_000 },
  { name: 'Cà phê & sữa', allocated_amount: 60_000 },
  { name: 'Xăng xe', allocated_amount: 200_000 },
  { name: 'Hẹn hò', allocated_amount: 200_000 },
  { name: 'Thuốc lá', allocated_amount: 45_000 },
  { name: 'Sinh hoạt khác', allocated_amount: 0 },
];

export function getWeekRange(offsetWeeks: number = 0): { weekStart: string; weekEnd: string } {
  const now = new Date();
  const hcmcStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  const base = new Date(`${hcmcStr}T00:00:00`);
  const day = base.getDay(); // 0=Sun, 1=Mon
  const diffToMonday = day === 0 ? -6 : 1 - day;
  base.setDate(base.getDate() + diffToMonday + offsetWeeks * 7);

  const end = new Date(base);
  end.setDate(end.getDate() + 6);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  return { weekStart: fmt(base), weekEnd: fmt(end) };
}

export interface WeekBudgetDetails {
  budget: WeeklyBudget;
  envelopes: EnvelopeWithSpent[];
  expenses: BudgetExpense[];
}

export async function getOrCreateWeekBudget(
  userId: string,
  weekStart: string,
  weekEnd: string
): Promise<WeeklyBudget> {
  const supabase = createClient();
  const { data: existing, error: findErr } = await supabase
    .from('weekly_budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle();

  if (findErr) throw new Error(findErr.message);
  if (existing) return existing as WeeklyBudget;

  // Look up most recent week to copy total_cap & envelope template
  const { data: prevWeeks } = await supabase
    .from('weekly_budgets')
    .select('*')
    .eq('user_id', userId)
    .order('week_start', { ascending: false })
    .limit(1);

  const prevWeek = (prevWeeks?.[0] as WeeklyBudget | undefined) || null;
  const defaultCap = prevWeek ? Number(prevWeek.total_cap) : 1_000_000;

  const { data: created, error: createErr } = await supabase
    .from('weekly_budgets')
    .insert({
      user_id: userId,
      week_start: weekStart,
      week_end: weekEnd,
      total_cap: defaultCap,
    })
    .select('*')
    .single();

  if (createErr) throw new Error(createErr.message);
  const newBudget = created as WeeklyBudget;

  // Copy envelopes from previous week or seed starter template
  let template: Array<{ name: string; allocated_amount: number }> = STARTER_ENVELOPES;
  if (prevWeek) {
    const { data: prevEnvelopes } = await supabase
      .from('budget_envelopes')
      .select('name, allocated_amount, sort_order')
      .eq('weekly_budget_id', prevWeek.id)
      .order('sort_order', { ascending: true });

    if (prevEnvelopes && prevEnvelopes.length > 0) {
      template = prevEnvelopes.map((e: { name: string; allocated_amount: number | string }) => ({
        name: e.name,
        allocated_amount: Number(e.allocated_amount),
      }));
    }
  }

  await supabase.from('budget_envelopes').insert(
    template.map((t, idx) => ({
      user_id: userId,
      weekly_budget_id: newBudget.id,
      name: t.name,
      allocated_amount: t.allocated_amount,
      sort_order: idx,
    }))
  );

  return newBudget;
}

export async function getWeekBudgetDetails(
  userId: string,
  weekStart: string,
  weekEnd: string
): Promise<WeekBudgetDetails> {
  const supabase = createClient();
  const budget = await getOrCreateWeekBudget(userId, weekStart, weekEnd);

  const [envRes, expRes] = await Promise.all([
    supabase
      .from('budget_envelopes')
      .select('*')
      .eq('weekly_budget_id', budget.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('budget_expenses')
      .select('*')
      .eq('weekly_budget_id', budget.id)
      .order('spent_at', { ascending: false })
      .order('created_at', { ascending: false }),
  ]);

  if (envRes.error) throw new Error(envRes.error.message);
  if (expRes.error) throw new Error(expRes.error.message);

  const expenses = (expRes.data || []) as BudgetExpense[];
  const spentByEnv = new Map<string, number>();
  for (const exp of expenses) {
    spentByEnv.set(exp.envelope_id, (spentByEnv.get(exp.envelope_id) || 0) + Number(exp.amount));
  }

  const envelopes: EnvelopeWithSpent[] = ((envRes.data || []) as BudgetEnvelope[]).map((env) => {
    const spent = spentByEnv.get(env.id) || 0;
    const allocated = Number(env.allocated_amount);
    return {
      ...env,
      allocated_amount: allocated,
      spent_amount: spent,
      remaining_amount: allocated - spent,
    };
  });

  return {
    budget: {
      ...budget,
      total_cap: Number(budget.total_cap),
      rollover_in: Number(budget.rollover_in),
      surplus_to_next_week: Number(budget.surplus_to_next_week),
      surplus_to_savings: Number(budget.surplus_to_savings),
    },
    envelopes,
    expenses: expenses.map((e) => ({ ...e, amount: Number(e.amount) })),
  };
}

export async function updateWeeklyCap(budgetId: string, totalCap: number): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('weekly_budgets')
    .update({ total_cap: totalCap })
    .eq('id', budgetId);
  if (error) throw new Error(error.message);
}

export async function createEnvelope(payload: {
  user_id: string;
  weekly_budget_id: string;
  name: string;
  allocated_amount: number;
  sort_order: number;
}): Promise<BudgetEnvelope> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('budget_envelopes')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as BudgetEnvelope;
}

export async function updateEnvelope(
  id: string,
  updates: { name?: string; allocated_amount?: number }
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('budget_envelopes')
    .update(updates)
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteEnvelope(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('budget_envelopes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function addBudgetExpense(payload: {
  user_id: string;
  weekly_budget_id: string;
  envelope_id: string;
  amount: number;
  note?: string | null;
  spent_at: string;
}): Promise<BudgetExpense> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('budget_expenses')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as BudgetExpense;
}

export async function deleteBudgetExpense(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('budget_expenses').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export interface WeeklyReportItem extends WeeklyBudget {
  total_spent: number;
  leftover: number;
}

export async function getWeeklyReports(userId: string): Promise<WeeklyReportItem[]> {
  const supabase = createClient();
  const [weeksRes, expRes] = await Promise.all([
    supabase
      .from('weekly_budgets')
      .select('*')
      .eq('user_id', userId)
      .order('week_start', { ascending: false })
      .limit(12),
    supabase.from('budget_expenses').select('weekly_budget_id, amount').eq('user_id', userId),
  ]);

  if (weeksRes.error) throw new Error(weeksRes.error.message);
  const spentMap = new Map<string, number>();
  for (const row of expRes.data || []) {
    spentMap.set(
      row.weekly_budget_id,
      (spentMap.get(row.weekly_budget_id) || 0) + Number(row.amount)
    );
  }

  return ((weeksRes.data || []) as WeeklyBudget[]).map((w) => {
    const cap = Number(w.total_cap) + Number(w.rollover_in);
    const spent = spentMap.get(w.id) || 0;
    return {
      ...w,
      total_cap: Number(w.total_cap),
      rollover_in: Number(w.rollover_in),
      surplus_to_next_week: Number(w.surplus_to_next_week),
      surplus_to_savings: Number(w.surplus_to_savings),
      total_spent: spent,
      leftover: cap - spent,
    };
  });
}

export async function getSavingsData(userId: string): Promise<{
  goals: SavingsGoal[];
  transactions: SavingsTransaction[];
}> {
  const supabase = createClient();
  const [goalsRes, txRes] = await Promise.all([
    supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true }),
    supabase
      .from('savings_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  if (goalsRes.error) throw new Error(goalsRes.error.message);
  if (txRes.error) throw new Error(txRes.error.message);

  return {
    goals: ((goalsRes.data || []) as SavingsGoal[]).map((g) => ({
      ...g,
      current_amount: Number(g.current_amount),
      target_amount: g.target_amount ? Number(g.target_amount) : null,
    })),
    transactions: ((txRes.data || []) as SavingsTransaction[]).map((t) => ({
      ...t,
      amount: Number(t.amount),
    })),
  };
}

export async function createSavingsGoal(payload: {
  user_id: string;
  name: string;
  target_amount?: number | null;
}): Promise<SavingsGoal> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('savings_goals')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as SavingsGoal;
}

export async function closeWeekAndDistribute(params: {
  userId: string;
  budget: WeeklyBudget;
  toNextWeek: number;
  toSavings: number;
  savingsGoalId?: string | null;
}): Promise<void> {
  const supabase = createClient();
  const { userId, budget, toNextWeek, toSavings, savingsGoalId } = params;

  const { error: closeErr } = await supabase
    .from('weekly_budgets')
    .update({
      status: 'CLOSED',
      surplus_to_next_week: toNextWeek,
      surplus_to_savings: toSavings,
      closed_at: new Date().toISOString(),
    })
    .eq('id', budget.id);
  if (closeErr) throw new Error(closeErr.message);

  // 1. Add to next week rollover if > 0
  if (toNextWeek > 0) {
    const start = new Date(`${budget.week_start}T00:00:00`);
    start.setDate(start.getDate() + 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const nextBudget = await getOrCreateWeekBudget(userId, fmt(start), fmt(end));
    await supabase
      .from('weekly_budgets')
      .update({ rollover_in: Number(nextBudget.rollover_in) + toNextWeek })
      .eq('id', nextBudget.id);
  }

  // 2. Add to savings goal if > 0
  if (toSavings > 0) {
    let targetGoalId = savingsGoalId;
    if (!targetGoalId) {
      const { goals } = await getSavingsData(userId);
      if (goals.length > 0) {
        targetGoalId = goals[0].id;
      } else {
        const created = await createSavingsGoal({
          user_id: userId,
          name: 'Quỹ tiết kiệm tuần',
        });
        targetGoalId = created.id;
      }
    }

    const { data: goal } = await supabase
      .from('savings_goals')
      .select('current_amount')
      .eq('id', targetGoalId)
      .single();

    const currentAmt = Number(goal?.current_amount || 0);
    await supabase
      .from('savings_goals')
      .update({ current_amount: currentAmt + toSavings })
      .eq('id', targetGoalId);

    await supabase.from('savings_transactions').insert({
      user_id: userId,
      savings_goal_id: targetGoalId,
      weekly_budget_id: budget.id,
      amount: toSavings,
      note: `Tiền dư tuần ${budget.week_start} → ${budget.week_end}`,
    });
  }
}
