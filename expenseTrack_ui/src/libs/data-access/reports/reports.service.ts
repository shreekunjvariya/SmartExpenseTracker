import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../src/environments/environment';
import { Observable } from 'rxjs';
import { ReportSummary } from '../../../models';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private http = inject(HttpClient);
  private api = environment.apiBaseUrl + '/reports';

  getSummary(period: 'week' | 'month' | 'year'): Observable<ReportSummary> {
    return this.http.get<ReportSummary>(`${this.api}/summary?period=${period}`);
  }

  exportCsv(start: string, end: string): Observable<Blob> {
    return this.http.get(`${this.api}/export?start_date=${start}&end_date=${end}`, { responseType: 'blob' });
  }

  importCsv(csv_data: string): Observable<{ imported: number; errors: string[] }> {
    return this.http.post<{ imported: number; errors: string[] }>(`${this.api}/import`, { csv_data });
  }
}
