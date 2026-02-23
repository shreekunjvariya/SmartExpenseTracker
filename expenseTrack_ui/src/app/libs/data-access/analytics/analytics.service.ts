import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  EMPTY,
  Observable,
  catchError,
  expand,
  map,
  reduce,
  shareReplay,
  throwError,
} from 'rxjs';
import {
  AnalyticsRawResponse,
  DashboardStats,
  ReportPeriod,
  ReportSummary,
} from '../../../../models';
import {
  AnalyticsSnapshot,
  buildDashboardStats,
  buildReportSummary,
  createAnalyticsSnapshot,
} from '../../shared/analytics/analytics-calculations';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth/auth.service';

interface CacheEntry<T> {
  value$: Observable<T>;
  fetchedAt: number;
  token: string;
}

interface RawAnalyticsData {
  expenses: AnalyticsRawResponse['expenses'];
  categories: AnalyticsRawResponse['categories'];
  currency: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private api = `${environment.apiBaseUrl}/analytics/raw`;
  private readonly cacheTtlMs = 2 * 60 * 1000;
  private readonly rawLimit = 500;

  private snapshotCache$: Observable<AnalyticsSnapshot> | null = null;
  private snapshotFetchedAt = 0;
  private snapshotToken = '';

  private reportCache = new Map<ReportPeriod, CacheEntry<ReportSummary>>();
  private dashboardCache = new Map<ReportPeriod, CacheEntry<DashboardStats>>();

  getReportSummary(period: ReportPeriod, forceRefresh = false): Observable<ReportSummary> {
    const token = this.buildCacheToken();
    const cached = this.reportCache.get(period);
    const isFresh =
      !!cached &&
      !forceRefresh &&
      cached.token === token &&
      Date.now() - cached.fetchedAt < this.cacheTtlMs;

    if (isFresh) {
      return cached.value$;
    }

    const request$ = this.getSnapshot(forceRefresh).pipe(
      map((snapshot) =>
        buildReportSummary(
          snapshot.transactions,
          snapshot.categoriesById,
          period,
          snapshot.currency
        )
      ),
      shareReplay(1),
      catchError((error) => {
        this.reportCache.delete(period);
        return throwError(() => error);
      })
    );

    this.reportCache.set(period, {
      value$: request$,
      fetchedAt: Date.now(),
      token,
    });

    return request$;
  }

  getDashboardStats(forceRefresh = false, period: ReportPeriod = 'month'): Observable<DashboardStats> {
    const token = this.buildCacheToken();
    const cached = this.dashboardCache.get(period);
    const isFresh =
      !!cached &&
      !forceRefresh &&
      cached.token === token &&
      Date.now() - cached.fetchedAt < this.cacheTtlMs;

    if (isFresh) {
      return cached.value$;
    }

    const request$ = this.getSnapshot(forceRefresh).pipe(
      map((snapshot) =>
        buildDashboardStats(
          snapshot.transactions,
          snapshot.categoriesCount,
          snapshot.currency,
          period
        )
      ),
      shareReplay(1),
      catchError((error) => {
        this.dashboardCache.delete(period);
        return throwError(() => error);
      })
    );

    this.dashboardCache.set(period, {
      value$: request$,
      fetchedAt: Date.now(),
      token,
    });

    return request$;
  }

  getSnapshotData(forceRefresh = false): Observable<AnalyticsSnapshot> {
    return this.getSnapshot(forceRefresh);
  }

  invalidateCache(): void {
    this.snapshotCache$ = null;
    this.snapshotFetchedAt = 0;
    this.snapshotToken = '';
    this.reportCache.clear();
    this.dashboardCache.clear();
  }

  private getSnapshot(forceRefresh = false): Observable<AnalyticsSnapshot> {
    const token = this.buildCacheToken();
    const isFresh =
      !!this.snapshotCache$ &&
      !forceRefresh &&
      this.snapshotToken === token &&
      Date.now() - this.snapshotFetchedAt < this.cacheTtlMs;

    if (isFresh) {
      return this.snapshotCache$;
    }

    this.snapshotToken = token;
    this.snapshotFetchedAt = Date.now();
    this.snapshotCache$ = this.fetchAllRawAnalyticsData().pipe(
      map((rawData) =>
        createAnalyticsSnapshot(
          rawData.expenses,
          rawData.categories,
          rawData.currency || this.auth.user?.preferred_currency || 'USD'
        )
      ),
      shareReplay(1),
      catchError((error) => {
        this.snapshotCache$ = null;
        this.snapshotFetchedAt = 0;
        this.snapshotToken = '';
        return throwError(() => error);
      })
    );

    return this.snapshotCache$;
  }

  private fetchAllRawAnalyticsData(
  ): Observable<RawAnalyticsData> {
    const fetchPage = (cursor: string | null) => {
      let params = new HttpParams().set('limit', String(this.rawLimit));
      if (cursor) {
        params = params.set('cursor', cursor);
      }
      return this.http.get<AnalyticsRawResponse>(this.api, { params });
    };

    return fetchPage(null).pipe(
      expand((page) => (page.has_more && page.next_cursor ? fetchPage(page.next_cursor) : EMPTY)),
      reduce<AnalyticsRawResponse, RawAnalyticsData>(
        (acc, page) => ({
          expenses: [...acc.expenses, ...(page.expenses || [])],
          categories: acc.categories.length ? acc.categories : page.categories || [],
          currency: page.currency || acc.currency,
        }),
        {
          expenses: [],
          categories: [],
          currency: this.auth.user?.preferred_currency || 'USD',
        }
      )
    );
  }

  private buildCacheToken(): string {
    return `${this.auth.token || ''}::${this.auth.user?.preferred_currency || 'USD'}`;
  }
}
