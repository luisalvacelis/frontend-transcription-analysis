import { HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { catchError, throwError } from "rxjs";
import { Router } from "@angular/router";

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn)  {
  const auth = inject(AuthService);
  const token = auth.token();
  const newReq = req.clone({
    headers: token ? req.headers.set('Authorization', `Bearer ${token}`) : req.headers,
  });

  return next(newReq).pipe(
    catchError((error) => {
      if(error.status === 401) {
        auth.clearSessionState();
        setTimeout(() => {
          const router = inject(Router);
          router.navigate(['/auth/login']);
        },0);
      }
      return throwError(() => error);
    })
  );
}
