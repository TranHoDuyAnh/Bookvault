'use client';

import React, { useState } from 'react';
import { Wrench, Loader2, Check, DollarSign, Calendar, User } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useAddMaintenanceLog } from '@/hooks/useHome';
import type { HomeItem } from '@/types/database';
import { toast } from 'sonner';

export function MaintenanceModal({
  isOpen,
  onClose,
  item,
}: {
  isOpen: boolean;
  onClose: () => void;
  item: HomeItem | null;
}) {
  const addLogMutation = useAddMaintenanceLog();

  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [maintenanceDate, setMaintenanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [performedBy, setPerformedBy] = useState('');

  if (!item) return null;

  const handleReset = () => {
    setDescription('');
    setCost('');
    setMaintenanceDate(new Date().toISOString().split('T')[0]);
    setPerformedBy('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Vui lòng nhập nội dung sửa chữa / bảo dưỡng.');
      return;
    }

    try {
      await addLogMutation.mutateAsync({
        itemId: item.id,
        description,
        cost: cost ? Number(cost) : 0,
        maintenanceDate,
        performedBy,
      });

      toast.success(`Đã lưu nhật ký bảo trì cho ${item.name}! 🔧`);
      handleReset();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu bảo trì.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-[#1e3a2f]" />
          <span>Ghi nhật ký bảo trì / sửa chữa</span>
        </div>
      }
      description={`Thiết bị: "${item.name}"`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          label="Nội dung bảo trì / Thay thế linh kiện *"
          placeholder="Ví dụ: Thay lõi lọc bụi HEPA chính hãng, vệ sinh quạt hút..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Chi phí (VNĐ)"
            type="number"
            min="0"
            placeholder="350000"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            leftIcon={<DollarSign className="h-4 w-4" />}
          />

          <Input
            label="Ngày thực hiện"
            type="date"
            value={maintenanceDate}
            onChange={(e) => setMaintenanceDate(e.target.value)}
            leftIcon={<Calendar className="h-4 w-4" />}
          />
        </div>

        <Input
          label="Người thực hiện / Trung tâm bảo hành"
          placeholder="Tự thay tại nhà, Thợ Điện Máy Xanh..."
          value={performedBy}
          onChange={(e) => setPerformedBy(e.target.value)}
          leftIcon={<User className="h-4 w-4" />}
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={addLogMutation.isPending}>
            Huỷ
          </Button>
          <Button type="submit" size="sm" disabled={addLogMutation.isPending} className="gap-1.5 font-semibold">
            {addLogMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Lưu bảo trì
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
