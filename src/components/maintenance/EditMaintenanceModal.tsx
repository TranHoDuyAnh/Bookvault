'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Wrench, Camera, X, Loader2, Check, DollarSign, Calendar, User, Phone, ShieldCheck, Edit } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useUpdateMaintenanceRecord } from '@/hooks/useMaintenance';
import { MAINTENANCE_CATEGORIES } from './AddMaintenanceModal';
import type { HomeMaintenanceRecord, MaintenanceStatus } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

export function EditMaintenanceModal({
  isOpen,
  onClose,
  record,
}: {
  isOpen: boolean;
  onClose: () => void;
  record: HomeMaintenanceRecord;
}) {
  const updateMutation = useUpdateMaintenanceRecord();
  const { user } = useUser();
  const beforePhotoRef = useRef<HTMLInputElement>(null);
  const afterPhotoRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(record.title || '');
  const [category, setCategory] = useState(record.category || 'Điện & Chiếu sáng');
  const [status, setStatus] = useState<MaintenanceStatus>(record.status || 'COMPLETED');
  const [description, setDescription] = useState(record.description || '');
  const [cost, setCost] = useState(record.cost !== null && record.cost !== undefined ? String(record.cost) : '');
  const [performedDate, setPerformedDate] = useState(record.performed_date || '');
  const [contractorName, setContractorName] = useState(record.contractor_name || '');
  const [contractorPhone, setContractorPhone] = useState(record.contractor_phone || '');
  const [warrantyUntil, setWarrantyUntil] = useState(record.warranty_until || '');
  const [notes, setNotes] = useState(record.notes || '');

  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(record.before_image_url || null);

  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(record.after_image_url || null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && record) {
      setTitle(record.title || '');
      setCategory(record.category || 'Điện & Chiếu sáng');
      setStatus(record.status || 'COMPLETED');
      setDescription(record.description || '');
      setCost(record.cost !== null && record.cost !== undefined ? String(record.cost) : '');
      setPerformedDate(record.performed_date || '');
      setContractorName(record.contractor_name || '');
      setContractorPhone(record.contractor_phone || '');
      setWarrantyUntil(record.warranty_until || '');
      setNotes(record.notes || '');
      setBeforeFile(null);
      setBeforePreview(record.before_image_url || null);
      setAfterFile(null);
      setAfterPreview(record.after_image_url || null);
    }
  }, [isOpen, record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên công việc bảo trì.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalBeforeUrl = record.before_image_url;
      let finalAfterUrl = record.after_image_url;

      if (user) {
        const supabase = createClient();
        if (beforeFile) {
          const fileExt = beforeFile.name.split('.').pop() || 'jpg';
          const filePath = `${user.id}/maintenance/before_${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('book-images')
            .upload(filePath, beforeFile, { cacheControl: '3600', upsert: false });
          if (!uploadError) {
            const { data: signed } = await supabase.storage.from('book-images').createSignedUrl(filePath, 60 * 60 * 24 * 30);
            finalBeforeUrl = signed?.signedUrl || filePath;
          }
        }

        if (afterFile) {
          const fileExt = afterFile.name.split('.').pop() || 'jpg';
          const filePath = `${user.id}/maintenance/after_${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('book-images')
            .upload(filePath, afterFile, { cacheControl: '3600', upsert: false });
          if (!uploadError) {
            const { data: signed } = await supabase.storage.from('book-images').createSignedUrl(filePath, 60 * 60 * 24 * 30);
            finalAfterUrl = signed?.signedUrl || filePath;
          }
        }
      }

      await updateMutation.mutateAsync({
        recordId: record.id,
        updates: {
          title: title.trim(),
          category,
          status,
          description: description.trim() || null,
          cost: cost ? Number(cost) : 0,
          performed_date: performedDate || new Date().toISOString().split('T')[0],
          contractor_name: contractorName.trim() || null,
          contractor_phone: contractorPhone.trim() || null,
          warranty_until: warrantyUntil || null,
          notes: notes.trim() || null,
          before_image_url: finalBeforeUrl,
          after_image_url: finalAfterUrl,
        },
      });

      toast.success('Đã cập nhật bảo trì nhà cửa! 🔧');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật bảo trì.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <Edit className="h-5 w-5 text-amber-700" />
          <span>Chỉnh sửa hồ sơ bảo trì & sửa chữa</span>
        </div>
      }
      description="Cập nhật chi phí, đơn vị sửa chữa và tình trạng bảo hành hạng mục."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Hạng mục / Vấn đề sửa chữa *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Phân loại
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-[#e7e2d9] dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm text-stone-800 dark:text-stone-200 outline-hidden focus:border-amber-700"
            >
              {MAINTENANCE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Trạng thái xử lý
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
            className="w-full rounded-lg border border-[#e7e2d9] dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm text-stone-800 dark:text-stone-200 outline-hidden focus:border-amber-700"
          >
            <option value="COMPLETED">Đã hoàn thành sửa chữa (COMPLETED)</option>
            <option value="IN_PROGRESS">Đang sửa / Chờ thợ (IN_PROGRESS)</option>
            <option value="REPORTED">Mới phát hiện sự cố (REPORTED)</option>
            <option value="CANCELLED">Đã huỷ (CANCELLED)</option>
          </select>
        </div>

        {/* Cost & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Tổng chi phí sửa (₫)"
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />

          <Input
            label="Ngày thực hiện"
            type="date"
            value={performedDate}
            onChange={(e) => setPerformedDate(e.target.value)}
          />
        </div>

        {/* Contractor info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Tên thợ / Công ty sửa chữa"
            value={contractorName}
            onChange={(e) => setContractorName(e.target.value)}
          />

          <Input
            label="Số điện thoại thợ"
            value={contractorPhone}
            onChange={(e) => setContractorPhone(e.target.value)}
          />
        </div>

        {/* Warranty until */}
        <Input
          label="Bảo hành sửa chữa đến ngày"
          type="date"
          value={warrantyUntil}
          onChange={(e) => setWarrantyUntil(e.target.value)}
        />

        {/* Description & Notes */}
        <Textarea
          label="Mô tả nguyên nhân & cách xử lý"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        <Textarea
          label="Ghi chú thêm"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        {/* Photos before / after */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Before */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Ảnh Trước khi sửa
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
            <div
              onClick={() => beforePhotoRef.current?.click()}
              className="group relative flex h-24 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#e7e2d9] dark:border-stone-700 bg-[#f7f4ee] dark:bg-stone-800 hover:border-amber-600 transition-colors"
            >
              {beforePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={beforePreview} alt="Before" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-stone-400 group-hover:text-amber-600">
                  <Camera className="h-4 w-4" />
                  <span className="text-[10px]">Chọn ảnh trước</span>
                </div>
              )}
            </div>
          </div>

          {/* After */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Ảnh Sau khi sửa
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
            <div
              onClick={() => afterPhotoRef.current?.click()}
              className="group relative flex h-24 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#e7e2d9] dark:border-stone-700 bg-[#f7f4ee] dark:bg-stone-800 hover:border-emerald-600 transition-colors"
            >
              {afterPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={afterPreview} alt="After" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-stone-400 group-hover:text-emerald-600">
                  <Camera className="h-4 w-4" />
                  <span className="text-[10px]">Chọn ảnh sau</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Huỷ
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="bg-amber-800 hover:bg-amber-900 text-white gap-2"
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
