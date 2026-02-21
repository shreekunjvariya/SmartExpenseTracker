import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardStats, ReportSummary } from '../../../../models';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private analytics = inject(AnalyticsService);

  getStats(forceRefresh = false): Observable<DashboardStats> {
    return this.analytics.getDashboardStats(forceRefresh);
  }

  getMonthlySummary(forceRefresh = false): Observable<ReportSummary> {
    return this.analytics.getReportSummary('month', forceRefresh);
  }

  invalidateCache(): void {
    this.analytics.invalidateCache();
  }
}
