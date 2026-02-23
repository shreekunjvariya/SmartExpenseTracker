import { Category, Expense } from '../../../../models';
import {
  buildCategoryLookup,
  buildDashboardStats,
  buildFilteredReportSummary,
  buildReportSummary,
  createAnalyticsSnapshot,
  filterTransactions,
  prepareTransactions,
} from './analytics-calculations';

const NOW_MS = Date.parse('2025-01-15T00:00:00.000Z');

function isoDaysAgo(daysAgo: number): string {
  return new Date(NOW_MS - daysAgo * 24 * 60 * 60 * 1000).toISOString();
}

function makeExpense(partial: Partial<Expense>): Expense {
  return {
    expense_id: partial.expense_id || `exp_${Math.random().toString(36).slice(2)}`,
    user_id: partial.user_id || 'u1',
    amount: partial.amount ?? 0,
    currency: partial.currency || 'USD',
    description: partial.description || 'Expense',
    category_id: partial.category_id || 'cat_food',
    subcategory_id: partial.subcategory_id ?? null,
    entry_type: partial.entry_type || 'expense',
    date: partial.date || isoDaysAgo(1),
    created_at: partial.created_at || isoDaysAgo(1),
  };
}

describe('analytics-calculations', () => {
  const categories: Category[] = [
    {
      category_id: 'cat_food',
      user_id: 'u1',
      name: 'Food',
      icon: 'utensils',
      color: '#F59E0B',
      entry_type: 'expense',
      subcategories: [],
      created_at: isoDaysAgo(100),
    },
    {
      category_id: 'cat_salary',
      user_id: 'u1',
      name: 'Salary',
      icon: 'wallet',
      color: '#2563EB',
      entry_type: 'income',
      subcategories: [],
      created_at: isoDaysAgo(100),
    },
  ];

  it('builds month summary and defaults missing entry_type to expense', () => {
    const expenses: Expense[] = [
      makeExpense({ amount: 100, entry_type: 'expense', category_id: 'cat_food', date: isoDaysAgo(1) }),
      makeExpense({ amount: 250, entry_type: 'income', category_id: 'cat_salary', date: isoDaysAgo(2) }),
      makeExpense({
        amount: 40,
        category_id: 'cat_food',
        date: isoDaysAgo(3),
        entry_type: undefined as unknown as 'expense',
      }),
      makeExpense({ amount: 15, entry_type: 'expense', category_id: 'cat_food', date: isoDaysAgo(40) }),
    ];

    const summary = buildReportSummary(
      prepareTransactions(expenses),
      buildCategoryLookup(categories),
      'month',
      'USD',
      NOW_MS
    );

    expect(summary.income_total).toBe(250);
    expect(summary.expense_total).toBe(140);
    expect(summary.net_total).toBe(110);
    expect(summary.income_count).toBe(1);
    expect(summary.expense_count).toBe(2);
    expect(summary.count).toBe(3);
    expect(summary.period).toBe('month');

    const food = summary.by_category.find((item) => item.category_id === 'cat_food');
    const salary = summary.by_category.find((item) => item.category_id === 'cat_salary');
    expect(food).toBeTruthy();
    expect(salary).toBeTruthy();
    expect(food?.total).toBe(140);
    expect(food?.entry_type).toBe('expense');
    expect(salary?.total).toBe(250);
    expect(salary?.entry_type).toBe('income');
    expect(summary.daily_trend).toHaveLength(3);
  });

  it('filters transactions by category, type, search and custom date range', () => {
    const expenses: Expense[] = [
      makeExpense({ amount: 100, entry_type: 'expense', category_id: 'cat_food', description: 'Dinner', date: isoDaysAgo(1) }),
      makeExpense({ amount: 250, entry_type: 'income', category_id: 'cat_salary', description: 'Monthly Salary', date: isoDaysAgo(2) }),
      makeExpense({ amount: 55, entry_type: 'expense', category_id: 'cat_food', description: 'Groceries', date: isoDaysAgo(7) }),
      makeExpense({ amount: 80, entry_type: 'expense', category_id: 'cat_food', description: 'Old Expense', date: isoDaysAgo(50) }),
    ];

    const snapshot = createAnalyticsSnapshot(expenses, categories, 'USD');
    const filtered = filterTransactions(
      snapshot,
      {
        period: 'custom',
        startDate: isoDaysAgo(10).slice(0, 10),
        endDate: isoDaysAgo(0).slice(0, 10),
        entryTypes: ['expense'],
        categoryIds: ['cat_food'],
        searchText: 'gro',
      },
      NOW_MS
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].amount).toBe(55);
  });

  it('builds filtered summary from snapshot query', () => {
    const expenses: Expense[] = [
      makeExpense({ amount: 1400, entry_type: 'income', category_id: 'cat_salary', description: 'Salary', date: isoDaysAgo(3) }),
      makeExpense({ amount: 120, entry_type: 'expense', category_id: 'cat_food', description: 'Food', date: isoDaysAgo(2) }),
    ];

    const snapshot = createAnalyticsSnapshot(expenses, categories, 'USD');
    const summary = buildFilteredReportSummary(
      snapshot,
      { period: 'month', entryTypes: ['income'], searchText: 'salary' },
      NOW_MS
    );

    expect(summary.income_total).toBe(1400);
    expect(summary.expense_total).toBe(0);
    expect(summary.net_total).toBe(1400);
  });

  it('builds dashboard stats using rolling month windows', () => {
    const expenses: Expense[] = [
      makeExpense({ amount: 100, entry_type: 'expense', category_id: 'cat_food', date: isoDaysAgo(5) }),
      makeExpense({ amount: 300, entry_type: 'income', category_id: 'cat_salary', date: isoDaysAgo(6) }),
      makeExpense({ amount: 50, entry_type: 'expense', category_id: 'cat_food', date: isoDaysAgo(35) }),
      makeExpense({ amount: 75, entry_type: 'income', category_id: 'cat_salary', date: isoDaysAgo(45) }),
      makeExpense({ amount: 25, entry_type: 'expense', category_id: 'cat_food', date: isoDaysAgo(100) }),
    ];

    const stats = buildDashboardStats(
      prepareTransactions(expenses),
      categories.length,
      'USD',
      'month',
      NOW_MS
    );

    expect(stats.this_month_expense.total).toBe(100);
    expect(stats.this_month_expense.count).toBe(1);
    expect(stats.this_month_income.total).toBe(300);
    expect(stats.this_month_income.count).toBe(1);
    expect(stats.this_month_net).toBe(200);

    expect(stats.last_month_expense.total).toBe(50);
    expect(stats.last_month_expense.count).toBe(1);
    expect(stats.last_month_income.total).toBe(75);
    expect(stats.last_month_income.count).toBe(1);
    expect(stats.last_month_net).toBe(25);

    expect(stats.all_time_expense.total).toBe(175);
    expect(stats.all_time_expense.count).toBe(3);
    expect(stats.all_time_income.total).toBe(375);
    expect(stats.all_time_income.count).toBe(2);
    expect(stats.all_time_net).toBe(200);

    expect(stats.change_percentage).toBe(100);
    expect(stats.net_change_percentage).toBe(700);
    expect(stats.categories_count).toBe(2);
  });
});
