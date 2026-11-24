'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Loader2, Check, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateMediaEntry } from '@/hooks/useEntertainment';
import type { MediaType, MediaStatus } from '@/types/database';

export function AddMediaModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('MOVIE');
  const [status, setStatus] = useState<MediaStatus>('WISHLIST');
  const [genre, setGenre] = useState('');
  const [platform, setPlatform] = useState('');
  const [releaseYear, setReleaseYear] = useState<string>('');
  const [directorCreator, setDirectorCreator] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState('');
  const [notes, setNotes] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = useCreateMediaEntry();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên.');
      return;
    }
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        media_type: mediaType,
        status,
        genre: genre || null,
        platform: platform || null,
        release_year: releaseYear ? Number(releaseYear) : null,
        director_creator: directorCreator || null,
        rating: rating || null,
        review: review || null,
        notes: notes || null,
        poster_url: posterUrl || null,
      });
      toast.success('Đã thêm thành công!');
      setTitle('');
      setGenre('');
      setPlatform('');
      setReleaseYear('');
      setDirectorCreator('');
      setRating(0);
      setReview('');
      setNotes('');
      setPosterUrl('');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDirectorLabel = () => {
    if (mediaType === 'GAME') return 'Nhà phát triển';
    if (mediaType === 'SERIES' || mediaType === 'ANIME') return 'Nhà sản xuất';
    return 'Đạo diễn';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm giải trí" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        <Input label="Tên *" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Loại"
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as MediaType)}
          >
            <option value="MOVIE">Phim</option>
            <option value="SERIES">Series</option>
            <option value="GAME">Game</option>
            <option value="PODCAST">Podcast</option>
            <option value="ANIME">Anime</option>
            <option value="DOCUMENTARY">Tài liệu</option>
          </Select>

          <Select
            label="Trạng thái"
            value={status}
            onChange={(e) => setStatus(e.target.value as MediaStatus)}
          >
            <option value="WISHLIST">Muốn xem/chơi</option>
            <option value="IN_PROGRESS">Đang xem/chơi</option>
            <option value="COMPLETED">Đã xong</option>
            <option value="DROPPED">Bỏ dở</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Thể loại" value={genre} onChange={(e) => setGenre(e.target.value)} />
          <Input label="Nền tảng" placeholder="Netflix, Steam..." value={platform} onChange={(e) => setPlatform(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Năm phát hành" type="number" value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)} />
          <Input label={getDirectorLabel()} value={directorCreator} onChange={(e) => setDirectorCreator(e.target.value)} />
        </div>

        <Input label="Link ảnh bìa" placeholder="https://..." value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} />

        <div className="space-y-1.5">
          <label className="block text-[13px] font-medium text-text-secondary">Đánh giá</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)} className="p-1 cursor-pointer">
                <Star className={`h-5 w-5 ${star <= rating ? 'text-warning fill-warning' : 'text-text-disabled'}`} />
              </button>
            ))}
          </div>
        </div>

        <Textarea label="Đánh giá/Nhận xét" rows={3} value={review} onChange={(e) => setReview(e.target.value)} />
        <Textarea label="Ghi chú" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Huỷ
          </Button>
          <Button type="submit" disabled={isSubmitting || !title.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Lưu</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
