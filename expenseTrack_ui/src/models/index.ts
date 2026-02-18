// Shared DTO/model types for API

export interface User {
  user_id: string;
  email: string;
  name: string;
  profile_type: 'salaried' | 'self-employed' | 'businessman';
  preferred_currency: string;
  picture?: string;
  created_at: string;
}

export interface Expense {
  _id?: string;
  user_id: string;
  category_id: string;
  amount: number;
  currency: string;
  date: string;
  description?: string;
  created_at?: string;
}

export interface Category {
  user_id: string;
  category_id: string;
  name: string;
  type: 'income' | 'expense' | 'investment';
  color: string;
  icon: string;
}

export interface ReportSummary {
  user_id: string;
  period: string;
  summary_data: any;
  generated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
