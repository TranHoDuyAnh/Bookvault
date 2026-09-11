'use client';

import React, { useState } from 'react';
import { Package, MapPin, DollarSign, Calendar, Trash2, Tag, TrendingDown, TrendingUp, Edit2 } from 'lucide-react';
import type { PersonalAsset, AssetCategory } from '@/types/database';
import { formatVND, formatDateVN } from '@/lib/utils';
import { useDeletePersonalAsset } from '@/hooks/useAssets';
import { EditAssetModal } from './EditAssetModal';
import { toast } from 'sonner';

export const ASSET_CATEGORIES: Record<AssetCategory, { label: string; bg: string; text: string }> = {
  TECH: { label: 'Công nghệ & Điện tử', bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300' },
  VEHICLE: { label: 'Phương tiện', bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300' },
  JEWELRY_WATCH: { label: 'Đồng hồ & Trang sức', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300' },
  FURNITURE: { label: 'Nội thất & Bàn ghế', bg: 'bg-stone-100 dark:bg-stone-800', text: 'text-stone-700 dark:text-stone-300' },
  APPLIANCE: { label: 'Đồ gia dụng', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300' },
  COLLECTIBLE: { label: 'Đồ sưu tầm & Mô hình', bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300' },
  REAL_ESTATE: { label: 'Bất động sản', bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300' },
  OTHER: { label: 'Tài sản khác', bg: 'bg-stone-100 dark:bg-stone-800', text: 'text-stone-600 dark:text-stone-400' },
};

export function AssetCard({ asset }: { asset: PersonalAsset }) {
  const deleteMutation = useDeletePersonalAsset();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const categoryInfo = ASSET_CATEGORIES[asset.category] || ASSET_CATEGORIES.OTHER;
  const pPrice = Number(asset.purchase_price || 0);
  const cValue = Number(asset.estimated_current_value || pPrice);
  const diff = cValue - pPrice;

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xoá tài sản "${asset.name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(asset.id);
      toast.success('Đã xoá tài sản.');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xoá tài sản.');
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-2xs hover:shadow-md hover:border-[#1e3a2f]/40 transition-all">
      {/* Photo */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#f7f4ee] dark:bg-stone-800 flex items-center justify-center">
        {asset.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.image_url}
            alt={asset.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-stone-400 space-y-1">
            <Package className="h-10 w-10 stroke-[1.5]" />
            <span className="text-[11px] font-medium text-stone-500">{asset.name}</span>
          </div>
        )}

        <div className="absolute top-2.5 left-2.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide backdrop-blur-xs ${categoryInfo.bg} ${categoryInfo.text} border border-black/5`}>
            {categoryInfo.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
            {asset.name}
          </h4>

          {asset.serial_number && (
            <p className="text-[11px] font-mono text-stone-400">
              S/N: {asset.serial_number}
            </p>
          )}

          {asset.location && (
            <p className="text-xs text-stone-600 dark:text-stone-400 flex items-center gap-1">
              <MapPin className="h-3 w-3 flex-shrink-0 text-stone-400" />
              <span>Vị trí: <strong>{asset.location}</strong></span>
            </p>
          )}

          {/* Value section */}
          <div className="pt-1 grid grid-cols-2 gap-2 text-xs border-t border-stone-100 dark:border-stone-800">
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">Giá trị hiện tại</span>
              <span className="font-bold text-sm text-emerald-800 dark:text-emerald-400">
                {formatVND(cValue)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">Giá lúc mua</span>
              <span className="font-medium text-stone-600 dark:text-stone-400">
                {formatVND(pPrice)}
              </span>
            </div>
          </div>

          {pPrice > 0 && diff !== 0 && (
            <div className={`flex items-center gap-1 text-[10px] font-semibold ${diff < 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {diff < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
              <span>{diff < 0 ? `Khấu hao: ${formatVND(Math.abs(diff))}` : `Tăng giá: +${formatVND(diff)}`}</span>
            </div>
          )}

          {asset.notes && (
            <p className="text-xs text-stone-500 line-clamp-2 pt-1">
              {asset.notes}
            </p>
          )}
        </div>

        {/* Footer info & Delete */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <span className="text-[11px]">
            {asset.purchase_date ? `Mua: ${formatDateVN(asset.purchase_date)}` : 'Chưa lưu ngày mua'}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditOpen(true)}
              className="rounded p-1 text-stone-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
              title="Chỉnh sửa tài sản"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="rounded p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Xoá tài sản"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <EditAssetModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        asset={asset}
      />
    </div>
  );
}
