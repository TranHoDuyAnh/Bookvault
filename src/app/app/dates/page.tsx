'use client';

import React, { useState } from 'react';
import { Calendar, Plus, Bell } from 'lucide-react';
import { useImportantDates, useUpcomingDates } from '@/hooks/useImportantDates';
import { ImportantDateCard } from '@/components/dates/ImportantDateCard';
import { AddDateModal } from '@/components/dates/AddDateModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import type { DateCategory } from '@/types/database';

export default function ImportantDatesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<DateCategory | 'ALL'>('ALL');

  const { data: allDates = [], isLoading } = useImportantDates();
  const { data: upcomingDates = [], isLoading: isUpcomingLoading } = useUpcomingDates(30);

  const filteredDates =
    categoryFilter === 'ALL'
      ? allDates
      : allDates.filter((d) => d.category === categoryFilter);

  const CATEGORY_TABS: { value: DateCategory | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'BIRTHDAY', label: 'Sinh nhật' },
    { value: 'ANNIVERSARY', label: 'Kỷ niệm' },
    { value: 'REMINDER', label: 'Nhắc nhở' },
    { value: 'HOLIDAY', label: 'Lễ kỷ niệm' },
    { value: 'OTHER', label: 'Khác' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Ngày Quan Trọng"
        description="Không bao giờ quên sinh nhật và kỷ niệm quan trọng"
        actions={
          <Button onClick={() => setIsAddOpen(true)} size="sm">
            <Plus className="h-4 w-4" />
            Thêm sự kiện
          </Button>
        }
      />

      {/* Upcoming Section */}
      <section className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-text-secondary" />
          <h2 className="text-base font-semibold text-foreground">
            Sắp diễn ra (30 ngày tới)
          </h2>
        </div>

        {isUpcomingLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ) : upcomingDates.length === 0 ? (
          <p className="text-sm text-text-muted">Không có sự kiện nào sắp tới.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {upcomingDates.map((item) => (
              <ImportantDateCard key={item.id} item={item} showCountdown={true} />
            ))}
          </div>
        )}
      </section>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setCategoryFilter(tab.value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              categoryFilter === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-text-secondary border border-border hover:bg-accent hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* All Dates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredDates.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-6 w-6 stroke-[1.5]" />}
          title="Chưa có ngày quan trọng"
          description="Thêm sinh nhật hoặc kỷ niệm để được nhắc nhở."
          actionLabel="Thêm mới"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredDates.map((item) => (
            <ImportantDateCard key={item.id} item={item} showCountdown={true} />
          ))}
        </div>
      )}

      <AddDateModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
