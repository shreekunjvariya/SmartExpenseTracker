import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../data-access/auth/auth.service';
import { DashboardService } from '../../data-access/dashboard/dashboard.service';
import { ExpensesService } from '../../data-access/expenses/expenses.service';
import { ReportsService } from '../../data-access/reports/reports.service';
import { EntryType, ReportCategorySummary, ReportSummary, User } from '../../../../models';

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
  private expenses = inject(ExpensesService);
  private dashboard = inject(DashboardService);
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

  get incomeTotal(): number {
    return this.summary?.income_total || 0;
  }

  get expenseTotal(): number {
    return this.summary?.expense_total || 0;
  }

  get netTotal(): number {
    return this.summary?.net_total || 0;
  }

  get dailyNetAverage(): number {
    const divisor = this.period === 'week' ? 7 : this.period === 'month' ? 30 : 365;
    return this.netTotal / divisor;
  }

  get categoryBreakdown(): ReportCategorySummary[] {
    return [...(this.summary?.by_category || [])].sort((a, b) => b.total - a.total);
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

  loadSummary(forceRefresh = false): void {
    this.loading = true;
    this.error = '';
    this.reports.getSummary(this.period, forceRefresh).subscribe({
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
        anchor.download = `transactions_${this.fromDate}_to_${this.toDate}.csv`;
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
        this.success = `Imported ${result.imported} transactions.`;
        if (result.errors?.length) {
          this.error = `${result.errors.length} rows had errors.`;
        }
        this.importData = '';
        this.importing = false;
        this.expenses.invalidateListCache();
        this.dashboard.invalidateCache();
        this.loadSummary(true);
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

  formatSignedAmount(total: number, entryType: EntryType): string {
    const value = this.formatCurrency(total);
    return entryType === 'income' ? `+${value}` : `-${value}`;
  }

  categoryPercent(category: ReportCategorySummary): string {
    const denominator = category.entry_type === 'income' ? this.incomeTotal : this.expenseTotal;
    if (!denominator) {
      return '0.0';
    }
    return ((category.total / denominator) * 100).toFixed(1);
  }

  typeLabel(entryType: EntryType): string {
    return entryType === 'income' ? 'Income' : 'Expense';
  }

  private offsetDate(offsetDays: number): string {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().slice(0, 10);
  }
}
