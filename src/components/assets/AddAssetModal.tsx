'use client';

import React, { useState, useRef } from 'react';
import { Package, Camera, X, Loader2, Check, DollarSign, MapPin, Calendar, Tag } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useCreatePersonalAsset } from '@/hooks/useAssets';
import { ASSET_CATEGORIES } from './AssetCard';
import type { AssetCategory } from '@/types/database';
import { toast } from 'sonner';

export function AddAssetModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const createAssetMutation = useCreatePersonalAsset();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('TECH');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [estimatedCurrentValue, setEstimatedCurrentValue] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleReset = () => {
    setName('');
    setCategory('TECH');
    setPurchasePrice('');
    setEstimatedCurrentValue('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setLocation('');
    setSerialNumber('');
    setNotes('');
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên tài sản.');
      return;
    }

    try {
      await createAssetMutation.mutateAsync({
        name,
        category,
        purchasePrice: purchasePrice ? Number(purchasePrice) : null,
        estimatedCurrentValue: estimatedCurrentValue ? Number(estimatedCurrentValue) : null,
        purchaseDate: purchaseDate || null,
        location: location || null,
        serialNumber: serialNumber || null,
        notes: notes || null,
        imageFile: selectedFile,
      });

      toast.success('Đã thêm tài sản thành công! 📦');
      handleReset();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi thêm tài sản.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-indigo-700" />
          <span>Thêm tài sản cá nhân</span>
        </div>
      }
      description="Quản lý các thiết bị, đồ giá trị cao, phương tiện và theo dõi khấu hao tài sản."
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

        {!previewUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-4 text-center cursor-pointer hover:border-[#1e3a2f] bg-stone-50/50 h-28"
          >
            <Camera className="h-6 w-6 text-stone-400 mb-1" />
            <span className="text-xs font-semibold text-stone-700">Tải ảnh chụp tài sản</span>
          </div>
        ) : (
          <div className="relative h-28 w-full overflow-hidden rounded-xl border border-stone-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
              className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Category Pills */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
            Danh mục tài sản
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {(Object.keys(ASSET_CATEGORIES) as AssetCategory[]).map((cat) => {
              const isSelected = category === cat;
              const config = ASSET_CATEGORIES[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'border-[#1e3a2f] bg-emerald-50 text-[#1e3a2f] ring-2 ring-[#1e3a2f]/20 font-bold'
                      : 'border-stone-200 bg-white hover:border-stone-300 text-stone-600'
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Tên tài sản *"
              placeholder="MacBook Pro M3 Max, Xe máy SH 150i, Đồng hồ Omega..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <Input
            label="Giá lúc mua (VNĐ)"
            type="number"
            min="0"
            placeholder="35000000"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            leftIcon={<DollarSign className="h-4 w-4" />}
          />

          <Input
            label="Giá trị ước tính hiện tại (VNĐ)"
            type="number"
            min="0"
            placeholder="28000000"
            value={estimatedCurrentValue}
            onChange={(e) => setEstimatedCurrentValue(e.target.value)}
            leftIcon={<DollarSign className="h-4 w-4" />}
          />

          <Input
            label="Vị trí cất giữ / Nơi để"
            placeholder="Phòng làm việc, Két sắt, Gara..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            leftIcon={<MapPin className="h-4 w-4" />}
          />

          <Input
            label="Số Serial / Mã định danh"
            placeholder="S/N: C02G80P..."
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
          />

          <div className="sm:col-span-2">
            <Input
              label="Ngày mua"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              leftIcon={<Calendar className="h-4 w-4" />}
            />
          </div>
        </div>

        <Textarea
          label="Ghi chú & Tình trạng tài sản"
          placeholder="Tình trạng 98%, còn đầy đủ hộp và phụ kiện..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={createAssetMutation.isPending}>
            Huỷ
          </Button>
          <Button type="submit" size="sm" disabled={createAssetMutation.isPending} className="gap-1.5 font-semibold">
            {createAssetMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Lưu tài sản
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
