import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CategoriesService } from '../../data-access/categories/categories.service';
import { DashboardService } from '../../data-access/dashboard/dashboard.service';
import { ReportsService } from '../../data-access/reports/reports.service';
import { Category, EntryType } from '../../../../models';

@Component({
  selector: 'categories-page',
  standalone: false,
  templateUrl: './categories-page.component.html',
  styleUrl: './categories-page.component.scss',
})
export class CategoriesPageComponent implements OnInit {
  private categoriesService = inject(CategoriesService);
  private dashboardService = inject(DashboardService);
  private fb = inject(FormBuilder);
  private reportsService = inject(ReportsService);

  categories: Category[] = [];
  activeEntryType: EntryType = 'expense';
  loading = true;
  categoryDialogOpen = false;
  subDialogOpen = false;
  editingCategory: Category | null = null;
  selectedCategoryId: string | null = null;
  expandedCategories: Record<string, boolean> = {};
  savingCategory = false;
  savingSubcategory = false;
  error = '';
  success = '';

  readonly presetColors = [
    '#064E3B',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#EF4444',
    '#3B82F6',
    '#EC4899',
    '#14B8A6',
  ];

  categoryForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    icon: ['folder', Validators.required],
    color: ['#064E3B', Validators.required],
    entry_type: ['expense' as EntryType, Validators.required],
  });

  subcategoryForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    icon: ['tag', Validators.required],
  });

  ngOnInit(): void {
    this.fetchCategories();
  }

  get selectedCategoryName(): string {
    if (!this.selectedCategoryId) {
      return '';
    }
    return this.categories.find((category) => category.category_id === this.selectedCategoryId)?.name || '';
  }

  get filteredCategories(): Category[] {
    return this.categories.filter((category) => category.entry_type === this.activeEntryType);
  }

  setEntryType(entryType: EntryType): void {
    this.activeEntryType = entryType;
  }

  openAddCategoryDialog(): void {
    this.editingCategory = null;
    this.categoryDialogOpen = true;
    this.categoryForm.reset({
      name: '',
      icon: 'folder',
      color: '#064E3B',
      entry_type: this.activeEntryType,
    });
  }

  openEditCategoryDialog(category: Category): void {
    this.editingCategory = category;
    this.categoryDialogOpen = true;
    this.categoryForm.reset({
      name: category.name,
      icon: category.icon || 'folder',
      color: category.color || '#064E3B',
      entry_type: category.entry_type || 'expense',
    });
  }

  closeCategoryDialog(): void {
    this.categoryDialogOpen = false;
    this.editingCategory = null;
    this.savingCategory = false;
  }

  saveCategory(): void {
    if (this.categoryForm.invalid || this.savingCategory) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.savingCategory = true;
    this.error = '';
    this.success = '';

    const payload = this.categoryForm.getRawValue();
    const request$ = this.editingCategory
      ? this.categoriesService.update(this.editingCategory.category_id, payload)
      : this.categoriesService.create(payload);

    request$.subscribe({
      next: () => {
        this.success = this.editingCategory ? 'Category updated.' : 'Category created.';
        this.closeCategoryDialog();
        this.refreshAfterMutation();
      },
      error: () => {
        this.error = 'Failed to save category.';
        this.savingCategory = false;
      },
    });
  }

  deleteCategory(category: Category): void {
    const confirmed = window.confirm(
      'Are you sure? This will also delete all expenses in this category.'
    );
    if (!confirmed) {
      return;
    }

    this.error = '';
    this.success = '';

    this.categoriesService.delete(category.category_id).subscribe({
      next: () => {
        this.success = 'Category deleted.';
        this.refreshAfterMutation();
      },
      error: () => {
        this.error = 'Failed to delete category.';
      },
    });
  }

  openSubcategoryDialog(categoryId: string): void {
    this.selectedCategoryId = categoryId;
    this.subDialogOpen = true;
    this.subcategoryForm.reset({
      name: '',
      icon: 'tag',
    });
  }

  closeSubcategoryDialog(): void {
    this.subDialogOpen = false;
    this.selectedCategoryId = null;
    this.savingSubcategory = false;
  }

  saveSubcategory(): void {
    if (!this.selectedCategoryId || this.subcategoryForm.invalid || this.savingSubcategory) {
      this.subcategoryForm.markAllAsTouched();
      return;
    }

    this.savingSubcategory = true;
    this.error = '';
    this.success = '';

    const payload = this.subcategoryForm.getRawValue();
    this.categoriesService.addSubcategory(this.selectedCategoryId, payload).subscribe({
      next: () => {
        this.success = 'Subcategory added.';
        this.closeSubcategoryDialog();
        this.refreshAfterMutation();
      },
      error: () => {
        this.error = 'Failed to add subcategory.';
        this.savingSubcategory = false;
      },
    });
  }

  deleteSubcategory(categoryId: string, subcategoryId: string): void {
    const confirmed = window.confirm('Are you sure you want to delete this subcategory?');
    if (!confirmed) {
      return;
    }

    this.error = '';
    this.success = '';

    this.categoriesService.deleteSubcategory(categoryId, subcategoryId).subscribe({
      next: () => {
        this.success = 'Subcategory deleted.';
        this.refreshAfterMutation();
      },
      error: () => {
        this.error = 'Failed to delete subcategory.';
      },
    });
  }

  toggleExpanded(categoryId: string): void {
    this.expandedCategories[categoryId] = !this.expandedCategories[categoryId];
  }

  setColor(color: string): void {
    this.categoryForm.patchValue({ color });
  }

  private fetchCategories(forceRefresh = false): void {
    this.loading = true;
    this.error = '';

    this.categoriesService.list(forceRefresh).subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load categories.';
        this.loading = false;
      },
    });
  }

  private refreshAfterMutation(): void {
    this.dashboardService.invalidateCache();
    this.reportsService.invalidateSummaryCache();
    this.fetchCategories(true);
  }
}
