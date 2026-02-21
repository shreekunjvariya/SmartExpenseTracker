import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, catchError, shareReplay, tap, throwError } from 'rxjs';
import { Category, EntryType, Subcategory } from '../../../../models';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private api = environment.apiBaseUrl + '/categories';
  private readonly listCacheTtlMs = 2 * 60 * 1000;
  private listCache$: Observable<Category[]> | null = null;
  private listFetchedAt = 0;
  private listCacheToken: string | null = null;

  list(forceRefresh = false, entryType?: EntryType): Observable<Category[]> {
    if (entryType) {
      return this.http.get<Category[]>(this.api, {
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
    this.listCache$ = this.http.get<Category[]>(this.api).pipe(
      shareReplay(1),
      catchError((error) => {
        this.invalidateListCache();
        return throwError(() => error);
      })
    );

    return this.listCache$;
  }

  create(category: Pick<Category, 'name' | 'icon' | 'color' | 'entry_type'>): Observable<Category> {
    return this.http.post<Category>(this.api, category).pipe(
      tap(() => this.invalidateListCache())
    );
  }

  update(id: string, category: Partial<Pick<Category, 'name' | 'icon' | 'color' | 'entry_type'>>): Observable<Category> {
    return this.http.put<Category>(`${this.api}/${id}`, category).pipe(
      tap(() => this.invalidateListCache())
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
      tap(() => this.invalidateListCache())
    );
  }

  addSubcategory(categoryId: string, subcategory: Pick<Subcategory, 'name' | 'icon'>): Observable<Subcategory> {
    return this.http.post<Subcategory>(`${this.api}/${categoryId}/subcategories`, subcategory).pipe(
      tap(() => this.invalidateListCache())
    );
  }

  deleteSubcategory(categoryId: string, subcategoryId: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${categoryId}/subcategories/${subcategoryId}`).pipe(
      tap(() => this.invalidateListCache())
    );
  }

  invalidateListCache(): void {
    this.listCache$ = null;
    this.listFetchedAt = 0;
    this.listCacheToken = null;
  }
}
