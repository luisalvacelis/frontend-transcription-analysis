import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '@feactures/auth/services/auth.service';
import { map } from 'rxjs/operators';

export const AuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.checkSession().pipe(
    map((isAuth) => {
      if (isAuth) {
        return true;
      }
      return router.createUrlTree(['/auth/login']);
    })
  );
};
