'use client';
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loader2, Check, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateMediaEntry } from '@/hooks/useEntertainment';
import type { MediaEntry } from '@/types/database';

export function EditMediaModal({ isOpen, onClose, item }: { isOpen: boolean; onClose: () => void, item: MediaEntry }) {
  const [title, setTitle] = useState(item.title);
  const [mediaType, setMediaType] = useState(item.media_type);
  const [status, setStatus] = useState(item.status);
  const [genre, setGenre] = useState(item.genre || '');
  const [platform, setPlatform] = useState(item.platform || '');
  const [releaseYear, setReleaseYear] = useState<number | ''>(item.release_year || '');
  const [directorCreator, setDirectorCreator] = useState(item.director_creator || '');
  const [rating, setRating] = useState<number>(item.rating || 0);
  const [review, setReview] = useState(item.review || '');
  const [notes, setNotes] = useState(item.notes || '');
  const [posterUrl, setPosterUrl] = useState(item.poster_url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const updateMutation = useUpdateMediaEntry();

  useEffect(() => {
    if (isOpen) {
      setTitle(item.title);
      setMediaType(item.media_type);
      setStatus(item.status);
      setGenre(item.genre || '');
      setPlatform(item.platform || '');
      setReleaseYear(item.release_year || '');
      setDirectorCreator(item.director_creator || '');
      setRating(item.rating || 0);
      setReview(item.review || '');
      setNotes(item.notes || '');
      setPosterUrl(item.poster_url || '');
    }
  }, [isOpen, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Vui lòng nhập tên.'); return; }
    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({ 
        id: item.id,
        updates: {
          title: title.trim(),
          media_type: mediaType as any,
          status: status as any,
          genre,
          platform,
          release_year: releaseYear ? Number(releaseYear) : null,
          director_creator: directorCreator,
          rating: rating || null,
          review,
          notes,
          poster_url: posterUrl
        } as any
      });
      toast.success('Đã cập nhật thành công!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra.');
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
    <Modal isOpen={isOpen} onClose={onClose} title="Sửa giải trí" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        <Input label="Tên *" value={title} onChange={(e) => setTitle(e.target.value)} required />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Loại</label>
            <select className="w-full h-10 px-3 py-2 bg-transparent border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" value={mediaType} onChange={(e) => setMediaType(e.target.value as any)}>
              <option value="MOVIE">🎬 Phim</option>
              <option value="SERIES">📺 Series</option>
              <option value="GAME">🎮 Game</option>
              <option value="PODCAST">🎙️ Podcast</option>
              <option value="ANIME">⛩️ Anime</option>
              <option value="DOCUMENTARY">🎥 Tài liệu</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Trạng thái</label>
            <select className="w-full h-10 px-3 py-2 bg-transparent border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="WISHLIST">Muốn xem/chơi</option>
              <option value="IN_PROGRESS">Đang xem/chơi</option>
              <option value="COMPLETED">Đã xong</option>
              <option value="DROPPED">Bỏ dở</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Thể loại" value={genre} onChange={(e) => setGenre(e.target.value)} />
          <Input label="Nền tảng" placeholder="Netflix, Steam..." value={platform} onChange={(e) => setPlatform(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Năm phát hành" type="number" value={releaseYear} onChange={(e) => setReleaseYear(e.target.value as any)} />
          <Input label={getDirectorLabel()} value={directorCreator} onChange={(e) => setDirectorCreator(e.target.value)} />
        </div>

        <Input label="Link ảnh bìa" placeholder="https://..." value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Đánh giá</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)} className="p-1 cursor-pointer">
                <Star className={`h-6 w-6 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Đánh giá/Nhận xét</label>
          <textarea rows={3} className="w-full p-3 bg-transparent border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" value={review} onChange={(e) => setReview(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Ghi chú</label>
          <textarea rows={2} className="w-full p-3 bg-transparent border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-stone-100 dark:border-stone-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Huỷ</Button>
          <Button type="submit" disabled={isSubmitting || !title.trim()} className="bg-[#1e3a2f] hover:bg-[#152a22] text-white gap-2">
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Đang lưu...</span></> : <><Check className="h-4 w-4" /><span>Lưu</span></>}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
