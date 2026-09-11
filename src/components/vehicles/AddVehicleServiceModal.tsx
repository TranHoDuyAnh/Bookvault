'use client';

import React, { useState } from 'react';
import { Wrench, Loader2, Check, DollarSign, Calendar, Gauge, MapPin } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useAddVehicleServiceLog } from '@/hooks/useVehicles';
import type { Vehicle } from '@/types/database';
import { toast } from 'sonner';

export const COMMON_VEHICLE_SERVICES = [
  'Thay nhớt máy & nhớt lap',
  'Bảo dưỡng định kỳ',
  'Thay lọc gió & bugi',
  'Thay lốp trước / sau',
  'Bảo dưỡng hệ thống phanh',
  'Vệ sinh nồi / kim phun',
  'Đăng kiểm xe',
  'Mua bảo hiểm bắt buộc',
  'Rửa xe & chăm sóc chi tiết',
  'Sửa chữa khác',
];

export function AddVehicleServiceModal({
  isOpen,
  onClose,
  vehicle,
}: {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}) {
  const addServiceMutation = useAddVehicleServiceLog();

  const [serviceType, setServiceType] = useState('Thay nhớt máy & nhớt lap');
  const [cost, setCost] = useState('');
  const [odoKm, setOdoKm] = useState(vehicle ? String(vehicle.current_odo || '') : '');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [performedAt, setPerformedAt] = useState('');
  const [nextServiceOdo, setNextServiceOdo] = useState('');
  const [nextServiceDate, setNextServiceDate] = useState('');
  const [notes, setNotes] = useState('');

  if (!vehicle) return null;

  const handleReset = () => {
    setServiceType('Thay nhớt máy & nhớt lap');
    setCost('');
    setOdoKm('');
    setLogDate(new Date().toISOString().split('T')[0]);
    setPerformedAt('');
    setNextServiceOdo('');
    setNextServiceDate('');
    setNotes('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceType.trim()) {
      toast.error('Vui lòng chọn loại dịch vụ.');
      return;
    }

    try {
      await addServiceMutation.mutateAsync({
        vehicleId: vehicle.id,
        serviceType,
        cost: cost ? Number(cost) : 0,
        odoKm: odoKm ? Number(odoKm) : null,
        logDate,
        performedAt,
        nextServiceOdo: nextServiceOdo ? Number(nextServiceOdo) : null,
        nextServiceDate: nextServiceDate || null,
        notes,
      });

      toast.success(`Đã lưu bảo dưỡng cho ${vehicle.name}! 🔧`);
      handleReset();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu bảo dưỡng xe.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-emerald-800" />
          <span>Ghi nhận bảo dưỡng & Chi phí xe</span>
        </div>
      }
      description={`Phương tiện: "${vehicle.name}" (${vehicle.license_plate || 'Chưa biển'})`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick select service */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
            Hạng mục dịch vụ / Sửa chữa *
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 border rounded-xl border-stone-200">
            {COMMON_VEHICLE_SERVICES.map((srv) => (
              <button
                key={srv}
                type="button"
                onClick={() => setServiceType(srv)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  serviceType === srv
                    ? 'bg-[#1e3a2f] text-white border-[#1e3a2f]'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                }`}
              >
                {srv}
              </button>
            ))}
          </div>
          <Input
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            placeholder="Hoặc nhập tên hạng mục khác..."
            className="text-xs"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Chi phí (VNĐ) *"
            type="number"
            min="0"
            placeholder="250000"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            leftIcon={<DollarSign className="h-4 w-4" />}
            required
          />

          <Input
            label="Số Odo (km)"
            type="number"
            min="0"
            placeholder="13000"
            value={odoKm}
            onChange={(e) => setOdoKm(e.target.value)}
            leftIcon={<Gauge className="h-4 w-4" />}
          />

          <Input
            label="Ngày thực hiện"
            type="date"
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            leftIcon={<Calendar className="h-4 w-4" />}
          />

          <Input
            label="Nơi thực hiện / Gara"
            placeholder="Honda HEAD, Gara ô tô..."
            value={performedAt}
            onChange={(e) => setPerformedAt(e.target.value)}
            leftIcon={<MapPin className="h-4 w-4" />}
          />

          <Input
            label="Nhắc bảo dưỡng lần sau ở Odo (km)"
            type="number"
            placeholder="15000"
            value={nextServiceOdo}
            onChange={(e) => setNextServiceOdo(e.target.value)}
          />

          <Input
            label="Hoặc nhắc vào ngày"
            type="date"
            value={nextServiceDate}
            onChange={(e) => setNextServiceDate(e.target.value)}
          />
        </div>

        <Textarea
          label="Ghi chú chi tiết"
          placeholder="Nhớt Motul 10W40, bảo hành 6 tháng..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={addServiceMutation.isPending}>
            Huỷ
          </Button>
          <Button type="submit" size="sm" disabled={addServiceMutation.isPending} className="gap-1.5 font-semibold">
            {addServiceMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Lưu bảo dưỡng
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
