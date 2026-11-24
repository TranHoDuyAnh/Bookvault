'use client';

import React, { useState } from 'react';
import { Film, Plus } from 'lucide-react';
import { useMediaEntries, useMediaStats } from '@/hooks/useEntertainment';
import { MediaCard } from '@/components/entertainment/MediaCard';
import { AddMediaModal } from '@/components/entertainment/AddMediaModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import type { MediaType, MediaStatus } from '@/types/database';

export default function EntertainmentPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<MediaType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<MediaStatus | 'ALL'>('ALL');

  const { data: items = [], isLoading } = useMediaEntries({ type: typeFilter, status: statusFilter });
  const { data: stats } = useMediaStats();

  const TYPE_TABS: { value: MediaType | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'MOVIE', label: 'Phim' },
    { value: 'SERIES', label: 'Series' },
    { value: 'GAME', label: 'Game' },
    { value: 'PODCAST', label: 'Podcast' },
    { value: 'ANIME', label: 'Anime' },
  ];

  const STATUS_TABS: { value: MediaStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'WISHLIST', label: 'Muốn xem' },
    { value: 'IN_PROGRESS', label: 'Đang xem' },
    { value: 'COMPLETED', label: 'Đã xong' },
    { value: 'DROPPED', label: 'Bỏ dở' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Giải Trí & Văn Hoá"
        description="Phim, series, game, podcast — tất cả trong một nơi"
        actions={
          <Button onClick={() => setIsAddOpen(true)} size="sm">
            <Plus className="h-4 w-4" />
            Thêm mới
          </Button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Tổng số" value={stats?.total || 0} />
        <StatCard label="Đã xong" value={stats?.byStatus?.COMPLETED || 0} />
        <StatCard label="Đang xem/chơi" value={stats?.byStatus?.IN_PROGRESS || 0} />
        <StatCard label="Muốn xem" value={stats?.byStatus?.WISHLIST || 0} />
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-2xs">
        <div className="flex flex-wrap gap-1.5">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setTypeFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                typeFilter === tab.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-text-secondary hover:bg-accent hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === tab.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-transparent border border-border text-text-secondary hover:bg-accent hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Film className="h-6 w-6 stroke-[1.5]" />}
          title="Chưa có mục nào"
          description="Hãy thêm bộ phim, game hoặc podcast đầu tiên của bạn."
          actionLabel="Thêm mới"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <AddMediaModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
