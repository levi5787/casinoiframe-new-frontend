import { Component, HostListener } from '@angular/core';
import { FooterComponent } from "../footer/footer.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { HeaderComponent } from "../header/header.component";
import { UserauthService } from '../services/userauth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SocketService } from '../services/socket.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatchService } from '../services/match.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ShortNumberPipe } from '../pipes/short-number.pipe';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-gamedetail-tennis',
  standalone: true,
  imports: [FooterComponent, SidebarComponent, HeaderComponent, FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './gamedetail-tennis.component.html',
  styleUrl: './gamedetail-tennis.component.css'
})
export class GamedetailTennisComponent {

  userButtons: any = {}; setButtonTab = "game"; isCashout = false;
  isSticky = false; sidebarTopOffset = 124; placeLoader = false; isLoading = true; gametab = true; bettab = false;
  safeURL: any; safeURLmbl: any; animationURL: any = ""; tvURL: any; beventId: any; tv: any;
  eventId: any; eventName: any; date: any; liveon = false; timer = false;
  betFor = ""; rate = 0; odds = 0; betType = ""; oddsType = ""; stake = 0; profit = 0; loss = 0; showbetform = false; sid: any; oname: any;
  data: any = []; placebetButton: any = [];

  match_odds: any = []; bookmaker: any = []; UnderOvers: any = []; setWinner: any = [];
  gameWinner: any = []; setWinnerHA: any = []; gameToDeuce: any = [];
  openBets: any; book: any = []; matchOddsBook = []; bookmakerBook = [];
  setWinnerBooks: any = {}; gameWinnerBooks: any = {}; underOversBooks: any = {}; gameToDeuceBook: any = {};
  matchOPreBook: any = []; bmPrebook: any = []; preBook: any = []; gameToDeucePreBook: any = {};
  setWinnerPreBooks: any = {}; gameWinnerPreBooks: any = {}; underOversPreBooks: any = {};
  dataChangedTime: any; dataCheckInterval: any; noMarketInterval: any;

  constructor(
    private auth: UserauthService,
    private match_service: MatchService,
    private _sanitizer: DomSanitizer,
    private game_socket: SocketService,
    private activated_route: ActivatedRoute,
    private toastr: ToastrService,
    private modalService: NgbModal,
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
      next: (res: any) => {
        this.eventName = res.eventName; this.date = res.date; this.beventId = res.beventId; this.tv = res.tv;
        //console.log(this.beventId, res)
        // sports tv
        //this.tvURL = this.match_service.getSportstvVideo()
        //this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.tvURL + this.eventId + "&sportid=2")
      },
      error: (e) => {} /* console.log(e) */
    })
    this.getOpenBets();
    this.placeBetButton();
    this.getScoreAnimation();
    this.marketNotAvailable();
    this.animationTimer();
    this.socketEmit();
    this.dataCheckInterval = setInterval(() => {
      let now = new Date().getTime();
      if ((now - this.dataChangedTime) > 3000) {
        this.socketEmit();
      }
    }, 3 * 1000)
  }

  getLiveTvURL() {
    this.match_service.getOthersTvURL({ sportId: '2', eventId: this.eventId, oldgmid: this.beventId }).subscribe({
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
      // this.UnderOvers = this.data.filter((m: any) => m.mname.startsWith('Under/Over'));
      // this.setWinner = this.data.filter((m: any) => m.mname.endsWith('Set Winner'));
      // this.setWinnerHA = this.data.filter((m: any) => m.mname.endsWith('Winner Home/Away'));
      // this.gameWinner = this.data.filter((m: any) => m.mname.startsWith('Game Winner'));
      // this.gameToDeuce = this.data.filter((m: any) => m.mname.startsWith('Game To Deuce'));
      this.data.forEach((item: any) => {
        if (item.mname == "MATCH_ODDS") {
          this.match_odds = item
        } else if (item.mname == "Bookmaker") {
          this.bookmaker = item
        }
      });
    });
  }
  getScoreAnimation() {
    // score animation
    this.match_service.getScoreAnimation('2', this.eventId).subscribe({
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
    this.profit = 0; this.matchOPreBook = []; this.bmPrebook = []; this.setWinnerPreBooks = {};
    this.gameWinnerPreBooks = {}; this.underOversPreBooks = {}; this.gameToDeucePreBook = [];
    this.loss = 0
    this.isCashout = isCashout;
    if (!isCashout) {
      this.stake = 0;
    }
    this.oname = oname;
    this.calcProfit();
    if (window.innerWidth < 768) {
      this.modalService.open(content)
      this.preBook = []; this.calcProfit();
    }
  }

  clickCashout(content: any, oddsType: string) {
    const selectedOddsType = oddsType == 'MATCH_ODDS' ? this.match_odds
      : oddsType == 'Bookmaker' ? this.bookmaker
        : this.data.find((m: any) => m.mname == oddsType);

    const selectedBook = oddsType == 'MATCH_ODDS' ? this.matchOddsBook
      : oddsType == 'Bookmaker' ? this.bookmakerBook
        : oddsType.includes('Set Winner') ? this.setWinnerBooks[oddsType]
          : oddsType.includes('Game Winner') ? this.gameWinnerBooks[oddsType]
            : oddsType.includes('Under/Over') ? this.underOversBooks[oddsType]
              : oddsType.includes('Game To Deuce') ? this.gameToDeuceBook[oddsType] : null;
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
    let decimalOdd = (oddsType == 'Bookmaker' || oddsType.includes('Set Winner')) ? (this.rate / 100) + 1 : this.rate;
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
    this.matchOPreBook = []; this.bmPrebook = []; this.setWinnerPreBooks = {};
    this.gameWinnerPreBooks = {}; this.underOversPreBooks = {}; this.gameToDeucePreBook = {};
    this.preBook = []; this.calcProfit();
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
    //if(!this.stake)return;
    if (this.stake.toString().includes('.')) {
      this.stake = Math.round(this.stake * 100) / 100
    }

    let rate_temp = 0; let book: any[] = [];
    if (this.oddsType == 'MATCH_ODDS') {
      rate_temp = this.rate - 1;
      book = this.matchOddsBook.length > 0 ? this.matchOddsBook : this.match_odds.section;
      this.preBook = this.matchOPreBook = this.calculatePreBook(rate_temp, book);
      //console.log(this.preBook)
    } else if (this.oddsType == "Bookmaker") {
      rate_temp = this.rate / 100;
      book = this.bookmakerBook.length > 0 ? this.bookmakerBook : this.bookmaker.section;
      this.preBook = this.bmPrebook = this.calculatePreBook(rate_temp, book);
    } else if (this.oddsType.includes('Set Winner')) {
      rate_temp = this.rate / 100;
      book = this.setWinnerBooks[this.oddsType] || (this.setWinner.find((f: any) => f.mname == this.oddsType)?.section || []);
      this.preBook = this.setWinnerPreBooks[this.oddsType] = this.calculatePreBook(rate_temp, book);
    } else if (this.oddsType.includes('Game Winner')) {
      rate_temp = this.rate - 1;
      book = this.gameWinnerBooks[this.oddsType] || (this.gameWinner.find((f: any) => f.mname == this.oddsType)?.section || []);
      this.preBook = this.gameWinnerPreBooks[this.oddsType] = this.calculatePreBook(rate_temp, book);
    } else if (this.oddsType.includes('Under/Over')) {
      rate_temp = this.rate - 1;
      book = this.underOversBooks[this.oddsType] || (this.UnderOvers.find((f: any) => f.mname == this.oddsType)?.section || []);
      this.preBook = this.underOversPreBooks[this.oddsType] = this.calculatePreBook(rate_temp, book);
    } else if (this.oddsType.includes('Game To Deuce')) {
      rate_temp = this.rate - 1;
      book = this.gameToDeuceBook[this.oddsType] || (this.gameToDeuce.find((f: any) => f.mname == this.oddsType)?.section || []);
      this.preBook = this.gameToDeucePreBook[this.oddsType] = this.calculatePreBook(rate_temp, book);
    } else {
      this.profit = 0;
      return;
    }
    this.profit = this.betType == 'back' ? Math.round((this.stake * rate_temp) * 100) / 100 : this.stake;
  }
  betsubmit() {
    this.placeLoader = true;
    let dt = { eventid: this.eventId, eventname: this.eventName, betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, rate: this.rate, stake: this.stake, sid: this.sid, oname: this.oname }
    this.auth.placeTennisBet(dt).subscribe({
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
    this.showbetform = false; this.matchOPreBook = []; this.bmPrebook = []; this.setWinnerPreBooks = {}; this.gameWinnerPreBooks = {}; this.underOversPreBooks = {}; this.gameToDeucePreBook = {};
    this.betFor = ""; this.rate = 0; this.betType = ""; this.oddsType = ""; this.sid = 0; this.profit = 0; this.loss = 0; this.stake = 0; this.oname = "";
  }

  getOpenBets() {
    this.auth.getTennisOpenBet(this.eventId).subscribe({
      next: (res: any) => {
        this.openBets = res.openbets;
        this.book = res.books;
        this.book.forEach((item: any) => {
          if (item.oddsType == "MATCH_ODDS") {
            this.matchOddsBook = item.book;
          } else if (item.oddsType == "Bookmaker") {
            this.bookmakerBook = item.book;
          } else if (item.oddsType.includes('Set Winner')) {
            this.setWinnerBooks[item.oddsType] = item.book;
          } else if (item.oddsType.includes('Game Winner')) {
            this.gameWinnerBooks[item.oddsType] = item.book;
          } else if (item.oddsType.includes('Under/Over')) {
            this.underOversBooks[item.oddsType] = item.book;
          } else if (item.oddsType.includes('Game To Deuce')) {
            this.gameToDeuceBook[item.oddsType] = item.book;
          }
        });
      },
      error: (e) => {} /* console.log(e) */
    })
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
