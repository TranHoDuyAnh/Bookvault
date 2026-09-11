import { createClient } from '@/lib/supabase/client';
import type { PersonalAsset, AssetCategory, AssetStatus } from '@/types/database';

export interface AssetFilters {
  category?: AssetCategory | 'ALL';
  status?: AssetStatus | 'ALL';
  search?: string;
  sortBy?: 'value_desc' | 'value_asc' | 'newest';
}

export async function getPersonalAssets(
  userId: string,
  filters: AssetFilters = {}
): Promise<PersonalAsset[]> {
  const supabase = createClient();

  let query = supabase
    .from('personal_assets')
    .select('*')
    .eq('user_id', userId);

  if (filters.category && filters.category !== 'ALL') {
    query = query.eq('category', filters.category);
  }

  if (filters.status && filters.status !== 'ALL') {
    query = query.eq('status', filters.status);
  }

  if (filters.search && filters.search.trim()) {
    const term = filters.search.trim();
    query = query.or(`name.ilike.%${term}%,location.ilike.%${term}%,serial_number.ilike.%${term}%`);
  }

  switch (filters.sortBy) {
    case 'value_desc':
      query = query.order('estimated_current_value', { ascending: false, nullsFirst: false });
      break;
    case 'value_asc':
      query = query.order('estimated_current_value', { ascending: true, nullsFirst: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching personal assets:', error);
    return [];
  }

  return (data || []) as PersonalAsset[];
}

export async function createPersonalAsset({
  userId,
  name,
  category = 'TECH',
  purchaseDate,
  purchasePrice,
  estimatedCurrentValue,
  location,
  status = 'ACTIVE',
  serialNumber,
  notes,
  imageFile,
}: {
  userId: string;
  name: string;
  category?: AssetCategory;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  estimatedCurrentValue?: number | null;
  location?: string | null;
  status?: AssetStatus;
  serialNumber?: string | null;
  notes?: string | null;
  imageFile?: File | null;
}): Promise<PersonalAsset> {
  const supabase = createClient();
  let imageUrl: string | null = null;

  if (imageFile) {
    const fileExt = imageFile.name.split('.').pop() || 'jpg';
    const filePath = `${userId}/assets/${Date.now()}_asset.${fileExt}`;
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
    category,
    purchase_date: purchaseDate || null,
    purchase_price: purchasePrice !== undefined && purchasePrice !== null ? purchasePrice : null,
    estimated_current_value:
      estimatedCurrentValue !== undefined && estimatedCurrentValue !== null
        ? estimatedCurrentValue
        : purchasePrice || null,
    location: location?.trim() || null,
    status,
    serial_number: serialNumber?.trim() || null,
    image_url: imageUrl,
    notes: notes?.trim() || null,
  };

  const { data, error } = await supabase
    .from('personal_assets')
    .insert(payload as any)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Thêm tài sản thất bại: ${error.message}`);
  }

  return data as PersonalAsset;
}

export async function updatePersonalAsset(
  assetId: string,
  updates: Partial<PersonalAsset>
): Promise<PersonalAsset> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('personal_assets')
    .update(updates as any)
    .eq('id', assetId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Cập nhật tài sản thất bại: ${error.message}`);
  }

  return data as PersonalAsset;
}

export async function deletePersonalAsset(assetId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('personal_assets').delete().eq('id', assetId);
  if (error) {
    throw new Error(`Xoá tài sản thất bại: ${error.message}`);
  }
}

export interface AssetStats {
  totalAssets: number;
  totalPurchaseValue: number;
  totalCurrentValue: number;
  depreciationValue: number;
}

export async function getAssetStats(userId: string): Promise<AssetStats> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('personal_assets')
    .select('purchase_price, estimated_current_value, status')
    .eq('user_id', userId);

  if (error || !data) {
    return {
      totalAssets: 0,
      totalPurchaseValue: 0,
      totalCurrentValue: 0,
      depreciationValue: 0,
    };
  }

  let totalPurchase = 0;
  let totalCurrent = 0;

  data.forEach((item: any) => {
    if (item.status === 'ACTIVE') {
      const pPrice = Number(item.purchase_price || 0);
      const cValue = Number(item.estimated_current_value || pPrice);
      totalPurchase += pPrice;
      totalCurrent += cValue;
    }
  });

  return {
    totalAssets: data.length,
    totalPurchaseValue: totalPurchase,
    totalCurrentValue: totalCurrent,
    depreciationValue: totalPurchase - totalCurrent,
  };
}
