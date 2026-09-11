import { createClient } from '@/lib/supabase/client';
import type { MysteryQuestPool, UserDailyQuest } from '@/types/database';

export const DEFAULT_QUESTS: Omit<MysteryQuestPool, 'id'>[] = [
  {
    title: 'Thử một món ăn hoàn toàn mới',
    description: 'Tìm và thưởng thức một món ăn hoặc đồ uống bạn chưa từng nếm thử bao giờ trong đời. Chụp ảnh lại và viết cảm nhận vào Food Diary!',
    category: 'FOOD',
    difficulty: 'EASY',
    points: 15,
    is_active: true,
  },
  {
    title: 'Dọn dẹp & sắp xếp 1 góc phòng',
    description: 'Dành 15 phút dọn gọn bàn làm việc hoặc một ngăn kéo tủ. Chụp ảnh trước/sau và lưu vào Home Manager.',
    category: 'HOME',
    difficulty: 'EASY',
    points: 10,
    is_active: true,
  },
  {
    title: 'Đọc 20 trang sách tại một không gian khác',
    description: 'Đọc sách ở một nơi bạn ít khi ngồi: công viên, ban công, quán cà phê yên tĩnh hoặc bên cửa sổ lúc hoàng hôn.',
    category: 'READING',
    difficulty: 'MEDIUM',
    points: 20,
    is_active: true,
  },
  {
    title: 'Một ngày không đồ ngọt (Sugar-free day)',
    description: 'Thử thách không dùng trà sữa, bánh ngọt hay đồ uống có gas trong suốt hôm nay để cơ thể nghỉ ngơi.',
    category: 'MINDFULNESS',
    difficulty: 'MEDIUM',
    points: 20,
    is_active: true,
  },
  {
    title: 'Đi bộ 5.000 bước & không dùng điện thoại',
    description: 'Rời xa màn hình, đi dạo 30 phút và quan sát nhịp sống phố phường hoặc cây cỏ xung quanh bạn.',
    category: 'ADVENTURE',
    difficulty: 'EASY',
    points: 15,
    is_active: true,
  },
  {
    title: 'Tự nấu một bữa ăn chuẩn chỉnh',
    description: 'Tự tay chuẩn bị một bữa tối ngon lành tại nhà với ít nhất 2 món ăn tốt cho sức khoẻ.',
    category: 'FOOD',
    difficulty: 'MEDIUM',
    points: 25,
    is_active: true,
  },
  {
    title: 'Viết ra 3 điều bạn biết ơn hôm nay',
    description: 'Dành 5 phút trước khi đi ngủ để viết ra 3 điều nhỏ bé nhưng ý nghĩa đã xảy ra với bạn trong ngày.',
    category: 'MINDFULNESS',
    difficulty: 'EASY',
    points: 10,
    is_active: true,
  },
  {
    title: 'Kiểm tra hạn bảo hành 3 món đồ trong nhà',
    description: 'Xem lại các thiết bị điện tử trong nhà, nhập hạn bảo hành vào Home Manager để không bị quên khi cần bảo dưỡng.',
    category: 'HOME',
    difficulty: 'EASY',
    points: 15,
    is_active: true,
  },
  {
    title: 'Gửi một lời khen chân thành',
    description: 'Nhắn tin hoặc nói trực tiếp một lời cảm ơn, lời khen đến một người bạn hoặc người thân mà bạn quý mến.',
    category: 'MINDFULNESS',
    difficulty: 'EASY',
    points: 15,
    is_active: true,
  },
  {
    title: 'Khám phá một con đường bạn chưa từng đi',
    description: 'Khi đi làm hoặc đi dạo, hãy chọn một ngõ nhỏ hoặc lộ trình khác thường ngày để mở rộng tầm mắt.',
    category: 'ADVENTURE',
    difficulty: 'FUN',
    points: 20,
    is_active: true,
  },
  {
    title: 'Đọc lại một trích dẫn hay & áp dụng ngay',
    description: 'Mở mục Ghi chú trong BookVault, chọn 1 câu trích dẫn bạn tâm đắc nhất và thực hành nó trong ngày hôm nay.',
    category: 'READING',
    difficulty: 'EASY',
    points: 15,
    is_active: true,
  },
  {
    title: 'Thức dậy sớm hơn 30 phút để tận hưởng buổi sáng',
    description: 'Pha một ly trà/cà phê, ngắm bình minh và bắt đầu ngày mới một cách thong thả không vội vã.',
    category: 'MINDFULNESS',
    difficulty: 'MEDIUM',
    points: 20,
    is_active: true,
  },
];

export async function getTodayQuest(userId: string): Promise<UserDailyQuest | null> {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  // 1. Check if user already has an assigned quest today
  const { data: existing, error: fetchError } = await supabase
    .from('user_daily_quests')
    .select('*, mystery_quest_pool(*)')
    .eq('user_id', userId)
    .eq('assigned_date', today)
    .maybeSingle();

  if (existing) {
    return {
      ...existing,
      quest: existing.mystery_quest_pool,
    } as UserDailyQuest;
  }

  // 2. Fetch or seed quest pool
  let { data: pool } = await supabase
    .from('mystery_quest_pool')
    .select('*')
    .eq('is_active', true);

  if (!pool || pool.length === 0) {
    // Seed default quests into database
    const { data: seeded } = await supabase
      .from('mystery_quest_pool')
      .insert(DEFAULT_QUESTS as any)
      .select('*');
    pool = seeded || [];
  }

  if (pool.length === 0) return null;

  // 3. Pick deterministic quest based on date and userId
  const seedString = `${userId}_${today}`;
  const charSum = seedString.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const randomIndex = charSum % pool.length;
  const selectedQuest = pool[randomIndex];

  // 4. Assign quest to user for today
  const { data: assigned, error: assignError } = await supabase
    .from('user_daily_quests')
    .insert({
      user_id: userId,
      quest_id: selectedQuest.id,
      assigned_date: today,
      is_completed: false,
    } as any)
    .select('*, mystery_quest_pool(*)')
    .single();

  if (assignError) {
    console.error('Error assigning quest:', assignError);
    return null;
  }

  return {
    ...assigned,
    quest: assigned.mystery_quest_pool || selectedQuest,
  } as UserDailyQuest;
}

export async function completeTodayQuest({
  dailyQuestId,
  proofNote,
  proofImageFile,
  userId,
}: {
  dailyQuestId: string;
  proofNote?: string;
  proofImageFile?: File | null;
  userId: string;
}): Promise<UserDailyQuest> {
  const supabase = createClient();
  let proofImageUrl: string | null = null;

  if (proofImageFile) {
    const fileExt = proofImageFile.name.split('.').pop() || 'jpg';
    const filePath = `${userId}/quest/proof_${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from('book-images')
      .upload(filePath, proofImageFile, { cacheControl: '3600', upsert: false });

    if (!error) {
      const { data: signed } = await supabase.storage
        .from('book-images')
        .createSignedUrl(filePath, 60 * 60 * 24 * 30);
      proofImageUrl = signed?.signedUrl || filePath;
    }
  }

  const { data, error } = await supabase
    .from('user_daily_quests')
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
      proof_note: proofNote?.trim() || null,
      proof_image_url: proofImageUrl,
    } as any)
    .eq('id', dailyQuestId)
    .select('*, mystery_quest_pool(*)')
    .single();

  if (error) {
    throw new Error(`Xác nhận nhiệm vụ thất bại: ${error.message}`);
  }

  return {
    ...data,
    quest: data.mystery_quest_pool,
  } as UserDailyQuest;
}

export async function getQuestHistory(userId: string): Promise<UserDailyQuest[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_daily_quests')
    .select('*, mystery_quest_pool(*)')
    .eq('user_id', userId)
    .order('assigned_date', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Error fetching quest history:', error);
    return [];
  }

  return (data || []).map((q: any) => ({
    ...q,
    quest: q.mystery_quest_pool,
  }));
}

export interface QuestStats {
  totalCompleted: number;
  totalPoints: number;
  currentStreak: number;
}

export async function getQuestStats(userId: string): Promise<QuestStats> {
  const history = await getQuestHistory(userId);
  const completed = history.filter((h) => h.is_completed);

  let points = 0;
  completed.forEach((c) => {
    points += c.quest?.points || 10;
  });

  // Calculate Streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    const questOnDate = history.find((h) => h.assigned_date === dateStr);
    if (questOnDate && questOnDate.is_completed) {
      streak++;
    } else if (i === 0) {
      // If today is not yet completed, check if yesterday was completed
      continue;
    } else {
      break;
    }
  }

  return {
    totalCompleted: completed.length,
    totalPoints: points,
    currentStreak: streak,
  };
}
