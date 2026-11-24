'use client';

import React, { useState } from 'react';
import { Trash2, Edit2, Calendar } from 'lucide-react';
import { useDeleteImportantDate } from '@/hooks/useImportantDates';
import { EditDateModal } from './EditDateModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import type { ImportantDate } from '@/types/database';
import { toast } from 'sonner';

const CATEGORY_EMOJIS: Record<string, string> = {
  BIRTHDAY: '🎂',
  ANNIVERSARY: '💑',
  REMINDER: '⏰',
  HOLIDAY: '🎉',
  OTHER: '📅',
};

export function ImportantDateCard({
  item,
  showCountdown = false,
}: {
  item: ImportantDate;
  showCountdown?: boolean;
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deleteMutation = useDeleteImportantDate();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success('Đã xoá!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi xoá.';
      toast.error(message);
    }
  };

  const getNextOccurrence = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const eventDate = new Date(item.event_date);

    if (item.is_recurring) {
      const thisYearEvent = new Date(currentYear, eventDate.getMonth(), eventDate.getDate());
      if (thisYearEvent < new Date(currentYear, now.getMonth(), now.getDate())) {
        return new Date(currentYear + 1, eventDate.getMonth(), eventDate.getDate());
      }
      return thisYearEvent;
    }
    return eventDate;
  };

  const nextDate = getNextOccurrence();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffTime = nextDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let countdownText = '';
  let countdownVariant: 'success' | 'destructive' | 'warning' | 'secondary' | 'info' = 'info';

  if (diffDays === 0) {
    countdownText = 'Hôm nay';
    countdownVariant = 'success';
  } else if (diffDays > 0 && diffDays <= (item.reminder_days_before || 7)) {
    countdownText = `Còn ${diffDays} ngày`;
    countdownVariant = diffDays <= 3 ? 'destructive' : 'warning';
  } else if (diffDays < 0) {
    countdownText = 'Đã qua';
    countdownVariant = 'secondary';
  } else {
    countdownText = `Còn ${diffDays} ngày`;
    countdownVariant = 'info';
  }

  const formattedDate = new Date(item.event_date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const nextFormattedDate = nextDate.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-2xs space-y-3 flex flex-col h-full">
      <div className="flex justify-between items-start gap-2">
        <div className="flex gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-lg shrink-0">
            {CATEGORY_EMOJIS[item.category] || '📅'}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-base text-foreground leading-snug truncate">
              {item.title}
            </h3>
            {item.person_name && (
              <p className="text-xs text-text-muted mt-0.5 truncate">{item.person_name}</p>
            )}
            <div className="flex items-center gap-1.5 mt-1 tabular-nums">
              <Calendar className="h-3.5 w-3.5 text-text-muted shrink-0" />
              <span className="text-xs text-text-muted">{formattedDate}</span>
              {item.is_recurring && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  Hàng năm
                </Badge>
              )}
            </div>
          </div>
        </div>
        {showCountdown && (
          <Badge variant={countdownVariant} className="whitespace-nowrap tabular-nums shrink-0">
            {countdownText}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
        <div className="text-xs text-text-muted tabular-nums">
          Tiếp theo: <span className="font-medium text-foreground">{nextFormattedDate}</span>
        </div>
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="p-1.5 rounded-md text-text-muted hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            aria-label="Chỉnh sửa"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="p-1.5 rounded-md text-text-muted hover:bg-destructive-subtle hover:text-destructive transition-colors cursor-pointer"
            aria-label="Xoá"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {isEditOpen && (
        <EditDateModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} item={item} />
      )}

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xoá sự kiện?"
        description={`Bạn có chắc muốn xoá "${item.title}"?`}
        confirmText="Xoá"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
