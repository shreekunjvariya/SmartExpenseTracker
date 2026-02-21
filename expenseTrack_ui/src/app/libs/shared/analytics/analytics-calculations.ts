import {
  Category,
  DashboardStats,
  EntryType,
  Expense,
  ReportCategorySummary,
  ReportPeriod,
  ReportSummary,
} from '../../../../models';

const DEFAULT_CATEGORY_NAME = 'Other';
const DEFAULT_CATEGORY_COLOR = '#064E3B';
const DEFAULT_CURRENCY = 'USD';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const PERIOD_DAY_COUNT: Record<ReportPeriod, number> = {
  week: 7,
  month: 30,
  year: 365,
};

type CategoryLookupEntry = {
  name: string;
  color: string;
};

export type PreparedExpense = {
  amount: number;
  entry_type: EntryType;
  category_id: string;
  date: string;
  timestamp: number;
};

export interface AnalyticsSnapshot {
  transactions: PreparedExpense[];
  categoriesById: Map<string, CategoryLookupEntry>;
  categoriesCount: number;
  currency: string;
}

type Totals = {
  income_total: number;
  expense_total: number;
  net_total: number;
  income_count: number;
  expense_count: number;
  total_count: number;
};

export function normalizeEntryType(value: string | null | undefined): EntryType {
  return value === 'income' ? 'income' : 'expense';
}

export function prepareTransactions(expenses: Expense[]): PreparedExpense[] {
  return expenses.map((expense) => {
    const timestamp = Date.parse(expense.date || '');
    return {
      amount: toFiniteNumber(expense.amount),
      entry_type: normalizeEntryType(expense.entry_type),
      category_id: expense.category_id || '',
      date: normalizeDateString(expense.date || '', timestamp),
      timestamp,
    };
  });
}

export function buildCategoryLookup(categories: Category[]): Map<string, CategoryLookupEntry> {
  const map = new Map<string, CategoryLookupEntry>();
  for (const category of categories) {
    map.set(category.category_id, {
      name: category.name || DEFAULT_CATEGORY_NAME,
      color: category.color || DEFAULT_CATEGORY_COLOR,
    });
  }
  return map;
}

export function createAnalyticsSnapshot(
  expenses: Expense[],
  categories: Category[],
  currency: string
): AnalyticsSnapshot {
  return {
    transactions: prepareTransactions(expenses),
    categoriesById: buildCategoryLookup(categories),
    categoriesCount: categories.length,
    currency: currency || DEFAULT_CURRENCY,
  };
}

export function buildReportSummary(
  transactions: PreparedExpense[],
  categoriesById: Map<string, CategoryLookupEntry>,
  period: ReportPeriod,
  currency: string,
  nowMs: number = Date.now()
): ReportSummary {
  const periodTransactions = transactions.filter((tx) => isInPeriod(tx, period, nowMs));
  const totals = splitTotals(periodTransactions);

  const byCategoryMap = new Map<string, ReportCategorySummary>();
  const dailyMap = new Map<string, { income: number; expense: number }>();

  for (const tx of periodTransactions) {
    const category = categoriesById.get(tx.category_id);
    const categoryKey = `${tx.entry_type}:${tx.category_id}`;

    if (!byCategoryMap.has(categoryKey)) {
      byCategoryMap.set(categoryKey, {
        category_id: tx.category_id,
        name: category?.name || DEFAULT_CATEGORY_NAME,
        color: category?.color || DEFAULT_CATEGORY_COLOR,
        entry_type: tx.entry_type,
        total: 0,
        count: 0,
      });
    }

    const categorySummary = byCategoryMap.get(categoryKey);
    if (categorySummary) {
      categorySummary.total += tx.amount;
      categorySummary.count += 1;
    }

    if (!tx.date) {
      continue;
    }
    const dateKey = tx.date;
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, { income: 0, expense: 0 });
    }
    const daySummary = dailyMap.get(dateKey);
    if (daySummary) {
      daySummary[tx.entry_type] += tx.amount;
    }
  }

  const daily_trend = [...dailyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, day]) => {
      const net = day.income - day.expense;
      return {
        date,
        income: day.income,
        expense: day.expense,
        net,
        amount: net,
      };
    });

  return {
    total: totals.expense_total,
    count: totals.total_count,
    income_total: totals.income_total,
    expense_total: totals.expense_total,
    net_total: totals.net_total,
    income_count: totals.income_count,
    expense_count: totals.expense_count,
    by_type: [
      { entry_type: 'income', total: totals.income_total, count: totals.income_count },
      { entry_type: 'expense', total: totals.expense_total, count: totals.expense_count },
    ],
    by_category: [...byCategoryMap.values()],
    daily_trend,
    period,
    currency: currency || DEFAULT_CURRENCY,
  };
}

export function buildDashboardStats(
  transactions: PreparedExpense[],
  categoriesCount: number,
  currency: string,
  period: ReportPeriod = 'month',
  nowMs: number = Date.now()
): DashboardStats {
  const currentTransactions = transactions.filter((tx) => isInPeriod(tx, period, nowMs));
  const previousTransactions = transactions.filter((tx) => isInPreviousPeriod(tx, period, nowMs));

  const current = splitTotals(currentTransactions);
  const previous = splitTotals(previousTransactions);
  const allTime = splitTotals(transactions);

  const change =
    previous.expense_total > 0
      ? ((current.expense_total - previous.expense_total) / previous.expense_total) * 100
      : current.expense_total > 0
        ? 100
        : 0;

  const netChange =
    previous.net_total !== 0
      ? ((current.net_total - previous.net_total) / Math.abs(previous.net_total)) * 100
      : current.net_total > 0
        ? 100
        : 0;

  return {
    this_month: {
      total: current.expense_total,
      count: current.expense_count,
    },
    last_month: {
      total: previous.expense_total,
      count: previous.expense_count,
    },
    all_time: {
      total: allTime.expense_total,
      count: allTime.expense_count,
    },
    this_month_income: {
      total: current.income_total,
      count: current.income_count,
    },
    this_month_expense: {
      total: current.expense_total,
      count: current.expense_count,
    },
    this_month_net: current.net_total,
    last_month_income: {
      total: previous.income_total,
      count: previous.income_count,
    },
    last_month_expense: {
      total: previous.expense_total,
      count: previous.expense_count,
    },
    last_month_net: previous.net_total,
    all_time_income: {
      total: allTime.income_total,
      count: allTime.income_count,
    },
    all_time_expense: {
      total: allTime.expense_total,
      count: allTime.expense_count,
    },
    all_time_net: allTime.net_total,
    change_percentage: roundToOneDecimal(change),
    net_change_percentage: roundToOneDecimal(netChange),
    categories_count: categoriesCount,
    currency: currency || DEFAULT_CURRENCY,
  };
}

function splitTotals(transactions: PreparedExpense[]): Totals {
  let income_total = 0;
  let expense_total = 0;
  let income_count = 0;
  let expense_count = 0;

  for (const tx of transactions) {
    if (tx.entry_type === 'income') {
      income_total += tx.amount;
      income_count += 1;
      continue;
    }

    expense_total += tx.amount;
    expense_count += 1;
  }

  return {
    income_total,
    expense_total,
    net_total: income_total - expense_total,
    income_count,
    expense_count,
    total_count: transactions.length,
  };
}

function isInPeriod(tx: PreparedExpense, period: ReportPeriod, nowMs: number): boolean {
  if (!Number.isFinite(tx.timestamp)) {
    return false;
  }

  const periodStart = nowMs - PERIOD_DAY_COUNT[period] * MS_PER_DAY;
  return tx.timestamp >= periodStart;
}

function isInPreviousPeriod(tx: PreparedExpense, period: ReportPeriod, nowMs: number): boolean {
  if (!Number.isFinite(tx.timestamp)) {
    return false;
  }

  const periodDuration = PERIOD_DAY_COUNT[period] * MS_PER_DAY;
  const previousStart = nowMs - periodDuration * 2;
  const previousEnd = nowMs - periodDuration;
  return tx.timestamp >= previousStart && tx.timestamp < previousEnd;
}

function normalizeDateString(value: string, parsedTimestamp: number): string {
  if (value && value.length >= 10) {
    return value.slice(0, 10);
  }

  if (!Number.isFinite(parsedTimestamp)) {
    return '';
  }

  return new Date(parsedTimestamp).toISOString().slice(0, 10);
}

function toFiniteNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}
