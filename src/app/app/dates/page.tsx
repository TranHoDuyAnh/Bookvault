'use client';
import React, { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { useImportantDates, useUpcomingDates } from '@/hooks/useImportantDates';
import { ImportantDateCard } from '@/components/dates/ImportantDateCard';
import { AddDateModal } from '@/components/dates/AddDateModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import type { DateCategory } from '@/types/database';

export default function ImportantDatesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<DateCategory | 'ALL'>('ALL');

  const { data: allDates = [], isLoading } = useImportantDates();
  const { data: upcomingDates = [], isLoading: isUpcomingLoading } = useUpcomingDates(30);

  const filteredDates = categoryFilter === 'ALL' 
    ? allDates 
    : allDates.filter(d => d.category === categoryFilter);

  const CATEGORY_TABS = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'BIRTHDAY', label: '🎂 Sinh nhật' },
    { value: 'ANNIVERSARY', label: '💑 Kỷ niệm' },
    { value: 'REMINDER', label: '⏰ Nhắc nhở' },
    { value: 'HOLIDAY', label: '🎉 Lễ kỷ niệm' },
    { value: 'OTHER', label: '📅 Khác' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-emerald-800" />
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Ngày Quan Trọng
            </h1>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">Không bao giờ quên sinh nhật và kỷ niệm quan trọng</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-1.5 font-bold shadow-xs">
          <Plus className="h-4 w-4" />
          Thêm sự kiện
        </Button>
      </div>

      {/* Upcoming Section */}
      <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-900/30">
        <h2 className="font-serif font-bold text-xl text-emerald-900 dark:text-emerald-100 mb-4 flex items-center gap-2">
          <span>🔔</span> Sắp diễn ra (30 ngày tới)
        </h2>
        {isUpcomingLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : upcomingDates.length === 0 ? (
          <p className="text-emerald-700 dark:text-emerald-400 text-sm">Không có sự kiện nào sắp tới.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {upcomingDates.map(item => (
              <ImportantDateCard key={item.id} item={item} showCountdown={true} />
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 pt-2">
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setCategoryFilter(tab.value as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              categoryFilter === tab.value 
                ? 'bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm' 
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* All Dates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
      ) : filteredDates.length === 0 ? (
        <EmptyState 
          icon={<Calendar className="h-8 w-8 text-stone-400" />} 
          title="Chưa có ngày quan trọng" 
          description="Thêm sinh nhật hoặc kỷ niệm để được nhắc nhở" 
          actionLabel="Thêm mới" 
          onAction={() => setIsAddOpen(true)} 
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredDates.map(item => <ImportantDateCard key={item.id} item={item} showCountdown={true} />)}
        </div>
      )}

      <AddDateModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
