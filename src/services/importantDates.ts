import { createClient } from '@/lib/supabase/client';
import type { ImportantDate } from '@/types/database';

export async function getImportantDates(userId: string): Promise<ImportantDate[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('important_dates')
    .select('*')
    .eq('user_id', userId)
    .order('event_date', { ascending: true });
  
  if (error) throw new Error(error.message);
  return (data || []) as ImportantDate[];
}

export async function getUpcomingDates(userId: string, days: number = 30): Promise<ImportantDate[]> {
  const allDates = await getImportantDates(userId);
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  return allDates.filter(date => {
    const eventDate = new Date(date.event_date);
    
    if (date.is_recurring) {
      // Create a date object for the event in the current year
      let thisYearEvent = new Date(currentYear, eventDate.getMonth(), eventDate.getDate());
      
      // If the event has already passed this year, look at next year
      if (thisYearEvent < new Date(currentYear, currentMonth, currentDay)) {
        thisYearEvent = new Date(currentYear + 1, eventDate.getMonth(), eventDate.getDate());
      }
      
      return thisYearEvent >= new Date(currentYear, currentMonth, currentDay) && thisYearEvent <= future;
    } else {
      // Non-recurring event: just check if it's within the window
      return eventDate >= new Date(currentYear, currentMonth, currentDay) && eventDate <= future;
    }
  }).sort((a, b) => {
    // Sort by next occurrence
    const aDate = new Date(a.event_date);
    const bDate = new Date(b.event_date);
    
    const aNext = a.is_recurring 
      ? new Date(currentYear + (new Date(currentYear, aDate.getMonth(), aDate.getDate()) < new Date(currentYear, currentMonth, currentDay) ? 1 : 0), aDate.getMonth(), aDate.getDate())
      : aDate;
      
    const bNext = b.is_recurring
      ? new Date(currentYear + (new Date(currentYear, bDate.getMonth(), bDate.getDate()) < new Date(currentYear, currentMonth, currentDay) ? 1 : 0), bDate.getMonth(), bDate.getDate())
      : bDate;
      
    return aNext.getTime() - bNext.getTime();
  });
}

export async function createImportantDate(payload: any): Promise<ImportantDate> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('important_dates')
    .insert(payload as any)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as ImportantDate;
}

export async function updateImportantDate(id: string, updates: Partial<ImportantDate>): Promise<ImportantDate> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('important_dates')
    .update(updates as any)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as ImportantDate;
}

export async function deleteImportantDate(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('important_dates').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
