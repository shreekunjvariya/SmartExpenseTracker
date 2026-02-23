import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { AnalyticsSnapshot } from '../../shared/analytics/analytics-calculations';
import { ReportPeriod, ReportSummary } from '../../../../models';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private http = inject(HttpClient);
  private analytics = inject(AnalyticsService);
  private api = environment.apiBaseUrl + '/reports';

  getSummary(period: ReportPeriod, forceRefresh = false): Observable<ReportSummary> {
    return this.analytics.getReportSummary(period, forceRefresh);
  }


  getAnalyticsSnapshot(forceRefresh = false): Observable<AnalyticsSnapshot> {
    return this.analytics.getSnapshotData(forceRefresh);
  }

  exportCsv(start: string, end: string): Observable<Blob> {
    return this.http.get(`${this.api}/export?start_date=${start}&end_date=${end}`, { responseType: 'blob' });
  }

  importCsv(csv_data: string): Observable<{ imported: number; errors: string[] }> {
    return this.http.post<{ imported: number; errors: string[] }>(`${this.api}/import`, { csv_data }).pipe(
      tap(() => this.invalidateSummaryCache())
    );
  }

  invalidateSummaryCache(): void {
    this.analytics.invalidateCache();
  }
}
