import { createClient } from '@/lib/supabase/client';
import type { ShoppingList, ShoppingItem } from '@/types/database';

export async function getShoppingLists(userId: string): Promise<(ShoppingList & { items: ShoppingItem[] })[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('shopping_lists')
    .select('*, items:shopping_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw new Error(error.message);
  return (data || []) as (ShoppingList & { items: ShoppingItem[] })[];
}

export async function createShoppingList(payload: Partial<ShoppingList>): Promise<ShoppingList> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('shopping_lists')
    .insert(payload as any)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as ShoppingList;
}

export async function updateShoppingList(id: string, updates: Partial<ShoppingList>): Promise<ShoppingList> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('shopping_lists')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as ShoppingList;
}

export async function deleteShoppingList(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('shopping_lists').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getShoppingItems(listId: string): Promise<ShoppingItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*')
    .eq('list_id', listId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []) as ShoppingItem[];
}

export async function createShoppingItem(payload: Partial<ShoppingItem>): Promise<ShoppingItem> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('shopping_items')
    .insert(payload as any)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as ShoppingItem;
}

export async function updateShoppingItem(id: string, updates: Partial<ShoppingItem>): Promise<ShoppingItem> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('shopping_items')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as ShoppingItem;
}

export async function checkItem(id: string, checked: boolean): Promise<ShoppingItem> {
  return updateShoppingItem(id, { is_checked: checked });
}

export async function deleteShoppingItem(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('shopping_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function clearCheckedItems(listId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('shopping_items')
    .delete()
    .eq('list_id', listId)
    .eq('is_checked', true);
  if (error) throw new Error(error.message);
}
