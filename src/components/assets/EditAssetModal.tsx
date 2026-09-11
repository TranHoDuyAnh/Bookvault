'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Package, Camera, X, Loader2, Check, DollarSign, MapPin, Calendar, Tag, Edit } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useUpdatePersonalAsset } from '@/hooks/useAssets';
import { ASSET_CATEGORIES } from './AssetCard';
import type { PersonalAsset, AssetCategory, AssetStatus } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

export function EditAssetModal({
  isOpen,
  onClose,
  asset,
}: {
  isOpen: boolean;
  onClose: () => void;
  asset: PersonalAsset;
}) {
  const updateAssetMutation = useUpdatePersonalAsset();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(asset.name || '');
  const [category, setCategory] = useState<AssetCategory>(asset.category || 'TECH');
  const [status, setStatus] = useState<AssetStatus>(asset.status || 'ACTIVE');
  const [purchasePrice, setPurchasePrice] = useState(
    asset.purchase_price !== null && asset.purchase_price !== undefined ? String(asset.purchase_price) : ''
  );
  const [estimatedCurrentValue, setEstimatedCurrentValue] = useState(
    asset.estimated_current_value !== null && asset.estimated_current_value !== undefined
      ? String(asset.estimated_current_value)
      : ''
  );
  const [purchaseDate, setPurchaseDate] = useState(asset.purchase_date || '');
  const [location, setLocation] = useState(asset.location || '');
  const [serialNumber, setSerialNumber] = useState(asset.serial_number || '');
  const [notes, setNotes] = useState(asset.notes || '');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(asset.image_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && asset) {
      setName(asset.name || '');
      setCategory(asset.category || 'TECH');
      setStatus(asset.status || 'ACTIVE');
      setPurchasePrice(
        asset.purchase_price !== null && asset.purchase_price !== undefined ? String(asset.purchase_price) : ''
      );
      setEstimatedCurrentValue(
        asset.estimated_current_value !== null && asset.estimated_current_value !== undefined
          ? String(asset.estimated_current_value)
          : ''
      );
      setPurchaseDate(asset.purchase_date || '');
      setLocation(asset.location || '');
      setSerialNumber(asset.serial_number || '');
      setNotes(asset.notes || '');
      setSelectedFile(null);
      setPreviewUrl(asset.image_url || null);
    }
  }, [isOpen, asset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên tài sản.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = asset.image_url;

      if (selectedFile && user) {
        const supabase = createClient();
        const fileExt = selectedFile.name.split('.').pop() || 'jpg';
        const filePath = `${user.id}/assets/${Date.now()}_asset.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('book-images')
          .upload(filePath, selectedFile, { cacheControl: '3600', upsert: false });

        if (!uploadError) {
          const { data: signed } = await supabase.storage
            .from('book-images')
            .createSignedUrl(filePath, 60 * 60 * 24 * 30);
          finalImageUrl = signed?.signedUrl || filePath;
        }
      }

      await updateAssetMutation.mutateAsync({
        assetId: asset.id,
        updates: {
          name: name.trim(),
          category,
          status,
          purchase_price: purchasePrice ? Number(purchasePrice) : null,
          estimated_current_value: estimatedCurrentValue ? Number(estimatedCurrentValue) : null,
          purchase_date: purchaseDate || null,
          location: location.trim() || null,
          serial_number: serialNumber.trim() || null,
          notes: notes.trim() || null,
          image_url: finalImageUrl,
        },
      });

      toast.success('Đã cập nhật tài sản! ✏️');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật tài sản.');
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
          <Edit className="h-5 w-5 text-indigo-700" />
          <span>Chỉnh sửa tài sản cá nhân</span>
        </div>
      }
      description="Cập nhật thông tin, giá trị khấu hao và vị trí lưu trữ tài sản."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setSelectedFile(e.target.files[0]);
              setPreviewUrl(URL.createObjectURL(e.target.files[0]));
            }
          }}
        />

        <div className="flex items-center gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex h-24 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#e7e2d9] dark:border-stone-700 bg-[#f7f4ee] dark:bg-stone-800 hover:border-indigo-600 transition-colors"
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-stone-400 group-hover:text-indigo-600">
                <Camera className="h-5 w-5" />
                <span className="text-[10px]">Đổi ảnh</span>
              </div>
            )}
          </div>
          <div className="text-xs text-stone-500 space-y-1">
            <p className="font-semibold text-stone-700 dark:text-stone-300">Ảnh tài sản / Hoá đơn</p>
            <p>Bấm vào khung để thay đổi ảnh chụp tài sản.</p>
          </div>
        </div>

        {/* Name & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Tên tài sản *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Danh mục
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AssetCategory)}
              className="w-full rounded-lg border border-[#e7e2d9] dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm text-stone-800 dark:text-stone-200 outline-hidden focus:border-indigo-600"
            >
              {Object.entries(ASSET_CATEGORIES).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Valuation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Giá lúc mua (₫)"
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
          />

          <Input
            label="Giá trị hiện tại ước tính (₫)"
            type="number"
            value={estimatedCurrentValue}
            onChange={(e) => setEstimatedCurrentValue(e.target.value)}
          />
        </div>

        {/* Date, Location, Serial */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Ngày mua"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />

          <Input
            label="Vị trí lưu trữ"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <Input
            label="Số Serial / Mã máy"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Trạng thái tài sản
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AssetStatus)}
            className="w-full rounded-lg border border-[#e7e2d9] dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm text-stone-800 dark:text-stone-200 outline-hidden focus:border-indigo-600"
          >
            <option value="ACTIVE">Đang sở hữu & sử dụng (ACTIVE)</option>
            <option value="SOLD">Đã bán lại (SOLD)</option>
            <option value="LOST">Thất lạc / Bị mất (LOST)</option>
            <option value="BROKEN">Hư hỏng không dùng được (BROKEN)</option>
          </select>
        </div>

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
            disabled={isSubmitting || !name.trim()}
            className="bg-indigo-700 hover:bg-indigo-800 text-white gap-2"
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
