import { Injectable, Injector } from '@angular/core';
import { UserauthService } from './userauth.service';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';

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

    if (req.headers.has('Skip-Interceptor')) {
      const clonedRequest = req.clone({
        headers: req.headers.delete('Skip-Interceptor'), // Remove the custom header
        setHeaders: {
          Authorization: `${auth_service.getToken()}`,
        }
      });
      return next.handle(clonedRequest);
    }

    let tokenizedReq = req.clone({
      setHeaders: {
        Authorization: `${auth_service.getToken()}`,
      },
      body: { data: auth_service.EncryptData(req.body) }
    })
    return next.handle(tokenizedReq).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const decryptedData = auth_service.DecryptData(event.body.data);
          //console.log('Response Data:', decryptedData);
          return event.clone({ body: decryptedData });
        }
        return event;
      }),
      catchError((error: any) => {
        if (error instanceof HttpErrorResponse) {
          //console.error('HTTP Error:', error);
          if (error.error && error.error.data) {
            const decryptedErrorData = auth_service.DecryptData(error.error.data);
            if (decryptedErrorData?.logout) {
              auth_service.logOut();
            }
            return throwError({ ...error, error: decryptedErrorData });
          }
        } else {
          //console.error('Error:', error);
        }
        return throwError(error);
      })
    );
  }
}
