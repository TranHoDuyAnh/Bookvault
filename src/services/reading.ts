import { createClient } from '@/lib/supabase/client';
import type { BookStatus } from '@/types/database';

export async function updateBookProgress({
  userBookId,
  currentPage,
  totalPages,
  currentStatus,
}: {
  userBookId: string;
  currentPage: number;
  totalPages?: number | null;
  currentStatus?: BookStatus;
}): Promise<void> {
  const supabase = createClient();

  const clampedPage = totalPages ? Math.min(currentPage, totalPages) : currentPage;
  const isFinished = totalPages ? clampedPage >= totalPages : false;

  const updates: Record<string, any> = {
    current_page: Math.max(0, clampedPage),
  };

  if (isFinished) {
    updates.status = 'READ';
    updates.finished_reading_at = new Date().toISOString().split('T')[0];
  } else if (currentStatus === 'OWNED' || currentStatus === 'WISHLIST') {
    updates.status = 'READING';
    updates.started_reading_at = new Date().toISOString().split('T')[0];
  }

  const { error } = await supabase
    .from('user_books')
    .update(updates as any)
    .eq('id', userBookId);

  if (error) {
    throw new Error(`Cập nhật tiến độ thất bại: ${error.message}`);
  }
}
