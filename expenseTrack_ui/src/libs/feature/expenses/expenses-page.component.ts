import { Component, OnInit, inject } from '@angular/core';
import { ExpensesService } from '../../data-access/expenses/expenses.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Expense } from '../../../models';

@Component({
  selector: 'expenses-page',
  standalone: false,
  templateUrl: './expenses-page.component.html',
  styleUrl: './expenses-page.component.scss',
})
export class ExpensesPageComponent implements OnInit {
  private expensesService = inject(ExpensesService);
  expenses: Expense[] = [];
  search = '';
  modalOpen = false;
  confirmOpen = false;
  editing = false;
  selected: Expense | null = null;
  form = inject(FormBuilder).group({
    date: ['', Validators.required],
    category_id: ['', Validators.required],
    amount: [0, Validators.required],
    currency: ['USD', Validators.required],
    description: ['']
  });

  ngOnInit() {
    this.expensesService.list().subscribe(data => this.expenses = data);
  }

  filteredExpenses() {
    if (!this.search) return this.expenses;
    return this.expenses.filter(e =>
      e.description?.toLowerCase().includes(this.search.toLowerCase()) ||
      e.category_id?.toLowerCase().includes(this.search.toLowerCase())
    );
  }

  openAdd() {
    this.editing = false;
    this.selected = null;
    this.form.reset({ date: '', category_id: '', amount: 0, currency: 'USD', description: '' });
    this.modalOpen = true;
  }

  edit(expense: Expense) {
    this.editing = true;
    this.selected = expense;
    this.form.patchValue(expense);
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
  }

  onSubmit() {
    if (this.form.invalid) return;
    const value = this.form.value;
    if (this.editing && this.selected) {
      this.expensesService.update(this.selected._id!, value).subscribe(() => {
        if (this.selected) {
          Object.assign(this.selected, value);
        }
        this.modalOpen = false;
      });
    } else {
      this.expensesService.create(value).subscribe(exp => {
        this.expenses.push(exp);
        this.modalOpen = false;
      });
    }
  }

  confirmDelete(expense: Expense) {
    this.selected = expense;
    this.confirmOpen = true;
  }

  deleteExpense() {
    if (!this.selected) return;
    this.expensesService.delete(this.selected._id!).subscribe(() => {
      this.expenses = this.expenses.filter(e => e !== this.selected);
      this.confirmOpen = false;
      this.selected = null;
    });
  }
}



