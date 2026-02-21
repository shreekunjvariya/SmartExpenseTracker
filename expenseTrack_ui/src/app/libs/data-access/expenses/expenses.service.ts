import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, catchError, shareReplay, tap, throwError } from 'rxjs';
import { EntryType, Expense } from '../../../../models';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private api = environment.apiBaseUrl + '/expenses';
  private readonly listCacheTtlMs = 2 * 60 * 1000;
  private listCache$: Observable<Expense[]> | null = null;
  private listFetchedAt = 0;
  private listCacheToken: string | null = null;

  list(forceRefresh = false, entryType?: EntryType): Observable<Expense[]> {
    if (entryType) {
      return this.http.get<Expense[]>(this.api, {
        params: new HttpParams().set('entry_type', entryType),
      });
    }

    const token = this.auth.token;
    const isFresh =
      !!this.listCache$ &&
      !forceRefresh &&
      this.listCacheToken === token &&
      Date.now() - this.listFetchedAt < this.listCacheTtlMs;

    if (isFresh) {
      return this.listCache$;
    }

    this.listCacheToken = token;
    this.listFetchedAt = Date.now();
    this.listCache$ = this.http.get<Expense[]>(this.api).pipe(
      shareReplay(1),
      catchError((error) => {
        this.invalidateListCache();
        return throwError(() => error);
      })
    );

    return this.listCache$;
  }

  create(expense: Omit<Expense, 'expense_id' | 'user_id' | 'created_at'>): Observable<Expense> {
    return this.http.post<Expense>(this.api, expense).pipe(
      tap(() => this.invalidateListCache())
    );
  }

  update(id: string, expense: Partial<Expense>): Observable<Expense> {
    return this.http.put<Expense>(`${this.api}/${id}`, expense).pipe(
      tap(() => this.invalidateListCache())
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
      tap(() => this.invalidateListCache())
    );
  }

  invalidateListCache(): void {
    this.listCache$ = null;
    this.listFetchedAt = 0;
    this.listCacheToken = null;
  }
}
