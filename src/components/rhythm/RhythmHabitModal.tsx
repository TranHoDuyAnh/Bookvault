'use client';

import React, { useState } from 'react';
import { RHYTHM_COLORS } from '@/lib/rhythm';
import type { RhythmColor, RhythmHabit } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface RhythmHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingHabit?: RhythmHabit | null;
  onSave: (
    payload: { title: string; weekly_target: number; color: RhythmColor },
    editingId?: string
  ) => Promise<void>;
  isSaving?: boolean;
}

export function RhythmHabitModal({
  isOpen,
  onClose,
  editingHabit,
  onSave,
  isSaving = false,
}: RhythmHabitModalProps) {
  const [title, setTitle] = useState(() => editingHabit?.title ?? '');
  const [weeklyTarget, setWeeklyTarget] = useState(
    () => editingHabit?.weekly_target ?? 4
  );
  const [color, setColor] = useState<RhythmColor>(
    () => editingHabit?.color ?? 'emerald'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onSave(
      {
        title: title.trim(),
        weekly_target: weeklyTarget,
        color,
      },
      editingHabit?.id
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingHabit ? 'Chỉnh sửa mục tiêu nhịp sống' : 'Thêm mục tiêu mới'}
      description="Đặt mục tiêu linh hoạt theo tuần thay vì ép bản thân không được nghỉ ngày nào."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary">
            Tên thói quen / hoạt động *
          </label>
          <Input
            required
            placeholder="Ví dụ: Tập thể dục, Đọc sách, Học tiếng Anh..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-text-secondary block">
            Mục tiêu mỗi tuần ({weeklyTarget} ngày/tuần)
          </label>
          <div className="grid grid-cols-7 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setWeeklyTarget(num)}
                className={cn(
                  'h-9 rounded-xl border text-xs font-semibold transition-colors cursor-pointer',
                  weeklyTarget === num
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-secondary/50 text-text-secondary hover:bg-accent'
                )}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-text-secondary block">
            Màu nhận diện
          </label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(RHYTHM_COLORS) as RhythmColor[]).map((key) => {
              const meta = RHYTHM_COLORS[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColor(key)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                    color === key
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-card text-text-secondary hover:bg-accent'
                  )}
                >
                  <span className={cn('h-2.5 w-2.5 rounded-full', meta.dot)} />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSaving || !title.trim()}>
            {isSaving ? 'Đang lưu...' : editingHabit ? 'Lưu thay đổi' : 'Tạo mục tiêu'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
