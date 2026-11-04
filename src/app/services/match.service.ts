import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  matchapi = environment.backendURI;
  cvideo = environment.cvideoURI;
  livetv = environment.livetvURI;
  sportstv = environment.sportstvURI;
  username = "";

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) { }

  //function for decoding jwt payload
  GetTokenDecoded(tokenvalue: any) {
    return JSON.stringify(this.jwtHelper.decodeToken(tokenvalue));
  }

  getUsername() {
    if (this.username) {
      return this.username;
    } else {
      let token = sessionStorage.getItem('token')
      let payload = JSON.parse(this.GetTokenDecoded(token))
      this.username = payload?.username
      return this.username
    }
  }

  getMatches(match: any) { // need to delete
    return this.http.get(this.matchapi + "/" + match)
  }

  getCricketMatches() {
    return this.http.get(this.matchapi + "/getcricketmatches")
  }
  getSoccerMatches() {
    return this.http.get(this.matchapi + "/getsoccermatches")
  }
  getTennisMatches() {
    return this.http.get(this.matchapi + "/gettennismatches")
  }
  getBasketballMatches() {
    return this.http.get(this.matchapi + "/getbasketballmatches")
  }
  getVolleyballMatches() {
    return this.http.get(this.matchapi + "/getvolleyballmatches")
  }
  getTabletennisMatches() {
    return this.http.get(this.matchapi + "/gettabletennismatches")
  }
  getFutsalMatches() {
    return this.http.get(this.matchapi + "/getfutsalmatches")
  }
  getEgamesMatches() {
    return this.http.get(this.matchapi + "/getegamesmatches")
  }
  getEsoccerMatches() {
    return this.http.get(this.matchapi + "/getesoccermatches")
  }
  getKabaddiMatches() {
    return this.http.get(this.matchapi + "/getkabaddimatches")
  }
  getSnookerMatches() {
    return this.http.get(this.matchapi + "/getsnookermatches")
  }
  getBadmintonMatches() {
    return this.http.get(this.matchapi + "/getbadmintonmatches")
  }
  getHorceraceMatches() {
    return this.http.get(this.matchapi + "/gethorseracingmatches")
  }
  getGrayhoundMatches() {
    return this.http.get(this.matchapi + "/getgreyhoundracingmatches")
  }
  getBinaryMatches() {
    return this.http.get(this.matchapi + "/getbinarymatches")
  }
  getMatchDetail(eventId: any) {
    return this.http.post(this.matchapi + '/getmatchdetail', { eventId: eventId })
  }
  getResult(roundId: any) {
    return this.http.get(this.matchapi + '/casino/getresult/' + roundId);
  }
  getCasinoResultReport(data: any) {
    return this.http.post(this.matchapi + '/casino/getcasinoresultsdata', data);
  }
  getResultDetail(data: any) {
    return this.http.post(this.matchapi + '/casino/getresultdetail', data);
  }
  getccmatches() {
    return this.http.get(this.matchapi + '/getcricketcasinomatches');
  }
  getccdata(eventId: any) {
    return this.http.get(this.matchapi + '/match/getccdata/' + eventId);
  }
  getNotice() {
    return this.http.get(this.matchapi + "/getnotice")
  }


  //Below functions need to manage. Currently not using.
  submitbet(data: any) {
    return this.http.post(this.matchapi + '/placebet', data);
  }

  getCasinoVideo() {
    return this.getUsername() == 'demo' ? 'https://google.com' : this.cvideo;
  }

  getCVideo(eventId: string) {
    return this.http.post(this.matchapi + '/getcvideo', { eventId });
  }
  
  getTvURL(eventId: string) {
    return this.http.post(this.matchapi + '/getlivetv', { eventId });
  }

  getOthersTvURL(data:any) {
    return this.http.post(this.matchapi + '/getlivetv', data);
  }

  getScoreURL(data:any) {
    return this.http.post(this.matchapi + '/getscoreurl', data);
  }

  getScoreAnimation(sportId: string, eventId: string) {
    return this.http.post(this.matchapi + '/getanimationurl', { sportId, eventId });
  }

  getGameUrl(data: any) {
    // /livecasino-v1 is mounted after the AES-envelope middleware (unlike
    // /mac88-v1, which stays plaintext for the aggregator's own webhooks), so
    // this goes through the normal encrypted interceptor path.
    return this.http.post(this.matchapi + `/livecasino-v1/play-game`, data);
  }

  // live-casino-list, slot-list, virtual-list, crash-list, and fantasy-list
  // all read from the same /livecasino-v1 endpoint, filtered by section
  // server-side.
  getLiveCasinoGames() {
    return this.http.post(this.matchapi + '/livecasino-v1/getallgames', { section: 'live' });
  }

  getSlotGames() {
    return this.http.post(this.matchapi + '/livecasino-v1/getallgames', { section: 'slot' });
  }

  getVirtualGames() {
    return this.http.post(this.matchapi + '/livecasino-v1/getallgames', { section: 'virtual' });
  }

  getCrashGames() {
    return this.http.post(this.matchapi + '/livecasino-v1/getallgames', { section: 'crash' });
  }

  getFantasyGames() {
    return this.http.post(this.matchapi + '/livecasino-v1/getallgames', { section: 'fantasy' });
  }
}
