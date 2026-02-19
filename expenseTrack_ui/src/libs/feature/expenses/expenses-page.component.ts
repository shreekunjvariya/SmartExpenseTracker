import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../data-access/auth/auth.service';
import { CategoriesService } from '../../data-access/categories/categories.service';
import { ExpensesService } from '../../data-access/expenses/expenses.service';
import { Category, Expense, User } from '../../../models';

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
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  user: User | null = null;
  expenses: Expense[] = [];
  categories: Category[] = [];
  loading = true;
  dialogOpen = false;
  saving = false;
  editingExpense: Expense | null = null;
  searchTerm = '';
  filterCategory = 'all';
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
    category_id: ['', Validators.required],
    subcategory_id: [''],
    date: [this.todayDate(), Validators.required],
  });

  ngOnInit(): void {
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
    return this.getCategory(this.form.controls.category_id.value);
  }

  get filteredExpenses(): Expense[] {
    return this.expenses.filter((expense) => {
      const matchesSearch = expense.description
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase());
      const matchesCategory =
        this.filterCategory === 'all' || expense.category_id === this.filterCategory;
      return matchesSearch && matchesCategory;
    });
  }

  openAddDialog(): void {
    this.editingExpense = null;
    this.success = '';
    this.error = '';
    this.form.reset({
      amount: '',
      currency: this.user?.preferred_currency || 'USD',
      description: '',
      category_id: '',
      subcategory_id: '',
      date: this.todayDate(),
    });
    this.dialogOpen = true;
  }

  openEditDialog(expense: Expense): void {
    this.editingExpense = expense;
    this.success = '';
    this.error = '';
    this.form.reset({
      amount: String(expense.amount),
      currency: expense.currency,
      description: expense.description,
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
      category_id: raw.category_id,
      subcategory_id: raw.subcategory_id || null,
      date: new Date(raw.date).toISOString(),
    };

    const request$ = this.editingExpense
      ? this.expensesService.update(this.editingExpense.expense_id, payload)
      : this.expensesService.create(payload);

    request$.subscribe({
      next: () => {
        this.success = this.editingExpense ? 'Expense updated.' : 'Expense added.';
        this.dialogOpen = false;
        this.saving = false;
        this.editingExpense = null;
        this.fetchData();
      },
      error: () => {
        this.error = 'Failed to save expense.';
        this.saving = false;
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
        this.fetchData();
      },
      error: () => {
        this.error = 'Failed to delete expense.';
      },
    });
  }

  getCategory(categoryId: string): Category | undefined {
    return this.categories.find((category) => category.category_id === categoryId);
  }

  getSubcategory(categoryId: string, subcategoryId?: string | null): string {
    if (!subcategoryId) {
      return '';
    }
    const category = this.getCategory(categoryId);
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

  private fetchData(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      expenses: this.expensesService.list(),
      categories: this.categoriesService.list(),
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
