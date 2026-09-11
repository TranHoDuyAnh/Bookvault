'use client';
import React, { useState } from 'react';
import { Trash2, Edit2, Star } from 'lucide-react';
import { useDeleteMediaEntry } from '@/hooks/useEntertainment';
import { EditMediaModal } from './EditMediaModal';
import type { MediaEntry } from '@/types/database';
import { toast } from 'sonner';

const TYPE_EMOJIS: Record<string, string> = {
  MOVIE: '🎬', SERIES: '📺', GAME: '🎮', PODCAST: '🎙️', ANIME: '⛩️', DOCUMENTARY: '🎥'
};

const TYPE_LABELS: Record<string, string> = {
  MOVIE: 'Phim', SERIES: 'Series', GAME: 'Game', PODCAST: 'Podcast', ANIME: 'Anime', DOCUMENTARY: 'Tài liệu'
};

const STATUS_COLORS: Record<string, string> = {
  WISHLIST: 'bg-blue-50 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DROPPED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const STATUS_LABELS: Record<string, string> = {
  WISHLIST: 'Muốn xem', IN_PROGRESS: 'Đang xem/chơi', COMPLETED: 'Đã xong', DROPPED: 'Bỏ dở'
};

export function MediaCard({ item }: { item: MediaEntry }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const deleteMutation = useDeleteMediaEntry();

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xoá?')) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success('Đã xoá!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-3 flex flex-col h-full">
      <div className="flex gap-4">
        <div className="w-20 h-28 shrink-0 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center">
          {item.poster_url ? (
            <img src={item.poster_url} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl">{TYPE_EMOJIS[item.media_type] || '🎬'}</span>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex flex-wrap gap-2 items-start mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
              {TYPE_LABELS[item.media_type] || item.media_type}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_COLORS[item.status]}`}>
              {STATUS_LABELS[item.status] || item.status}
            </span>
          </div>
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 leading-tight truncate">
            {item.title} {item.release_year && <span className="text-stone-500 font-sans text-sm font-normal">({item.release_year})</span>}
          </h3>
          {item.director_creator && (
            <p className="text-xs text-stone-500 mt-1 truncate">{item.director_creator}</p>
          )}
          {item.platform && (
            <p className="text-xs text-stone-500 truncate">Nền tảng: {item.platform}</p>
          )}
          <div className="mt-auto pt-2 flex gap-1">
            {item.rating ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < item.rating! ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`} />
              ))
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 pt-2 border-t border-stone-100 dark:border-stone-800 mt-auto">
        <button onClick={() => setIsEditOpen(true)} className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer">
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button onClick={handleDelete} className="p-1.5 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {isEditOpen && <EditMediaModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} item={item} />}
    </div>
  );
}
