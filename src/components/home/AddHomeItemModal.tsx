'use client';

import React, { useState, useRef } from 'react';
import { Home, Camera, FileText, X, Loader2, Check, Plus, DollarSign, Store, Calendar, ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useHomeRooms, useCreateHomeItem, useCreateHomeRoom } from '@/hooks/useHome';
import { toast } from 'sonner';

export function AddHomeItemModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: rooms = [] } = useHomeRooms();
  const createItemMutation = useCreateHomeItem();
  const createRoomMutation = useCreateHomeRoom();

  const itemPhotoInputRef = useRef<HTMLInputElement>(null);
  const receiptPhotoInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState<string>('');
  const [category, setCategory] = useState('Đồ gia dụng');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseStore, setPurchaseStore] = useState('');
  const [warrantyEndDate, setWarrantyEndDate] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [notes, setNotes] = useState('');

  // New room quick create
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  // Files
  const [itemFile, setItemFile] = useState<File | null>(null);
  const [itemPreview, setItemPreview] = useState<string | null>(null);

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  const handleReset = () => {
    setName('');
    setRoomId('');
    setCategory('Đồ gia dụng');
    setPurchasePrice('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setPurchaseStore('');
    setWarrantyEndDate('');
    setSerialNumber('');
    setNotes('');
    setItemFile(null);
    setItemPreview(null);
    setReceiptFile(null);
    setReceiptPreview(null);
    setIsCreatingRoom(false);
    setNewRoomName('');
    onClose();
  };

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

    try {
      await createItemMutation.mutateAsync({
        name,
        roomId: roomId || null,
        category,
        purchasePrice: purchasePrice ? Number(purchasePrice) : null,
        purchaseDate: purchaseDate || null,
        purchaseStore: purchaseStore || null,
        warrantyEndDate: warrantyEndDate || null,
        serialNumber: serialNumber || null,
        notes: notes || null,
        imageFile: itemFile,
        receiptFile: receiptFile,
      });

      toast.success('Đã lưu thiết bị vào Home Manager! 🏠');
      handleReset();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi thêm đồ đạc.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5 text-[#1e3a2f]" />
          <span>Thêm đồ đạc & Quản lý bảo hành</span>
        </div>
      }
      description="Lưu giữ thông tin thiết bị trong nhà, hạn bảo hành và hoá đơn mua hàng."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo upload row: Item photo & Receipt photo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Item Photo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
              Ảnh thiết bị / đồ đạc
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
            {!itemPreview ? (
              <div
                onClick={() => itemPhotoInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-3 text-center cursor-pointer hover:border-[#1e3a2f] bg-stone-50/50 h-28"
              >
                <Camera className="h-6 w-6 text-stone-400 mb-1" />
                <span className="text-xs font-semibold text-stone-700">Tải ảnh đồ đạc</span>
              </div>
            ) : (
              <div className="relative h-28 w-full overflow-hidden rounded-xl border border-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={itemPreview} alt="Item" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setItemFile(null);
                    setItemPreview(null);
                  }}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Receipt Photo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
              Ảnh phiếu bảo hành / Hoá đơn
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
            {!receiptPreview ? (
              <div
                onClick={() => receiptPhotoInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-3 text-center cursor-pointer hover:border-[#1e3a2f] bg-stone-50/50 h-28"
              >
                <FileText className="h-6 w-6 text-stone-400 mb-1" />
                <span className="text-xs font-semibold text-stone-700">Tải ảnh phiếu bảo hành</span>
              </div>
            ) : (
              <div className="relative h-28 w-full overflow-hidden rounded-xl border border-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={receiptPreview} alt="Receipt" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setReceiptFile(null);
                    setReceiptPreview(null);
                  }}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Room selector and quick create */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Khu vực / Phòng trong nhà
            </label>
            {!isCreatingRoom && (
              <button
                type="button"
                onClick={() => setIsCreatingRoom(true)}
                className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                Thêm phòng mới
              </button>
            )}
          </div>

          {isCreatingRoom ? (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-100 dark:bg-stone-800">
              <Input
                placeholder="Tên phòng (vd: Phòng khách, Bếp, Bàn làm việc...)"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="h-8 text-xs"
              />
              <Button size="sm" type="button" onClick={handleQuickCreateRoom} className="h-8 text-xs">
                Lưu
              </Button>
              <Button size="sm" variant="ghost" type="button" onClick={() => setIsCreatingRoom(false)} className="h-8 text-xs">
                Huỷ
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setRoomId('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  roomId === ''
                    ? 'bg-[#1e3a2f] text-white border-[#1e3a2f]'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                }`}
              >
                Chưa xếp phòng
              </button>
              {rooms.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRoomId(r.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    roomId === r.id
                      ? 'bg-[#1e3a2f] text-white border-[#1e3a2f]'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Tên đồ đạc / Thiết bị *"
              placeholder="Ví dụ: Máy lọc không khí Xiaomi Pro, Màn hình Dell UltraSharp..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <Input
            label="Danh mục"
            placeholder="Đồ gia dụng, Công nghệ, Bếp, Nội thất..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <Input
            label="Số Serial / Model máy"
            placeholder="S/N: 2024-XIAOMI-8899..."
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
          />

          <Input
            label="Giá mua (VNĐ)"
            type="number"
            min="0"
            placeholder="3500000"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            leftIcon={<DollarSign className="h-4 w-4" />}
          />

          <Input
            label="Nơi mua"
            placeholder="Điện Máy Xanh, Shopee, Tiki..."
            value={purchaseStore}
            onChange={(e) => setPurchaseStore(e.target.value)}
            leftIcon={<Store className="h-4 w-4" />}
          />

          <Input
            label="Ngày mua"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            leftIcon={<Calendar className="h-4 w-4" />}
          />

          <Input
            label="Hạn bảo hành đến ngày"
            type="date"
            value={warrantyEndDate}
            onChange={(e) => setWarrantyEndDate(e.target.value)}
            leftIcon={<ShieldCheck className="h-4 w-4" />}
          />
        </div>

        <Textarea
          label="Ghi chú cách bảo quản & sử dụng"
          placeholder="Thay lõi lọc định kỳ 6 tháng 1 lần, vệ sinh cảm biến bụi..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={createItemMutation.isPending}>
            Huỷ
          </Button>
          <Button type="submit" size="sm" disabled={createItemMutation.isPending} className="gap-1.5 font-semibold">
            {createItemMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Lưu vào Home Manager
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
