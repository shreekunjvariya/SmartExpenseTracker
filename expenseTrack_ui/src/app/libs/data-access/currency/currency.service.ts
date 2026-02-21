import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CurrencyConvertResponse } from '../../../../models';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private http = inject(HttpClient);
  private api = environment.apiBaseUrl + '/currencies';

  convert(amount: number, fromCurrency: string, toCurrency: string): Observable<CurrencyConvertResponse> {
    return this.http.get<CurrencyConvertResponse>(
      `${this.api}/convert?amount=${amount}&from_currency=${fromCurrency}&to_currency=${toCurrency}`
    );
  }
}
