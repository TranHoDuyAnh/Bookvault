'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Utensils, Camera, X, Loader2, Check, Star, DollarSign, MapPin, Store, Home, Edit } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useUpdateFoodEntry } from '@/hooks/useFood';
import { MEAL_TYPE_LABELS } from './FoodCard';
import type { FoodEntry, MealType } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

export function EditFoodModal({
  isOpen,
  onClose,
  entry,
}: {
  isOpen: boolean;
  onClose: () => void;
  entry: FoodEntry;
}) {
  const updateMutation = useUpdateFoodEntry();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dishName, setDishName] = useState(entry.dish_name || '');
  const [mealType, setMealType] = useState<MealType>(entry.meal_type || 'DINNER');
  const [isCookedAtHome, setIsCookedAtHome] = useState(entry.is_cooked_at_home || false);
  const [restaurantName, setRestaurantName] = useState(entry.restaurant_name || '');
  const [locationAddress, setLocationAddress] = useState(entry.location_address || '');
  const [price, setPrice] = useState(entry.price !== null && entry.price !== undefined ? String(entry.price) : '');
  const [rating, setRating] = useState<number>(entry.rating || 5);
  const [entryDate, setEntryDate] = useState(entry.entry_date || '');
  const [reviewNotes, setReviewNotes] = useState(entry.review_notes || '');
  const [isFavorite, setIsFavorite] = useState(entry.is_favorite || false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(entry.image_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && entry) {
      setDishName(entry.dish_name || '');
      setMealType(entry.meal_type || 'DINNER');
      setIsCookedAtHome(entry.is_cooked_at_home || false);
      setRestaurantName(entry.restaurant_name || '');
      setLocationAddress(entry.location_address || '');
      setPrice(entry.price !== null && entry.price !== undefined ? String(entry.price) : '');
      setRating(entry.rating || 5);
      setEntryDate(entry.entry_date || '');
      setReviewNotes(entry.review_notes || '');
      setIsFavorite(entry.is_favorite || false);
      setSelectedFile(null);
      setPreviewUrl(entry.image_url || null);
    }
  }, [isOpen, entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) {
      toast.error('Vui lòng nhập tên món ăn.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = entry.image_url;

      if (selectedFile && user) {
        const supabase = createClient();
        const fileExt = selectedFile.name.split('.').pop() || 'jpg';
        const filePath = `${user.id}/food/${Date.now()}_food.${fileExt}`;
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

      await updateMutation.mutateAsync({
        entryId: entry.id,
        updates: {
          dish_name: dishName.trim(),
          meal_type: mealType,
          is_cooked_at_home: isCookedAtHome,
          restaurant_name: isCookedAtHome ? 'Tự nấu tại nhà' : (restaurantName.trim() || null),
          location_address: locationAddress.trim() || null,
          price: price ? Number(price) : null,
          rating: rating > 0 ? rating : null,
          entry_date: entryDate || new Date().toISOString().split('T')[0],
          review_notes: reviewNotes.trim() || null,
          is_favorite: isFavorite,
          image_url: finalImageUrl,
        },
      });

      toast.success('Đã cập nhật món ăn! 🍜');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật món ăn.');
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
          <Edit className="h-5 w-5 text-amber-600" />
          <span>Chỉnh sửa nhật ký ẩm thực</span>
        </div>
      }
      description="Cập nhật món ngon, hương vị, đánh giá và chi phí."
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
            className="group relative flex h-24 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#e7e2d9] dark:border-stone-700 bg-[#f7f4ee] dark:bg-stone-800 hover:border-amber-600 transition-colors"
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-stone-400 group-hover:text-amber-600">
                <Camera className="h-5 w-5" />
                <span className="text-[10px]">Đổi ảnh</span>
              </div>
            )}
          </div>
          <div className="text-xs text-stone-500 space-y-1">
            <p className="font-semibold text-stone-700 dark:text-stone-300">Ảnh món ăn</p>
            <p>Bấm vào khung để thay đổi ảnh chụp món ăn.</p>
          </div>
        </div>

        {/* Dish Name */}
        <Input
          label="Tên món ăn *"
          value={dishName}
          onChange={(e) => setDishName(e.target.value)}
          required
        />

        {/* Meal Type Pills */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
            Bữa ăn
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MEAL_TYPE_LABELS).map(([key, labelInfo]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMealType(key as MealType)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  mealType === key
                    ? 'bg-[#1e3a2f] text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {labelInfo.label}
              </button>
            ))}
          </div>
        </div>

        {/* Home-cooked vs Restaurant */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
          <button
            type="button"
            onClick={() => setIsCookedAtHome(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isCookedAtHome
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Home className="h-4 w-4" />
            Tự nấu tại nhà
          </button>
          <button
            type="button"
            onClick={() => setIsCookedAtHome(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              !isCookedAtHome
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Store className="h-4 w-4" />
            Ăn ngoài / Mua về
          </button>
        </div>

        {/* Restaurant & Address (if not home-cooked) */}
        {!isCookedAtHome && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Tên quán / Nhà hàng"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
            />

            <Input
              label="Địa chỉ quán"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
            />
          </div>
        )}

        {/* Price & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Giá tiền (₫)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <Input
            label="Ngày ăn"
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
          />
        </div>

        {/* Rating */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Đánh giá mức độ ngon
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

        {/* Review Notes */}
        <Textarea
          label="Cảm nhận hương vị & ghi chú"
          value={reviewNotes}
          onChange={(e) => setReviewNotes(e.target.value)}
          rows={2}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Huỷ
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !dishName.trim()}
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
