import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { NavigationStart, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';
import * as CryptoJS from 'crypto-js';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserauthService {

  balance = 0; exposure = 0;
  apiurl = environment.backendURI;
  private isAuthenticated = false;

  private previousUrl: string | undefined;
  private currentUrl: string | undefined;
  constructor(private http: HttpClient, private router: Router, private jwtHelper: JwtHelperService) {
    this.currentUrl = this.router.url;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
        //console.log(this.previousUrl, this.currentUrl)
      }
    });
  }

  public getPreviousUrl(): string | undefined {
    return this.previousUrl;
  }

  EncryptData(data: string) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), environment.kk).toString();
  }

  DecryptData(data: string) {
    var bytes = CryptoJS.AES.decrypt(data, environment.kk);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  //function for decoding jwt payload
  GetTokenDecoded(tokenvalue: any) {
    return JSON.stringify(this.jwtHelper.decodeToken(tokenvalue));
  }
  getBaseURL() {
    return this.apiurl;
  }

  getUserDetails() {
    let token = this.getToken()
    let payload = JSON.parse(this.GetTokenDecoded(token))
    return payload;
  }
  getUsername() {
    let token = this.getToken()
    let payload = JSON.parse(this.GetTokenDecoded(token))
    return payload?.username
  }
  getUserBalance() {
    this.http.get<any>(this.apiurl + '/getuserbalance').subscribe({
      next: (res) => {
        if (res.logout) {
          this.logOut();
        } else {
          this.balance = res.balance;
          this.exposure = res.exposure;
        }
      },
      error: (e) => console.log(e)
    })
  }
  getBalance() {
    return this.balance;
  }
  getExposure() {
    return this.exposure;
  }
  loginuser(data: any): Observable<any> {
    // return this.http.post(this.apiurl + '/userlogin', {data: this.EncryptData(data)}).pipe(
    //   map((response: any) => {
    //     return this.DecryptData(response.data)
    //   }),
    //   catchError((error: HttpErrorResponse) => {
    //     return throwError({error:this.DecryptData(error.error.data)});
    //   })
    // );
    return this.http.post(this.apiurl + '/userlogin', data)
  }
  autoAuth() {
    let userDetails = this.getUserDetails();
    if (userDetails) {
      let currentTime = Math.round(new Date().getTime() / 1000);
      if (currentTime < userDetails.exp) {
        this.isAuthenticated = true;
      }
    }
  }
  authStatus() {
    return this.isAuthenticated;
  }
  // Token comes from the iframe URL (signed by the client site) and is kept per-tab.
  setToken(token: any, auth: boolean) {
    this.isAuthenticated = auth;
    sessionStorage.setItem('token', token)
  }
  getToken() {
    return sessionStorage.getItem('token')
  }
  // Verify the client JWT with our backend (used on lobby and game page entry).
  validateToken(token: string): Observable<{ valid: boolean, message?: string }> {
    return this.http.post<{ valid: boolean, message?: string }>(this.apiurl + '/validateClientToken', { token })
  }
  logOut() {
    // No login page in the iframe: clear the session and show the expired page.
    sessionStorage.removeItem('token')
    this.isAuthenticated = false;
    this.router.navigate(['/session-expired'])
    // if (window.innerWidth <= 990) {
    //   this.router.navigate(['m/login']);
    // } else if (window.innerWidth > 990) {
    //   this.router.navigate(['/login'])
    // }
  }
  placebet(data: any) {
    return this.http.post(this.apiurl + '/cricket/placebet', data)
  }
  placewbet(data: any) {
    return this.http.post(this.apiurl + '/cricket/placewbet', data)
  }
  placeVirtualT10Bet(data: any) {
    return this.http.post(this.apiurl + '/virtualt10/placebet', data)
  }
  placeccbet(data: any) {
    return this.http.post(this.apiurl + '/cricket/placeccbet', data)
  }
  placeFootballBet(data: any) {
    return this.http.post(this.apiurl + '/football/placebet', data)
  }
  placeTennisBet(data: any) {
    return this.http.post(this.apiurl + '/tennis/placebet', data)
  }
  placeBasketballBet(data: any) {
    return this.http.post(this.apiurl + '/basketball/placebet', data)
  }
  placeVolleyballBet(data: any) {
    return this.http.post(this.apiurl + '/volleyball/placebet', data)
  }
  placeTableTennisBet(data: any) {
    return this.http.post(this.apiurl + '/tabletennis/placebet', data)
  }
  placeFutsalBet(data: any) {
    return this.http.post(this.apiurl + '/futsal/placebet', data)
  }
  placeEgamesBet(data: any) {
    return this.http.post(this.apiurl + '/egames/placebet', data)
  }
  placeBinaryBet(data: any) {
    return this.http.post(this.apiurl + '/binary/placebet', data)
  }
  placeEsoccerBet(data: any) {
    return this.http.post(this.apiurl + '/esoccer/placebet', data)
  }
  placeKabaddiBet(data: any) {
    return this.http.post(this.apiurl + '/kabaddi/placebet', data)
  }
  placeBadmintonBet(data: any) {
    return this.http.post(this.apiurl + '/badminton/placebet', data)
  }
  placeSnookerBet(data: any) {
    return this.http.post(this.apiurl + '/snooker/placebet', data)
  }
  placeHorseRacingBet(data: any) {
    return this.http.post(this.apiurl + '/horseracing/placebet', data)
  }
  placeGreyhoundRacingBet(data: any) {
    return this.http.post(this.apiurl + '/greyhoundracing/placebet', data)
  }
  getopenbet(eventId: any) {
    return this.http.post(this.apiurl + '/cricket/getopenbet', { eventId: eventId })
  }
  getfancybook(dt: any) {
    return this.http.post(this.apiurl + '/cricket/getfancybook', dt)
  }
  getFootballOpenBet(eventId: any) {
    return this.http.post(this.apiurl + '/football/getopenbet', { eventId: eventId })
  }
  getTennisOpenBet(eventId: any) {
    return this.http.post(this.apiurl + '/tennis/getopenbet', { eventId: eventId })
  }
  getBasketballOpenBet(eventId: any) {
    return this.http.post(this.apiurl + '/basketball/getopenbet', { eventId: eventId })
  }
  getVolleyballOpenBet(eventId: any) {
    return this.http.post(this.apiurl + '/volleyball/getopenbet', { eventId: eventId })
  }
  getTableTennisOpenBet(eventId: any) {
    return this.http.post(this.apiurl + '/tabletennis/getopenbet', { eventId: eventId })
  }
  getFutsalOpenBet(eventId: any) {
    return this.http.post(this.apiurl + '/futsal/getopenbet', { eventId: eventId })
  }
  getEgamesOpenBet(eventId: any) {
    return this.http.post(this.apiurl + '/egames/getopenbet', { eventId: eventId })
  }
  getBinaryOpenBet(eventId: any) {
    return this.http.post(this.apiurl + '/binary/getopenbet', { eventId: eventId })
  }
  getEsoccerOpenBet(eventId: any) {
    return this.http.post(this.apiurl + '/esoccer/getopenbet', { eventId: eventId })
  }
  getKabaddiOpenBet(eventId: any) {
    return this.http.post(this.apiurl + '/kabaddi/getopenbet', { eventId: eventId })
  }
  getBadmintonpenBet(eventId: any) {
    return this.http.post(this.apiurl + '/badminton/getopenbet', { eventId: eventId })
  }
  getSnookerOpenBet(eventId: any) {
    return this.http.post(this.apiurl + '/snooker/getopenbet', { eventId: eventId })
  }
  getHorseRacingOpenBet(eventId: any) {
    return this.http.post(this.apiurl + '/horseracing/getopenbet', { eventId: eventId })
  }
  getGreyhoundRacingOpenBet(eventId: any) {
    return this.http.post(this.apiurl + '/greyhoundracing/getopenbet', { eventId: eventId })
  }

  getmymarket() {
    return this.http.get(this.apiurl + '/user/getmymarket');
  }
  placeCasinoBet(data: any) {
    return this.http.post(this.apiurl + '/casino/placebet', data)
  }
  getCasinoOpenBet(eventId: String, roundId: String) {
    return this.http.post(this.apiurl + '/casino/getopenbet', { eventId: eventId, roundId: roundId })
  }

  getuserstatement(data: any) {
    return this.http.post(this.apiurl + '/getaccountstatement', data)
  }
  getstatementdetail(data: any) {
    return this.http.post(this.apiurl + '/getstatementdetail', data)
  }
  getunsettledbet(data: any) {
    return this.http.post(this.apiurl + '/getunsettledbet', data);
  }
  getuserbethistory(data: any) {
    return this.http.post(this.apiurl + '/getbethistory', data)
  }
  getuserprofitloss(data: any) {
    return this.http.post(this.apiurl + '/getuserprofitloss', data)
  }
  changeUserPassFirst(data: any) {
    return this.http.post(this.apiurl + '/change_user_password', data)
  }
  changeUserPass(data: any) {
    return this.http.post(this.apiurl + '/changeuserpassword', data)
  }
  getButtons() {
    return this.http.get(this.apiurl + '/getuserbuttons');
  }
  updateButtons(data: any) {
    return this.http.post(this.apiurl + '/updatebuttons', data);
  }

  getConnectionId(data: any) {
    return this.http.post(this.apiurl + '/getConnectionId', data)
  }
  validateSecurityCode(data: any) { //to login with security auth
    return this.http.post(this.apiurl + '/validatesecuritycode', data)
  }
  secAuthStatus() {
    return this.http.get(this.apiurl + '/secureAuthStatus')
  }
  disableSecAuth() {
    return this.http.post(this.apiurl + '/disableSecAuth', {})
  }
  validateDisableSecAuth(data: any) { // to disable security auth
    return this.http.post(this.apiurl + '/validateDisableSecAuth', data)
  }
  
  getactivitylog(data: any) { // to disable security auth
    return this.http.post(this.apiurl + '/activitylogs', data)
  }

  placebetAviator(data: any) {
    return this.http.post(this.apiurl + '/aviator/placebet', data)
  }
  cancelbetAviator(data: any) {
    return this.http.post(this.apiurl + '/aviator/cancelBet', data)
  }
  cashoutAviator(data: any) {
    return this.http.post(this.apiurl + '/aviator/cashout', data)
  }
  getGameHistory(){
      return this.http.get(this.apiurl + '/aviator/getGameHistory')
  }

  getBanks() {
    return this.http.get(this.apiurl + "/getbanks");
  }

  addBank(formData: FormData) {
    return this.http.post(this.apiurl + "/addbank", formData, {
      headers: { "Skip-Interceptor": "true" },
    });
  }

  deleteBank(data: any) {
    return this.http.post(this.apiurl + "/deletebank", data);
  }

  userWithdraw(data: any) {
    return this.http.post(this.apiurl + "/userwithdraw", data);
  }

  userDeposit(formData: FormData) {
    return this.http.post(this.apiurl + "/userdeposit", formData, {
      headers: { "Skip-Interceptor": "true" },
    });
  }

  getDWStatement(data: any) {
    return this.http.post(this.apiurl + "/getdwstatement", data);
  }

  getParentBank() {
    return this.http.get(this.apiurl + "/getparentbanks");
  }
}
