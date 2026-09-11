import { createClient } from '@/lib/supabase/client';
import type { CleaningTask, CleaningLog } from '@/types/database';

export const DEFAULT_CLEANING_SEEDS = [
  {
    title: 'Vệ sinh máy lạnh & lưới lọc',
    category: 'Thiết bị & Điện lạnh',
    frequency_days: 90, // 3 tháng
    notes: 'Rửa sạch lưới lọc bụi, xịt dàn lạnh và kiểm tra gas điều hoà.',
  },
  {
    title: 'Giặt chăn ga gối đệm',
    category: 'Phòng ngủ',
    frequency_days: 14, // 2 tuần
    notes: 'Giặt nước ấm và phơi nắng khô ráo để diệt khuẩn.',
  },
  {
    title: 'Vệ sinh & khử mùi tủ lạnh',
    category: 'Bếp & Đồ ăn',
    frequency_days: 30, // 1 tháng
    notes: 'Dọn sạch thực phẩm hết hạn, lau sạch các khay kính và đặt viên khử mùi.',
  },
  {
    title: 'Vệ sinh lồng giặt máy giặt',
    category: 'Thiết bị & Giặt ủi',
    frequency_days: 90, // 3 tháng
    notes: 'Dùng viên tẩy lồng giặt và chạy chu trình tự làm sạch ở nhiệt độ cao.',
  },
  {
    title: 'Lau cửa kính & gương trong nhà',
    category: 'Nhà cửa chung',
    frequency_days: 30, // 1 tháng
    notes: 'Lau cửa kính ban công, gương phòng tắm và bàn làm việc.',
  },
];

export async function getCleaningTasks(userId: string): Promise<CleaningTask[]> {
  const supabase = createClient();

  // 1. Fetch user tasks
  let { data, error } = await supabase
    .from('cleaning_tasks')
    .select('*, cleaning_logs(*)')
    .eq('user_id', userId)
    .order('next_due_date', { ascending: true });

  // 2. If user has no tasks yet, seed the default recommended tasks
  if (!error && (!data || data.length === 0)) {
    const today = new Date();
    const tasksToInsert = DEFAULT_CLEANING_SEEDS.map((seed) => {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + seed.frequency_days);

      return {
        user_id: userId,
        title: seed.title,
        category: seed.category,
        frequency_days: seed.frequency_days,
        last_completed_at: today.toISOString().split('T')[0],
        next_due_date: nextDate.toISOString().split('T')[0],
        notes: seed.notes,
        is_active: true,
      };
    });

    const { data: seeded } = await supabase
      .from('cleaning_tasks')
      .insert(tasksToInsert as any)
      .select('*, cleaning_logs(*)');

    data = seeded || [];
  }

  return (data || []).map((t: any) => ({
    ...t,
    logs: t.cleaning_logs || [],
  }));
}

export async function createCleaningTask({
  userId,
  title,
  category = 'Nhà cửa',
  frequencyDays = 30,
  lastCompletedAt,
  notes,
}: {
  userId: string;
  title: string;
  category?: string;
  frequencyDays: number;
  lastCompletedAt?: string | null;
  notes?: string | null;
}): Promise<CleaningTask> {
  const supabase = createClient();
  const baseDate = lastCompletedAt ? new Date(lastCompletedAt) : new Date();
  const nextDueDate = new Date(baseDate);
  nextDueDate.setDate(baseDate.getDate() + frequencyDays);

  const payload = {
    user_id: userId,
    title: title.trim(),
    category: category.trim(),
    frequency_days: frequencyDays,
    last_completed_at: lastCompletedAt || new Date().toISOString().split('T')[0],
    next_due_date: nextDueDate.toISOString().split('T')[0],
    notes: notes?.trim() || null,
    is_active: true,
  };

  const { data, error } = await supabase
    .from('cleaning_tasks')
    .insert(payload as any)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Thêm lịch vệ sinh thất bại: ${error.message}`);
  }

  return data as CleaningTask;
}

export async function completeCleaningTask({
  taskId,
  notes,
  frequencyDays,
}: {
  taskId: string;
  notes?: string;
  frequencyDays: number;
}): Promise<void> {
  const supabase = createClient();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const nextDue = new Date(today);
  nextDue.setDate(today.getDate() + frequencyDays);
  const nextDueStr = nextDue.toISOString().split('T')[0];

  // 1. Insert into cleaning_logs
  await supabase.from('cleaning_logs').insert({
    task_id: taskId,
    completed_at: new Date().toISOString(),
    notes: notes || null,
  } as any);

  // 2. Update task
  const { error } = await supabase
    .from('cleaning_tasks')
    .update({
      last_completed_at: todayStr,
      next_due_date: nextDueStr,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', taskId);

  if (error) {
    throw new Error(`Xác nhận vệ sinh thất bại: ${error.message}`);
  }
}

export async function updateCleaningTask(
  taskId: string,
  updates: Partial<CleaningTask>
): Promise<CleaningTask> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('cleaning_tasks')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', taskId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Cập nhật lịch vệ sinh thất bại: ${error.message}`);
  }

  return data as CleaningTask;
}

export async function deleteCleaningTask(taskId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('cleaning_tasks').delete().eq('id', taskId);
  if (error) {
    throw new Error(`Xoá lịch vệ sinh thất bại: ${error.message}`);
  }
}

export interface CleaningStats {
  totalTasks: number;
  overdueCount: number;
  dueSoonCount: number;
  healthyCount: number;
}

export async function getCleaningStats(userId: string): Promise<CleaningStats> {
  const tasks = await getCleaningTasks(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let overdue = 0;
  let dueSoon = 0;
  let healthy = 0;

  tasks.forEach((task) => {
    const due = new Date(task.next_due_date);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) overdue++;
    else if (diffDays <= 3) dueSoon++;
    else healthy++;
  });

  return {
    totalTasks: tasks.length,
    overdueCount: overdue,
    dueSoonCount: dueSoon,
    healthyCount: healthy,
  };
}
