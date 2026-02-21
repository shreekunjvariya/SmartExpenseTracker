import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../libs/data-access/auth/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.token) {
    router.navigate(['/login']);
    return false;
  }

  if (auth.user) {
    return true;
  }

  return auth.me().pipe(
    map(() => true),
    catchError(() => {
      auth.resetSession();
      router.navigate(['/login']);
      return of(false);
    })
  );
};
