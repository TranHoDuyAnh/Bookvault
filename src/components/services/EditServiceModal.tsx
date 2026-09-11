'use client';

import React, { useState, useEffect } from 'react';
import { Wrench, Loader2, Check, DollarSign, Calendar, User, Phone, MapPin, Star, Edit } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useUpdateServiceRecord } from '@/hooks/useServices';
import { SERVICE_CATEGORIES } from '@/services/services';
import type { ServiceRecord } from '@/types/database';
import { toast } from 'sonner';

export function EditServiceModal({
  isOpen,
  onClose,
  record,
}: {
  isOpen: boolean;
  onClose: () => void;
  record: ServiceRecord;
}) {
  const updateMutation = useUpdateServiceRecord();

  const [serviceCategory, setServiceCategory] = useState(record.service_category || SERVICE_CATEGORIES[0]);
  const [title, setTitle] = useState(record.title || '');
  const [cost, setCost] = useState(record.cost !== null && record.cost !== undefined ? String(record.cost) : '');
  const [serviceDate, setServiceDate] = useState(record.service_date || '');
  const [providerName, setProviderName] = useState(record.provider_name || '');
  const [providerPhone, setProviderPhone] = useState(record.provider_phone || '');
  const [providerAddress, setProviderAddress] = useState(record.provider_address || '');
  const [rating, setRating] = useState<number>(record.rating || 5);
  const [nextServiceRecommendedDate, setNextServiceRecommendedDate] = useState(
    record.next_service_recommended_date || ''
  );
  const [notes, setNotes] = useState(record.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && record) {
      setServiceCategory(record.service_category || SERVICE_CATEGORIES[0]);
      setTitle(record.title || '');
      setCost(record.cost !== null && record.cost !== undefined ? String(record.cost) : '');
      setServiceDate(record.service_date || '');
      setProviderName(record.provider_name || '');
      setProviderPhone(record.provider_phone || '');
      setProviderAddress(record.provider_address || '');
      setRating(record.rating || 5);
      setNextServiceRecommendedDate(record.next_service_recommended_date || '');
      setNotes(record.notes || '');
    }
  }, [isOpen, record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên dịch vụ đã dùng.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({
        recordId: record.id,
        updates: {
          service_category: serviceCategory.trim(),
          title: title.trim(),
          cost: cost ? Number(cost) : 0,
          service_date: serviceDate || new Date().toISOString().split('T')[0],
          provider_name: providerName.trim() || null,
          provider_phone: providerPhone.trim() || null,
          provider_address: providerAddress.trim() || null,
          rating: rating > 0 ? rating : null,
          next_service_recommended_date: nextServiceRecommendedDate || null,
          notes: notes.trim() || null,
        },
      });

      toast.success('Đã cập nhật lịch sử dịch vụ! 🛠️');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật dịch vụ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Edit className="h-5 w-5 text-emerald-800" />
          <span>Chỉnh sửa lịch sử dịch vụ</span>
        </div>
      }
      description="Cập nhật chi phí, đơn vị phục vụ và đánh giá dịch vụ."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300">
            Loại dịch vụ
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 border rounded-xl border-stone-200 dark:border-stone-700">
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setServiceCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  serviceCategory === cat
                    ? 'bg-[#1e3a2f] text-white border-[#1e3a2f]'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <Input
          label="Nội dung dịch vụ / Tiêu đề *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Cost & Date */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Chi phí (₫) *"
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
          />

          <Input
            label="Ngày sử dụng dịch vụ"
            type="date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
          />
        </div>

        {/* Provider info */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Tên tiệm / Người phục vụ"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
          />

          <Input
            label="Số điện thoại"
            value={providerPhone}
            onChange={(e) => setProviderPhone(e.target.value)}
          />
        </div>

        <Input
          label="Địa chỉ tiệm / Nơi làm dịch vụ"
          value={providerAddress}
          onChange={(e) => setProviderAddress(e.target.value)}
        />

        {/* Rating */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Đánh giá mức độ hài lòng
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 cursor-pointer hover:scale-110 transition-transform"
              >
                <Star
                  className={`h-5 w-5 ${
                    rating >= star
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-stone-300 dark:text-stone-600'
                  }`}
                />
              </button>
            ))}
            <span className="text-xs text-stone-500 ml-1">({rating} sao)</span>
          </div>
        </div>

        {/* Next service date */}
        <Input
          label="Khuyến nghị ngày làm lần tới"
          type="date"
          value={nextServiceRecommendedDate}
          onChange={(e) => setNextServiceRecommendedDate(e.target.value)}
        />

        {/* Notes */}
        <Textarea
          label="Ghi chú thêm"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Huỷ
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="bg-[#1e3a2f] hover:bg-[#152a22] text-white gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
