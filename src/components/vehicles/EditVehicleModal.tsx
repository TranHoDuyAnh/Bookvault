'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Car, Camera, X, Loader2, Check, Calendar, Gauge, FileCheck, ShieldCheck, Edit } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useUpdateVehicle } from '@/hooks/useVehicles';
import { VEHICLE_TYPES } from './VehicleCard';
import type { Vehicle, VehicleType } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

export function EditVehicleModal({
  isOpen,
  onClose,
  vehicle,
}: {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
}) {
  const updateVehicleMutation = useUpdateVehicle();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(vehicle.name || '');
  const [type, setType] = useState<VehicleType>(vehicle.type || 'MOTORBIKE');
  const [licensePlate, setLicensePlate] = useState(vehicle.license_plate || '');
  const [brand, setBrand] = useState(vehicle.brand || '');
  const [modelYear, setModelYear] = useState(vehicle.model_year ? String(vehicle.model_year) : '');
  const [currentOdo, setCurrentOdo] = useState(vehicle.current_odo ? String(vehicle.current_odo) : '');
  const [insuranceExpiryDate, setInsuranceExpiryDate] = useState(vehicle.insurance_expiry_date || '');
  const [registrationExpiryDate, setRegistrationExpiryDate] = useState(vehicle.registration_expiry_date || '');
  const [notes, setNotes] = useState(vehicle.notes || '');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(vehicle.image_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && vehicle) {
      setName(vehicle.name || '');
      setType(vehicle.type || 'MOTORBIKE');
      setLicensePlate(vehicle.license_plate || '');
      setBrand(vehicle.brand || '');
      setModelYear(vehicle.model_year ? String(vehicle.model_year) : '');
      setCurrentOdo(vehicle.current_odo ? String(vehicle.current_odo) : '');
      setInsuranceExpiryDate(vehicle.insurance_expiry_date || '');
      setRegistrationExpiryDate(vehicle.registration_expiry_date || '');
      setNotes(vehicle.notes || '');
      setSelectedFile(null);
      setPreviewUrl(vehicle.image_url || null);
    }
  }, [isOpen, vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên phương tiện.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = vehicle.image_url;

      if (selectedFile && user) {
        const supabase = createClient();
        const fileExt = selectedFile.name.split('.').pop() || 'jpg';
        const filePath = `${user.id}/vehicles/${Date.now()}_vehicle.${fileExt}`;
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

      await updateVehicleMutation.mutateAsync({
        vehicleId: vehicle.id,
        updates: {
          name: name.trim(),
          type,
          license_plate: licensePlate.trim() || null,
          brand: brand.trim() || null,
          model_year: modelYear ? Number(modelYear) : null,
          current_odo: currentOdo ? Number(currentOdo) : 0,
          insurance_expiry_date: insuranceExpiryDate || null,
          registration_expiry_date: registrationExpiryDate || null,
          notes: notes.trim() || null,
          image_url: finalImageUrl,
        },
      });

      toast.success('Đã cập nhật phương tiện! 🚗');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật xe.');
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
          <Edit className="h-5 w-5 text-[#1e3a2f]" />
          <span>Chỉnh sửa thông tin phương tiện</span>
        </div>
      }
      description="Cập nhật thông tin chi tiết, hạn đăng kiểm và hạn bảo hiểm phương tiện."
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
            className="group relative flex h-24 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#e7e2d9] dark:border-stone-700 bg-[#f7f4ee] dark:bg-stone-800 hover:border-[#1e3a2f] transition-colors"
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-stone-400 group-hover:text-[#1e3a2f]">
                <Camera className="h-5 w-5" />
                <span className="text-[10px]">Đổi ảnh</span>
              </div>
            )}
          </div>
          <div className="text-xs text-stone-500 space-y-1">
            <p className="font-semibold text-stone-700 dark:text-stone-300">Ảnh xe / Phương tiện</p>
            <p>Bấm vào khung để thay đổi ảnh chụp xe.</p>
          </div>
        </div>

        {/* Name & Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Tên phương tiện (VD: Vision 2023, Mazda 3) *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Loại phương tiện
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as VehicleType)}
              className="w-full rounded-lg border border-[#e7e2d9] dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm text-stone-800 dark:text-stone-200 outline-hidden focus:border-[#1e3a2f]"
            >
              {Object.entries(VEHICLE_TYPES).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.icon} {info.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* License plate, Brand, Model year */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Biển số xe"
            placeholder="VD: 59-P1 123.45"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
          />

          <Input
            label="Hãng sản xuất"
            placeholder="VD: Honda, Toyota..."
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />

          <Input
            label="Năm sản xuất"
            type="number"
            placeholder="VD: 2022"
            value={modelYear}
            onChange={(e) => setModelYear(e.target.value)}
          />
        </div>

        {/* Current ODO */}
        <Input
          label="Số ODO hiện tại (km)"
          type="number"
          value={currentOdo}
          onChange={(e) => setCurrentOdo(e.target.value)}
        />

        {/* Expiries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
          <Input
            label="Hạn đăng kiểm tiếp theo"
            type="date"
            value={registrationExpiryDate}
            onChange={(e) => setRegistrationExpiryDate(e.target.value)}
          />

          <Input
            label="Hạn bảo hiểm tiếp theo"
            type="date"
            value={insuranceExpiryDate}
            onChange={(e) => setInsuranceExpiryDate(e.target.value)}
          />
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
