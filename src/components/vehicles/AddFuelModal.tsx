'use client';

import React, { useState } from 'react';
import { Fuel, Loader2, Check, DollarSign, Calendar, Gauge, MapPin } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useAddFuelLog } from '@/hooks/useVehicles';
import type { Vehicle } from '@/types/database';
import { toast } from 'sonner';

export function AddFuelModal({
  isOpen,
  onClose,
  vehicle,
}: {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}) {
  const addFuelMutation = useAddFuelLog();

  const [totalCost, setTotalCost] = useState('');
  const [liters, setLiters] = useState('');
  const [odoKm, setOdoKm] = useState(vehicle ? String(vehicle.current_odo || '') : '');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [gasStation, setGasStation] = useState('Petrolimex');
  const [notes, setNotes] = useState('');

  if (!vehicle) return null;

  const handleReset = () => {
    setTotalCost('');
    setLiters('');
    setOdoKm('');
    setLogDate(new Date().toISOString().split('T')[0]);
    setGasStation('Petrolimex');
    setNotes('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalCost) {
      toast.error('Vui lòng nhập số tiền đổ xăng.');
      return;
    }

    try {
      await addFuelMutation.mutateAsync({
        vehicleId: vehicle.id,
        totalCost: Number(totalCost),
        liters: liters ? Number(liters) : null,
        odoKm: odoKm ? Number(odoKm) : null,
        logDate,
        gasStation,
        notes,
      });

      toast.success(`Đã ghi nhận đổ xăng cho ${vehicle.name}! ⛽`);
      handleReset();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi ghi nhận đổ xăng.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Fuel className="h-5 w-5 text-amber-600" />
          <span>Ghi nhận đổ xăng</span>
        </div>
      }
      description={`Phương tiện: "${vehicle.name}" (${vehicle.license_plate || 'Chưa biển'})`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Tổng tiền xăng (VNĐ) *"
            type="number"
            min="0"
            placeholder="100000"
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
            leftIcon={<DollarSign className="h-4 w-4" />}
            required
          />

          <Input
            label="Số lít xăng"
            type="number"
            step="0.01"
            placeholder="4.5"
            value={liters}
            onChange={(e) => setLiters(e.target.value)}
          />

          <Input
            label="Số Odo lúc đổ (km)"
            type="number"
            min="0"
            placeholder="12850"
            value={odoKm}
            onChange={(e) => setOdoKm(e.target.value)}
            leftIcon={<Gauge className="h-4 w-4" />}
          />

          <Input
            label="Ngày đổ xăng"
            type="date"
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            leftIcon={<Calendar className="h-4 w-4" />}
          />
        </div>

        <Input
          label="Cây xăng / Trạm xăng"
          placeholder="Petrolimex, PVOIL, Shell..."
          value={gasStation}
          onChange={(e) => setGasStation(e.target.value)}
          leftIcon={<MapPin className="h-4 w-4" />}
        />

        <Textarea
          label="Ghi chú"
          placeholder="Đổ xăng RON 95-V, đi được 250km..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={addFuelMutation.isPending}>
            Huỷ
          </Button>
          <Button type="submit" size="sm" disabled={addFuelMutation.isPending} className="gap-1.5 font-semibold">
            {addFuelMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Lưu nhật ký xăng
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
