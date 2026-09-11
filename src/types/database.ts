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

// ================= PERSONAL ASSET TYPES =================
export type AssetCategory = 'TECH' | 'VEHICLE' | 'JEWELRY_WATCH' | 'FURNITURE' | 'APPLIANCE' | 'COLLECTIBLE' | 'REAL_ESTATE' | 'OTHER';
export type AssetStatus = 'ACTIVE' | 'SOLD' | 'BROKEN' | 'GIFTED';

export interface PersonalAsset {
  id: string;
  user_id: string;
  name: string;
  category: AssetCategory;
  purchase_date: string | null;
  purchase_price: number | null;
  estimated_current_value: number | null;
  location: string | null;
  status: AssetStatus;
  serial_number: string | null;
  image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ================= VEHICLE MANAGER TYPES =================
export type VehicleType = 'MOTORBIKE' | 'CAR' | 'ELECTRIC' | 'OTHER';

export interface Vehicle {
  id: string;
  user_id: string;
  name: string;
  type: VehicleType;
  license_plate: string | null;
  brand: string | null;
  model_year: number | null;
  current_odo: number;
  insurance_expiry_date: string | null;
  registration_expiry_date: string | null;
  image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  fuel_logs?: VehicleFuelLog[];
  service_logs?: VehicleServiceLog[];
}

export interface VehicleFuelLog {
  id: string;
  vehicle_id: string;
  log_date: string;
  odo_km: number | null;
  liters: number | null;
  price_per_liter: number | null;
  total_cost: number;
  gas_station: string | null;
  notes: string | null;
  created_at: string;
}

export interface VehicleServiceLog {
  id: string;
  vehicle_id: string;
  log_date: string;
  odo_km: number | null;
  service_type: string;
  cost: number;
  performed_at: string | null;
  next_service_odo: number | null;
  next_service_date: string | null;
  notes: string | null;
  receipt_url: string | null;
  created_at: string;
}

// ================= HOME MAINTENANCE HUB TYPES =================
export type MaintenanceStatus = 'COMPLETED' | 'SCHEDULED' | 'IN_PROGRESS';

export interface HomeMaintenanceRecord {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string | null;
  cost: number;
  performed_date: string;
  contractor_name: string | null;
  contractor_phone: string | null;
  warranty_until: string | null;
  status: MaintenanceStatus;
  before_image_url: string | null;
  after_image_url: string | null;
  notes: string | null;
  created_at: string;
}

// ================= CLEANING PLANNER TYPES =================
export interface CleaningTask {
  id: string;
  user_id: string;
  title: string;
  category: string;
  frequency_days: number;
  last_completed_at: string | null;
  next_due_date: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  logs?: CleaningLog[];
}

export interface CleaningLog {
  id: string;
  task_id: string;
  completed_at: string;
  notes: string | null;
  created_at: string;
}

// ================= UTILITY TRACKER TYPES =================
export type UtilityType = 'ELECTRICITY' | 'WATER' | 'INTERNET' | 'PHONE' | 'APARTMENT_FEE' | 'TRASH' | 'OTHER';

export interface UtilityBill {
  id: string;
  user_id: string;
  utility_type: UtilityType;
  title: string;
  billing_period: string;
  due_date: string;
  amount: number;
  meter_reading: string | null;
  is_paid: boolean;
  paid_at: string | null;
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ================= SERVICE HISTORY TYPES =================
export interface ServiceRecord {
  id: string;
  user_id: string;
  service_category: string;
  title: string;
  service_date: string;
  cost: number;
  provider_name: string | null;
  provider_phone: string | null;
  provider_address: string | null;
  rating: number | null;
  next_service_recommended_date: string | null;
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ================= NOTIFICATION REMINDER TYPES =================
export type NotificationType =
  | 'CLEANING_DUE'
  | 'UTILITY_UNPAID'
  | 'VEHICLE_EXPIRY'
  | 'WARRANTY_EXPIRY'
  | 'MYSTERY_QUEST'
  | 'IMPORTANT_DATE'
  | 'HABIT_STREAK'
  | 'SAVINGS_DEADLINE';

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

// ================= BUDGET TRACKER =================
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'EWALLET' | 'OTHER';

export interface BudgetCategory {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  monthly_budget: number;
  created_at: string;
}

export interface ExpenseTransaction {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  amount: number;
  transaction_date: string;
  payment_method: PaymentMethod;
  notes: string | null;
  created_at: string;
  category?: BudgetCategory | null;
}

export interface IncomeEntry {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  income_date: string;
  source: string | null;
  notes: string | null;
  created_at: string;
}

// ================= SAVINGS GOALS =================
export interface SavingsGoal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  icon: string;
  color: string;
  deadline: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  contributions?: SavingsContribution[];
}

export interface SavingsContribution {
  id: string;
  goal_id: string;
  amount: number;
  contribution_date: string;
  note: string | null;
  created_at: string;
}

// ================= HABIT TRACKER =================
export type HabitFrequency = 'DAILY' | 'WEEKLY';

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  target_per_week: number;
  is_active: boolean;
  created_at: string;
  logs?: HabitLog[];
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  note: string | null;
  created_at: string;
}

// ================= PERSONAL JOURNAL =================
export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  mood: MoodLevel | null;
  entry_date: string;
  tags: string[] | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// ================= GOALS & OKR =================
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'ABANDONED';

export interface PersonalGoal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  period: string;
  status: GoalStatus;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
  key_results?: KeyResult[];
}

export interface KeyResult {
  id: string;
  goal_id: string;
  title: string;
  unit: string | null;
  target_value: number;
  current_value: number;
  created_at: string;
  updated_at: string;
}

// ================= SHOPPING LIST =================
export interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  description: string | null;
  created_at: string;
  items?: ShoppingItem[];
}

export interface ShoppingItem {
  id: string;
  list_id: string;
  user_id: string;
  name: string;
  quantity: string;
  unit: string | null;
  category: string | null;
  estimated_price: number | null;
  is_checked: boolean;
  note: string | null;
  sort_order: number;
  created_at: string;
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
