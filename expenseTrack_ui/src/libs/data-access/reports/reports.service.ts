import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private http = inject(HttpClient);
  private api = environment.apiBaseUrl + '/reports';

  getSummary(period: string): Observable<any> {
    return this.http.get(`${this.api}/summary?period=${period}`);
  }

  export(start: string, end: string): Observable<Blob> {
    return this.http.get(`${this.api}/export?start_date=${start}&end_date=${end}`, { responseType: 'blob' });
  }

  import(data: any): Observable<any> {
    return this.http.post(`${this.api}/import`, data);
  }
}
