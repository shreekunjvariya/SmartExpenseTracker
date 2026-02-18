import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../src/environments/environment';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../../../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private api = environment.apiBaseUrl + '/auth';

  private _user: User | null = null;
  private _token: string | null = null;

  get user(): User | null {
    return this._user;
  }

  get token(): string | null {
    return this._token;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/login`, { email, password }).pipe(
      tap(res => {
        this._token = res.token;
        this._user = res.user;
        localStorage.setItem('token', res.token);
      })
    );
  }

  register(data: Partial<User> & { password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/register`, data).pipe(
      tap(res => {
        this._token = res.token;
        this._user = res.user;
        localStorage.setItem('token', res.token);
      })
    );
  }

  logout(): void {
    this._user = null;
    this._token = null;
    localStorage.removeItem('token');
    // Optionally call backend logout endpoint
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.api}/me`).pipe(
      tap(user => {
        this._user = user;
      })
    );
  }

  loadToken(): void {
    this._token = localStorage.getItem('token');
  }
}
