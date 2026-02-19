import { Component, OnInit, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { DashboardService } from '../../data-access/dashboard/dashboard.service';
import { AuthService } from '../../data-access/auth/auth.service';
import { DashboardStats, ReportCategorySummary, ReportSummary, User } from '../../../models';

interface StatCard {
  title: string;
  value: string;
  subtext: string;
  trend?: {
    direction: 'up' | 'down';
    value: number;
  };
}

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
    if (!this.stats) {
      return [];
    }

    return [
      {
        title: 'This Month',
        value: this.formatCurrency(this.stats.this_month.total),
        subtext: `${this.stats.this_month.count} expenses`,
        trend: {
          direction: this.stats.change_percentage > 0 ? 'up' : 'down',
          value: Math.abs(this.stats.change_percentage || 0),
        },
      },
      {
        title: 'Last Month',
        value: this.formatCurrency(this.stats.last_month.total),
        subtext: `${this.stats.last_month.count} expenses`,
      },
      {
        title: 'All Time',
        value: this.formatCurrency(this.stats.all_time.total),
        subtext: `${this.stats.all_time.count} total expenses`,
      },
      {
        title: 'Categories',
        value: String(this.stats.categories_count),
        subtext: 'Active categories',
      },
    ];
  }

  get topCategories(): ReportCategorySummary[] {
    return (this.summary?.by_category || []).slice(0, 6);
  }

  get maxCategoryTotal(): number {
    if (!this.topCategories.length) {
      return 1;
    }
    return Math.max(...this.topCategories.map((item) => item.total), 1);
  }

  get dailyTrendRows(): { label: string; amount: string }[] {
    return (this.summary?.daily_trend || []).slice(-10).map((point) => {
      const date = new Date(point.date);
      return {
        label: Number.isNaN(date.getTime())
          ? point.date
          : `${date.getMonth() + 1}/${date.getDate()}`,
        amount: this.formatCurrency(point.amount),
      };
    });
  }

  private fetchData(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      stats: this.dashboard.getStats(),
      summary: this.dashboard.getMonthlySummary(),
    }).subscribe({
      next: ({ stats, summary }) => {
        this.stats = stats;
        this.summary = summary;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load dashboard data.';
        this.loading = false;
      },
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
}
