import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserauthService } from '../services/userauth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth:UserauthService, private router:Router){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if(!this.auth.getToken()||!this.auth.authStatus()){
        this.router.navigate(['/login'])
        return false;
      }else{
        if (localStorage.getItem("first")) {
          let url = state.url.split('/').pop()
          if (url && url != 'changepasswordlogin') {
            this.router.navigate(['changepasswordlogin'])
          }
        }
        return true;
      }
  }
  
}
