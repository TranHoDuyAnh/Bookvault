import { createClient } from '@/lib/supabase/client';
import type { HomeRoom, HomeItem, HomeMaintenanceLog } from '@/types/database';

export async function getHomeRooms(userId: string): Promise<HomeRoom[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('home_rooms')
    .select('*, home_items(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }

  return (data || []).map((r: any) => ({
    ...r,
    item_count: r.home_items?.[0]?.count || 0,
  }));
}

export async function createHomeRoom(userId: string, name: string, icon = 'Home'): Promise<HomeRoom> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('home_rooms')
    .insert({
      user_id: userId,
      name: name.trim(),
      icon,
    } as any)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Tạo phòng thất bại: ${error.message}`);
  }

  return data as HomeRoom;
}

export async function deleteHomeRoom(roomId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('home_rooms').delete().eq('id', roomId);
  if (error) {
    throw new Error(`Xoá phòng thất bại: ${error.message}`);
  }
}

export interface HomeItemFilters {
  roomId?: string;
  category?: string;
  status?: string;
  warrantyStatus?: 'active' | 'expiring_soon' | 'expired' | 'all';
  search?: string;
}

export async function getHomeItems(
  userId: string,
  filters: HomeItemFilters = {}
): Promise<HomeItem[]> {
  const supabase = createClient();

  let query = supabase
    .from('home_items')
    .select('*, home_rooms(*), home_maintenance_logs(*)')
    .eq('user_id', userId);

  if (filters.roomId) {
    query = query.eq('room_id', filters.roomId);
  }

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.search && filters.search.trim()) {
    const term = filters.search.trim();
    query = query.or(`name.ilike.%${term}%,purchase_store.ilike.%${term}%,serial_number.ilike.%${term}%`);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching home items:', error);
    return [];
  }

  let items: HomeItem[] = (data || []).map((item: any) => ({
    ...item,
    room: item.home_rooms,
    maintenance_logs: item.home_maintenance_logs || [],
  }));

  // Warranty filter
  if (filters.warrantyStatus && filters.warrantyStatus !== 'all') {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    items = items.filter((item) => {
      if (!item.warranty_end_date) return false;
      const wDate = new Date(item.warranty_end_date);
      if (filters.warrantyStatus === 'expired') return wDate < today;
      if (filters.warrantyStatus === 'expiring_soon') return wDate >= today && wDate <= thirtyDaysLater;
      if (filters.warrantyStatus === 'active') return wDate >= today;
      return true;
    });
  }

  return items;
}

export async function createHomeItem({
  userId,
  roomId,
  name,
  category,
  purchaseDate,
  purchasePrice,
  purchaseStore,
  warrantyEndDate,
  serialNumber,
  status = 'ACTIVE',
  manualUrl,
  notes,
  imageFile,
  receiptFile,
}: {
  userId: string;
  roomId?: string | null;
  name: string;
  category?: string | null;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  purchaseStore?: string | null;
  warrantyEndDate?: string | null;
  serialNumber?: string | null;
  status?: string;
  manualUrl?: string | null;
  notes?: string | null;
  imageFile?: File | null;
  receiptFile?: File | null;
}): Promise<HomeItem> {
  const supabase = createClient();
  let imageUrl: string | null = null;
  let receiptImageUrl: string | null = null;

  // Upload item photo
  if (imageFile) {
    const fileExt = imageFile.name.split('.').pop() || 'jpg';
    const filePath = `${userId}/home/item_${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from('book-images')
      .upload(filePath, imageFile, { cacheControl: '3600', upsert: false });
    if (!error) {
      const { data: signed } = await supabase.storage
        .from('book-images')
        .createSignedUrl(filePath, 60 * 60 * 24 * 30);
      imageUrl = signed?.signedUrl || filePath;
    }
  }

  // Upload receipt / warranty photo
  if (receiptFile) {
    const fileExt = receiptFile.name.split('.').pop() || 'jpg';
    const filePath = `${userId}/home/receipt_${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from('book-images')
      .upload(filePath, receiptFile, { cacheControl: '3600', upsert: false });
    if (!error) {
      const { data: signed } = await supabase.storage
        .from('book-images')
        .createSignedUrl(filePath, 60 * 60 * 24 * 30);
      receiptImageUrl = signed?.signedUrl || filePath;
    }
  }

  const payload = {
    user_id: userId,
    room_id: roomId || null,
    name: name.trim(),
    category: category?.trim() || 'Đồ gia dụng',
    purchase_date: purchaseDate || null,
    purchase_price: purchasePrice !== undefined && purchasePrice !== null ? purchasePrice : null,
    purchase_store: purchaseStore?.trim() || null,
    warranty_end_date: warrantyEndDate || null,
    serial_number: serialNumber?.trim() || null,
    status: status as any,
    manual_url: manualUrl?.trim() || null,
    notes: notes?.trim() || null,
    image_url: imageUrl,
    receipt_image_url: receiptImageUrl,
  };

  const { data, error } = await supabase
    .from('home_items')
    .insert(payload as any)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Thêm đồ đạc thất bại: ${error.message}`);
  }

  return data as HomeItem;
}

export async function updateHomeItem(
  itemId: string,
  updates: Partial<HomeItem>
): Promise<HomeItem> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('home_items')
    .update(updates as any)
    .eq('id', itemId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Cập nhật đồ đạc thất bại: ${error.message}`);
  }

  return data as HomeItem;
}

export async function deleteHomeItem(itemId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('home_items').delete().eq('id', itemId);
  if (error) {
    throw new Error(`Xoá đồ đạc thất bại: ${error.message}`);
  }
}

export async function addMaintenanceLog({
  itemId,
  maintenanceDate = new Date().toISOString().split('T')[0],
  cost = 0,
  description,
  performedBy,
}: {
  itemId: string;
  maintenanceDate?: string;
  cost?: number;
  description: string;
  performedBy?: string | null;
}): Promise<HomeMaintenanceLog> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('home_maintenance_logs')
    .insert({
      item_id: itemId,
      maintenance_date: maintenanceDate,
      cost,
      description: description.trim(),
      performed_by: performedBy?.trim() || null,
    } as any)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Lưu bảo trì thất bại: ${error.message}`);
  }

  return data as HomeMaintenanceLog;
}

export interface HomeStats {
  totalItems: number;
  totalAssetValue: number;
  expiringWarrantiesCount: number;
  activeWarrantiesCount: number;
  totalMaintenanceSpent: number;
}

export async function getHomeStats(userId: string): Promise<HomeStats> {
  const supabase = createClient();

  const { data: items } = await supabase
    .from('home_items')
    .select('purchase_price, warranty_end_date, home_maintenance_logs(cost)')
    .eq('user_id', userId);

  if (!items) {
    return {
      totalItems: 0,
      totalAssetValue: 0,
      expiringWarrantiesCount: 0,
      activeWarrantiesCount: 0,
      totalMaintenanceSpent: 0,
    };
  }

  const today = new Date();
  const thirtyDays = new Date();
  thirtyDays.setDate(today.getDate() + 30);

  let totalAsset = 0;
  let expiring = 0;
  let activeW = 0;
  let totalMaint = 0;

  items.forEach((item: any) => {
    if (item.purchase_price) totalAsset += Number(item.purchase_price);
    if (item.warranty_end_date) {
      const wDate = new Date(item.warranty_end_date);
      if (wDate >= today) {
        activeW++;
        if (wDate <= thirtyDays) expiring++;
      }
    }
    if (item.home_maintenance_logs) {
      item.home_maintenance_logs.forEach((log: any) => {
        totalMaint += Number(log.cost || 0);
      });
    }
  });

  return {
    totalItems: items.length,
    totalAssetValue: totalAsset,
    expiringWarrantiesCount: expiring,
    activeWarrantiesCount: activeW,
    totalMaintenanceSpent: totalMaint,
  };
}
