import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize, forkJoin, timeout } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../data-access/auth/auth.service';
import { CategoriesService } from '../../data-access/categories/categories.service';
import { DashboardService } from '../../data-access/dashboard/dashboard.service';
import { ExpensesService } from '../../data-access/expenses/expenses.service';
import { ReportsService } from '../../data-access/reports/reports.service';
import { Category, EntryType, Expense, User } from '../../../../models';

interface CurrencyOption {
  code: string;
  label: string;
}

@Component({
  selector: 'expenses-page',
  standalone: false,
  templateUrl: './expenses-page.component.html',
  styleUrl: './expenses-page.component.scss',
})
export class ExpensesPageComponent implements OnInit {
  private expensesService = inject(ExpensesService);
  private categoriesService = inject(CategoriesService);
  private dashboardService = inject(DashboardService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private reportsService = inject(ReportsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  user: User | null = null;
  expenses: Expense[] = [];
  categories: Category[] = [];
  loading = true;
  dialogOpen = false;
  saving = false;
  editingExpense: Expense | null = null;
  searchTerm = '';
  filterCategory = 'all';
  activeEntryType: EntryType = 'expense';
  error = '';
  success = '';

  readonly currencies: CurrencyOption[] = [
    { code: 'USD', label: 'USD ($)' },
    { code: 'EUR', label: 'EUR (EUR)' },
    { code: 'GBP', label: 'GBP (GBP)' },
    { code: 'INR', label: 'INR (INR)' },
    { code: 'JPY', label: 'JPY (JPY)' },
    { code: 'CAD', label: 'CAD (CAD)' },
    { code: 'AUD', label: 'AUD (AUD)' },
  ];

  form = this.fb.nonNullable.group({
    amount: ['', Validators.required],
    currency: ['USD', Validators.required],
    description: ['', Validators.required],
    entry_type: ['expense' as EntryType, Validators.required],
    category_id: ['', Validators.required],
    subcategory_id: [''],
    date: [this.todayDate(), Validators.required],
  });

  ngOnInit(): void {
    this.watchAddExpenseIntent();

    this.user = this.auth.user;
    if (!this.user && this.auth.token) {
      this.auth.me().subscribe({
        next: (user) => {
          this.user = user;
          this.form.patchValue({ currency: user.preferred_currency || 'USD' });
        },
      });
    } else {
      this.form.patchValue({ currency: this.user?.preferred_currency || 'USD' });
    }
    this.fetchData();
  }

  get selectedCategory(): Category | undefined {
    const entryType = this.form.controls.entry_type.value;
    return this.getCategory(this.form.controls.category_id.value, entryType);
  }

  get formCategories(): Category[] {
    const entryType = this.form.controls.entry_type.value;
    return this.categories.filter((category) => category.entry_type === entryType);
  }

  get filterCategories(): Category[] {
    return this.categories.filter((category) => category.entry_type === this.activeEntryType);
  }

  get filteredExpenses(): Expense[] {
    return this.expenses.filter((expense) => {
      const matchesSearch = expense.description
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase());
      const matchesCategory =
        this.filterCategory === 'all' || expense.category_id === this.filterCategory;
      const entryType = expense.entry_type || 'expense';
      const matchesEntryType = entryType === this.activeEntryType;
      return matchesSearch && matchesCategory && matchesEntryType;
    });
  }

  openAddDialog(entryType: EntryType = 'expense'): void {
    this.setActiveEntryType(entryType);
    this.editingExpense = null;
    this.success = '';
    this.error = '';
    this.form.reset({
      amount: '',
      currency: this.user?.preferred_currency || 'USD',
      description: '',
      entry_type: entryType,
      category_id: '',
      subcategory_id: '',
      date: this.todayDate(),
    });
    this.dialogOpen = true;
  }

  openEditDialog(expense: Expense): void {
    this.setActiveEntryType(expense.entry_type || 'expense');
    this.editingExpense = expense;
    this.success = '';
    this.error = '';
    this.form.reset({
      amount: String(expense.amount),
      currency: expense.currency,
      description: expense.description,
      entry_type: expense.entry_type || 'expense',
      category_id: expense.category_id,
      subcategory_id: expense.subcategory_id || '',
      date: this.toInputDate(expense.date),
    });
    this.dialogOpen = true;
  }

  closeDialog(): void {
    this.dialogOpen = false;
    this.editingExpense = null;
    this.saving = false;
    this.form.markAsPristine();
  }

  onCategoryChange(): void {
    this.form.patchValue({ subcategory_id: '' });
  }

  onEntryTypeChange(): void {
    this.form.patchValue({
      category_id: '',
      subcategory_id: '',
    });
  }

  onFilterCategorySelected(categoryId: string): void {
    this.filterCategory = categoryId || 'all';
  }

  setActiveEntryType(entryType: EntryType): void {
    if (this.activeEntryType === entryType) {
      return;
    }

    this.activeEntryType = entryType;
    this.filterCategory = 'all';
  }

  saveExpense(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';

    const raw = this.form.getRawValue();
    const payload = {
      amount: Number(raw.amount),
      currency: raw.currency,
      description: raw.description,
      entry_type: raw.entry_type,
      category_id: raw.category_id,
      subcategory_id: raw.subcategory_id || null,
      date: new Date(raw.date).toISOString(),
    };

    const request$ = this.editingExpense
      ? this.expensesService.update(this.editingExpense.expense_id, payload)
      : this.expensesService.create(payload);

    const saveWatchdog = setTimeout(() => {
      if (!this.saving) {
        return;
      }

      this.error = 'Save response is delayed. Syncing latest expenses now.';
      this.dialogOpen = false;
      this.editingExpense = null;
      this.dashboardService.invalidateCache();
      this.reportsService.invalidateSummaryCache();
      this.fetchData(true);
    }, 10000);

    request$
      .pipe(
        timeout(15000),
        finalize(() => {
          clearTimeout(saveWatchdog);
          this.saving = false;
        })
      )
      .subscribe({
        next: () => {
          this.success = this.editingExpense ? 'Expense updated.' : 'Expense added.';
          this.dialogOpen = false;
          this.editingExpense = null;
          this.dashboardService.invalidateCache();
          this.reportsService.invalidateSummaryCache();
          this.fetchData(true);
        },
        error: (error) => {
          if (error?.name === 'TimeoutError') {
            this.error = 'Save request timed out. Syncing latest expenses now.';
            this.dialogOpen = false;
            this.editingExpense = null;
            this.dashboardService.invalidateCache();
            this.reportsService.invalidateSummaryCache();
            this.fetchData(true);
            return;
          }

          this.error = 'Failed to save expense.';
        },
      });
  }

  deleteExpense(expense: Expense): void {
    const confirmed = window.confirm('Are you sure you want to delete this expense?');
    if (!confirmed) {
      return;
    }

    this.error = '';
    this.success = '';

    this.expensesService.delete(expense.expense_id).subscribe({
      next: () => {
        this.success = 'Expense deleted.';
        this.dashboardService.invalidateCache();
        this.reportsService.invalidateSummaryCache();
        this.fetchData(true);
      },
      error: () => {
        this.error = 'Failed to delete expense.';
      },
    });
  }

  getCategory(categoryId: string, entryType?: EntryType): Category | undefined {
    return this.categories.find((category) => {
      if (category.category_id !== categoryId) {
        return false;
      }
      if (!entryType) {
        return true;
      }
      return category.entry_type === entryType;
    });
  }

  getSubcategory(categoryId: string, subcategoryId?: string | null, entryType?: EntryType): string {
    if (!subcategoryId) {
      return '';
    }
    const category = this.getCategory(categoryId, entryType);
    return (
      category?.subcategories?.find((subcategory) => subcategory.subcategory_id === subcategoryId)
        ?.name || ''
    );
  }

  formatCurrency(amount: number, currency?: string | null): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  }

  formatSignedAmount(expense: Expense): string {
    const entryType = expense.entry_type || 'expense';
    const amount = this.formatCurrency(expense.amount, expense.currency);
    return entryType === 'income' ? `+${amount}` : `-${amount}`;
  }

  formatDate(date: string): string {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return date;
    }
    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private fetchData(forceRefresh = false): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      expenses: this.expensesService.list(forceRefresh),
      categories: this.categoriesService.list(forceRefresh),
    }).subscribe({
      next: ({ expenses, categories }) => {
        this.expenses = expenses;
        this.categories = categories;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load expenses.';
        this.loading = false;
      },
    });
  }

  private watchAddExpenseIntent(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        if (params.get('action') !== 'add') {
          if (params.get('action') === 'add-income') {
            this.openAddDialog('income');
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { action: null },
              queryParamsHandling: 'merge',
              replaceUrl: true,
            });
          } else if (params.get('action') === 'add-expense') {
            this.openAddDialog('expense');
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { action: null },
              queryParamsHandling: 'merge',
              replaceUrl: true,
            });
          }
          return;
        }

        this.openAddDialog('expense');
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { action: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      });
  }

  private todayDate(): string {
    return this.toInputDate(new Date().toISOString());
  }

  private toInputDate(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value.slice(0, 10);
    }
    return parsed.toISOString().slice(0, 10);
  }
}
