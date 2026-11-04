import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { FooterComponent } from "../footer/footer.component";
import { UserauthService } from '../services/userauth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatchService } from '../services/match.service';
import { SocketService } from '../services/socket.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ShortNumberPipe } from '../pipes/short-number.pipe';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-gamedetail-football',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent, FooterComponent, CommonModule, ShortNumberPipe, FormsModule],
  templateUrl: './gamedetail-football.component.html',
  styleUrl: './gamedetail-football.component.css'
})
export class GamedetailFootballComponent {

  userButtons: any = {}; setButtonTab = "game"; isCashout = false;
  isSticky = false; sidebarTopOffset = 124; isLoading = true; placeLoader = false; gametab = true; bettab = false;
  safeURL: any; safeURLmbl: any; tvURL: any; animationURL: any = ""; beventId: any; tv: any;
  eventId: any; eventName: any; date: any; liveon = false; timer = false;
  betFor = ""; rate = 0; odds = 0; betType = ""; oddsType = ""; stake = 0; profit = 0; loss = 0; showbetform = false; sid: any; oname: any;
  data: any = []; placebetButton: any = [];

  match_odds: any = []; bookmaker: any = []; bm_over_under: any = []; first_half_goals: any = []; half_time: any = [];
  over_under: any = []; under_over: any = []; period_winner: any = []; next_goal: any = []; draw_no_bet: any = [];
  goal_odd_even: any = []; both_team_score: any = []; correct_score: any = []; corners: any = []; ht_ft: any = []; group_winner: any = [];
  draw_no_bet_new: any = []; both_team_score_new: any = []; bm_half_time: any = []; total_corners: any = [];

  openBets: any = []; book: any = [];
  matchOddsBook = []; bookmakerBook = []; bm_over_underBook: any = {}; first_half_goalsBook: any = {}; half_timeBook: any = [];
  over_underBook: any = {}; under_overBook: any = {}; period_winnerBook: any = []; next_goalBook: any = {}; draw_no_betBook: any = [];
  goal_odd_evenBook: any = []; both_team_scoreBook: any = []; ht_ftBook: any = []; csBook: any = []; cornersBook: any = []; group_winnerBook: any = [];
  draw_no_bet_newBook: any = []; both_team_score_newBook: any = []; bm_half_timeBook: any = []; total_cornersBook: any = []; preBook: any = [];

  matchOPreBook: any = []; bmPrebook: any = []; bm_over_underPreBook: any = {}; first_half_goalsPreBook: any = {}; half_timePreBook: any = [];
  over_underPreBook: any = {}; under_overPreBook: any = {}; period_winnerPreBook: any = []; next_goalPreBook: any = {}; draw_no_betPreBook: any = [];
  goal_odd_evenPreBook: any = []; both_team_scorePreBook: any = []; ht_ftPreBook: any = []; csPreBook: any = []; cornersPreBook: any = []; group_winnerPreBook: any = []
  draw_no_bet_newPreBook: any = []; both_team_score_newPreBook: any = []; bm_half_timePreBook: any = []; total_cornersPreBook: any = [];

  dataChangedTime: any; dataCheckInterval: any; noMarketInterval: any;
  constructor(
    private auth: UserauthService,
    private _sanitizer: DomSanitizer,
    private match_service: MatchService,
    private game_socket: SocketService,
    private activated_route: ActivatedRoute,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = (window.pageYOffset >= this.sidebarTopOffset);
    //console.log(this.sidebarTopOffset)
  }

  ngOnInit(): void {
    this.eventId = this.activated_route.snapshot.paramMap.get('gameid');
    this.match_service.getMatchDetail(this.eventId).subscribe({
      next: (res: any) => { this.eventName = res.eventName; this.date = res.date; this.beventId = res.beventId; this.tv = res.tv; },
      error: (e) => {} /* console.log(e) */
    })
    // live tv
    //this.tvURL = this.match_service.getSportstvVideo()
    //this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.tvURL + this.eventId + "&sportid=1")
    //this.animationURL = this._sanitizer.bypassSecurityTrustResourceUrl(	"https://betexch999.com/d/scoreanimation/5248285/1E6E2B91-E5C3-47CD-804E-DF63AF81AFA5")

    this.socketEmit();
    this.getOpenBets();
    this.placeBetButton();
    this.getScoreAnimation();
    this.marketNotAvailable();
    this.animationTimer();
    this.dataCheckInterval = setInterval(() => {
      let now = new Date().getTime();
      if ((now - this.dataChangedTime) > 3000) {
        this.socketEmit();
      }
    }, 3 * 1000)
  }

  getLiveTvURL() {
    this.match_service.getOthersTvURL({ sportId: '1', eventId: this.eventId, oldgmid: this.beventId }).subscribe({
      next: (res: any) => {
        //console.log(res)
        this.tvURL = res.url
        if (window.innerWidth < 1200) {
          this.safeURLmbl = this._sanitizer.bypassSecurityTrustResourceUrl(this.tvURL)
        } else {
          this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.tvURL)
        }
      }, error: (e) => {
        //console.log(e)
      }
    })
  }

  socketEmit() {
    this.game_socket.gamedata('Market', this.eventId).subscribe((data: any) => {
      this.dataChangedTime = new Date().getTime();
      //console.log(data) 
      this.data = data['data'];
      this.over_under = this.data.filter((m: any) => m.mname.startsWith('OVER_UNDER'));
      // this.under_over = this.data.filter((m: any) => m.mname.startsWith('Under/Over'));
      // this.bm_over_under = this.data.filter((m: any) => m.mname.startsWith('BM_OVER_UNDER'));
      // this.first_half_goals = this.data.filter((m: any) => m.mname.startsWith('FIRST_HALF_GOALS'));
      // this.next_goal = this.data.filter((m: any) => m.mname.startsWith('Next Goal'));
      // this.group_winner = this.data.filter((m: any) => m.mname.startsWith('BM Group'));
      // this.both_team_score = this.data.filter((m: any) => m.mname.startsWith('Both Teams To Score'));
      // this.period_winner = this.data.filter((m: any) => m.mname.endsWith('Period Winner'));
      // this.total_corners = this.data.filter((m: any) => m.mname.startsWith('Total Corners'));
      this.data.forEach((item: any) => {
        if (item.mname == "MATCH_ODDS") {
          this.match_odds = item
        } else if (["Bookmaker", "BM_UEFA Euro 2024", "BM_CONMEBOL Copa America - 2024"].includes(item.mname)) {
          this.bookmaker = item
        }
        // else if (item.mname == "HALF_TIME") {
        //   this.half_time = item;
        // } else if (item.mname == "Draw No Bet") {
        //   this.draw_no_bet = item
        // } else if (item.mname == "Goals Odd/Even") {
        //   this.goal_odd_even = item
        // } else if (item.mname == '1X2 Corners') {
        //   this.corners = item
        // } else if (item.mname == 'CORRECT_SCORE') {
        //   this.correct_score = item
        // } else if (item.mname == "HT/FT") {
        //   this.ht_ft = item
        // }
      });
    })
  }

  ngAfterViewInit() {
    setTimeout(() => {
      //this.isLoading = false;
      this.cdr.detectChanges();
    }, 300);
  }
  placeBetButton() {
    this.auth.getButtons().subscribe({
      next: (res: any) => {
        this.placebetButton = res.gamebutton;
        //console.log(this.placebetButton)
      }, error: (e) => {} /* console.log(e) */
    })
  }
  ngOnDestroy() {
    this.game_socket.leavaAllRooms();
    if (this.dataCheckInterval) {
      clearInterval(this.dataCheckInterval)
    }
    if (this.noMarketInterval) {
      clearInterval(this.noMarketInterval)
    }
  }
  liveClicked() {
    this.liveon = !this.liveon;
    if (this.liveon) {
      this.getLiveTvURL();
    }
  }
  getScoreAnimation() {
    // score animation
    this.match_service.getScoreAnimation('1', this.eventId).subscribe({
      next: ((res: any) => {
        if (res?.url) {
          let splited = res.url.split('/')
          let scoreCode = splited[splited.length - 2]
          //console.log(scoreCode)
          if (scoreCode != 0) {
            this.animationURL = this._sanitizer.bypassSecurityTrustResourceUrl(res.url)
          }
        }
      }), error: (e) => {} /* console.log(e) */
    })
  }
  trackByFunc(index: number, item: any) {
    return item.sid;
  }
  trackBymid(index: number, item: any) {
    return item.mid;
  }
  openBetForm(content: any, betfor: any, rate: any, bettype: any, oddstype: any, sid: any, oname: any, isCashout: boolean = false) {
    this.showbetform = true
    this.betFor = betfor
    this.rate = rate
    this.betType = bettype
    this.oddsType = oddstype
    this.sid = sid
    this.profit = 0;
    this.loss = 0
    this.isCashout = isCashout;
    if (!isCashout) {
      this.stake = 0;
      this.matchOPreBook = []; this.bmPrebook = []; this.bm_over_underPreBook = {}; this.first_half_goalsPreBook = {}; this.half_timePreBook = [];
      this.over_underPreBook = {}; this.under_overPreBook = {}; this.period_winnerPreBook = []; this.next_goalPreBook = {}; this.draw_no_betPreBook = [];
      this.goal_odd_evenPreBook = []; this.both_team_scorePreBook = []; this.ht_ftPreBook = []; this.csPreBook = []; this.cornersPreBook = []; this.group_winnerPreBook = [];
    }
    this.oname = oname;
    this.calcProfit();
    if (window.innerWidth < 1100) {
      this.modalService.open(content)
      this.preBook = []; //this.calcProfit();
    }
  }

  clickCashout(content: any, oddsType: string) {
    const selectedOddsType = oddsType == 'MATCH_ODDS' ? this.match_odds
      : oddsType == 'Bookmaker' ? this.bookmaker
        : this.data.find((m: any) => m.mname == oddsType);

    const selectedBook = oddsType == 'MATCH_ODDS' ? this.matchOddsBook
      : oddsType == 'Bookmaker' ? this.bookmakerBook
        : oddsType.startsWith('BM_OVER_UNDER') ? this.bm_over_underBook[oddsType]
          : oddsType.startsWith('OVER_UNDER') ? this.over_underBook[oddsType]
            : oddsType.startsWith('Under/Over') ? this.under_overBook[oddsType]
              : oddsType.startsWith('FIRST_HALF_GOALS') ? this.first_half_goalsBook[oddsType]
                : oddsType.includes('Next Goal') ? this.next_goalBook[oddsType]
                  : oddsType == 'HALF_TIME' ? this.half_timeBook
                    : oddsType == 'Draw No Bet' ? this.draw_no_betBook
                      : oddsType == 'Goals Odd/Even' ? this.goal_odd_evenBook
                        : oddsType == '1X2 Corners' ? this.cornersBook
                          : oddsType == 'CORRECT_SCORE' ? this.csBook
                            : oddsType == 'HT/FT' ? this.ht_ftBook
                              : oddsType.startsWith('BM Group') ? this.group_winnerBook[oddsType]
                                : oddsType.startsWith('Both Teams To Score') ? this.both_team_scoreBook[oddsType]
                                  : oddsType.endsWith('Period Winner') ? this.period_winnerBook[oddsType] : null;
    if (!selectedBook || selectedBook?.length == 0) {
      return;
    }
    const amount1 = selectedBook?.[0]?.amount || 0;
    const amount2 = selectedBook?.[1]?.amount || 0;
    // highest amount
    const highest: any = selectedBook.reduce((prev: any, curr: any) =>
      curr.amount > prev.amount ? curr : prev
    );
    // lowest amount
    const lowest: any = selectedBook.reduce((prev: any, curr: any) =>
      curr.amount < prev.amount ? curr : prev
    );
    const profitx = highest.amount;
    const profity = lowest.amount;
    let odd = 0;
    let sid = 0;
    let oname = "";
    if (amount1 >= 0 && amount2 <= 0 || amount1 <= 0 && amount2 >= 0) { // one side profit another side loss
      const selectedNation = selectedOddsType?.section.find((s: any) => s.nat == lowest.selectionName || s.nat.trim() == lowest.selectionName);
      this.betType = 'back';
      this.betFor = selectedNation?.nat || lowest.selectionName;
      this.rate = selectedNation?.odds.find((o: any) => o.oname == 'back1')?.odds || 0;
      sid = selectedNation?.sid || 0;
      oname = 'back1';
    } else if (amount1 >= 0 && amount2 >= 0) { // both side profit
      const selectedNation = selectedOddsType?.section.find((s: any) => s.nat == highest.selectionName || s.nat.trim() == highest.selectionName);
      this.betType = 'lay';
      this.betFor = selectedNation?.nat || highest.selectionName;
      this.rate = selectedNation?.odds.find((o: any) => o.oname == 'lay1')?.odds || 0;
      oname = 'lay1';
      sid = selectedNation?.sid || 0;
    } else if (amount1 <= 0 && amount2 <= 0) { // both side loss
      const selectedNation = selectedOddsType?.section.find((s: any) => s.nat == lowest.selectionName || s.nat.trim() == lowest.selectionName);
      this.betType = 'back';
      this.betFor = selectedNation?.nat || lowest.selectionName;
      this.rate = selectedNation?.odds.find((o: any) => o.oname == 'back1')?.odds || 0;
      sid = selectedNation?.sid || 0;
      oname = 'back1';
    }
    if (this.rate == 0) {
      this.toastr.error('Odds not available for cashout', '', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        closeButton: true,
      });
      return;
    }
    let decimalOdd = (oddsType == 'Bookmaker' || oddsType.includes('BM_OVER_UNDER') || oddsType.includes('BM Group')) ? (this.rate / 100) + 1 : this.rate;
    if (this.betType === 'back') {
      odd = decimalOdd;       // use O
    } else {
      odd = decimalOdd - 1;   // use O - 1
    }

    this.stake = (profitx - profity) / odd;
    this.openBetForm(content, this.betFor, this.rate, this.betType, oddsType, sid, oname, true)
  }

  placeStake(val: number) {
    this.stake += val;
    this.calcProfit();
  }
  resetStake() {
    this.stake = 0;
    this.profit = 0;
    this.loss = 0;
    this.matchOPreBook = []; this.bmPrebook = []; this.preBook = []; this.calcProfit();
  }

  calculatePreBook(rate_temp: number, book: any[]) {
    return book.map((m: any) => {
      let amt = 0; let name = m.selectionName || m.nat;
      if (this.betFor == name) {
        amt = (this.betType == 'back') ? (this.stake * rate_temp) : -(this.stake * rate_temp);
      } else {
        amt = this.betType == 'back' ? -this.stake : this.stake;
      }
      let oldAmt = m?.amount || 0;
      return { selectionName: name, oldAmount: oldAmt, amount: (Math.round(amt * 100) / 100) + oldAmt };
    });
  }

  calcProfit() {
    //if (!this.stake) return;
    if (this.stake.toString().includes('.')) {
      this.stake = Math.round(this.stake * 100) / 100
    }

    let rate_temp = 0; let book: any[] = [];
    if (this.oddsType == 'MATCH_ODDS') {
      rate_temp = this.rate - 1;
      book = this.matchOddsBook.length > 0 ? this.matchOddsBook : this.match_odds.section;
      this.preBook = this.calculatePreBook(rate_temp, book);
      this.matchOPreBook = this.preBook;
      //console.log(this.preBook)
    } else if (this.oddsType == "Bookmaker") {
      rate_temp = this.rate / 100;
      book = this.bookmakerBook.length > 0 ? this.bookmakerBook : this.bookmaker.section;
      this.preBook = this.bmPrebook = this.calculatePreBook(rate_temp, book);
    } else if (this.oddsType.startsWith('BM_OVER_UNDER')) {
      rate_temp = this.rate / 100;
      book = this.bm_over_underBook[this.oddsType] || (this.bm_over_under.find((f: any) => f.mname == this.oddsType)?.section || [])
      this.preBook = this.bm_over_underPreBook[this.oddsType] = this.calculatePreBook(rate_temp, book);
    } else if (this.oddsType.startsWith('OVER_UNDER')) {
      rate_temp = this.rate - 1;
      book = this.over_underBook[this.oddsType] || (this.over_under.find((f: any) => f.mname == this.oddsType)?.section || []);
      this.preBook = this.over_underPreBook[this.oddsType] = this.calculatePreBook(rate_temp, book);
    } else if (this.oddsType.startsWith('Under/Over')) {
      rate_temp = this.rate - 1;
      book = this.under_overBook[this.oddsType] || (this.under_over.find((f: any) => f.mname == this.oddsType)?.section || []);
      this.preBook = this.under_overPreBook[this.oddsType] = this.calculatePreBook(rate_temp, book);
    } else if (this.oddsType.startsWith('FIRST_HALF_GOALS')) {
      rate_temp = this.rate - 1;
      book = this.first_half_goalsBook[this.oddsType] || (this.first_half_goals.find((f: any) => f.mname == this.oddsType)?.section || []);
      this.preBook = this.first_half_goalsPreBook[this.oddsType] = this.calculatePreBook(rate_temp, book);
    } else if (this.oddsType.includes('Next Goal')) {
      rate_temp = this.rate - 1;
      book = this.next_goalBook[this.oddsType] || (this.next_goal.find((f: any) => f.mname == this.oddsType)?.section || []); // this.next_goal.section; //since market is not in array
      this.preBook = this.next_goalPreBook[this.oddsType] = this.calculatePreBook(rate_temp, book);
    } else if (this.oddsType == 'HALF_TIME') {
      rate_temp = this.rate - 1;
      book = this.half_timeBook.length > 0 ? this.half_timeBook : this.half_time.section; //since market is not in array
      this.preBook = this.half_timePreBook = this.calculatePreBook(rate_temp, book);
    } else if (this.oddsType == 'Draw No Bet') {
      rate_temp = this.rate - 1;
      book = this.draw_no_betBook.length > 0 ? this.draw_no_betBook : this.draw_no_bet.section;
      this.preBook = this.draw_no_betPreBook = this.calculatePreBook(rate_temp, book);
    } else if (this.oddsType.endsWith('Period Winner')) {
      rate_temp = this.rate - 1;
      book = this.period_winnerBook[this.oddsType] || (this.period_winner.find((f: any) => f.mname == this.oddsType)?.section || []);
      this.preBook = this.calculatePreBook(rate_temp, book);
    } else if (this.oddsType.startsWith('Both Teams To Score')) {
      rate_temp = this.rate - 1;
      book = this.both_team_scoreBook[this.oddsType] || (this.both_team_score.find((f: any) => f.mname == this.oddsType)?.section || []);
      this.preBook = this.both_team_scorePreBook[this.oddsType] = this.calculatePreBook(rate_temp, book);
    } else if (this.oddsType == 'Goals Odd/Even') {
      rate_temp = this.rate - 1;
      book = this.goal_odd_evenBook.length > 0 ? this.goal_odd_evenBook : this.goal_odd_even.section;
      this.preBook = this.goal_odd_evenPreBook = this.calculatePreBook(rate_temp, book);
    } else if (this.oddsType == '1X2 Corners') {
      rate_temp = this.rate - 1;
      book = this.cornersBook.length > 0 ? this.cornersBook : this.corners.section;
      this.preBook = this.cornersPreBook = this.calculatePreBook(rate_temp, book);
    } else if (this.oddsType == 'CORRECT_SCORE') {
      rate_temp = this.rate - 1;
      book = this.csBook.length > 0 ? this.csBook : this.correct_score.section;
      this.preBook = this.csPreBook = this.calculatePreBook(rate_temp, book);
    } else if (this.oddsType == 'HT/FT') {
      rate_temp = this.rate - 1;
      book = this.ht_ftBook.length > 0 ? this.ht_ftBook : this.ht_ft.section;
      this.preBook = this.ht_ftPreBook = this.calculatePreBook(rate_temp, book);
    } else if (this.oddsType.startsWith('BM Group')) {
      rate_temp = this.rate / 100;
      book = this.group_winnerBook[this.oddsType] || (this.group_winner.find((f: any) => f.mname == this.oddsType)?.section || []);
      this.preBook = this.group_winnerPreBook[this.oddsType] = this.calculatePreBook(rate_temp, book);
    } else {
      this.profit = 0;
      return;
    }
    this.profit = this.betType == 'back' ? Math.round((this.stake * rate_temp) * 100) / 100 : this.stake;
  }
  betsubmit() {
    this.placeLoader = true;
    let dt = { eventid: this.eventId, eventname: this.eventName, betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, rate: this.rate, stake: this.stake, sid: this.sid, oname: this.oname }
    this.auth.placeFootballBet(dt).subscribe({
      next: (res: any) => {
        this.placeLoader = false;
        this.closeBetform();
        if (res.status == "success") {
          this.auth.getUserBalance(); this.getOpenBets();
          this.toastr.success(res.message, '', {
            timeOut: 3000,
            positionClass: 'toast-top-center',
            closeButton: true,
          });
        }
      },
      error: (e) => {
        this.placeLoader = false;
        this.closeBetform();
        //console.log(e)
        this.toastr.error(e.error.message, '', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          closeButton: true,
        });
      }
    })
  }
  closeBetform() {
    this.modalService.dismissAll();
    this.showbetform = false; this.matchOPreBook = []; this.bmPrebook = [];
    this.matchOPreBook = []; this.bmPrebook = []; this.bm_over_underPreBook = {}; this.first_half_goalsPreBook = {}; this.half_timePreBook = [];
    this.over_underPreBook = {}; this.under_overPreBook = {}; this.period_winnerPreBook = []; this.next_goalPreBook = {}; this.draw_no_betPreBook = [];
    this.goal_odd_evenPreBook = []; this.both_team_scorePreBook = []; this.ht_ftPreBook = []; this.csPreBook = []; this.cornersPreBook = []; this.group_winnerPreBook = [];
    // this.draw_no_bet_newPreBook=[]; this.both_team_score_newBook=[]; this.bm_half_timePreBook=[]; this.total_cornersPreBook=[];

    this.betFor = ""; this.rate = 0; this.betType = ""; this.oddsType = ""; this.sid = 0; this.profit = 0; this.loss = 0; this.stake = 0; this.oname = "";
  }

  getOpenBets() {
    this.auth.getFootballOpenBet(this.eventId).subscribe({
      next: (res: any) => {
        this.openBets = res.openbets;
        this.book = res.books;
        this.book.forEach((item: any) => {
          if (item.oddsType == "MATCH_ODDS") {
            this.matchOddsBook = item.book;
          } else if (item.oddsType == "Bookmaker") {
            this.bookmakerBook = item.book;
          } else if (item.oddsType.startsWith("BM_OVER_UNDER")) {
            this.bm_over_underBook[item.oddsType] = item.book;
          } else if (item.oddsType.startsWith("OVER_UNDER")) {
            this.over_underBook[item.oddsType] = item.book;
          } else if (item.oddsType.startsWith("Under/Over")) {
            this.under_overBook[item.oddsType] = item.book;
          } else if (item.oddsType.startsWith("FIRST_HALF_GOALS")) {
            this.first_half_goalsBook[item.oddsType] = item.book;
          } else if (item.oddsType.includes("Next Goal")) {
            this.next_goalBook[item.oddsType] = item.book;
          } else if (item.oddsType == "HALF_TIME") {
            this.half_timeBook = item.book;
          } else if (item.oddsType == "Draw No Bet") {
            this.draw_no_betBook = item.book;
          } else if (item.oddsType == "Goals Odd/Even") {
            this.goal_odd_evenBook = item.book;
          } else if (item.oddsType == "1X2 Corners") {
            this.cornersBook = item.book;
          } else if (item.oddsType == "CORRECT_SCORE") {
            this.csBook = item.book;
          } else if (item.oddsType == "HT/FT") {
            this.ht_ftBook = item.book;
          } else if (item.oddsType.startsWith("BM Group")) {
            this.group_winnerBook[item.oddsType] = item.book;
          } else if (item.oddsType.startsWith("Both Teams To Score")) {
            this.both_team_scoreBook[item.oddsType] = item.book;
          } else if (item.oddsType.endsWith("Period Winner")) {
            this.period_winnerBook[item.oddsType] = item.book;
          }
        });
      },
      error: (e) => {} /* console.log(e) */
    })
  }
  removeFullstop(str: any) { //need for bookmaker2 
    if (str.charAt(str.length - 1) === '.') {
      return str.slice(0, -1);
    } else {
      return str;
    }
  }
  calculateIncrement(currentValue: number): number {
    if (currentValue > 100) return 10;
    if (currentValue >= 50) return 5;
    if (currentValue >= 30) return 2;
    if (currentValue >= 20) return 1;
    if (currentValue >= 10) return 0.5;
    if (currentValue >= 9) return 0.2;
    if (currentValue >= 6) return 0.2;
    if (currentValue >= 5) return 0.2;
    if (currentValue >= 4) return 0.1;
    if (currentValue >= 3) return 0.05;
    if (currentValue >= 2) return 0.02;
    if (currentValue >= 1) return 0.01;
    return 0;
  }
  ratePlus() {
    const increment = this.calculateIncrement(this.rate);
    this.rate += increment;
    this.rate = Math.round(this.rate * 100) / 100;
    this.calcProfit();
  }
  rateMinus() {
    const decrement = this.calculateIncrement(this.rate);
    this.rate -= decrement;
    this.rate = Math.round(this.rate * 100) / 100;
    this.calcProfit();
  }
  twoDecimal(num: number) {
    if (num) return num.toFixed(2);
    return 0.00;
  }
  animationTimer() {
    setTimeout(() => {
      this.timer = true;
      //console.log(this.noDataTimer)
    }, 4000);
  }
  marketNotAvailable() {
    this.noMarketInterval = setInterval(() => {
      if (this.data.length != 0) {
        this.isLoading = false;
      }
    }, 250)
    setTimeout(() => {
      if (!this.data) {
        this.toastr.error('There are no markets available in this game!', '', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          closeButton: true,
        });
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 300);
      }
    }, 5000);
  }
  gameTabClicked() {
    this.bettab = false;
    this.gametab = true;
  }
  betTabClicked() {
    this.bettab = true;
    this.gametab = false;
  }

  clickSetButton(name: any) {
    this.setButtonTab = name
  }
  openButtons(content: any) {
    this.auth.getButtons().subscribe({
      next: (res) => {
        this.userButtons = res;
        this.modalService.open(content, { size: 'md' });
      }, error: (e) => {
        //console.log(e)
      }
    })
  }

  updateButtons() {
    this.auth.updateButtons(this.userButtons).subscribe({
      next: (res: any) => {
        this.toastr.success(res.message, '', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          closeButton: true,
        });
        this.placeBetButton();
        this.modalService.dismissAll();
      }, error: (e) => {
        this.toastr.error(e.error.message, '', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          closeButton: true,
        });
        this.modalService.dismissAll();
      }
    })
  }
}