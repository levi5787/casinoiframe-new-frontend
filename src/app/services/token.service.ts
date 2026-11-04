import { Injectable, Injector } from '@angular/core';
import { UserauthService } from './userauth.service';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  constructor(private injector: Injector) { }
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let auth_service = this.injector.get(UserauthService)
    const token = auth_service.getToken();

    // Plain JSON (no payload encryption); client JWT sent as Bearer token.
    let tokenizedReq = req.clone({
      headers: req.headers.delete('Skip-Interceptor'),
      setHeaders: token ? { Authorization: `Bearer ${token}` } : {}
    })

    return next.handle(tokenizedReq).pipe(
      catchError((error: any) => {
        if (error instanceof HttpErrorResponse && error.error?.logout) {
          auth_service.logOut();
        }
        return throwError(() => error);
      })
    );
  }
}
