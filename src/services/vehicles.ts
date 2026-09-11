import { createClient } from '@/lib/supabase/client';
import type { Vehicle, VehicleFuelLog, VehicleServiceLog, VehicleType } from '@/types/database';

export async function getVehicles(userId: string): Promise<Vehicle[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('vehicles')
    .select('*, vehicle_fuel_logs(*), vehicle_service_logs(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }

  return (data || []).map((v: any) => ({
    ...v,
    fuel_logs: v.vehicle_fuel_logs || [],
    service_logs: v.vehicle_service_logs || [],
  }));
}

export async function createVehicle({
  userId,
  name,
  type = 'MOTORBIKE',
  licensePlate,
  brand,
  modelYear,
  currentOdo = 0,
  insuranceExpiryDate,
  registrationExpiryDate,
  notes,
  imageFile,
}: {
  userId: string;
  name: string;
  type?: VehicleType;
  licensePlate?: string | null;
  brand?: string | null;
  modelYear?: number | null;
  currentOdo?: number;
  insuranceExpiryDate?: string | null;
  registrationExpiryDate?: string | null;
  notes?: string | null;
  imageFile?: File | null;
}): Promise<Vehicle> {
  const supabase = createClient();
  let imageUrl: string | null = null;

  if (imageFile) {
    const fileExt = imageFile.name.split('.').pop() || 'jpg';
    const filePath = `${userId}/vehicles/${Date.now()}_veh.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('book-images')
      .upload(filePath, imageFile, { cacheControl: '3600', upsert: false });

    if (!uploadError) {
      const { data: signed } = await supabase.storage
        .from('book-images')
        .createSignedUrl(filePath, 60 * 60 * 24 * 30);
      imageUrl = signed?.signedUrl || filePath;
    }
  }

  const payload = {
    user_id: userId,
    name: name.trim(),
    type,
    license_plate: licensePlate?.trim() || null,
    brand: brand?.trim() || null,
    model_year: modelYear || null,
    current_odo: currentOdo || 0,
    insurance_expiry_date: insuranceExpiryDate || null,
    registration_expiry_date: registrationExpiryDate || null,
    image_url: imageUrl,
    notes: notes?.trim() || null,
  };

  const { data, error } = await supabase
    .from('vehicles')
    .insert(payload as any)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Thêm phương tiện thất bại: ${error.message}`);
  }

  return data as Vehicle;
}

export async function updateVehicle(
  vehicleId: string,
  updates: Partial<Vehicle>
): Promise<Vehicle> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('vehicles')
    .update(updates as any)
    .eq('id', vehicleId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Cập nhật xe thất bại: ${error.message}`);
  }

  return data as Vehicle;
}

export async function deleteVehicle(vehicleId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('vehicles').delete().eq('id', vehicleId);
  if (error) {
    throw new Error(`Xoá phương tiện thất bại: ${error.message}`);
  }
}

// Fuel Logs
export async function addFuelLog({
  vehicleId,
  logDate = new Date().toISOString().split('T')[0],
  odoKm,
  liters,
  pricePerLiter,
  totalCost,
  gasStation,
  notes,
}: {
  vehicleId: string;
  logDate?: string;
  odoKm?: number | null;
  liters?: number | null;
  pricePerLiter?: number | null;
  totalCost: number;
  gasStation?: string | null;
  notes?: string | null;
}): Promise<VehicleFuelLog> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('vehicle_fuel_logs')
    .insert({
      vehicle_id: vehicleId,
      log_date: logDate,
      odo_km: odoKm || null,
      liters: liters || null,
      price_per_liter: pricePerLiter || null,
      total_cost: totalCost,
      gas_station: gasStation?.trim() || null,
      notes: notes?.trim() || null,
    } as any)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Ghi nhận đổ xăng thất bại: ${error.message}`);
  }

  // Update vehicle current Odo if provided
  if (odoKm && odoKm > 0) {
    await supabase
      .from('vehicles')
      .update({ current_odo: odoKm } as any)
      .eq('id', vehicleId);
  }

  return data as VehicleFuelLog;
}

// Service Logs
export async function addVehicleServiceLog({
  vehicleId,
  logDate = new Date().toISOString().split('T')[0],
  odoKm,
  serviceType,
  cost,
  performedAt,
  nextServiceOdo,
  nextServiceDate,
  notes,
}: {
  vehicleId: string;
  logDate?: string;
  odoKm?: number | null;
  serviceType: string;
  cost: number;
  performedAt?: string | null;
  nextServiceOdo?: number | null;
  nextServiceDate?: string | null;
  notes?: string | null;
}): Promise<VehicleServiceLog> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('vehicle_service_logs')
    .insert({
      vehicle_id: vehicleId,
      log_date: logDate,
      odo_km: odoKm || null,
      service_type: serviceType.trim(),
      cost,
      performed_at: performedAt?.trim() || null,
      next_service_odo: nextServiceOdo || null,
      next_service_date: nextServiceDate || null,
      notes: notes?.trim() || null,
    } as any)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Ghi nhận bảo dưỡng xe thất bại: ${error.message}`);
  }

  if (odoKm && odoKm > 0) {
    await supabase
      .from('vehicles')
      .update({ current_odo: odoKm } as any)
      .eq('id', vehicleId);
  }

  return data as VehicleServiceLog;
}

export interface VehicleStats {
  totalVehicles: number;
  totalFuelSpent: number;
  totalServiceSpent: number;
  expiringRegistrationCount: number;
  expiringInsuranceCount: number;
}

export async function getVehicleStats(userId: string): Promise<VehicleStats> {
  const vehicles = await getVehicles(userId);
  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);

  let fuelSpent = 0;
  let serviceSpent = 0;
  let expReg = 0;
  let expIns = 0;

  vehicles.forEach((v) => {
    v.fuel_logs?.forEach((f) => (fuelSpent += Number(f.total_cost || 0)));
    v.service_logs?.forEach((s) => (serviceSpent += Number(s.cost || 0)));

    if (v.registration_expiry_date) {
      const regDate = new Date(v.registration_expiry_date);
      if (regDate >= today && regDate <= thirtyDaysLater) expReg++;
    }

    if (v.insurance_expiry_date) {
      const insDate = new Date(v.insurance_expiry_date);
      if (insDate >= today && insDate <= thirtyDaysLater) expIns++;
    }
  });

  return {
    totalVehicles: vehicles.length,
    totalFuelSpent: fuelSpent,
    totalServiceSpent: serviceSpent,
    expiringRegistrationCount: expReg,
    expiringInsuranceCount: expIns,
  };
}
