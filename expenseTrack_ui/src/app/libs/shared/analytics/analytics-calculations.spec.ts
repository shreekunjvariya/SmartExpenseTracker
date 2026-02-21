import { Category, Expense } from '../../../../models';
import {
  buildCategoryLookup,
  buildDashboardStats,
  buildReportSummary,
  prepareTransactions,
} from './analytics-calculations';

const NOW_MS = Date.UTC(2026, 1, 21, 12, 0, 0, 0);
const DAY_MS = 24 * 60 * 60 * 1000;

function isoDaysAgo(days: number): string {
  return new Date(NOW_MS - days * DAY_MS).toISOString();
}

function makeExpense(partial: Partial<Expense> = {}): Expense {
  return {
    expense_id: partial.expense_id || `exp_${Math.random().toString(16).slice(2)}`,
    user_id: partial.user_id || 'u1',
    category_id: partial.category_id || 'cat_food',
    subcategory_id: partial.subcategory_id || null,
    entry_type: partial.entry_type || 'expense',
    amount: partial.amount ?? 0,
    currency: partial.currency || 'USD',
    date: partial.date || isoDaysAgo(0),
    description: partial.description || 'test',
    created_at: partial.created_at || isoDaysAgo(0),
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
