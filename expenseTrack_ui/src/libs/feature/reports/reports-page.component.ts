import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../data-access/auth/auth.service';
import { ReportsService } from '../../data-access/reports/reports.service';
import { ReportSummary, User } from '../../../models';

type ReportPeriod = 'week' | 'month' | 'year';
type ReportTab = 'overview' | 'export' | 'import';

@Component({
  selector: 'reports-page',
  standalone: false,
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss',
})
export class ReportsPageComponent implements OnInit {
  private reports = inject(ReportsService);
  private auth = inject(AuthService);

  user: User | null = null;
  period: ReportPeriod = 'month';
  activeTab: ReportTab = 'overview';
  summary: ReportSummary | null = null;
  loading = true;
  importData = '';
  importing = false;
  fromDate = this.offsetDate(-30);
  toDate = this.offsetDate(0);
  error = '';
  success = '';

  ngOnInit(): void {
    this.user = this.auth.user;
    if (!this.user && this.auth.token) {
      this.auth.me().subscribe({
        next: (user) => (this.user = user),
      });
    }
    this.loadSummary();
  }

  get total(): number {
    return this.summary?.total || 0;
  }

  get dailyAverage(): number {
    const divisor = this.period === 'week' ? 7 : this.period === 'month' ? 30 : 365;
    return this.total / divisor;
  }

  get topCategory(): { name: string; total: number } | null {
    const first = this.summary?.by_category?.[0];
    return first ? { name: first.name, total: first.total } : null;
  }

  setTab(tab: ReportTab): void {
    this.activeTab = tab;
    this.error = '';
    this.success = '';
  }

  setPeriod(period: ReportPeriod): void {
    this.period = period;
    this.loadSummary();
  }

  setPeriodFromString(period: string): void {
    this.setPeriod(period as ReportPeriod);
  }

  loadSummary(): void {
    this.loading = true;
    this.error = '';
    this.reports.getSummary(this.period).subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load report data.';
        this.loading = false;
      },
    });
  }

  exportCsv(): void {
    this.error = '';
    this.success = '';

    this.reports.exportCsv(this.fromDate, this.toDate).subscribe({
      next: (blob) => {
        if (typeof window === 'undefined') {
          return;
        }
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `expenses_${this.fromDate}_to_${this.toDate}.csv`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(url);
        this.success = 'Export successful.';
      },
      error: () => {
        this.error = 'Export failed.';
      },
    });
  }

  importCsv(): void {
    if (!this.importData.trim() || this.importing) {
      return;
    }

    this.importing = true;
    this.error = '';
    this.success = '';

    this.reports.importCsv(this.importData).subscribe({
      next: (result) => {
        this.success = `Imported ${result.imported} expenses.`;
        if (result.errors?.length) {
          this.error = `${result.errors.length} rows had errors.`;
        }
        this.importData = '';
        this.importing = false;
        this.loadSummary();
      },
      error: () => {
        this.error = 'Import failed.';
        this.importing = false;
      },
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.user?.preferred_currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  }

  categoryPercent(total: number): string {
    if (!this.summary?.total) {
      return '0.0';
    }
    return ((total / this.summary.total) * 100).toFixed(1);
  }

  private offsetDate(offsetDays: number): string {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().slice(0, 10);
  }
}
