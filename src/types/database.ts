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

// ================= WEEKLY ENVELOPE BUDGET =================
export type WeeklyBudgetStatus = 'OPEN' | 'CLOSED';

export interface WeeklyBudget {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  total_cap: number;
  rollover_in: number;
  status: WeeklyBudgetStatus;
  surplus_to_next_week: number;
  surplus_to_savings: number;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BudgetEnvelope {
  id: string;
  user_id: string;
  weekly_budget_id: string;
  name: string;
  allocated_amount: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetExpense {
  id: string;
  user_id: string;
  weekly_budget_id: string;
  envelope_id: string;
  amount: number;
  note: string | null;
  spent_at: string;
  created_at: string;
}

export interface EnvelopeWithSpent extends BudgetEnvelope {
  spent_amount: number;
  remaining_amount: number;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number | null;
  current_amount: number;
  created_at: string;
  updated_at: string;
}

export interface SavingsTransaction {
  id: string;
  user_id: string;
  savings_goal_id: string;
  weekly_budget_id: string | null;
  amount: number;
  note: string | null;
  created_at: string;
}
