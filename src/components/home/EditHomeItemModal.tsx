'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Home, Camera, FileText, X, Loader2, Check, Plus, DollarSign, Store, Calendar, ShieldCheck, Edit } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useHomeRooms, useUpdateHomeItem, useCreateHomeRoom } from '@/hooks/useHome';
import type { HomeItem } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

export function EditHomeItemModal({
  isOpen,
  onClose,
  item,
}: {
  isOpen: boolean;
  onClose: () => void;
  item: HomeItem;
}) {
  const { data: rooms = [] } = useHomeRooms();
  const updateItemMutation = useUpdateHomeItem();
  const createRoomMutation = useCreateHomeRoom();
  const { user } = useUser();

  const itemPhotoInputRef = useRef<HTMLInputElement>(null);
  const receiptPhotoInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(item.name || '');
  const [roomId, setRoomId] = useState<string>(item.room_id || '');
  const [category, setCategory] = useState(item.category || 'Đồ gia dụng');
  const [purchasePrice, setPurchasePrice] = useState(
    item.purchase_price !== null && item.purchase_price !== undefined ? String(item.purchase_price) : ''
  );
  const [purchaseDate, setPurchaseDate] = useState(item.purchase_date || '');
  const [purchaseStore, setPurchaseStore] = useState(item.purchase_store || '');
  const [warrantyEndDate, setWarrantyEndDate] = useState(item.warranty_end_date || '');
  const [serialNumber, setSerialNumber] = useState(item.serial_number || '');
  const [status, setStatus] = useState<string>(item.status || 'ACTIVE');
  const [notes, setNotes] = useState(item.notes || '');

  // New room quick create
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  // Files
  const [itemFile, setItemFile] = useState<File | null>(null);
  const [itemPreview, setItemPreview] = useState<string | null>(item.image_url || null);

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(item.receipt_image_url || null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      setName(item.name || '');
      setRoomId(item.room_id || '');
      setCategory(item.category || 'Đồ gia dụng');
      setPurchasePrice(
        item.purchase_price !== null && item.purchase_price !== undefined ? String(item.purchase_price) : ''
      );
      setPurchaseDate(item.purchase_date || '');
      setPurchaseStore(item.purchase_store || '');
      setWarrantyEndDate(item.warranty_end_date || '');
      setSerialNumber(item.serial_number || '');
      setStatus(item.status || 'ACTIVE');
      setNotes(item.notes || '');
      setItemFile(null);
      setItemPreview(item.image_url || null);
      setReceiptFile(null);
      setReceiptPreview(item.receipt_image_url || null);
      setIsCreatingRoom(false);
      setNewRoomName('');
    }
  }, [isOpen, item]);

  const handleQuickCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    try {
      const created = await createRoomMutation.mutateAsync({ name: newRoomName.trim() });
      setRoomId(created.id);
      setIsCreatingRoom(false);
      setNewRoomName('');
      toast.success(`Đã thêm phòng: ${created.name}`);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tạo phòng.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên đồ đạc / thiết bị.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalItemUrl = item.image_url;
      let finalReceiptUrl = item.receipt_image_url;

      if (user) {
        const supabase = createClient();

        if (itemFile) {
          const fileExt = itemFile.name.split('.').pop() || 'jpg';
          const filePath = `${user.id}/home/item_${Date.now()}.${fileExt}`;
          const { error } = await supabase.storage
            .from('book-images')
            .upload(filePath, itemFile, { cacheControl: '3600', upsert: false });
          if (!error) {
            const { data: signed } = await supabase.storage.from('book-images').createSignedUrl(filePath, 60 * 60 * 24 * 30);
            finalItemUrl = signed?.signedUrl || filePath;
          }
        }

        if (receiptFile) {
          const fileExt = receiptFile.name.split('.').pop() || 'jpg';
          const filePath = `${user.id}/home/receipt_${Date.now()}.${fileExt}`;
          const { error } = await supabase.storage
            .from('book-images')
            .upload(filePath, receiptFile, { cacheControl: '3600', upsert: false });
          if (!error) {
            const { data: signed } = await supabase.storage.from('book-images').createSignedUrl(filePath, 60 * 60 * 24 * 30);
            finalReceiptUrl = signed?.signedUrl || filePath;
          }
        }
      }

      await updateItemMutation.mutateAsync({
        itemId: item.id,
        updates: {
          name: name.trim(),
          room_id: roomId || null,
          category: category.trim() || 'Đồ gia dụng',
          purchase_price: purchasePrice ? Number(purchasePrice) : null,
          purchase_date: purchaseDate || null,
          purchase_store: purchaseStore.trim() || null,
          warranty_end_date: warrantyEndDate || null,
          serial_number: serialNumber.trim() || null,
          status: status as any,
          notes: notes.trim() || null,
          image_url: finalItemUrl,
          receipt_image_url: finalReceiptUrl,
        },
      });

      toast.success('Đã cập nhật thông tin đồ đạc! 🏠');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật đồ đạc.');
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
          <span>Chỉnh sửa thông tin đồ đạc</span>
        </div>
      }
      description="Cập nhật vị trí phòng, thời hạn bảo hành và phiếu bảo hành thiết bị."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photos Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Item Photo */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Ảnh thiết bị / Đồ vật
            </label>
            <input
              ref={itemPhotoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setItemFile(e.target.files[0]);
                  setItemPreview(URL.createObjectURL(e.target.files[0]));
                }
              }}
            />
            <div
              onClick={() => itemPhotoInputRef.current?.click()}
              className="group relative flex h-24 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#e7e2d9] dark:border-stone-700 bg-[#f7f4ee] dark:bg-stone-800 hover:border-indigo-600 transition-colors"
            >
              {itemPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={itemPreview} alt="Item Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-stone-400 group-hover:text-indigo-600">
                  <Camera className="h-5 w-5" />
                  <span className="text-[10px]">Đổi ảnh đồ vật</span>
                </div>
              )}
            </div>
          </div>

          {/* Receipt Photo */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Phiếu bảo hành / Hoá đơn
            </label>
            <input
              ref={receiptPhotoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setReceiptFile(e.target.files[0]);
                  setReceiptPreview(URL.createObjectURL(e.target.files[0]));
                }
              }}
            />
            <div
              onClick={() => receiptPhotoInputRef.current?.click()}
              className="group relative flex h-24 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#e7e2d9] dark:border-stone-700 bg-[#f7f4ee] dark:bg-stone-800 hover:border-amber-600 transition-colors"
            >
              {receiptPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={receiptPreview} alt="Receipt Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-stone-400 group-hover:text-amber-600">
                  <FileText className="h-5 w-5" />
                  <span className="text-[10px]">Đổi ảnh phiếu BH</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Name */}
        <Input
          label="Tên đồ đạc / Thiết bị *"
          placeholder="VD: Tủ lạnh LG Inverter 335L, Bàn làm việc nâng hạ"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Room selection & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Khu vực / Phòng
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingRoom(!isCreatingRoom)}
                className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
              >
                {isCreatingRoom ? 'Đóng' : '+ Thêm phòng'}
              </button>
            </div>

            {isCreatingRoom ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Tên phòng mới..."
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="flex-1 rounded-lg border border-[#e7e2d9] dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-1.5 text-xs text-stone-800 dark:text-stone-200 outline-hidden"
                />
                <Button size="sm" type="button" onClick={handleQuickCreateRoom} className="h-8 text-xs px-2.5">
                  Lưu
                </Button>
              </div>
            ) : (
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full rounded-lg border border-[#e7e2d9] dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm text-stone-800 dark:text-stone-200 outline-hidden focus:border-indigo-600"
              >
                <option value="">-- Chưa chọn phòng --</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Phân loại đồ
            </label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="VD: Đồ gia dụng, Điện tử, Nội thất..."
            />
          </div>
        </div>

        {/* Purchase Info: Price, Store, Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Giá lúc mua (₫)"
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
          />

          <Input
            label="Nơi mua sắm"
            placeholder="VD: Điện Máy Xanh, Shopee..."
            value={purchaseStore}
            onChange={(e) => setPurchaseStore(e.target.value)}
          />

          <Input
            label="Ngày mua"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
        </div>

        {/* Warranty & Serial */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
          <Input
            label="Hạn bảo hành đến ngày"
            type="date"
            value={warrantyEndDate}
            onChange={(e) => setWarrantyEndDate(e.target.value)}
          />

          <Input
            label="Số Serial / Mã Model"
            placeholder="VD: SN-94829103"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Trạng thái đồ đạc
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-[#e7e2d9] dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm text-stone-800 dark:text-stone-200 outline-hidden focus:border-indigo-600"
          >
            <option value="ACTIVE">Đang hoạt động tốt (ACTIVE)</option>
            <option value="REPAIRING">Đang sửa chữa (REPAIRING)</option>
            <option value="RETIRED">Đã thanh lý / Vứt bỏ (RETIRED)</option>
          </select>
        </div>

        {/* Notes */}
        <Textarea
          label="Ghi chú thêm"
          placeholder="Lưu ý khi sử dụng, thời gian vệ sinh định kỳ..."
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
