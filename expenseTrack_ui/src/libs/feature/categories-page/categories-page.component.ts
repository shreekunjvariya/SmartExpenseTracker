import { Component, OnInit, inject } from '@angular/core';
import { CategoriesService } from '../../data-access/categories/categories.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Category } from '../../../models';

@Component({
  selector: 'categories-page',
  standalone: false,
  templateUrl: './categories-page.component.html',
  styleUrl: './categories-page.component.scss',
})
export class CategoriesPageComponent implements OnInit {
  private categoriesService = inject(CategoriesService);
  categories: Category[] = [];
  modalOpen = false;
  confirmOpen = false;
  editing = false;
  selected: Category | null = null;
  form = inject(FormBuilder).group({
    name: ['', Validators.required],
    type: ['expense', Validators.required],
    color: ['#064E3B', Validators.required],
    icon: ['']
  });

  ngOnInit() {
    this.categoriesService.list().subscribe(data => this.categories = data);
  }

  openAdd() {
    this.editing = false;
    this.selected = null;
    this.form.reset({ name: '', type: 'expense', color: '#064E3B', icon: '' });
    this.modalOpen = true;
  }

  edit(category: Category) {
    this.editing = true;
    this.selected = category;
    this.form.patchValue(category);
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
  }

  onSubmit() {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const value: Partial<Category> = {
      name: raw.name ?? '',
      type: raw.type as Category['type'],
      color: raw.color ?? '#064E3B',
      icon: raw.icon ?? '',
    };
    if (this.editing && this.selected) {
      this.categoriesService.update(this.selected.category_id, value).subscribe(() => {
        Object.assign(this.selected, value);
        this.modalOpen = false;
      });
    } else {
      this.categoriesService.create(value).subscribe(cat => {
        this.categories.push(cat);
        this.modalOpen = false;
      });
    }
  }

  confirmDelete(category: Category) {
    this.selected = category;
    this.confirmOpen = true;
  }

  deleteCategory() {
    if (!this.selected) return;
    this.categoriesService.delete(this.selected.category_id).subscribe(() => {
      this.categories = this.categories.filter(c => c !== this.selected);
      this.confirmOpen = false;
      this.selected = null;
    });
  }
}



