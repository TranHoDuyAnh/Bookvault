'use client';

import React, { useState, useRef } from 'react';
import { CheckCircle2, Camera, X, Loader2, Award, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useCompleteQuest } from '@/hooks/useMystery';
import type { UserDailyQuest } from '@/types/database';
import { toast } from 'sonner';

export function QuestCompleteModal({
  isOpen,
  onClose,
  dailyQuest,
}: {
  isOpen: boolean;
  onClose: () => void;
  dailyQuest: UserDailyQuest | null;
}) {
  const completeMutation = useCompleteQuest();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [proofNote, setProofNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!dailyQuest) return null;

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh.');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleReset = () => {
    setProofNote('');
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await completeMutation.mutateAsync({
        dailyQuestId: dailyQuest.id,
        proofNote,
        proofImageFile: selectedFile,
      });

      toast.success('Chúc mừng bạn đã hoàn thành nhiệm vụ hôm nay! 🎉🔥');
      handleReset();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xác nhận nhiệm vụ.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-600" />
          <span>Xác nhận hoàn thành nhiệm vụ</span>
        </div>
      }
      description={`Nhiệm vụ: "${dailyQuest.quest?.title}"`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo Proof */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
            Ảnh check-in minh chứng (tuỳ chọn)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
          />
          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-4 text-center cursor-pointer hover:border-[#1e3a2f] bg-stone-50/50"
            >
              <Camera className="h-6 w-6 text-stone-400 mb-1" />
              <span className="text-xs font-semibold text-stone-700">Tải ảnh chụp kỷ niệm</span>
            </div>
          ) : (
            <div className="relative h-36 w-full overflow-hidden rounded-xl border border-stone-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        <Textarea
          label="Cảm nhận / Nhật ký trải nghiệm"
          placeholder="Bạn cảm thấy thế nào sau khi hoàn thành thử thách này? Có điều gì bất ngờ hay bài học gì rút ra không?..."
          value={proofNote}
          onChange={(e) => setProofNote(e.target.value)}
          rows={3}
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={completeMutation.isPending}>
            Huỷ
          </Button>
          <Button type="submit" size="sm" disabled={completeMutation.isPending} className="gap-1.5 font-bold">
            {completeMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang xác nhận...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Hoàn thành & Nhận điểm
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
