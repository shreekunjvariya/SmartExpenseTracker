import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../../libs/data-access/auth/auth.service';

const SESSION_TIMEOUT_ERRORS = new Set(['SESSION_IDLE_TIMEOUT', 'SESSION_EXPIRED', 'Session revoked']);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token;

  req = token
    ? req.clone({
        withCredentials: true,
        setHeaders: { Authorization: `Bearer ${token}` },
      })
    : req.clone({ withCredentials: true });

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const detail = error.error?.detail;
        if (typeof detail === 'string' && SESSION_TIMEOUT_ERRORS.has(detail)) {
          auth.resetSession();
          router.navigate(['/login'], { queryParams: { reason: 'session_timeout' } });
        }
      }
      return throwError(() => error);
    })
  );
};
