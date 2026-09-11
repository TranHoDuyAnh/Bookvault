'use client';

import React, { useState } from 'react';
import { Wrench, Loader2, Check, DollarSign, Calendar, User, Phone, MapPin, Star } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useCreateServiceRecord } from '@/hooks/useServices';
import { SERVICE_CATEGORIES } from '@/services/services';
import { toast } from 'sonner';

export function AddServiceModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const createMutation = useCreateServiceRecord();

  const [serviceCategory, setServiceCategory] = useState(SERVICE_CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState('');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [providerName, setProviderName] = useState('');
  const [providerPhone, setProviderPhone] = useState('');
  const [providerAddress, setProviderAddress] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState('');

  const handleReset = () => {
    setServiceCategory(SERVICE_CATEGORIES[0]);
    setTitle('');
    setCost('');
    setServiceDate(new Date().toISOString().split('T')[0]);
    setProviderName('');
    setProviderPhone('');
    setProviderAddress('');
    setRating(5);
    setNotes('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên dịch vụ đã dùng.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        serviceCategory,
        title,
        cost: cost ? Number(cost) : 0,
        serviceDate,
        providerName,
        providerPhone,
        providerAddress,
        rating: rating > 0 ? rating : null,
        notes,
      });

      toast.success('Đã lưu lịch sử dịch vụ! 🛠️');
      handleReset();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu dịch vụ.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-emerald-800" />
          <span>Ghi nhận lịch sử dịch vụ</span>
        </div>
      }
      description="Lưu vết bảo dưỡng xe, vệ sinh máy lạnh, cắt tóc, sửa điện thoại..."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Pills */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
            Loại dịch vụ
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 border rounded-xl border-stone-200">
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setServiceCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  serviceCategory === cat
                    ? 'bg-[#1e3a2f] text-white border-[#1e3a2f]'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Tên dịch vụ *"
          placeholder="Bảo dưỡng xe máy 10.000km, Cắt tóc & gội đầu..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            leftIcon={<Calendar className="h-4 w-4" />}
          />

          <Input
            label="Tên cửa hàng / Thợ làm"
            placeholder="Salon 30Shine, HEAD Honda..."
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            leftIcon={<User className="h-4 w-4" />}
          />

          <Input
            label="Số điện thoại liên hệ"
            placeholder="0988 123 456"
            value={providerPhone}
            onChange={(e) => setProviderPhone(e.target.value)}
            leftIcon={<Phone className="h-4 w-4" />}
          />
        </div>

        <Input
          label="Địa chỉ cửa hàng / Trụ sở"
          placeholder="120 Cầu Giấy, Hà Nội..."
          value={providerAddress}
          onChange={(e) => setProviderAddress(e.target.value)}
          leftIcon={<MapPin className="h-4 w-4" />}
        />

        {/* Rating */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
            Đánh giá chất lượng: {rating} / 5 ⭐
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-2xl hover:scale-110 transition-transform cursor-pointer"
              >
                {star <= rating ? '★' : '☆'}
              </button>
            ))}
          </div>
        </div>

        <Textarea
          label="Ghi chú & Trải nghiệm"
          placeholder="Thợ nhiệt tình, làm sạch sẽ, lần sau nên quay lại..."
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
                Lưu dịch vụ
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
