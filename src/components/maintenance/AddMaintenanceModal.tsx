'use client';

import React, { useState, useRef } from 'react';
import { Wrench, Camera, X, Loader2, Check, DollarSign, Calendar, User, Phone, ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useCreateMaintenanceRecord } from '@/hooks/useMaintenance';
import { toast } from 'sonner';

export const MAINTENANCE_CATEGORIES = [
  'Điện & Chiếu sáng',
  'Ống nước & Thiết bị vệ sinh',
  'Điều hoà & Máy lạnh',
  'Sơn sửa tường & Chống thấm',
  'Khoá cửa & Cửa kính',
  'Tủ bếp & Mộc',
  'Mái nhà & Trần thạch cao',
  'Khác',
];

export function AddMaintenanceModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const createMutation = useCreateMaintenanceRecord();
  const beforePhotoRef = useRef<HTMLInputElement>(null);
  const afterPhotoRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Điện & Chiếu sáng');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [performedDate, setPerformedDate] = useState(new Date().toISOString().split('T')[0]);
  const [contractorName, setContractorName] = useState('');
  const [contractorPhone, setContractorPhone] = useState('');
  const [warrantyUntil, setWarrantyUntil] = useState('');
  const [notes, setNotes] = useState('');

  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);

  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);

  const handleReset = () => {
    setTitle('');
    setCategory('Điện & Chiếu sáng');
    setDescription('');
    setCost('');
    setPerformedDate(new Date().toISOString().split('T')[0]);
    setContractorName('');
    setContractorPhone('');
    setWarrantyUntil('');
    setNotes('');
    setBeforeFile(null);
    setBeforePreview(null);
    setAfterFile(null);
    setAfterPreview(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên công việc bảo trì.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        title,
        category,
        description,
        cost: cost ? Number(cost) : 0,
        performedDate,
        contractorName,
        contractorPhone,
        warrantyUntil: warrantyUntil || null,
        notes,
        beforeImageFile: beforeFile,
        afterImageFile: afterFile,
      });

      toast.success('Đã lưu nhật ký bảo trì nhà cửa! 🔧');
      handleReset();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu bảo trì.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-[#1e3a2f]" />
          <span>Ghi nhận sửa chữa & Bảo trì nhà</span>
        </div>
      }
      description="Lưu giữ lịch sử sửa điện nước, chống thấm, điều hoà và bảo hành thi công."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photos: Before & After */}
        <div className="grid grid-cols-2 gap-3">
          {/* Before Photo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
              Ảnh trước khi sửa (Before)
            </label>
            <input
              ref={beforePhotoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setBeforeFile(e.target.files[0]);
                  setBeforePreview(URL.createObjectURL(e.target.files[0]));
                }
              }}
            />
            {!beforePreview ? (
              <div
                onClick={() => beforePhotoRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-3 text-center cursor-pointer hover:border-[#1e3a2f] bg-stone-50/50 h-24"
              >
                <Camera className="h-5 w-5 text-stone-400 mb-1" />
                <span className="text-[11px] font-semibold text-stone-700">Tải ảnh trước</span>
              </div>
            ) : (
              <div className="relative h-24 w-full overflow-hidden rounded-xl border border-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={beforePreview} alt="Before" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setBeforeFile(null);
                    setBeforePreview(null);
                  }}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* After Photo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
              Ảnh sau khi sửa (After)
            </label>
            <input
              ref={afterPhotoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setAfterFile(e.target.files[0]);
                  setAfterPreview(URL.createObjectURL(e.target.files[0]));
                }
              }}
            />
            {!afterPreview ? (
              <div
                onClick={() => afterPhotoRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-3 text-center cursor-pointer hover:border-[#1e3a2f] bg-stone-50/50 h-24"
              >
                <Camera className="h-5 w-5 text-stone-400 mb-1" />
                <span className="text-[11px] font-semibold text-stone-700">Tải ảnh sau khi sửa</span>
              </div>
            ) : (
              <div className="relative h-24 w-full overflow-hidden rounded-xl border border-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={afterPreview} alt="After" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setAfterFile(null);
                    setAfterPreview(null);
                  }}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
            Hạng mục sửa chữa
          </label>
          <div className="flex flex-wrap gap-1.5">
            {MAINTENANCE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-[#1e3a2f] text-white border-[#1e3a2f]'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Tiêu đề công việc *"
              placeholder="Thay van khoá nước bồn cầu, Xử lý thấm trần ban công..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <Input
            label="Chi phí (VNĐ)"
            type="number"
            min="0"
            placeholder="450000"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            leftIcon={<DollarSign className="h-4 w-4" />}
          />

          <Input
            label="Ngày thực hiện"
            type="date"
            value={performedDate}
            onChange={(e) => setPerformedDate(e.target.value)}
            leftIcon={<Calendar className="h-4 w-4" />}
          />

          <Input
            label="Tên thợ / Đơn vị thi công"
            placeholder="Thợ Nam, Công ty Xử lý thấm..."
            value={contractorName}
            onChange={(e) => setContractorName(e.target.value)}
            leftIcon={<User className="h-4 w-4" />}
          />

          <Input
            label="Số điện thoại thợ"
            placeholder="0912 345 678"
            value={contractorPhone}
            onChange={(e) => setContractorPhone(e.target.value)}
            leftIcon={<Phone className="h-4 w-4" />}
          />

          <div className="sm:col-span-2">
            <Input
              label="Thời hạn bảo hành thi công đến ngày"
              type="date"
              value={warrantyUntil}
              onChange={(e) => setWarrantyUntil(e.target.value)}
              leftIcon={<ShieldCheck className="h-4 w-4" />}
            />
          </div>
        </div>

        <Textarea
          label="Mô tả chi tiết nguyên nhân & giải pháp"
          placeholder="Ống nước bị nứt ở mối nối, đã thay co nối ren đồng và dán keo chuyên dụng..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
                Lưu bảo trì
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
