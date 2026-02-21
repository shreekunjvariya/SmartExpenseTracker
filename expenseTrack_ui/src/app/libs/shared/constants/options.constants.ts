import { ProfileType } from '../../../../models';

export interface ProfileOption {
  value: ProfileType;
  label: string;
}

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

export interface ExpenseCurrencyOption {
  code: string;
  label: string;
}

export const PROFILE_OPTIONS: ProfileOption[] = [
  { value: 'salaried', label: 'Salaried Employee' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'businessman', label: 'Business Owner' },
];

export const REGISTRATION_CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: 'EUR' },
  { code: 'GBP', name: 'British Pound', symbol: 'GBP' },
  { code: 'JPY', name: 'Japanese Yen', symbol: 'JPY' },
  { code: 'INR', name: 'Indian Rupee', symbol: 'INR' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CAD' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'AUD' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: 'CNY' },
];

export const SETTINGS_CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: 'EUR' },
  { code: 'GBP', name: 'British Pound', symbol: 'GBP' },
  { code: 'JPY', name: 'Japanese Yen', symbol: 'JPY' },
  { code: 'INR', name: 'Indian Rupee', symbol: 'INR' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CAD' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'AUD' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: 'CNY' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MXN' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'BRL' },
  { code: 'KRW', name: 'South Korean Won', symbol: 'KRW' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'SGD' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HKD' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'SEK' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'NOK' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZD' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'ZAR' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR' },
];

export const EXPENSE_CURRENCY_OPTIONS: ExpenseCurrencyOption[] = [
  { code: 'USD', label: 'USD ($)' },
  { code: 'EUR', label: 'EUR (EUR)' },
  { code: 'GBP', label: 'GBP (GBP)' },
  { code: 'INR', label: 'INR (INR)' },
  { code: 'JPY', label: 'JPY (JPY)' },
  { code: 'CAD', label: 'CAD (CAD)' },
  { code: 'AUD', label: 'AUD (AUD)' },
];
