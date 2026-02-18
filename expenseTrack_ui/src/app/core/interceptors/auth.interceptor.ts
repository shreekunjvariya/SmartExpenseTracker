import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

// TODO: Inject AuthService and handle error mapping
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  // Example: Attach JWT if available
  // const token = inject(AuthService).getToken();
  // if (token) {
  //   req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  // }
  return next(req);
};
