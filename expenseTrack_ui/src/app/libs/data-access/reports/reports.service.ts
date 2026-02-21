import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, catchError, shareReplay, tap, throwError } from 'rxjs';
import { ReportSummary } from '../../../../models';
import { AuthService } from '../auth/auth.service';

type ReportPeriod = 'week' | 'month' | 'year';

interface SummaryCacheEntry {
  value$: Observable<ReportSummary>;
  fetchedAt: number;
  token: string | null;
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private api = environment.apiBaseUrl + '/reports';
  private readonly summaryCacheTtlMs = 2 * 60 * 1000;
  private summaryCache = new Map<ReportPeriod, SummaryCacheEntry>();

  getSummary(period: ReportPeriod, forceRefresh = false): Observable<ReportSummary> {
    const cached = this.summaryCache.get(period);
    const token = this.auth.token;
    const isFresh =
      !!cached &&
      !forceRefresh &&
      cached.token === token &&
      Date.now() - cached.fetchedAt < this.summaryCacheTtlMs;

    if (isFresh) {
      return cached.value$;
    }

    const request$ = this.http.get<ReportSummary>(`${this.api}/summary?period=${period}`).pipe(
      shareReplay(1),
      catchError((error) => {
        this.summaryCache.delete(period);
        return throwError(() => error);
      })
    );

    this.summaryCache.set(period, {
      value$: request$,
      fetchedAt: Date.now(),
      token,
    });

    return request$;
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
    this.summaryCache.clear();
  }
}
