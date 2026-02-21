import { Component, OnInit, inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { DashboardService } from '../../data-access/dashboard/dashboard.service';
import { AuthService } from '../../data-access/auth/auth.service';
import { DashboardStats, EntryType, ReportCategorySummary, ReportSummary, User } from '../../../../models';

interface StatCard {
  title: string;
  value: string;
  subtext: string;
  valueClass?: string;
  trend?: {
    direction: 'up' | 'down';
    value: number;
  };
}

const EMPTY_DASHBOARD_STATS: DashboardStats = {
  this_month: { total: 0, count: 0 },
  last_month: { total: 0, count: 0 },
  all_time: { total: 0, count: 0 },
  this_month_income: { total: 0, count: 0 },
  this_month_expense: { total: 0, count: 0 },
  this_month_net: 0,
  last_month_income: { total: 0, count: 0 },
  last_month_expense: { total: 0, count: 0 },
  last_month_net: 0,
  all_time_income: { total: 0, count: 0 },
  all_time_expense: { total: 0, count: 0 },
  all_time_net: 0,
  change_percentage: 0,
  net_change_percentage: 0,
  categories_count: 0,
  currency: 'USD',
};

const EMPTY_REPORT_SUMMARY: ReportSummary = {
  total: 0,
  count: 0,
  income_total: 0,
  expense_total: 0,
  net_total: 0,
  income_count: 0,
  expense_count: 0,
  by_type: [],
  by_category: [],
  daily_trend: [],
  period: 'month',
  currency: 'USD',
};

@Component({
  selector: 'dashboard-page',
  standalone: false,
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent implements OnInit {
  private dashboard = inject(DashboardService);
  private auth = inject(AuthService);

  user: User | null = null;
  stats: DashboardStats | null = null;
  summary: ReportSummary | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    this.user = this.auth.user;
    if (!this.user && this.auth.token) {
      this.auth.me().subscribe({
        next: (user) => (this.user = user),
      });
    }
    this.fetchData();
  }

  get statCards(): StatCard[] {
    const stats = this.stats || EMPTY_DASHBOARD_STATS;

    return [
      {
        title: 'Total Income',
        value: this.formatCurrency(stats.this_month_income.total),
        subtext: `${stats.this_month_income.count} income entries this month`,
        valueClass: 'value-income',
      },
      {
        title: 'Total Expense',
        value: this.formatCurrency(stats.this_month_expense.total),
        subtext: `${stats.this_month_expense.count} expense entries this month`,
        valueClass: 'value-expense',
      },
      {
        title: 'Net Cashflow',
        value: this.formatSignedCurrency(stats.this_month_net),
        subtext: `Last month ${this.formatSignedCurrency(stats.last_month_net)}`,
        valueClass: stats.this_month_net >= 0 ? 'value-income' : 'value-expense',
        trend: {
          direction: stats.net_change_percentage > 0 ? 'up' : 'down',
          value: Math.abs(stats.net_change_percentage || 0),
        },
      },
      {
        title: 'Categories',
        value: String(stats.categories_count),
        subtext: 'Active categories',
      },
    ];
  }

  get topCategories(): ReportCategorySummary[] {
    return [...(this.summary || EMPTY_REPORT_SUMMARY).by_category]
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }

  get maxCategoryTotal(): number {
    if (!this.topCategories.length) {
      return 1;
    }
    return Math.max(...this.topCategories.map((item) => item.total), 1);
  }

  get dailyTrendRows(): { label: string; amount: string }[] {
    return (this.summary || EMPTY_REPORT_SUMMARY).daily_trend.slice(-10).map((point) => {
      const date = new Date(point.date);
      const net = point.net ?? point.amount ?? 0;
      return {
        label: Number.isNaN(date.getTime())
          ? point.date
          : `${date.getMonth() + 1}/${date.getDate()}`,
        amount: this.formatSignedCurrency(net),
      };
    });
  }

  private fetchData(): void {
    this.loading = true;
    this.error = '';
    this.stats = EMPTY_DASHBOARD_STATS;
    this.summary = EMPTY_REPORT_SUMMARY;

    let completedCalls = 0;
    let successfulCalls = 0;

    const markCompleted = () => {
      completedCalls += 1;
      if (completedCalls !== 2) {
        return;
      }

      if (successfulCalls === 0) {
        this.error = 'Failed to load dashboard data.';
      } else if (successfulCalls === 1) {
        this.error = 'Some dashboard data could not be loaded.';
      }

      this.loading = false;
    };

    this.dashboard
      .getStats()
      .pipe(catchError(() => of<DashboardStats | null>(null)))
      .subscribe({
        next: (stats) => {
          if (!stats) {
            return;
          }

          this.stats = stats;
          successfulCalls += 1;
          this.loading = false;
        },
        complete: markCompleted,
      });

    this.dashboard
      .getMonthlySummary()
      .pipe(catchError(() => of<ReportSummary | null>(null)))
      .subscribe({
        next: (summary) => {
          if (!summary) {
            return;
          }

          this.summary = summary;
          successfulCalls += 1;
          this.loading = false;
        },
        complete: markCompleted,
    });
  }

  formatCurrency(amount: number | null | undefined): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.user?.preferred_currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  }

  formatSignedCurrency(amount: number | null | undefined): string {
    const safeAmount = amount || 0;
    const formatted = this.formatCurrency(Math.abs(safeAmount));
    return safeAmount >= 0 ? `+${formatted}` : `-${formatted}`;
  }

  categoryTypeLabel(entryType: EntryType): string {
    return entryType === 'income' ? 'Income' : 'Expense';
  }

  formatCategoryAmount(category: ReportCategorySummary): string {
    const value = this.formatCurrency(category.total);
    return category.entry_type === 'income' ? `+${value}` : `-${value}`;
  }
}
