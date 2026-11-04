import { Component, ChangeDetectorRef, inject, NgModule, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatchService } from '../services/match.service';
import { SocketService } from '../services/socket.service';
import { UserauthService } from '../services/userauth.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ContainerComponent } from '../container/container.component';
import { ShortNumberPipe } from '../pipes/short-number.pipe';

@Component({
  selector: 'app-gamedetail-politics',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent, FooterComponent, SidebarComponent, ShortNumberPipe],
  templateUrl: './gamedetail-politics.component.html',
  styleUrl: './gamedetail-politics.component.css'
})
export class GamedetailPoliticsComponent {

  userButtons: any = {}; setButtonTab = "game";
  private sub !: Subscription; safeURL: any; safeURLmbl: any; tvURL: any; dataTimer = false; gametab = true; bettab = false;
  isSticky = false; sidebarTopOffset = 124; placebetButton: any = []; loader = false; placeLoader = false; isLoading = true;
  eventId: any; oldgmid: any; eventName: any; mType: any; date: any; tv: any; inplay: any; liveon = false; activeFancyTab = 'fancy1';
  fancy1tab = true; metertab = false; khadotab = false; oddeventab = false;
  betFor = ""; rate = 0; betType = ""; oddsType = ""; stake = 0; profit = 0; loss = 0; showbetform = false; sid: any; oname: any; min: any; max: any;
  data: any = []; t1: any = []; t2: any = []; t3: any = []; t4: any = [];

  match_odds: any = []; bookmaker: any = []; bookmaker2: any = []; bm10over: any = []; normal_fancy: any = [];
  ballbyball: any = []; overbyover: any = []; fancy1: any = []; oddeven: any = []; meter: any = []; khado: any = [];
  tied_match: any = []; completed_match: any = []; tied_match_bm: any = []; completed_match_bm: any = []; cricket_casino: any = [];

  openBets: any = []; book: any = []; matchOddsBook = []; bookmakerBook = []; bm2Book = []; fancyBook: any = {}; fancy1Book: any = {}; oddEvenBook: any = {};
  meterBook: any = {}; khadoBook: any = {}; fancyBookDetail: any = [];
  TMBook: any = []; TMBMBook: any = []; CMBook: any = []; CMBMBook: any = []; preBook: any = [];
  matchOPreBook: any = []; bmPrebook: any = []; bm2PreBook: any = []; TMPreBook: any = []; TMBMPreBook: any = []; CMPreBook: any = []; CMBMPreBook: any = [];
  dataChangedTime: any; dataCheckInterval: any; noMarketInterval: any;

  private sub1 !: Subscription; title = 'scoreboard'; gmid: any; scoredata: any;
  team1 = ""; team2 = ""; score1 = ""; score2 = ""; msg = "";
  runrate1 = ""; runrate2 = ""; reqrate1 = ""; reqrate2 = "";
  balls = []; screenSize: any;
  desktopview = true;

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
      next: (res: any) => {
        this.eventName = res.eventName; this.date = res.date
        this.tv = res.tv; this.inplay = res.inPlay; this.mType = res.mType; this.oldgmid = res.oldgmid;
        // live tv
        this.tvURL = "https://tv.dada09.com/livetv.php?eventId=";
        this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.tvURL + this.oldgmid)
      },
      error: (e) => console.log(e)
    })

    // live tv
    //this.tvURL = this.match_service.getLivetvVideo()
    //this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.tvURL + this.eventId)

    //this.getLiveTvURL();
    this.dataCheckTimer()
    this.getOpenBets();
    this.placeBetButton();
    this.marketNotAvailable();
    this.socketEmit();
    this.dataCheckInterval = setInterval(() => {
      let now = new Date().getTime();
      if ((now - this.dataChangedTime) > 3000) {
        this.socketEmit();
      }
    }, 3 * 1000)
  }

  getLiveTvURL() {
    this.match_service.getOthersTvURL(this.gmid).subscribe({
      next: (res: any) => {
        //console.log(res)
        this.tvURL = res.url
        if (window.innerWidth < 1200) {
          this.safeURLmbl = this._sanitizer.bypassSecurityTrustResourceUrl(this.tvURL)
        } else {
          this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.tvURL)
        }
      }, error: (e) => {
        console.log(e)
      }
    })
  }

  socketEmit() {
    this.sub = this.game_socket.gamedata('Market', this.eventId).subscribe((data: any) => {
      //console.log(data)
      this.dataChangedTime = new Date().getTime();
      this.data = data['data'];
      this.gmid = data['data'][0]['gmid'];
      //console.log(this.gmid)
      for (let i = 0; i < this.data.length; i++) {
        //console.log(this.data[i]['mname'])
        if (this.data[i]['mname'] == "MATCH_ODDS"
          || this.data[i]['mname'].includes("TOURNAMENT_WINNER")) {
          this.match_odds = this.data[i]
        }
        if (this.data[i]['mname'] == "Bookmaker"
          || this.data[i]['mname'].includes("Bookmaker IPL CUP")) {
          this.bookmaker = this.data[i]
        }
        if (this.data[i]['mname'] == "Bookmaker 2") {
          this.bookmaker2 = this.data[i]
        }
        if (this.data[i]['mname'] == "Normal") {
          this.normal_fancy = this.data[i]
        }
        if (this.data[i]['mname'] == "fancy1") {
          this.fancy1 = this.data[i]
        }
        if (this.data[i]['mname'] == "oddeven") {
          this.oddeven = this.data[i]
        }
      }
    });

    this.sub1 = this.game_socket.scoredata('Score', this.eventId).subscribe((scoredata: any) => {
      //console.log(data);
      if (scoredata) {
        this.scoredata = scoredata?.data;
        this.team1 = this.scoredata?.spnnation1;
        this.team2 = this.scoredata?.spnnation2;
        this.score1 = this.scoredata?.score1;
        this.score2 = this.scoredata?.score2;
        this.runrate1 = this.scoredata?.spnrunrate1;
        this.runrate2 = this.scoredata?.spnrunrate2;
        this.reqrate1 = this.scoredata?.spnreqrate1;
        this.reqrate2 = this.scoredata?.spnreqrate2;
        this.msg = this.scoredata?.spnmessage;
        this.balls = this.scoredata?.balls
      }
    })
  }
  ngAfterViewInit() {
    setTimeout(() => {
      //this.isLoading = false;
      this.cdr.detectChanges();
    }, 300);
  }
  openRule(content: any) {
    this.loader = true;
    setTimeout(() => {
      this.loader = false;
      this.modalService.open(content, { size: 'xl' });
    }, 600);
  }
  placeBetButton() {
    this.auth.getButtons().subscribe({
      next: (res: any) => {
        this.placebetButton = res.gamebutton;
      }, error: (e) => console.log(e)
    })
  }
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.sub1) {
      this.sub1.unsubscribe();
    }
    this.game_socket.leavaAllRooms();
    if (this.dataCheckInterval) {
      clearInterval(this.dataCheckInterval)
    }
    if (this.noMarketInterval) {
      clearInterval(this.noMarketInterval)
    }
  }
  liveClicked() {
    this.liveon = !this.liveon
    // if (this.liveon) {
    //   this.getLiveTvURL();
    // }
  }
  fancyTabChange(name: string) {
    this.activeFancyTab = name
  }
  arrayFirstHalf(data: any) {
    let half = Math.ceil(data.length / 2);
    return data.slice(0, half)
  }
  arraySecondHalf(data: any) {
    let half = Math.ceil(data.length / 2);
    return data.slice(half, data.length)
  }
  trackByFunc(index: number, item: any) {
    return item.sid;
  }
  openBetForm(content: any, betfor: any, rate: any, bettype: any, oddstype: any, sid: any, oname: any, min: number = 0, max: number = 0) {
    this.showbetform = true
    this.betFor = betfor
    this.rate = rate
    this.betType = bettype
    this.oddsType = oddstype
    this.sid = sid
    this.profit = 0;
    this.matchOPreBook = []; this.bmPrebook = []; this.bm2PreBook = []; this.TMPreBook = [];
    this.TMBMPreBook = []; this.CMPreBook = []; this.CMBMPreBook = [];
    this.loss = 0
    this.stake = 0
    this.oname = oname;
    this.min = min;
    this.max = max;
    if (window.innerWidth < 768) {
      this.modalService.open(content);
      this.preBook = []; this.calcProfit();
    }
  }
  placeStake(val: number) {
    this.stake += val;
    this.calcProfit();
  }
  resetStake() {
    this.stake = 0;
    this.profit = 0;
    this.loss = 0;
    this.matchOPreBook = []; this.bmPrebook = []; this.bm2PreBook = []; this.preBook = []; this.calcProfit();
  }

  calcProfit() {
    //if(!this.stake)return;
    if (this.stake.toString().includes('.')) this.stake = Math.floor(this.stake)

    let rate_temp = 0; this.preBook = [];
    if (this.oddsType == 'MATCH_ODDS') {
      rate_temp = this.rate - 1;

      let preBook: any = [];
      if (this.matchOddsBook.length > 0) {
        preBook = this.matchOddsBook.map((m: any) => {
          let amt = 0;
          if (this.betFor == m.selectionName) {
            amt = (this.betType == 'back') ? (this.stake * rate_temp) : -(this.stake * rate_temp)
          } else {
            amt = this.betType == 'back' ? -this.stake : this.stake;
          }
          return { selectionName: m.selectionName, oldAmount: m.amount, amount: (Math.round(amt * 100) / 100) + m.amount }
        });
      } else {
        preBook = this.match_odds.section.map((m: any) => {
          let amt = 0;
          if (this.betFor == m.nat) {
            amt = (this.betType == 'back') ? (this.stake * rate_temp) : -(this.stake * rate_temp)
          } else {
            amt = this.betType == 'back' ? -this.stake : this.stake;
          }
          return { selectionName: m.nat, oldAmount: 0, amount: Math.round(amt * 100) / 100 }
        });
      }

      this.preBook = preBook;
      this.matchOPreBook = preBook;

    } else if (this.oddsType == "Bookmaker" || this.oddsType == "Bookmaker 2") {
      rate_temp = (this.rate / 100);
      let book = this.oddsType == "Bookmaker" ? this.bookmakerBook : this.bm2Book;
      //console.log(book)
      let preBook: any = [];
      if (book.length > 0) {
        preBook = book.map((m: any) => {
          let amt = 0;
          if (this.betFor == m.selectionName) {
            amt = (this.betType == 'back') ? (this.stake * rate_temp) : -(this.stake * rate_temp)
          } else {
            amt = this.betType == 'back' ? -this.stake : this.stake;
          }
          return { selectionName: m.selectionName, oldAmount: m.amount, amount: (Math.round(amt * 100) / 100) + m.amount }
        });
      } else {
        let data = this.oddsType == 'Bookmaker' ? this.bookmaker.section : this.bookmaker2.section;
        preBook = data.map((m: any) => {
          let amt = 0;
          if (this.betFor == (this.oddsType == 'Bookmaker' ? m.nat : this.removeFullstop(m.nat))) {
            amt = (this.betType == 'back') ? (this.stake * rate_temp) : -(this.stake * rate_temp)
          } else {
            amt = this.betType == 'back' ? -this.stake : this.stake;
          }
          return { selectionName: m.nat, oldAmount: 0, amount: Math.round(amt * 100) / 100 }
        });
      }

      this.preBook = preBook;
      if (this.oddsType == 'Bookmaker') { this.bmPrebook = preBook } else { this.bm2PreBook = preBook }
    } else if (this.oddsType == "TIED_MATCH" || this.oddsType == "COMPLETED_MATCH") {
      rate_temp = this.rate - 1;
      let book = this.oddsType == "TIED_MATCH" ? this.TMBook : this.CMBook;
      //console.log(book)
      let preBook: any = [];
      if (book.length > 0) {
        preBook = book.map((m: any) => {
          let amt = 0;
          if (this.betFor == m.selectionName) {
            amt = (this.betType == 'back') ? (this.stake * rate_temp) : -(this.stake * rate_temp)
          } else {
            amt = this.betType == 'back' ? -this.stake : this.stake;
          }
          return { selectionName: m.selectionName, oldAmount: m.amount, amount: (Math.round(amt * 100) / 100) + m.amount }
        });
      } else {
        let data = this.oddsType == 'TIED_MATCH' ? this.tied_match.section : this.completed_match.section;
        preBook = data.map((m: any) => {
          let amt = 0;
          if (this.betFor == m.nat) {
            amt = (this.betType == 'back') ? (this.stake * rate_temp) : -(this.stake * rate_temp)
          } else {
            amt = this.betType == 'back' ? -this.stake : this.stake;
          }
          return { selectionName: m.nat, oldAmount: 0, amount: Math.round(amt * 100) / 100 }
        });
      }

      this.preBook = preBook;
      if (this.oddsType == 'TIED_MATCH') { this.TMPreBook = preBook } else { this.CMPreBook = preBook }

    } else if (this.oddsType == "Tied Match" || this.oddsType == "Completed Match") {
      rate_temp = (this.rate / 100);
      let book = this.oddsType == "Tied Match" ? this.TMBMBook : this.CMBMBook;
      //console.log(book)
      let preBook: any = [];
      if (book.length > 0) {
        preBook = book.map((m: any) => {
          let amt = 0;
          if (this.betFor == m.selectionName) {
            amt = (this.betType == 'back') ? (this.stake * rate_temp) : -(this.stake * rate_temp)
          } else {
            amt = this.betType == 'back' ? -this.stake : this.stake;
          }
          return { selectionName: m.selectionName, oldAmount: m.amount, amount: (Math.round(amt * 100) / 100) + m.amount }
        });
      } else {
        let data = this.oddsType == 'Tied Match' ? this.tied_match_bm.section : this.completed_match_bm.section;
        preBook = data.map((m: any) => {
          let amt = 0;
          if (this.betFor == (this.oddsType == 'Tied Match' ? m.nat : this.removeFullstop(m.nat))) {
            amt = (this.betType == 'back') ? (this.stake * rate_temp) : -(this.stake * rate_temp)
          } else {
            amt = this.betType == 'back' ? -this.stake : this.stake;
          }
          return { selectionName: m.nat, oldAmount: 0, amount: Math.round(amt * 100) / 100 }
        });
      }

      this.preBook = preBook;
      if (this.oddsType == 'Tied Match') { this.TMBMPreBook = preBook } else { this.CMBMPreBook = preBook }

    } else if (this.oddsType == "Khado") {
      let khado = parseInt(this.betFor.split(' - ')[1]) || 0;
      this.profit = this.rate + khado - 1;
      return;
    } else {
      this.profit = 0;
      return;
    }
    this.profit = this.betType == 'back' ? Math.round((this.stake * rate_temp) * 100) / 100 : this.stake;
  }

  betsubmit() {
    this.placeLoader = true;
    let dt = { eventid: this.eventId, eventname: this.eventName, betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, rate: this.rate, stake: this.stake, sid: this.sid, oname: this.oname }
    this.auth.placewbet(dt).subscribe({
      next: (res: any) => {
        this.placeLoader = false;
        this.closeBetform();
        if (res.status == "success") {
          this.toastr.success(res.message, '', {
            timeOut: 3000,
            positionClass: 'toast-top-center',
            closeButton: true,
          });
          setTimeout(() => {
            this.auth.getUserBalance(); this.getOpenBets();
          }, 1000);
        }
      },
      error: (e) => {
        //console.log(e)
        this.placeLoader = false;
        this.closeBetform();
        this.toastr.error(e.error.message, '', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          closeButton: true,
        });
      }
    })
  }
  closeBetform() {
    this.showbetform = false; this.matchOPreBook = []; this.bmPrebook = []; this.bm2PreBook = [];
    this.betFor = ""; this.rate = 0; this.betType = ""; this.oddsType = ""; this.sid = 0; this.profit = 0; this.loss = 0; this.stake = 0; this.oname = "";
    this.modalService.dismissAll();
  }
  getOpenBets() {
    this.auth.getopenbet(this.eventId).subscribe({
      next: (res: any) => {
        this.openBets = res.openbets;
        this.book = res.books;
        let fancy: any = []; let fancy1: any = []; let meter: any = []; let khado: any = []; let oddeven: any = [];
        this.book.forEach((item: any) => {
          if (item.oddsType == "MATCH_ODDS" || item.oddsType == "TOURNAMENT_WINNER") {
            this.matchOddsBook = item.book;
          } else if (item.oddsType == "Bookmaker" || item.oddsType == "Womens Premier League Cup") {
            this.bookmakerBook = item.book;
          } else if (item.oddsType == "Bookmaker 2") {
            this.bm2Book = item.book;
          } else if (item.oddsType == "TIED_MATCH") {
            this.TMBook = item.book;
          } else if (item.oddsType == "Tied Match") {
            this.TMBMBook = item.book;
          } else if (item.oddsType == "COMPLETED_MATCH") {
            this.CMBook = item.book;
          } else if (item.oddsType == "Completed Match") {
            this.CMBMBook = item.book;
          } else if (item.oddsType == "Fancy") {
            fancy.push(item);
          } else if (item.oddsType == "Fancy1") {
            fancy1.push(item);
          } else if (item.oddsType == "Meter") {
            meter.push(item);
          } else if (item.oddsType == "Khado") {
            khado.push(item);
          } else if (item.oddsType == "OddEven") {
            oddeven.push(item);
          }
        });
        this.fancyBook = fancy.reduce((result: any, item: any) => {
          result[item.fancyName] = -Math.abs(item.book);
          return result;
        }, {});
        this.fancy1Book = fancy1.reduce((result: any, item: any) => {
          result[item.fancyName] = -Math.abs(item.book);
          return result;
        }, {});
        this.oddEvenBook = oddeven.reduce((result: any, item: any) => {
          result[item.fancyName.replace(/\s\([ODD|EVEN]+\)$/, '').trim()] = -Math.abs(item.book);
          return result;
        }, {});
        this.khadoBook = khado.reduce((result: any, item: any) => {
          result[item.fancyName.split(' - ')[0]] = -Math.abs(item.book);
          return result;
        }, {});
        this.meterBook = meter.reduce((result: any, item: any) => {
          result[item.fancyName] = -Math.abs(item.book);
          return result;
        }, {});
      },
      error: (e) => console.log(e)
    })
  }
  getFancyBook(content: any, oddsType: string, fancyId: any) {
    this.fancyBookDetail = [];
    const dt = { eventId: this.eventId, oddsType, fancyId }
    this.auth.getfancybook(dt).subscribe({
      next: (res) => {
        this.fancyBookDetail = res;
        if (this.fancyBookDetail.length > 0) {
          this.modalService.open(content, { size: 'm' });
        }
      },
      error: (e) => console.log(e)
    })
  }
  removeFullstop(str: any) { //need for bookmaker2 
    if (str.charAt(str.length - 1) === '.') {
      return str.slice(0, -1);
    } else {
      return str;
    }
  }
  getFancybook(selectionName: string) {
    let book = this.fancyBook.find((obj: any) => obj.fancyName == selectionName)
    if (book) {
      return -Math.abs(book.book);
    } else {
      return 0;
    }
  }
  calculateIncrement(currentValue: number): number {
    if (currentValue > 100) {
      return 10;
    } else if (currentValue >= 50) {
      return 5;
    } else if (currentValue >= 30) {
      return 2;
    } else if (currentValue >= 20) {
      return 1;
    } else if (currentValue >= 10) {
      return 0.5;
    } else if (currentValue >= 9) {
      return 0.2;
    } else if (currentValue >= 6) {
      return 0.2;
    } else if (currentValue >= 5) {
      return 0.2;
    } else if (currentValue >= 4) {
      return 0.1;
    } else if (currentValue >= 3) {
      return 0.05;
    } else if (currentValue >= 2) {
      return 0.02;
    } else if (currentValue >= 1) {
      return 0.01;
    } else {
      return 0;
    }
  }
  ratePlus() {
    const increment = this.oddsType == "Khado" ? 1 : this.calculateIncrement(this.rate);
    this.rate += increment;
    this.rate = Math.round(this.rate * 100) / 100;
    this.calcProfit();
  }
  rateMinus() {
    const decrement = this.oddsType == "Khado" ? 1 : this.calculateIncrement(this.rate);
    this.rate -= decrement;
    this.rate = Math.round(this.rate * 100) / 100;
    this.calcProfit();
  }
  twoDecimal(num: number) {
    if (num) return num.toFixed(2);
    return 0.00;
  }
  dataCheckTimer() {
    setTimeout(() => {
      if (this.data.length != 0) {
        this.dataTimer = true;
      }
      //console.log(this.noDataTimer)
    }, 1700);
  }
  marketNotAvailable() {
    this.noMarketInterval = setInterval(() => {
      if (this.data.length != 0) {
        this.isLoading = false;
      }
    }, 250)
    setTimeout(() => {
      if (this.data.length == 0) {
        this.toastr.error('There are no markets available in this game!', '', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          closeButton: true,
        });
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 300);
      }
    }, 8000);
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
        console.log(e)
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
