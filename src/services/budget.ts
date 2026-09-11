import { createClient } from '@/lib/supabase/client';
import type { BudgetCategory, ExpenseTransaction, IncomeEntry } from '@/types/database';

export async function getBudgetCategories(userId: string): Promise<BudgetCategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('budget_categories')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []) as BudgetCategory[];
}

export async function createBudgetCategory(payload: { userId: string, name: string, icon?: string, color?: string, monthly_budget?: number }): Promise<BudgetCategory> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('budget_categories')
    .insert({
      user_id: payload.userId,
      name: payload.name,
      icon: payload.icon || '💰',
      color: payload.color || '#1e3a2f',
      monthly_budget: payload.monthly_budget || 0,
    } as any)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as BudgetCategory;
}

export async function updateBudgetCategory(id: string, updates: Partial<BudgetCategory>): Promise<BudgetCategory> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('budget_categories')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as BudgetCategory;
}

export async function deleteBudgetCategory(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('budget_categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getExpenses(userId: string, filter?: { month?: number, year?: number }): Promise<ExpenseTransaction[]> {
  const supabase = createClient();
  let query = supabase.from('expense_transactions').select('*, budget_categories(*)').eq('user_id', userId).order('transaction_date', { ascending: false });
  
  if (filter?.month && filter?.year) {
    const startDate = new Date(filter.year, filter.month - 1, 1).toISOString();
    const endDate = new Date(filter.year, filter.month, 0, 23, 59, 59, 999).toISOString();
    query = query.gte('transaction_date', startDate).lte('transaction_date', endDate);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as any; // Cast as any to bypass join typing complexity
}

export async function createExpense(payload: { userId: string, category_id?: string, title: string, amount: number, transaction_date: string, payment_method?: string, notes?: string }): Promise<ExpenseTransaction> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('expense_transactions')
    .insert({
      user_id: payload.userId,
      category_id: payload.category_id || null,
      title: payload.title,
      amount: payload.amount,
      transaction_date: payload.transaction_date,
      payment_method: payload.payment_method || 'CASH',
      notes: payload.notes || '',
    } as any)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as ExpenseTransaction;
}

export async function updateExpense(id: string, updates: Partial<ExpenseTransaction>): Promise<ExpenseTransaction> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('expense_transactions')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as ExpenseTransaction;
}

export async function deleteExpense(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('expense_transactions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getIncomes(userId: string, filter?: { month?: number, year?: number }): Promise<IncomeEntry[]> {
  const supabase = createClient();
  let query = supabase.from('income_entries').select('*').eq('user_id', userId).order('income_date', { ascending: false });
  
  if (filter?.month && filter?.year) {
    const startDate = new Date(filter.year, filter.month - 1, 1).toISOString();
    const endDate = new Date(filter.year, filter.month, 0, 23, 59, 59, 999).toISOString();
    query = query.gte('income_date', startDate).lte('income_date', endDate);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as IncomeEntry[];
}

export async function createIncome(payload: { userId: string, title: string, amount: number, income_date: string, source?: string, notes?: string }): Promise<IncomeEntry> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('income_entries')
    .insert({
      user_id: payload.userId,
      title: payload.title,
      amount: payload.amount,
      income_date: payload.income_date,
      source: payload.source || '',
      notes: payload.notes || '',
    } as any)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as IncomeEntry;
}

export async function deleteIncome(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('income_entries').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getMonthlyBudgetSummary(userId: string, month: number, year: number) {
  const [expenses, incomes, categories] = await Promise.all([
    getExpenses(userId, { month, year }),
    getIncomes(userId, { month, year }),
    getBudgetCategories(userId)
  ]);

  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const byCategory = categories.map(category => {
    const spent = expenses
      .filter(exp => exp.category_id === category.id)
      .reduce((sum, exp) => sum + exp.amount, 0);
    return {
      category,
      budgeted: category.monthly_budget || 0,
      spent,
      remaining: (category.monthly_budget || 0) - spent
    };
  });

  return { totalIncome, totalExpense, netBalance, byCategory };
}
