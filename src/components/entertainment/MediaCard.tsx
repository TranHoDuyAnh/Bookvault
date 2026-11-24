'use client';

import React, { useState } from 'react';
import { Trash2, Edit2, Star } from 'lucide-react';
import { useDeleteMediaEntry } from '@/hooks/useEntertainment';
import { EditMediaModal } from './EditMediaModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import type { MediaEntry } from '@/types/database';
import { toast } from 'sonner';

const TYPE_EMOJIS: Record<string, string> = {
  MOVIE: '🎬',
  SERIES: '📺',
  GAME: '🎮',
  PODCAST: '🎙️',
  ANIME: '⛩️',
  DOCUMENTARY: '🎥',
};

const TYPE_LABELS: Record<string, string> = {
  MOVIE: 'Phim',
  SERIES: 'Series',
  GAME: 'Game',
  PODCAST: 'Podcast',
  ANIME: 'Anime',
  DOCUMENTARY: 'Tài liệu',
};

const STATUS_BADGE: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'destructive' | 'secondary' }> = {
  WISHLIST: { label: 'Muốn xem', variant: 'info' },
  IN_PROGRESS: { label: 'Đang xem/chơi', variant: 'warning' },
  COMPLETED: { label: 'Đã xong', variant: 'success' },
  DROPPED: { label: 'Bỏ dở', variant: 'destructive' },
};

export function MediaCard({ item }: { item: MediaEntry }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deleteMutation = useDeleteMediaEntry();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success('Đã xoá!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi xoá.';
      toast.error(message);
    }
  };

  const statusInfo = STATUS_BADGE[item.status] || { label: item.status, variant: 'secondary' as const };

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-2xs space-y-3 flex flex-col h-full">
      <div className="flex gap-3.5">
        <div className="w-18 h-26 shrink-0 rounded-md overflow-hidden bg-secondary border border-border flex items-center justify-center">
          {item.poster_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.poster_url} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">{TYPE_EMOJIS[item.media_type] || '🎬'}</span>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex flex-wrap gap-1.5 items-start mb-1.5">
            <Badge variant="outline">{TYPE_LABELS[item.media_type] || item.media_type}</Badge>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          <h3 className="font-semibold text-base text-foreground leading-snug truncate">
            {item.title}{' '}
            {item.release_year && (
              <span className="text-text-muted text-xs font-normal tabular-nums">
                ({item.release_year})
              </span>
            )}
          </h3>
          {item.director_creator && (
            <p className="text-xs text-text-muted mt-0.5 truncate">{item.director_creator}</p>
          )}
          {item.platform && (
            <p className="text-xs text-text-muted truncate">Nền tảng: {item.platform}</p>
          )}
          {item.rating ? (
            <div className="mt-auto pt-2 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < item.rating! ? 'text-warning fill-warning' : 'text-text-disabled'
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 pt-2 border-t border-border mt-auto">
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

      {isEditOpen && (
        <EditMediaModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} item={item} />
      )}

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xoá mục giải trí?"
        description={`Bạn có chắc muốn xoá "${item.title}"?`}
        confirmText="Xoá"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
