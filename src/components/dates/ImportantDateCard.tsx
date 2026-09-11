'use client';
import React, { useState } from 'react';
import { Trash2, Edit2, Calendar } from 'lucide-react';
import { useDeleteImportantDate } from '@/hooks/useImportantDates';
import { EditDateModal } from './EditDateModal';
import type { ImportantDate } from '@/types/database';
import { toast } from 'sonner';

const CATEGORY_EMOJIS: Record<string, string> = {
  BIRTHDAY: '🎂', ANNIVERSARY: '💑', REMINDER: '⏰', HOLIDAY: '🎉', OTHER: '📅'
};

const CATEGORY_LABELS: Record<string, string> = {
  BIRTHDAY: 'Sinh nhật', ANNIVERSARY: 'Kỷ niệm', REMINDER: 'Nhắc nhở', HOLIDAY: 'Lễ kỷ niệm', OTHER: 'Khác'
};

export function ImportantDateCard({ item, showCountdown = false }: { item: ImportantDate, showCountdown?: boolean }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const deleteMutation = useDeleteImportantDate();

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xoá?')) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success('Đã xoá!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getNextOccurrence = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const eventDate = new Date(item.event_date);
    
    if (item.is_recurring) {
      let thisYearEvent = new Date(currentYear, eventDate.getMonth(), eventDate.getDate());
      // If it passed, next occurrence is next year
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
  let countdownColor = '';
  
  if (diffDays === 0) {
    countdownText = '🎉 Hôm nay!';
    countdownColor = 'text-green-600 bg-green-50 border-green-200';
  } else if (diffDays > 0 && diffDays <= (item.reminder_days_before || 7)) {
    countdownText = `Còn ${diffDays} ngày!`;
    countdownColor = diffDays <= 3 ? 'text-red-600 bg-red-50 border-red-200' : 'text-amber-600 bg-amber-50 border-amber-200';
  } else if (diffDays < 0) {
    countdownText = `Đã qua`;
    countdownColor = 'text-stone-500 bg-stone-50 border-stone-200';
  } else {
    countdownText = `Còn ${diffDays} ngày`;
    countdownColor = 'text-blue-600 bg-blue-50 border-blue-200';
  }

  const formattedDate = new Date(item.event_date).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const nextFormattedDate = nextDate.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  return (
    <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-3 flex flex-col h-full">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-2xl shrink-0">
            {CATEGORY_EMOJIS[item.category] || '📅'}
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 leading-tight">
              {item.title}
            </h3>
            {item.person_name && (
              <p className="text-sm italic text-stone-600 dark:text-stone-400 mt-0.5">{item.person_name}</p>
            )}
            <div className="flex items-center gap-1.5 mt-1">
              <Calendar className="h-3.5 w-3.5 text-stone-400" />
              <span className="text-xs text-stone-500">{formattedDate}</span>
              {item.is_recurring && (
                <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded ml-1">Hàng năm</span>
              )}
            </div>
          </div>
        </div>
        {showCountdown && (
          <span className={`text-xs px-2 py-1 rounded-full border font-medium whitespace-nowrap ${countdownColor}`}>
            {countdownText}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800 mt-auto">
        <div className="text-xs text-stone-500">
          Tiếp theo: <span className="font-medium text-stone-700 dark:text-stone-300">{nextFormattedDate}</span>
        </div>
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => setIsEditOpen(true)} className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer">
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={handleDelete} className="p-1.5 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {isEditOpen && <EditDateModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} item={item} />}
    </div>
  );
}
