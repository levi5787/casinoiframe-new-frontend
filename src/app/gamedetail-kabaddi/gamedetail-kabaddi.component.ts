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
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gamedetail-kabaddi',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent, FooterComponent, CommonModule, ShortNumberPipe, FormsModule],
  templateUrl: './gamedetail-kabaddi.component.html',
  styleUrl: './gamedetail-kabaddi.component.css'
})
export class GamedetailKabaddiComponent {

  userButtons: any = {}; setButtonTab = "game";
  private sub !: Subscription; safeURL: any; tvURL: any; safeURLmbl:any; gametab = true; bettab = false;
  isSticky = false; sidebarTopOffset = 124; placebetButton: any = []; loader = false; placeLoader = false; isLoading = true;
  eventId: any; eventName: any; date: any; tv: any; inplay: any; liveon = false; activeFancyTab = 'fancy1';
  fancy1tab = true; metertab = false; khadotab = false; oddeventab = false;
  betFor = ""; rate = 0; betType = ""; oddsType = ""; stake = 0; profit = 0; loss = 0; showbetform = false; sid: any; oname: any;
  data: any = []; t1: any = []; t2: any = []; t3: any = []; t4: any = [];

  match_odds: any = []; bookmaker: any = []; bookmaker2:any; normal_fancy: any = []; fancy1: any = []; oddeven: any = []; meter:any=[]; khado:any=[];

  openBets: any = []; book: any = []; matchOddsBook = []; bookmakerBook = []; bm2Book=[]; fancyBook: any = {};
  fancy1Book: any = {}; oddEvenBook: any = {}; fancyBookDetail: any = [];
  matchOPreBook: any = []; bmPrebook: any = []; bm2PreBook=[]; preBook:any=[];
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
      next: (res: any) => { this.eventName = res.eventName, this.date = res.date },
      error: (e) => console.log(e)
    })
    // live tv
    //this.tvURL = this.match_service.getLivetvVideo()
    //this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.tvURL + this.eventId)

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
    this.match_service.getOthersTvURL(this.eventId).subscribe({
      next: (res: any) => {
        //console.log(res)
        this.tvURL = res.url
        if(window.innerWidth < 1200) {
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
      for (let i = 0; i < this.data.length; i++) {
        //console.log(this.data[i]['mname'])
        if (this.data[i]['mname'] == "MATCH_ODDS") {
          this.match_odds = this.data[i]
        }
        if (this.data[i]['mname'] == "Bookmaker") {
          this.bookmaker = this.data[i]
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
        if (this.data[i]['mname'] == "meter") {
          this.meter = this.data[i]
        }
        if (this.data[i]['mname'] == "khado") {
          this.khado = this.data[i]
        }
      }
    });
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
        //console.log(this.placebetButton)
      }, error: (e) => console.log(e)
    })
  }
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
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
    this.liveon = !this.liveon;
    if(this.liveon) {
      this.getLiveTvURL();
    }
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
  openBetForm(content:any, betfor: any, rate: any, bettype: any, oddstype: any, sid: any, oname: any) {
    this.showbetform = true
    this.betFor = betfor
    this.rate = rate
    this.betType = bettype
    this.oddsType = oddstype
    this.sid = sid
    this.profit = 0;
    this.matchOPreBook = []; this.bmPrebook = [];
    this.loss = 0
    this.stake = 0
    this.oname = oname;
    if (window.innerWidth < 1100) {
      this.modalService.open(content)
      this.preBook=[]; this.calcProfit();
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
    this.matchOPreBook = []; this.bmPrebook = [];
  }
  // calcProfit() {
  //   if (!this.stake) return;
  //   if (this.stake.toString().includes('.')) this.stake = Math.floor(this.stake)

  //   let rate_temp = 0; //let existBook = [];
  //   if (this.oddsType == 'MATCH_ODDS') {
  //     rate_temp = this.rate - 1;

  //     let preBook: any = [];
  //     if (this.matchOddsBook.length > 0) {
  //       preBook = this.matchOddsBook.map((m: any) => {
  //         let amt = 0;
  //         if (this.betFor == m.selectionName) {
  //           amt = (this.betType == 'back') ? (this.stake * rate_temp) : -(this.stake * rate_temp)
  //         } else {
  //           amt = this.betType == 'back' ? -this.stake : this.stake;
  //         }
  //         return { selectionName: m.selectionName, amount: (Math.round(amt * 100) / 100) + m.amount }
  //       });
  //     } else {
  //       preBook = this.match_odds.section.map((m: any) => {
  //         let amt = 0;
  //         if (this.betFor == m.nat) {
  //           amt = (this.betType == 'back') ? (this.stake * rate_temp) : -(this.stake * rate_temp)
  //         } else {
  //           amt = this.betType == 'back' ? -this.stake : this.stake;
  //         }
  //         return { selectionName: m.nat, amount: Math.round(amt * 100) / 100 }
  //       });
  //     }
  //     this.matchOPreBook = preBook;

  //   } else if (this.oddsType == "Bookmaker" || this.oddsType == "Bookmaker 2") {
  //     rate_temp = (this.rate / 100);
  //     let book = this.oddsType == "Bookmaker" ? this.bookmakerBook : this.bm2Book;
  //     //console.log(book)
  //     let preBook: any = [];
  //     if (book.length > 0) {
  //       preBook = book.map((m: any) => {
  //         let amt = 0;
  //         if (this.betFor == m.selectionName) {
  //           amt = (this.betType == 'back') ? (this.stake * rate_temp) : -(this.stake * rate_temp)
  //         } else {
  //           amt = this.betType == 'back' ? -this.stake : this.stake;
  //         }
  //         return { selectionName: m.selectionName, amount: (Math.round(amt * 100) / 100) + m.amount }
  //       });
  //     } else {
  //       let data = this.oddsType == 'Bookmaker' ? this.bookmaker.section : this.bookmaker2.section;
  //       preBook = data.map((m: any) => {
  //         let amt = 0;
  //         if (this.betFor == (this.oddsType == 'Bookmaker' ? m.nat : this.removeFullstop(m.nat))) {
  //           amt = (this.betType == 'back') ? (this.stake * rate_temp) : -(this.stake * rate_temp)
  //         } else {
  //           amt = this.betType == 'back' ? -this.stake : this.stake;
  //         }
  //         return { selectionName: m.nat, amount: Math.round(amt * 100) / 100 }
  //       });
  //     }
  //     if (this.oddsType == 'Bookmaker') { this.bmPrebook = preBook } else { this.bm2PreBook = preBook }
  //   } else if (this.oddsType == "Khado") {
  //     let khado = parseInt(this.betFor.split(' - ')[1]) || 0;
  //     this.profit = this.rate + khado - 1;
  //     return;
  //   } else {
  //     this.profit = 0;
  //     return;
  //   }
  //   this.profit = this.betType == 'back' ? Math.round((this.stake * rate_temp) * 100) / 100 : this.stake;
  // }
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
    if (this.stake.toString().includes('.')) this.stake = Math.floor(this.stake);

    let rate_temp = 0; let book: any[] = [];
    if (this.oddsType == 'MATCH_ODDS') {
      rate_temp = this.rate - 1;
      book = this.matchOddsBook.length > 0 ? this.matchOddsBook : this.match_odds.section;
      this.preBook = this.matchOPreBook =this.calculatePreBook(rate_temp, book);
    } else if (this.oddsType == "Bookmaker") {
      rate_temp = this.rate / 100;
      book = this.bookmakerBook.length > 0 ? this.bookmakerBook : this.bookmaker.section;
      this.preBook =this.bmPrebook= this.calculatePreBook(rate_temp, book);
    } else {
      this.profit = 0;
      return;
    }
    this.profit = this.betType == 'back' ? Math.round((this.stake * rate_temp) * 100) / 100 : this.stake;
  }

  betsubmit() {
    this.placeLoader = true;
    let dt = { eventid: this.eventId, eventname: this.eventName, betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, rate: this.rate, stake: this.stake, sid: this.sid, oname: this.oname }
    this.auth.placeKabaddiBet(dt).subscribe({
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
    this.showbetform = false; this.matchOPreBook = []; this.bmPrebook = [];
    this.betFor = ""; this.rate = 0; this.betType = ""; this.oddsType = ""; this.sid = 0; this.profit = 0; this.loss = 0; this.stake = 0; this.oname = "";
    this.modalService.dismissAll();
  }
  getOpenBets() {
    this.auth.getKabaddiOpenBet(this.eventId).subscribe({
      next: (res: any) => {
        this.openBets = res.openbets;
        this.book = res.books;
        let fancy: any = []; let fancy1: any = []; let meter: any = []; let khado: any = []; let oddeven: any = [];
        this.book.forEach((item: any) => {
          if (item.oddsType == "MATCH_ODDS") {
            this.matchOddsBook = item.book;
          } else if (item.oddsType == "Bookmaker") {
            this.bookmakerBook = item.book;
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
          this.modalService.open(content, { size: 'sm' });
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
