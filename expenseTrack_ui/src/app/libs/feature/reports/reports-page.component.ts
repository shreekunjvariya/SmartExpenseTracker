import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../data-access/auth/auth.service';
import { DashboardService } from '../../data-access/dashboard/dashboard.service';
import { ExpensesService } from '../../data-access/expenses/expenses.service';
import { ReportsService } from '../../data-access/reports/reports.service';
import { catchError, debounceTime, distinctUntilChanged, of, Subject } from 'rxjs';
import {
  AnalyticsPeriod,
  AnalyticsQuery,
  EntryType,
  ReportCategorySummary,
  ReportSummary,
  User,
} from '../../../../models';
import {
  AnalyticsSnapshot,
  buildFilteredReportSummary,
} from '../../shared/analytics/analytics-calculations';

type ReportTab = 'overview' | 'export' | 'import';
type ChartType = 'line' | 'bar';
type BreakdownChartType = 'donut' | 'bar';

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
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private destroyed = false;

  user: User | null = null;
  period: AnalyticsPeriod = 'month';
  activeTab: ReportTab = 'overview';
  summary: ReportSummary | null = null;
  snapshot: AnalyticsSnapshot | null = null;
  loading = true;
  importData = '';
  importing = false;
  fromDate = this.offsetDate(-30);
  toDate = this.offsetDate(0);
  filterStartDate = this.offsetDate(-30);
  filterEndDate = this.offsetDate(0);
  selectedEntryTypes: EntryType[] = ['expense', 'income'];
  selectedCategoryIds: string[] = [];
  searchTerm = '';
  chartType: ChartType = 'line';
  breakdownChartType: BreakdownChartType = 'donut';
  error = '';
  success = '';
  private searchSubject = new Subject<string>();

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
    });
  }

  ngOnInit(): void {
    this.user = this.auth.user;
    if (!this.user && this.auth.token) {
      this.auth
        .me()
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          catchError(() => of<User | null>(null))
        )
        .subscribe({
          next: (user) => {
            if (!user) {
              return;
            }
            this.user = user;
            this.refreshView();
          },
        });
    }

    this.restoreFilters();

    this.searchSubject
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.searchTerm = value;
        this.recomputeSummary();
      });

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
    const divisor = this.period === 'week' ? 7 : this.period === 'year' ? 365 : 30;
    return this.netTotal / divisor;
  }

  get categoryBreakdown(): ReportCategorySummary[] {
    return [...(this.summary?.by_category || [])].sort((a, b) => b.total - a.total);
  }

  get categoryOptions(): { id: string; name: string }[] {
    if (!this.snapshot) {
      return [];
    }
    return [...this.snapshot.categoriesById.entries()]
      .map(([id, value]) => ({ id, name: value.name || 'Other' }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  get trendPoints(): { date: string; value: number }[] {
    return (this.summary?.daily_trend || []).map((point) => ({
      date: point.date,
      value: point.net,
    }));
  }

  get maxTrendValue(): number {
    return Math.max(...this.trendPoints.map((point) => Math.abs(point.value)), 1);
  }

  get lineChartPoints(): string {
    if (!this.trendPoints.length) {
      return '';
    }
    const max = this.maxTrendValue;
    return this.trendPoints
      .map((point, index) => {
        const x = this.trendPoints.length === 1 ? 0 : (index / (this.trendPoints.length - 1)) * 100;
        const y = 100 - ((point.value + max) / (2 * max)) * 100;
        return `${x},${y}`;
      })
      .join(' ');
  }

  get donutStyle(): string {
    const items = this.categoryBreakdown;
    if (!items.length) {
      return 'conic-gradient(#e5e7eb 0 100%)';
    }
    const total = items.reduce((sum, item) => sum + item.total, 0);
    if (!total) {
      return 'conic-gradient(#e5e7eb 0 100%)';
    }

    let running = 0;
    const pieces = items.slice(0, 6).map((item) => {
      const start = (running / total) * 100;
      running += item.total;
      const end = (running / total) * 100;
      return `${item.color || '#064E3B'} ${start}% ${end}%`;
    });

    return `conic-gradient(${pieces.join(', ')})`;
  }

  setTab(tab: ReportTab): void {
    this.activeTab = tab;
    this.error = '';
    this.success = '';
  }

  setPeriod(period: AnalyticsPeriod): void {
    this.period = period;
    this.saveFilters();
    this.recomputeSummary();
  }

  setPeriodFromString(period: string): void {
    this.setPeriod(period as AnalyticsPeriod);
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  onEntryTypeToggle(entryType: EntryType, checked: boolean): void {
    if (checked) {
      if (!this.selectedEntryTypes.includes(entryType)) {
        this.selectedEntryTypes = [...this.selectedEntryTypes, entryType];
      }
    } else {
      this.selectedEntryTypes = this.selectedEntryTypes.filter((item) => item !== entryType);
      if (!this.selectedEntryTypes.length) {
        this.selectedEntryTypes = ['expense', 'income'];
      }
    }
    this.saveFilters();
    this.recomputeSummary();
  }

  onCategoryToggle(categoryId: string, checked: boolean): void {
    if (checked) {
      if (!this.selectedCategoryIds.includes(categoryId)) {
        this.selectedCategoryIds = [...this.selectedCategoryIds, categoryId];
      }
    } else {
      this.selectedCategoryIds = this.selectedCategoryIds.filter((id) => id !== categoryId);
    }
    this.saveFilters();
    this.recomputeSummary();
  }

  clearFilters(): void {
    this.period = 'month';
    this.filterStartDate = this.offsetDate(-30);
    this.filterEndDate = this.offsetDate(0);
    this.selectedEntryTypes = ['expense', 'income'];
    this.selectedCategoryIds = [];
    this.searchTerm = '';
    this.saveFilters();
    this.recomputeSummary();
  }

  loadSummary(forceRefresh = false): void {
    this.loading = true;
    this.error = '';
    this.refreshView();

    this.reports
      .getAnalyticsSnapshot(forceRefresh)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (snapshot) => {
          this.snapshot = snapshot;
          this.loading = false;
          this.recomputeSummary();
        },
        error: () => {
          this.error = 'Failed to load report data.';
          this.loading = false;
          this.refreshView();
        },
      });
  }

  exportCsv(): void {
    this.error = '';
    this.success = '';

    this.reports
      .exportCsv(this.fromDate, this.toDate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
          this.refreshView();
        },
        error: () => {
          this.error = 'Export failed.';
          this.refreshView();
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

    this.reports
      .importCsv(this.importData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
          this.refreshView();
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

  categoryPercent(category: ReportCategorySummary): number {
    const denominator = category.entry_type === 'income' ? this.incomeTotal : this.expenseTotal;
    if (!denominator) {
      return 0;
    }
    return Number(((category.total / denominator) * 100).toFixed(1));
  }


  barHeightPercent(value: number): number {
    return (Math.abs(value) / this.maxTrendValue) * 100;
  }

  typeLabel(entryType: EntryType): string {
    return entryType === 'income' ? 'Income' : 'Expense';
  }

  trackByCategory(_: number, item: { id: string }): string {
    return item.id;
  }

  private buildQuery(): AnalyticsQuery {
    return {
      period: this.period,
      startDate: this.filterStartDate,
      endDate: this.filterEndDate,
      entryTypes: this.selectedEntryTypes,
      categoryIds: this.selectedCategoryIds,
      searchText: this.searchTerm,
    };
  }

  recomputeSummary(): void {
    if (!this.snapshot) {
      return;
    }
    this.summary = buildFilteredReportSummary(this.snapshot, this.buildQuery());
    this.saveFilters();
    this.refreshView();
  }

  private offsetDate(offsetDays: number): string {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().slice(0, 10);
  }

  private saveFilters(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(
      'reports.filters',
      JSON.stringify({
        period: this.period,
        filterStartDate: this.filterStartDate,
        filterEndDate: this.filterEndDate,
        selectedEntryTypes: this.selectedEntryTypes,
        selectedCategoryIds: this.selectedCategoryIds,
        searchTerm: this.searchTerm,
      })
    );
  }

  private restoreFilters(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const raw = localStorage.getItem('reports.filters');
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as Partial<ReportsPageComponent>;
      if (parsed.period && ['week', 'month', 'year', 'custom'].includes(parsed.period)) {
        this.period = parsed.period as AnalyticsPeriod;
      }
      if (typeof parsed.filterStartDate === 'string') {
        this.filterStartDate = parsed.filterStartDate;
      }
      if (typeof parsed.filterEndDate === 'string') {
        this.filterEndDate = parsed.filterEndDate;
      }
      if (Array.isArray(parsed.selectedEntryTypes) && parsed.selectedEntryTypes.length) {
        this.selectedEntryTypes = parsed.selectedEntryTypes as EntryType[];
      }
      if (Array.isArray(parsed.selectedCategoryIds)) {
        this.selectedCategoryIds = parsed.selectedCategoryIds as string[];
      }
      if (typeof parsed.searchTerm === 'string') {
        this.searchTerm = parsed.searchTerm;
      }
    } catch {
      // Ignore malformed local storage payloads.
    }
  }

  private refreshView(): void {
    queueMicrotask(() => {
      if (this.destroyed) {
        return;
      }
      this.cdr.detectChanges();
    });
  }
}
