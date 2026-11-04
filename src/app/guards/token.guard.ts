import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { UserauthService } from '../services/userauth.service';

// Finds the :token param on this route or any child route.
function findToken(route: ActivatedRouteSnapshot): string | null {
  let r: ActivatedRouteSnapshot | null = route;
  while (r) {
    const t = r.paramMap.get('token');
    if (t) return t;
    r = r.firstChild;
  }
  return null;
}

// Verifies the client JWT (from the iframe URL) with our backend on every
// entry to the lobby and game pages. No login page exists in the iframe.
export const tokenGuard: CanActivateFn = (route) => {
  const auth = inject(UserauthService);
  const router = inject(Router);
  const expired = router.createUrlTree(['/session-expired']);

  const token = findToken(route) || auth.getToken();
  if (!token) return expired;

  return auth.validateToken(token).pipe(
    map((res) => {
      if (res?.valid) {
        auth.setToken(token, true);
        return true;
      }
      return expired;
    }),
    catchError(() => of(expired))
  );
};
