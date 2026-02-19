import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../src/environments/environment';
import { Observable } from 'rxjs';
import { Expense } from '../../../models';

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  private http = inject(HttpClient);
  private api = environment.apiBaseUrl + '/expenses';

  list(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.api);
  }

  create(expense: Omit<Expense, 'expense_id' | 'user_id' | 'created_at'>): Observable<Expense> {
    return this.http.post<Expense>(this.api, expense);
  }

  update(id: string, expense: Partial<Expense>): Observable<Expense> {
    return this.http.put<Expense>(`${this.api}/${id}`, expense);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
