import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../src/environments/environment';
import { Observable } from 'rxjs';
import { Category, Subcategory } from '../../../models';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private http = inject(HttpClient);
  private api = environment.apiBaseUrl + '/categories';

  list(): Observable<Category[]> {
    return this.http.get<Category[]>(this.api);
  }

  create(category: Pick<Category, 'name' | 'icon' | 'color'>): Observable<Category> {
    return this.http.post<Category>(this.api, category);
  }

  update(id: string, category: Partial<Pick<Category, 'name' | 'icon' | 'color'>>): Observable<Category> {
    return this.http.put<Category>(`${this.api}/${id}`, category);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  addSubcategory(categoryId: string, subcategory: Pick<Subcategory, 'name' | 'icon'>): Observable<Subcategory> {
    return this.http.post<Subcategory>(`${this.api}/${categoryId}/subcategories`, subcategory);
  }

  deleteSubcategory(categoryId: string, subcategoryId: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${categoryId}/subcategories/${subcategoryId}`);
  }
}
