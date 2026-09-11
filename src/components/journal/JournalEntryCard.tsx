'use client';
import React, { useState } from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import { useDeleteJournalEntry } from '@/hooks/useJournal';
import { EditJournalModal } from './EditJournalModal';
import type { JournalEntry } from '@/types/database';
import { toast } from 'sonner';

const MOODS: Record<number, string> = {
  1: '😞',
  2: '😐',
  3: '🙂',
  4: '😊',
  5: '🤩'
};

export function JournalEntryCard({ entry }: { entry: JournalEntry }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const deleteMutation = useDeleteJournalEntry();

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xoá nhật ký này?')) return;
    try {
      await deleteMutation.mutateAsync(entry.id);
      toast.success('Đã xoá nhật ký!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  
  const dateObj = new Date(entry.entry_date || entry.created_at);
  const dateStr = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const dayOfWeek = dateObj.toLocaleDateString('vi-VN', { weekday: 'long' });

  return (
    <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-[#FAF8F5] dark:bg-stone-900 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">{dateStr}</div>
          <div className="text-sm text-stone-500 capitalize">{dayOfWeek}</div>
        </div>
        {entry.mood && (
          <div className="text-4xl" title={`Tâm trạng: ${entry.mood}/5`}>
            {MOODS[entry.mood as number]}
          </div>
        )}
      </div>
      
      {entry.title && (
        <h3 className="font-bold text-lg font-serif text-stone-800 dark:text-stone-200">{entry.title}</h3>
      )}
      
      <p className="text-stone-700 dark:text-stone-300 whitespace-pre-wrap text-sm line-clamp-4 leading-relaxed">
        {entry.content}
      </p>

      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {entry.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs rounded-md">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-1 pt-3 border-t border-stone-200 dark:border-stone-800">
        <button onClick={() => setIsEditOpen(true)} className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors cursor-pointer">
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button onClick={handleDelete} className="p-1.5 rounded-lg text-stone-400 hover:bg-rose-100 hover:text-rose-600 transition-colors cursor-pointer">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <EditJournalModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} entry={entry} />
    </div>
  );
}
