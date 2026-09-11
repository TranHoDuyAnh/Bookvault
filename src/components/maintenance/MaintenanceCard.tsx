'use client';

import React, { useState } from 'react';
import { Wrench, Calendar, DollarSign, User, Phone, ShieldCheck, Trash2, CheckCircle2, Clock, Image as ImageIcon, Edit2 } from 'lucide-react';
import type { HomeMaintenanceRecord } from '@/types/database';
import { formatVND, formatDateVN } from '@/lib/utils';
import { useDeleteMaintenanceRecord } from '@/hooks/useMaintenance';
import { EditMaintenanceModal } from './EditMaintenanceModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export function MaintenanceCard({ record }: { record: HomeMaintenanceRecord }) {
  const deleteMutation = useDeleteMaintenanceRecord();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const today = new Date();

  const isWarrantyActive = record.warranty_until && new Date(record.warranty_until) >= today;

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xoá nhật ký sửa chữa "${record.title}"?`)) return;
    try {
      await deleteMutation.mutateAsync(record.id);
      toast.success('Đã xoá nhật ký sửa chữa.');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xoá.');
    }
  };

  return (
    <>
      <div className="group relative flex flex-col justify-between rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-2xs hover:shadow-md hover:border-[#1e3a2f]/40 transition-all space-y-4">
        {/* Header: Title, Category & Status */}
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              {record.category}
            </span>

            {record.status === 'COMPLETED' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="h-3 w-3" /> Đã hoàn thành
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                <Clock className="h-3 w-3" /> Đang xử lý
              </span>
            )}
          </div>

          <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
            {record.title}
          </h4>

          {record.description && (
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              {record.description}
            </p>
          )}
        </div>

        {/* Details: Cost, Date, Contractor, Warranty */}
        <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-stone-500 font-medium">Chi phí sửa chữa:</span>
            <span className="font-serif text-base font-bold text-emerald-800 dark:text-emerald-400">
              {formatVND(record.cost)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500">
            <span>Ngày thực hiện:</span>
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              {formatDateVN(record.performed_date)}
            </span>
          </div>

          {record.contractor_name && (
            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <span>Thợ / Nhà thầu:</span>
              <span className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                <User className="h-3 w-3 text-stone-400" />
                {record.contractor_name}
                {record.contractor_phone && ` (${record.contractor_phone})`}
              </span>
            </div>
          )}

          {record.warranty_until && (
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-stone-500">Bảo hành sửa chữa:</span>
              <span className={`font-bold flex items-center gap-1 ${isWarrantyActive ? 'text-emerald-700' : 'text-stone-400'}`}>
                <ShieldCheck className="h-3.5 w-3.5" />
                {formatDateVN(record.warranty_until)} {isWarrantyActive ? '(Còn hạn)' : '(Hết hạn)'}
              </span>
            </div>
          )}
        </div>

        {/* Photos Preview trigger if any */}
        {(record.before_image_url || record.after_image_url) && (
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-stone-600 bg-stone-50 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <ImageIcon className="h-3.5 w-3.5 text-stone-500" />
            <span>Xem ảnh trước & sau sửa chữa</span>
          </button>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span className="text-[10px]">{record.notes || ''}</span>
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => setIsEditOpen(true)}
              className="rounded p-1 text-stone-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
              title="Chỉnh sửa bảo trì"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="rounded p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Xoá nhật ký"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <EditMaintenanceModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        record={record}
      />

      {/* Image comparison modal */}
      {isPreviewOpen && (
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          maxWidth="2xl"
          title={`Hình ảnh: ${record.title}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {record.before_image_url && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-stone-600 block">Ảnh trước khi sửa (Before)</span>
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-900 border border-stone-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={record.before_image_url} alt="Before" className="h-full w-full object-cover" />
                  </div>
                </div>
              )}
              {record.after_image_url && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-stone-600 block">Ảnh sau khi hoàn thành (After)</span>
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-900 border border-stone-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={record.after_image_url} alt="After" className="h-full w-full object-cover" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setIsPreviewOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
