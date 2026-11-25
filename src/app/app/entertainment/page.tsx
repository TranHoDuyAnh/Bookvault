'use client';

import React, { useMemo, useState } from 'react';
import { Film, Plus, Search, X } from 'lucide-react';
import { useMediaEntries, useMediaStats } from '@/hooks/useEntertainment';
import { MediaCard } from '@/components/entertainment/MediaCard';
import { AddMediaModal } from '@/components/entertainment/AddMediaModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import type { MediaType, MediaStatus } from '@/types/database';

export default function EntertainmentPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<MediaType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<MediaStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: items = [], isLoading } = useMediaEntries({ type: typeFilter, status: statusFilter });
  const { data: stats } = useMediaStats();

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const hay = [
        item.title,
        item.director_creator,
        item.genre,
        item.platform,
        item.notes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, searchQuery]);

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

      {/* Filters & Compact Search */}
      <div className="rounded-2xl border border-border bg-card backdrop-blur-xl p-4 space-y-3 shadow-[var(--glass-shadow)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setTypeFilter(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  typeFilter === tab.value
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-secondary text-text-secondary hover:bg-accent hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên phim, đạo diễn, thể loại..."
              className="h-8 rounded-full pl-8 pr-8 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground cursor-pointer"
                aria-label="Xóa tìm kiếm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === tab.value
                  ? 'bg-primary text-primary-foreground shadow-xs'
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
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={<Film className="h-6 w-6 stroke-[1.5]" />}
          title={searchQuery.trim() ? 'Không tìm thấy kết quả' : 'Chưa có mục nào'}
          description={
            searchQuery.trim()
              ? `Không có phim/mục nào khớp với "${searchQuery.trim()}".`
              : 'Hãy thêm bộ phim, game hoặc podcast đầu tiên của bạn.'
          }
          actionLabel={searchQuery.trim() ? 'Xóa tìm kiếm' : 'Thêm mới'}
          onAction={() => (searchQuery.trim() ? setSearchQuery('') : setIsAddOpen(true))}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <AddMediaModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
