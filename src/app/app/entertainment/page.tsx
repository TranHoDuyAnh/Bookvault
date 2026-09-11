'use client';
import React, { useState } from 'react';
import { Film, Plus } from 'lucide-react';
import { useMediaEntries, useMediaStats } from '@/hooks/useEntertainment';
import { MediaCard } from '@/components/entertainment/MediaCard';
import { AddMediaModal } from '@/components/entertainment/AddMediaModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import type { MediaType, MediaStatus } from '@/types/database';

export default function EntertainmentPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<MediaType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<MediaStatus | 'ALL'>('ALL');

  const { data: items = [], isLoading } = useMediaEntries({ type: typeFilter, status: statusFilter });
  const { data: stats } = useMediaStats();

  const TYPE_TABS = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'MOVIE', label: '🎬 Phim' },
    { value: 'SERIES', label: '📺 Series' },
    { value: 'GAME', label: '🎮 Game' },
    { value: 'PODCAST', label: '🎙️ Podcast' },
    { value: 'ANIME', label: '⛩️ Anime' },
  ];

  const STATUS_TABS = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'WISHLIST', label: 'Muốn xem' },
    { value: 'IN_PROGRESS', label: 'Đang xem' },
    { value: 'COMPLETED', label: 'Đã xong' },
    { value: 'DROPPED', label: 'Bỏ dở' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Film className="h-6 w-6 text-emerald-800" />
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Giải Trí & Văn Hoá
            </h1>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">Phim, series, game, podcast - tất cả trong một chỗ</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-1.5 font-bold shadow-xs">
          <Plus className="h-4 w-4" />
          Thêm mới
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-[#e7e2d9] dark:border-stone-800 shadow-2xs">
          <p className="text-sm text-stone-500 font-medium">Tổng số</p>
          <p className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">{stats?.total || 0}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30 shadow-2xs">
          <p className="text-sm text-emerald-600 dark:text-emerald-500 font-medium">Đã xong</p>
          <p className="text-2xl font-serif font-bold text-emerald-700 dark:text-emerald-400">{stats?.byStatus?.COMPLETED || 0}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/30 shadow-2xs">
          <p className="text-sm text-amber-600 dark:text-amber-500 font-medium">Đang xem/chơi</p>
          <p className="text-2xl font-serif font-bold text-amber-700 dark:text-amber-400">{stats?.byStatus?.IN_PROGRESS || 0}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30 shadow-2xs">
          <p className="text-sm text-blue-600 dark:text-blue-500 font-medium">Muốn xem</p>
          <p className="text-2xl font-serif font-bold text-blue-700 dark:text-blue-400">{stats?.byStatus?.WISHLIST || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {TYPE_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setTypeFilter(tab.value as any)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                typeFilter === tab.value 
                  ? 'bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900' 
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value as any)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                statusFilter === tab.value 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' 
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-400'
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
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState 
          icon={<Film className="h-8 w-8 text-stone-400" />} 
          title="Chưa có mục nào" 
          description="Hãy thêm bộ phim, game hoặc podcast đầu tiên của bạn" 
          actionLabel="Thêm mới" 
          onAction={() => setIsAddOpen(true)} 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => <MediaCard key={item.id} item={item} />)}
        </div>
      )}

      <AddMediaModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
