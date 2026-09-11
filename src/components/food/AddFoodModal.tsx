'use client';

import React, { useState, useRef } from 'react';
import { Utensils, Camera, X, Loader2, Check, Star, DollarSign, MapPin, Store, Home } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useCreateFoodEntry } from '@/hooks/useFood';
import { MEAL_TYPE_LABELS } from './FoodCard';
import type { MealType } from '@/types/database';
import { toast } from 'sonner';

export function AddFoodModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const createFoodMutation = useCreateFoodEntry();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dishName, setDishName] = useState('');
  const [mealType, setMealType] = useState<MealType>('DINNER');
  const [isCookedAtHome, setIsCookedAtHome] = useState(false);
  const [restaurantName, setRestaurantName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [price, setPrice] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Photo
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh.');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleReset = () => {
    setDishName('');
    setMealType('DINNER');
    setIsCookedAtHome(false);
    setRestaurantName('');
    setLocationAddress('');
    setPrice('');
    setRating(5);
    setEntryDate(new Date().toISOString().split('T')[0]);
    setReviewNotes('');
    setIsFavorite(false);
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) {
      toast.error('Vui lòng nhập tên món ăn.');
      return;
    }

    try {
      await createFoodMutation.mutateAsync({
        dishName,
        mealType,
        isCookedAtHome,
        restaurantName: isCookedAtHome ? null : restaurantName,
        locationAddress: isCookedAtHome ? null : locationAddress,
        price: price ? Number(price) : null,
        rating: rating > 0 ? rating : null,
        entryDate,
        reviewNotes,
        isFavorite,
        imageFile: selectedFile,
      });

      toast.success('Đã lưu món ăn vào Food Diary! 🍜');
      handleReset();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu món ăn.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-emerald-700" />
          <span>Ghi nhật ký món ăn & Quán ngon</span>
        </div>
      }
      description="Lưu lại trải nghiệm ẩm thực, quán ăn yêu thích hoặc bữa cơm tự nấu."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo Upload Area */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
        />

        {!previewUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900/50 p-4 text-center cursor-pointer hover:border-[#1e3a2f] transition-colors"
          >
            <Camera className="h-8 w-8 text-stone-400 mb-1" />
            <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Nhấn để chụp / tải ảnh món ăn
            </p>
            <p className="text-[10px] text-stone-400">JPG, PNG, WebP (tối đa 10MB)</p>
          </div>
        ) : (
          <div className="relative h-40 w-full overflow-hidden rounded-xl border border-stone-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
              className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Meal Type Tabs */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
            Loại bữa ăn
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {(Object.keys(MEAL_TYPE_LABELS) as MealType[]).map((type) => {
              const isSelected = mealType === type;
              const config = MEAL_TYPE_LABELS[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMealType(type)}
                  className={`py-2 px-1 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                    isSelected
                      ? `${config.bg} ${config.text} border-[#1e3a2f] ring-2 ring-[#1e3a2f]/20`
                      : 'border-stone-200 bg-white hover:border-stone-300 text-stone-600'
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Home vs Eat out switch */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f3eee7]/70 dark:bg-stone-800/50 text-xs">
          <span className="font-semibold text-stone-700 dark:text-stone-300">Nguồn gốc:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="origin"
              checked={!isCookedAtHome}
              onChange={() => setIsCookedAtHome(false)}
              className="text-[#1e3a2f]"
            />
            <span>Ăn tại quán / Mua mang về</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="origin"
              checked={isCookedAtHome}
              onChange={() => setIsCookedAtHome(true)}
              className="text-[#1e3a2f]"
            />
            <span>Tự nấu tại nhà</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Tên món ăn *"
              placeholder="Ví dụ: Phở Bò Bát Đàn, Cơm tấm Sườn Bì Chả, Bún chả..."
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              required
            />
          </div>

          {!isCookedAtHome && (
            <>
              <Input
                label="Tên quán ăn / Thương hiệu"
                placeholder="Ví dụ: Phở Gia Truyền, Pizza 4P's..."
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                leftIcon={<Store className="h-4 w-4" />}
              />

              <Input
                label="Địa chỉ / Khu vực"
                placeholder="49 Bát Đàn, Hoàn Kiếm, Hà Nội..."
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                leftIcon={<MapPin className="h-4 w-4" />}
              />
            </>
          )}

          <Input
            label="Giá tiền (VNĐ)"
            type="number"
            min="0"
            placeholder="65000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            leftIcon={<DollarSign className="h-4 w-4" />}
          />

          <Input
            label="Ngày ăn"
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
          />
        </div>

        {/* Rating Stars & Favorite */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Đánh giá: {rating} / 5 ⭐
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

          <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer pt-2 sm:pt-0">
            <input
              type="checkbox"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="rounded text-rose-500"
            />
            <span>Đánh dấu món yêu thích ❤️</span>
          </label>
        </div>

        <Textarea
          label="Cảm nhận & Ghi chú hương vị"
          placeholder="Nước dùng thanh ngọt, thịt mềm, không gian quán thoáng đãng..."
          value={reviewNotes}
          onChange={(e) => setReviewNotes(e.target.value)}
          rows={3}
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={createFoodMutation.isPending}>
            Huỷ
          </Button>
          <Button type="submit" size="sm" disabled={createFoodMutation.isPending} className="gap-1.5 font-semibold">
            {createFoodMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Lưu vào Food Diary
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
