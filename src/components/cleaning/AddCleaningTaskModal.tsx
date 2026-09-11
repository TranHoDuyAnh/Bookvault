'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, Check, Calendar, RotateCw } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useCreateCleaningTask } from '@/hooks/useCleaning';
import { toast } from 'sonner';

export const CLEANING_PRESETS = [
  { title: 'Vệ sinh máy lạnh & lưới lọc', days: 90, category: 'Thiết bị' },
  { title: 'Giặt chăn ga gối đệm', days: 14, category: 'Phòng ngủ' },
  { title: 'Vệ sinh & khử mùi tủ lạnh', days: 30, category: 'Bếp' },
  { title: 'Vệ sinh lồng giặt máy giặt', days: 90, category: 'Thiết bị' },
  { title: 'Lau cửa kính & gương', days: 30, category: 'Nhà cửa' },
  { title: 'Thay lõi lọc nước / máy lọc khí', days: 180, category: 'Thiết bị' },
  { title: 'Tẩy cặn bồn tắm & nhà vệ sinh', days: 7, category: 'Nhà tắm' },
];

export function AddCleaningTaskModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const createMutation = useCreateCleaningTask();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Nhà cửa');
  const [frequencyDays, setFrequencyDays] = useState('30');
  const [lastCompletedAt, setLastCompletedAt] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleReset = () => {
    setTitle('');
    setCategory('Nhà cửa');
    setFrequencyDays('30');
    setLastCompletedAt(new Date().toISOString().split('T')[0]);
    setNotes('');
    onClose();
  };

  const handleSelectPreset = (preset: typeof CLEANING_PRESETS[0]) => {
    setTitle(preset.title);
    setFrequencyDays(String(preset.days));
    setCategory(preset.category);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên việc vệ sinh.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        title,
        category,
        frequencyDays: Number(frequencyDays) || 30,
        lastCompletedAt,
        notes,
      });

      toast.success('Đã thêm lịch vệ sinh định kỳ! 🧹');
      handleReset();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi thêm lịch vệ sinh.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-700" />
          <span>Thêm lịch vệ sinh định kỳ</span>
        </div>
      }
      description="Tự động nhắc việc dọn dẹp theo chu kỳ ngày, tuần hoặc tháng."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Preset chips */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
            Gợi ý công việc mẫu
          </span>
          <div className="flex flex-wrap gap-1.5">
            {CLEANING_PRESETS.map((p) => (
              <button
                key={p.title}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="px-2.5 py-1 text-xs rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors cursor-pointer"
              >
                {p.title} ({p.days}d)
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Tên việc cần vệ sinh *"
          placeholder="Ví dụ: Vệ sinh máy lạnh, Giặt rèm cửa..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Khu vực / Danh mục"
            placeholder="Phòng khách, Bếp, Thiết bị..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <Input
            label="Chu kỳ lặp lại (Số ngày) *"
            type="number"
            min="1"
            placeholder="30"
            value={frequencyDays}
            onChange={(e) => setFrequencyDays(e.target.value)}
            leftIcon={<RotateCw className="h-4 w-4" />}
            required
          />
        </div>

        <Input
          label="Lần làm gần nhất"
          type="date"
          value={lastCompletedAt}
          onChange={(e) => setLastCompletedAt(e.target.value)}
          leftIcon={<Calendar className="h-4 w-4" />}
        />

        <Textarea
          label="Ghi chú & Hướng dẫn vệ sinh"
          placeholder="Dùng dung dịch tẩy rửa nhẹ, tháo lưới lọc cẩn thận..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={createMutation.isPending}>
            Huỷ
          </Button>
          <Button type="submit" size="sm" disabled={createMutation.isPending} className="gap-1.5 font-semibold">
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Lưu lịch vệ sinh
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
