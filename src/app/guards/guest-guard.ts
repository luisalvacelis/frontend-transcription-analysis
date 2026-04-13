import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@feactures/auth/services/auth.service';
import { map } from 'rxjs/operators';

export const GuestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.checkSession().pipe(
    map((isAuth) => {
      if (isAuth) {
        return router.createUrlTree(['/']);
      }
      return true;
    })
  );
};
