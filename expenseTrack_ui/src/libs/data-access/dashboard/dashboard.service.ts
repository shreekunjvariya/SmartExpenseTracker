import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private api = environment.apiBaseUrl + '/dashboard';

  getStats(): Observable<any> {
    return this.http.get(`${this.api}/stats`);
  }

  getMonthlySummary(): Observable<any> {
    return this.http.get(`${this.api}/summary?period=month`);
  }
}
