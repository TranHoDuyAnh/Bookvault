export type BookStatus = 'WISHLIST' | 'OWNED' | 'READING' | 'READ' | 'DROPPED';

export type BookImageType = 'COVER' | 'BACK_COVER' | 'SPINE' | 'ISBN' | 'OTHER';

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'CAFE_DRINK';

export type HomeItemStatus = 'ACTIVE' | 'REPAIRING' | 'RETIRED';

export type QuestCategory = 'FOOD' | 'MINDFULNESS' | 'HOME' | 'ADVENTURE' | 'READING';

export type QuestDifficulty = 'EASY' | 'MEDIUM' | 'FUN';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle: string | null;
  author: string | null;
  publisher: string | null;
  isbn_10: string | null;
  isbn_13: string | null;
  language: string | null;
  release_year: number | null;
  description: string | null;
  page_count: number | null;
  google_books_id: string | null;
  open_library_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookImage {
  id: string;
  book_id: string;
  image_url: string;
  storage_path: string | null;
  image_type: BookImageType;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface UserBook {
  id: string;
  user_id: string;
  book_id: string;
  status: BookStatus;
  rating: number | null;
  purchase_price: number | null;
  purchase_date: string | null;
  purchase_store: string | null;
  started_reading_at: string | null;
  finished_reading_at: string | null;
  current_page: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReadingSession {
  id: string;
  user_book_id: string;
  started_at: string;
  ended_at: string | null;
  start_page: number | null;
  end_page: number | null;
  duration_minutes: number | null;
  created_at: string;
}

export interface BookNote {
  id: string;
  user_book_id: string;
  title: string | null;
  content: string;
  page_number: number | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface BookTag {
  user_book_id: string;
  tag_id: string;
  created_at: string;
}

export interface MyLibraryItem {
  id: string;
  user_id: string;
  book_id: string;
  title: string;
  subtitle: string | null;
  author: string | null;
  publisher: string | null;
  isbn_10: string | null;
  isbn_13: string | null;
  language: string | null;
  release_year: number | null;
  description: string | null;
  page_count: number | null;
  status: BookStatus;
  rating: number | null;
  purchase_price: number | null;
  purchase_date: string | null;
  purchase_store: string | null;
  started_reading_at: string | null;
  finished_reading_at: string | null;
  current_page: number;
  total_pages: number | null;
  reading_progress: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  images?: BookImage[];
  tags?: Tag[];
}

// ================= FOOD DIARY TYPES =================
export interface FoodEntry {
  id: string;
  user_id: string;
  dish_name: string;
  meal_type: MealType;
  restaurant_name: string | null;
  location_address: string | null;
  price: number | null;
  rating: number | null;
  entry_date: string;
  review_notes: string | null;
  is_cooked_at_home: boolean;
  is_favorite: boolean;
  image_url: string | null;
  storage_path: string | null;
  created_at: string;
  updated_at: string;
}

// ================= HOME MANAGER TYPES =================
export interface HomeRoom {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  created_at: string;
  item_count?: number;
}

export interface HomeItem {
  id: string;
  user_id: string;
  room_id: string | null;
  name: string;
  category: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  purchase_store: string | null;
  warranty_end_date: string | null;
  serial_number: string | null;
  status: HomeItemStatus;
  manual_url: string | null;
  notes: string | null;
  image_url: string | null;
  receipt_image_url: string | null;
  created_at: string;
  updated_at: string;
  room?: HomeRoom | null;
  maintenance_logs?: HomeMaintenanceLog[];
}

export interface HomeMaintenanceLog {
  id: string;
  item_id: string;
  maintenance_date: string;
  cost: number;
  description: string;
  performed_by: string | null;
  created_at: string;
}

// ================= MYSTERY BOX TYPES =================
export interface MysteryQuestPool {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  points: number;
  is_active: boolean;
}

export interface UserDailyQuest {
  id: string;
  user_id: string;
  quest_id: string;
  assigned_date: string;
  is_completed: boolean;
  completed_at: string | null;
  proof_note: string | null;
  proof_image_url: string | null;
  created_at: string;
  quest?: MysteryQuestPool;
}
