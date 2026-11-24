export type BookStatus = 'WISHLIST' | 'OWNED' | 'READING' | 'READ' | 'DROPPED';

export type BookImageType = 'COVER' | 'BACK_COVER' | 'SPINE' | 'ISBN' | 'OTHER';

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

// ================= NOTIFICATION REMINDER TYPES =================
export type NotificationType = 'IMPORTANT_DATE';

export interface NotificationReminder {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  dueDate?: string | null;
  severity: 'urgent' | 'warning' | 'info';
  linkHref: string;
  actionText: string;
}

// ================= ENTERTAINMENT =================
export type MediaType = 'MOVIE' | 'SERIES' | 'GAME' | 'PODCAST' | 'ANIME' | 'DOCUMENTARY';
export type MediaStatus = 'WISHLIST' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';

export interface MediaEntry {
  id: string;
  user_id: string;
  title: string;
  media_type: MediaType;
  status: MediaStatus;
  genre: string | null;
  platform: string | null;
  rating: number | null;
  review: string | null;
  poster_url: string | null;
  release_year: number | null;
  director_creator: string | null;
  total_episodes: number | null;
  notes: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
}

// ================= IMPORTANT DATES =================
export type DateCategory = 'BIRTHDAY' | 'ANNIVERSARY' | 'REMINDER' | 'HOLIDAY' | 'OTHER';

export interface ImportantDate {
  id: string;
  user_id: string;
  title: string;
  event_date: string;
  is_recurring: boolean;
  category: DateCategory;
  person_name: string | null;
  notes: string | null;
  reminder_days_before: number;
  created_at: string;
}
