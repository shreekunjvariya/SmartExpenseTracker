export type ProfileType = 'salaried' | 'self_employed' | 'businessman';

export interface User {
  user_id: string;
  email: string;
  name: string;
  profile_type: ProfileType;
  preferred_currency: string;
  picture?: string | null;
  created_at?: string;
}

export interface AuthResponse extends User {
  token: string;
}

export interface Subcategory {
  subcategory_id: string;
  name: string;
  icon: string;
}

export interface Category {
  category_id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: Subcategory[];
  created_at?: string;
}

export interface Expense {
  expense_id: string;
  user_id: string;
  category_id: string;
  subcategory_id?: string | null;
  amount: number;
  currency: string;
  date: string;
  description: string;
  created_at?: string;
}

export interface DashboardStats {
  this_month: { total: number; count: number };
  last_month: { total: number; count: number };
  all_time: { total: number; count: number };
  change_percentage: number;
  categories_count: number;
  currency: string;
}

export interface ReportCategorySummary {
  category_id: string;
  name: string;
  color: string;
  total: number;
  count: number;
}

export interface ReportDailyTrend {
  date: string;
  amount: number;
}

export interface ReportSummary {
  total: number;
  count: number;
  by_category: ReportCategorySummary[];
  daily_trend: ReportDailyTrend[];
  period: 'week' | 'month' | 'year';
  currency: string;
}

export interface CurrencyConvertResponse {
  from: string;
  to: string;
  original_amount: number;
  converted_amount: number;
  rate: number;
}
