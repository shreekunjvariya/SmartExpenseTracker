export type ProfileType = 'salaried' | 'self_employed' | 'businessman';
export type EntryType = 'expense' | 'income';
export type ReportPeriod = 'week' | 'month' | 'year';
export type AnalyticsPeriod = ReportPeriod | 'custom';
export type AnalyticsGroupBy = 'day' | 'week' | 'month';

export interface AnalyticsQuery {
  period: AnalyticsPeriod;
  startDate?: string;
  endDate?: string;
  entryTypes?: EntryType[];
  categoryIds?: string[];
  searchText?: string;
  groupBy?: AnalyticsGroupBy;
}

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
  entry_type: EntryType;
  subcategories: Subcategory[];
  created_at?: string;
}

export interface Expense {
  expense_id: string;
  user_id: string;
  category_id: string;
  subcategory_id?: string | null;
  entry_type: EntryType;
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
  this_month_income: { total: number; count: number };
  this_month_expense: { total: number; count: number };
  this_month_net: number;
  last_month_income: { total: number; count: number };
  last_month_expense: { total: number; count: number };
  last_month_net: number;
  all_time_income: { total: number; count: number };
  all_time_expense: { total: number; count: number };
  all_time_net: number;
  change_percentage: number;
  net_change_percentage: number;
  categories_count: number;
  currency: string;
}

export interface ReportCategorySummary {
  category_id: string;
  name: string;
  color: string;
  entry_type: EntryType;
  total: number;
  count: number;
}

export interface ReportDailyTrend {
  date: string;
  income: number;
  expense: number;
  net: number;
  amount?: number;
}

export interface ReportTypeSummary {
  entry_type: EntryType;
  total: number;
  count: number;
}

export interface ReportSummary {
  total: number;
  count: number;
  income_total: number;
  expense_total: number;
  net_total: number;
  income_count: number;
  expense_count: number;
  by_type: ReportTypeSummary[];
  by_category: ReportCategorySummary[];
  daily_trend: ReportDailyTrend[];
  period: ReportPeriod;
  currency: string;
}

export interface CurrencyConvertResponse {
  from: string;
  to: string;
  original_amount: number;
  converted_amount: number;
  rate: number;
}

export interface AnalyticsRawResponse {
  expenses: Expense[];
  categories: Category[];
  currency: string;
  has_more: boolean;
  next_cursor: string | null;
  limit: number;
}
