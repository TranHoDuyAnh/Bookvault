'use client';

import React, { useState, useRef } from 'react';
import { Car, Camera, X, Loader2, Check, Calendar, Gauge, FileCheck, ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useCreateVehicle } from '@/hooks/useVehicles';
import { VEHICLE_TYPES } from './VehicleCard';
import type { VehicleType } from '@/types/database';
import { toast } from 'sonner';

export function AddVehicleModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const createVehicleMutation = useCreateVehicle();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<VehicleType>('MOTORBIKE');
  const [licensePlate, setLicensePlate] = useState('');
  const [brand, setBrand] = useState('');
  const [modelYear, setModelYear] = useState('');
  const [currentOdo, setCurrentOdo] = useState('');
  const [insuranceExpiryDate, setInsuranceExpiryDate] = useState('');
  const [registrationExpiryDate, setRegistrationExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleReset = () => {
    setName('');
    setType('MOTORBIKE');
    setLicensePlate('');
    setBrand('');
    setModelYear('');
    setCurrentOdo('');
    setInsuranceExpiryDate('');
    setRegistrationExpiryDate('');
    setNotes('');
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên phương tiện.');
      return;
    }

    try {
      await createVehicleMutation.mutateAsync({
        name,
        type,
        licensePlate: licensePlate || null,
        brand: brand || null,
        modelYear: modelYear ? Number(modelYear) : null,
        currentOdo: currentOdo ? Number(currentOdo) : 0,
        insuranceExpiryDate: insuranceExpiryDate || null,
        registrationExpiryDate: registrationExpiryDate || null,
        notes: notes || null,
        imageFile: selectedFile,
      });

      toast.success('Đã thêm phương tiện thành công! 🚗');
      handleReset();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi thêm xe.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-emerald-800" />
          <span>Thêm phương tiện di chuyển</span>
        </div>
      }
      description="Quản lý xe máy, ô tô, theo dõi Odo, hạn đăng kiểm và bảo hiểm bắt buộc."
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
            <span className="text-xs font-semibold text-stone-700">Tải ảnh chụp xe</span>
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

        {/* Vehicle Type Tabs */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
            Loại phương tiện
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(VEHICLE_TYPES) as VehicleType[]).map((vt) => {
              const isSelected = type === vt;
              const info = VEHICLE_TYPES[vt];
              return (
                <button
                  key={vt}
                  type="button"
                  onClick={() => setType(vt)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'border-[#1e3a2f] bg-emerald-50 text-[#1e3a2f] ring-2 ring-[#1e3a2f]/20 font-bold'
                      : 'border-stone-200 bg-white hover:border-stone-300 text-stone-600'
                  }`}
                >
                  <span>{info.icon}</span>
                  <span>{info.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Tên xe *"
              placeholder="Honda SH 150i ABS, Mazda CX-5 Premium, VinFast VF8..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <Input
            label="Biển số xe"
            placeholder="29A-123.45 hoặc 51F-999.88"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
          />

          <Input
            label="Hãng sản xuất"
            placeholder="Honda, Yamaha, Mazda, Toyota, VinFast..."
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />

          <Input
            label="Đời xe / Năm sản xuất"
            type="number"
            placeholder="2023"
            value={modelYear}
            onChange={(e) => setModelYear(e.target.value)}
          />

          <Input
            label="Odo hiện tại (km)"
            type="number"
            min="0"
            placeholder="12500"
            value={currentOdo}
            onChange={(e) => setCurrentOdo(e.target.value)}
            leftIcon={<Gauge className="h-4 w-4" />}
          />

          <Input
            label="Hạn đăng kiểm tiếp theo"
            type="date"
            value={registrationExpiryDate}
            onChange={(e) => setRegistrationExpiryDate(e.target.value)}
            leftIcon={<FileCheck className="h-4 w-4" />}
          />

          <Input
            label="Hạn bảo hiểm bắt buộc"
            type="date"
            value={insuranceExpiryDate}
            onChange={(e) => setInsuranceExpiryDate(e.target.value)}
            leftIcon={<ShieldCheck className="h-4 w-4" />}
          />
        </div>

        <Textarea
          label="Ghi chú thêm"
          placeholder="Số khung, số máy, địa chỉ tiệm sửa xe quen..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={createVehicleMutation.isPending}>
            Huỷ
          </Button>
          <Button type="submit" size="sm" disabled={createVehicleMutation.isPending} className="gap-1.5 font-semibold">
            {createVehicleMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Lưu phương tiện
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
