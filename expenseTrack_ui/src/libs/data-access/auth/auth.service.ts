import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../src/environments/environment';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { AuthResponse, ProfileType, User } from '../../../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private api = environment.apiBaseUrl + '/auth';
  private readonly tokenStorageKey = 'expense_track_token';
  private readonly userStorageKey = 'expense_track_user';

  private _user$ = new BehaviorSubject<User | null>(null);
  private _token: string | null = null;

  get user(): User | null {
    return this._user$.value;
  }

  get token(): string | null {
    return this._token;
  }

  get user$(): Observable<User | null> {
    return this._user$.asObservable();
  }

  constructor() {
    this.loadSession();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/login`, { email, password }).pipe(
      tap((res) => this.setSession(res))
    );
  }

  register(data: Partial<User> & { password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/register`, data).pipe(
      tap((res) => this.setSession(res))
    );
  }

  updateProfile(data: Partial<Pick<User, 'name' | 'profile_type' | 'preferred_currency'>>): Observable<User> {
    return this.http.put<User>(`${this.api}/profile`, data).pipe(
      tap((user) => this.persistUser(user))
    );
  }

  logout(): Observable<void> {
    return this.http.post<{ message: string }>(`${this.api}/logout`, {}).pipe(
      map(() => void 0),
      tap(() => this.clearSession())
    );
  }

  resetSession(): void {
    this.clearSession();
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.api}/me`).pipe(
      tap((user) => this.persistUser(user))
    );
  }

  loadSession(): void {
    if (!this.canUseStorage()) {
      return;
    }

    this._token = localStorage.getItem(this.tokenStorageKey);

    const cachedUser = localStorage.getItem(this.userStorageKey);
    if (!cachedUser) {
      return;
    }

    try {
      const parsed = JSON.parse(cachedUser) as User;
      this._user$.next(parsed);
    } catch {
      localStorage.removeItem(this.userStorageKey);
    }
  }

  private setSession(res: AuthResponse): void {
    const user: User = {
      user_id: res.user_id,
      email: res.email,
      name: res.name,
      profile_type: res.profile_type as ProfileType,
      preferred_currency: res.preferred_currency,
      picture: res.picture ?? null,
      created_at: res.created_at,
    };

    this._token = res.token;
    if (this.canUseStorage()) {
      localStorage.setItem(this.tokenStorageKey, res.token);
    }
    this.persistUser(user);
  }

  private persistUser(user: User): void {
    this._user$.next(user);
    if (this.canUseStorage()) {
      localStorage.setItem(this.userStorageKey, JSON.stringify(user));
    }
  }

  private clearSession(): void {
    this._token = null;
    this._user$.next(null);
    if (this.canUseStorage()) {
      localStorage.removeItem(this.tokenStorageKey);
      localStorage.removeItem(this.userStorageKey);
    }
  }

  private canUseStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }
}
