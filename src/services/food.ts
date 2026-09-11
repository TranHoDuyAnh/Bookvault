import { createClient } from '@/lib/supabase/client';
import type { FoodEntry, MealType } from '@/types/database';

export interface FoodFilters {
  mealType?: MealType | 'ALL';
  isFavorite?: boolean;
  isCookedAtHome?: boolean;
  search?: string;
  sortBy?: 'newest' | 'rating' | 'price_asc' | 'price_desc';
}

export async function getFoodEntries(
  userId: string,
  filters: FoodFilters = {}
): Promise<FoodEntry[]> {
  const supabase = createClient();

  let query = supabase
    .from('food_entries')
    .select('*')
    .eq('user_id', userId);

  if (filters.mealType && filters.mealType !== 'ALL') {
    query = query.eq('meal_type', filters.mealType);
  }

  if (filters.isFavorite !== undefined) {
    query = query.eq('is_favorite', filters.isFavorite);
  }

  if (filters.isCookedAtHome !== undefined) {
    query = query.eq('is_cooked_at_home', filters.isCookedAtHome);
  }

  if (filters.search && filters.search.trim()) {
    const term = filters.search.trim();
    query = query.or(`dish_name.ilike.%${term}%,restaurant_name.ilike.%${term}%,location_address.ilike.%${term}%`);
  }

  switch (filters.sortBy) {
    case 'rating':
      query = query.order('rating', { ascending: false, nullsFirst: false });
      break;
    case 'price_asc':
      query = query.order('price', { ascending: true, nullsFirst: false });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false, nullsFirst: false });
      break;
    case 'newest':
    default:
      query = query.order('entry_date', { ascending: false }).order('created_at', { ascending: false });
      break;
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching food entries:', error);
    return [];
  }

  return (data || []) as FoodEntry[];
}

export async function createFoodEntry({
  userId,
  dishName,
  mealType = 'DINNER',
  restaurantName,
  locationAddress,
  price,
  rating,
  entryDate = new Date().toISOString().split('T')[0],
  reviewNotes,
  isCookedAtHome = false,
  isFavorite = false,
  imageFile,
}: {
  userId: string;
  dishName: string;
  mealType?: MealType;
  restaurantName?: string | null;
  locationAddress?: string | null;
  price?: number | null;
  rating?: number | null;
  entryDate?: string;
  reviewNotes?: string | null;
  isCookedAtHome?: boolean;
  isFavorite?: boolean;
  imageFile?: File | null;
}): Promise<FoodEntry> {
  const supabase = createClient();
  let imageUrl: string | null = null;
  let storagePath: string | null = null;

  // Upload image if provided
  if (imageFile) {
    const fileExt = imageFile.name.split('.').pop() || 'jpg';
    const fileName = `food_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    storagePath = `${userId}/food/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('book-images')
      .upload(storagePath, imageFile, { cacheControl: '3600', upsert: false });

    if (!uploadError) {
      const { data: signedData } = await supabase.storage
        .from('book-images')
        .createSignedUrl(storagePath, 60 * 60 * 24 * 30); // 30 days
      imageUrl = signedData?.signedUrl || storagePath;
    }
  }

  const payload = {
    user_id: userId,
    dish_name: dishName.trim(),
    meal_type: mealType,
    restaurant_name: isCookedAtHome ? 'Tự nấu tại nhà' : restaurantName?.trim() || null,
    location_address: locationAddress?.trim() || null,
    price: price !== undefined && price !== null ? price : null,
    rating: rating || null,
    entry_date: entryDate,
    review_notes: reviewNotes?.trim() || null,
    is_cooked_at_home: isCookedAtHome,
    is_favorite: isFavorite,
    image_url: imageUrl,
    storage_path: storagePath,
  };

  const { data, error } = await supabase
    .from('food_entries')
    .insert(payload as any)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Thêm món ăn thất bại: ${error.message}`);
  }

  return data as FoodEntry;
}

export async function updateFoodEntry(
  entryId: string,
  updates: Partial<FoodEntry>
): Promise<FoodEntry> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('food_entries')
    .update(updates as any)
    .eq('id', entryId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Cập nhật món ăn thất bại: ${error.message}`);
  }

  return data as FoodEntry;
}

export async function deleteFoodEntry(entryId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('food_entries').delete().eq('id', entryId);
  if (error) {
    throw new Error(`Xoá món ăn thất bại: ${error.message}`);
  }
}

export interface FoodStats {
  totalDishes: number;
  homeCookedCount: number;
  eatOutCount: number;
  favoriteCount: number;
  totalSpent: number;
  avgRating: number;
}

export async function getFoodStats(userId: string): Promise<FoodStats> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('food_entries')
    .select('price, rating, is_cooked_at_home, is_favorite')
    .eq('user_id', userId);

  if (error || !data) {
    return {
      totalDishes: 0,
      homeCookedCount: 0,
      eatOutCount: 0,
      favoriteCount: 0,
      totalSpent: 0,
      avgRating: 0,
    };
  }

  let totalSpent = 0;
  let homeCooked = 0;
  let favorites = 0;
  let ratingSum = 0;
  let ratedCount = 0;

  data.forEach((item: any) => {
    if (item.is_cooked_at_home) homeCooked++;
    if (item.is_favorite) favorites++;
    if (item.price) totalSpent += Number(item.price);
    if (item.rating && item.rating > 0) {
      ratingSum += Number(item.rating);
      ratedCount++;
    }
  });

  return {
    totalDishes: data.length,
    homeCookedCount: homeCooked,
    eatOutCount: data.length - homeCooked,
    favoriteCount: favorites,
    totalSpent,
    avgRating: ratedCount > 0 ? Number((ratingSum / ratedCount).toFixed(1)) : 0,
  };
}
