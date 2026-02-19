import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../src/environments/environment';
import { Observable } from 'rxjs';
import { DashboardStats, ReportSummary } from '../../../models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private api = environment.apiBaseUrl;

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.api}/dashboard/stats`);
  }

  getMonthlySummary(): Observable<ReportSummary> {
    return this.http.get<ReportSummary>(`${this.api}/reports/summary?period=month`);
  }
}
