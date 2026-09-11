'use client';

import React, { useState } from 'react';
import { Home, ShieldCheck, AlertTriangle, ShieldAlert, Wrench, Trash2, Calendar, DollarSign, Store, FileText, ExternalLink } from 'lucide-react';
import type { HomeItem } from '@/types/database';
import { formatVND, formatDateVN } from '@/lib/utils';
import { useDeleteHomeItem } from '@/hooks/useHome';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';

export function HomeItemCard({
  item,
  onOpenMaintenanceModal,
}: {
  item: HomeItem;
  onOpenMaintenanceModal: (item: HomeItem) => void;
}) {
  const deleteMutation = useDeleteHomeItem();
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);

  // Warranty calculation
  const getWarrantyInfo = () => {
    if (!item.warranty_end_date) return null;
    const today = new Date();
    const endDate = new Date(item.warranty_end_date);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: 'expired',
        label: 'Đã hết hạn bảo hành',
        bg: 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-300',
        icon: ShieldAlert,
      };
    }

    if (diffDays <= 30) {
      return {
        status: 'expiring_soon',
        label: `Sắp hết hạn (còn ${diffDays} ngày)`,
        bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300',
        icon: AlertTriangle,
      };
    }

    return {
      status: 'active',
      label: `Còn ${diffDays} ngày bảo hành`,
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300',
      icon: ShieldCheck,
    };
  };

  const warrantyInfo = getWarrantyInfo();

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xoá "${item.name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success('Đã xoá đồ đạc khỏi danh mục.');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xoá.');
    }
  };

  return (
    <>
      <div className="group relative flex flex-col justify-between rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-2xs hover:shadow-md hover:border-[#1e3a2f]/40 transition-all">
        {/* Photo or Placeholder */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#f7f4ee] dark:bg-stone-800 flex items-center justify-center">
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-stone-400 space-y-1">
              <Home className="h-10 w-10 stroke-[1.5]" />
              <span className="text-[11px] font-medium text-stone-500">{item.name}</span>
            </div>
          )}

          {/* Room Tag Badge */}
          {item.room && (
            <div className="absolute top-2.5 left-2.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-stone-900/80 text-white backdrop-blur-xs">
                {item.room.name}
              </span>
            </div>
          )}

          {/* Receipt View Button */}
          {item.receipt_image_url && (
            <button
              type="button"
              onClick={() => setIsReceiptPreviewOpen(true)}
              className="absolute top-2.5 right-2.5 rounded-lg bg-white/90 dark:bg-stone-900/90 p-1.5 text-stone-700 dark:text-stone-300 hover:text-emerald-700 shadow-xs cursor-pointer backdrop-blur-xs text-[10px] flex items-center gap-1 font-semibold"
              title="Xem phiếu bảo hành / hoá đơn"
            >
              <FileText className="h-3 w-3" />
              <span>Hoá đơn</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div>
              <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                {item.name}
              </h4>
              <p className="text-xs text-stone-500 font-medium">
                {item.category || 'Đồ gia dụng'} {item.serial_number ? `• S/N: ${item.serial_number}` : ''}
              </p>
            </div>

            {/* Warranty Status Banner */}
            {warrantyInfo && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${warrantyInfo.bg}`}>
                <warrantyInfo.icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{warrantyInfo.label}</span>
              </div>
            )}

            {/* Purchase metadata */}
            <div className="grid grid-cols-2 gap-1.5 text-xs text-stone-600 dark:text-stone-400 pt-1">
              {item.purchase_price !== null && item.purchase_price !== undefined && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-stone-400" />
                  <span className="font-bold text-stone-800 dark:text-stone-200">{formatVND(item.purchase_price)}</span>
                </div>
              )}
              {item.purchase_store && (
                <div className="flex items-center gap-1 truncate">
                  <Store className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
                  <span className="truncate">{item.purchase_store}</span>
                </div>
              )}
              {item.purchase_date && (
                <div className="flex items-center gap-1 col-span-2 text-[11px] text-stone-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Mua ngày: {formatDateVN(item.purchase_date)}</span>
                </div>
              )}
            </div>

            {item.notes && (
              <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 pt-1">
                {item.notes}
              </p>
            )}

            {/* Maintenance logs preview */}
            {item.maintenance_logs && item.maintenance_logs.length > 0 && (
              <div className="pt-1 text-[11px] text-stone-500 font-medium">
                🔧 Đã sửa chữa/bảo dưỡng: {item.maintenance_logs.length} lần (Tổng: {formatVND(item.maintenance_logs.reduce((acc, l) => acc + (l.cost || 0), 0))})
              </div>
            )}
          </div>

          {/* Action row */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenMaintenanceModal(item)}
              className="text-xs gap-1 h-7 px-2 font-medium"
            >
              <Wrench className="h-3 w-3" />
              Ghi bảo trì
            </Button>

            <button
              onClick={handleDelete}
              className="rounded p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Xoá đồ"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Photo Modal */}
      {isReceiptPreviewOpen && item.receipt_image_url && (
        <Modal
          isOpen={isReceiptPreviewOpen}
          onClose={() => setIsReceiptPreviewOpen(false)}
          maxWidth="lg"
          title={`Phiếu bảo hành / Hoá đơn: ${item.name}`}
        >
          <div className="space-y-4">
            <div className="max-h-[65vh] overflow-hidden rounded-xl bg-stone-950 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.receipt_image_url}
                alt="Receipt"
                className="max-h-[65vh] max-w-full object-contain"
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setIsReceiptPreviewOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
