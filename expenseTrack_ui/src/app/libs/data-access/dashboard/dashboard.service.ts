import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, catchError, shareReplay, throwError } from 'rxjs';
import { DashboardStats, ReportSummary } from '../../../../models';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private api = environment.apiBaseUrl;
  private readonly cacheTtlMs = 2 * 60 * 1000;
  private statsCache$: Observable<DashboardStats> | null = null;
  private statsFetchedAt = 0;
  private statsCacheToken: string | null = null;
  private summaryCache$: Observable<ReportSummary> | null = null;
  private summaryFetchedAt = 0;
  private summaryCacheToken: string | null = null;

  getStats(forceRefresh = false): Observable<DashboardStats> {
    const token = this.auth.token;
    const isFresh =
      !!this.statsCache$ &&
      !forceRefresh &&
      this.statsCacheToken === token &&
      Date.now() - this.statsFetchedAt < this.cacheTtlMs;

    if (isFresh) {
      return this.statsCache$;
    }

    this.statsCacheToken = token;
    this.statsFetchedAt = Date.now();
    this.statsCache$ = this.http.get<DashboardStats>(`${this.api}/dashboard/stats`).pipe(
      shareReplay(1),
      catchError((error) => {
        this.clearStatsCache();
        return throwError(() => error);
      })
    );

    return this.statsCache$;
  }

  getMonthlySummary(forceRefresh = false): Observable<ReportSummary> {
    const token = this.auth.token;
    const isFresh =
      !!this.summaryCache$ &&
      !forceRefresh &&
      this.summaryCacheToken === token &&
      Date.now() - this.summaryFetchedAt < this.cacheTtlMs;

    if (isFresh) {
      return this.summaryCache$;
    }

    this.summaryCacheToken = token;
    this.summaryFetchedAt = Date.now();
    this.summaryCache$ = this.http
      .get<ReportSummary>(`${this.api}/reports/summary?period=month`)
      .pipe(
        shareReplay(1),
        catchError((error) => {
          this.clearSummaryCache();
          return throwError(() => error);
        })
      );

    return this.summaryCache$;
  }

  invalidateCache(): void {
    this.clearStatsCache();
    this.clearSummaryCache();
  }

  private clearStatsCache(): void {
    this.statsCache$ = null;
    this.statsFetchedAt = 0;
    this.statsCacheToken = null;
  }

  private clearSummaryCache(): void {
    this.summaryCache$ = null;
    this.summaryFetchedAt = 0;
    this.summaryCacheToken = null;
  }
}
