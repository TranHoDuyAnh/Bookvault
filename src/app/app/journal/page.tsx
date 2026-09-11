'use client';
import React, { useState } from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { useJournalEntries } from '@/hooks/useJournal';
import { JournalEntryCard } from '@/components/journal/JournalEntryCard';
import { AddJournalModal } from '@/components/journal/AddJournalModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';

export default function JournalPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');
  
  const { data: entries = [], isLoading } = useJournalEntries();

  const filteredEntries = entries.filter(entry => {
    if (filter === 'all') return true;
    const entryDate = new Date(entry.entry_date || entry.created_at);
    const now = new Date();
    const diffMs = now.getTime() - entryDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (filter === 'week') return diffDays <= 7;
    if (filter === 'month') return diffDays <= 30;
    return true;
  });

  const thisMonthEntries = entries.filter(e => {
    const d = new Date(e.entry_date || e.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const moods = entries.map(e => e.mood).filter(Boolean) as number[];
  let mostCommonMood = '-';
  if (moods.length > 0) {
    const counts = moods.reduce((acc, m) => { acc[m] = (acc[m] || 0) + 1; return acc; }, {} as Record<number, number>);
    const bestMood = Object.keys(counts).reduce((a, b) => counts[Number(a)] > counts[Number(b)] ? a : b);
    const moodEmojis: Record<string, string> = { '1': '😞', '2': '😐', '3': '🙂', '4': '😊', '5': '🤩' };
    mostCommonMood = moodEmojis[bestMood] || '-';
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-[#1e3a2f]" />
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Nhật Ký Cá Nhân
            </h1>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">Ghi lại suy nghĩ, cảm xúc và kỷ niệm mỗi ngày.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-1.5 font-bold shadow-sm bg-[#1e3a2f] text-white hidden sm:flex">
          <Plus className="h-4 w-4" />
          Viết ngày mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm text-center">
          <div className="text-3xl font-bold text-stone-800 dark:text-stone-200">{entries.length}</div>
          <div className="text-xs text-stone-500 uppercase font-semibold mt-1">Tổng bài viết</div>
        </div>
        <div className="bg-[#FAF8F5] dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm text-center">
          <div className="text-3xl font-bold text-[#1e3a2f] dark:text-emerald-400">{thisMonthEntries}</div>
          <div className="text-xs text-stone-600 dark:text-stone-400 uppercase font-semibold mt-1">Tháng này</div>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm text-center">
          <div className="text-3xl font-bold">{mostCommonMood}</div>
          <div className="text-xs text-stone-500 uppercase font-semibold mt-1">Tâm trạng phổ biến</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-4">
        {(['all', 'week', 'month'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f 
                ? 'bg-[#1e3a2f] text-white' 
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400'
            }`}
          >
            {f === 'all' ? 'Tất cả' : f === 'week' ? 'Tuần này' : 'Tháng này'}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
        </div>
      ) : filteredEntries.length === 0 ? (
        <EmptyState 
          icon={<BookOpen className="h-12 w-12 text-stone-300" />} 
          title="Chưa có nhật ký nào" 
          description="Bắt đầu ghi lại những khoảnh khắc đáng nhớ của bạn." 
          actionLabel="Viết bài đầu tiên" 
          onAction={() => setIsAddOpen(true)} 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEntries.map((entry) => (
            <JournalEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* Floating Action Button (Mobile) */}
      <button 
        onClick={() => setIsAddOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#1e3a2f] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        <Plus className="h-6 w-6" />
      </button>

      <AddJournalModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
