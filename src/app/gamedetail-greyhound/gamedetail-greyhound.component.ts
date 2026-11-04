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
  selector: 'app-gamedetail-greyhound',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent, FooterComponent, CommonModule, ShortNumberPipe, FormsModule],
  templateUrl: './gamedetail-greyhound.component.html',
  styleUrl: './gamedetail-greyhound.component.css'
})
export class GamedetailGreyhoundComponent {

  userButtons: any = {}; setButtonTab = "game"; gametab = true; bettab = false;
  isSticky = false; sidebarTopOffset = 124; placebetButton: any = []; raceDetails = false; selectedId: any;
  isLoading = true; placeLoader = false;
  safeURL: any; safeURLmbl: any; tvURL: any;
  cName: any; eventId: any; eventName: any; date: any; liveon = false;
  betFor = ""; rate = 0; odds = 0; betType = ""; oddsType = ""; stake = 0; profit = 0; loss = 0; showbetform = false; sid: any; oname: any;
  data: any = []; cname = ""; remainingTime: any = ""; hour: any; minute: any;

  match_odds: any = [];
  openBets: any; book: any = []; matchOddsBook = [];
  matchOPreBook: any = []; preBook:any=[];
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
      next: (res: any) => {
        this.eventName = res.eventName, this.date = res.date, this.cname = res.cname;
        this.calculateRemainingTime();
      },
      error: (e) => console.log(e)
    })

    this.getOpenBets();
    this.placeBetButton();
    this.remainingTime = setInterval(() => {
      this.calculateRemainingTime()
    }, 5000);
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
    this.game_socket.gamedata('Market', this.eventId).subscribe((data: any) => {
      this.dataChangedTime = new Date().getTime();
      //console.log(data) 
      this.data = data['data'];
      //this.setWinner = this.data.filter((m: any) => m.mname.endsWith('Set Winner'));\
      this.data.forEach((item: any) => {
        if (item.mname == "MATCH_ODDS") {
          this.match_odds = item
        }
      });
    });
  }
  ngAfterViewInit() {
    setTimeout(() => {
      //this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }
  placeBetButton() {
    this.auth.getButtons().subscribe({
      next: (res:any) => {
        this.placebetButton = res.gamebutton;
        //console.log(this.placebetButton)
      }, error: (e) => console.log(e)
    })
  }
  ngOnDestroy() {
    clearInterval(this.remainingTime);
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
  trackByFunc(index: number, item: any) {
    return item.sid;
  }
  trackBymid(index: number, item: any) {
    return item.mid;
  }
  openBetForm(content:any, betfor: any, rate: any, bettype: any, oddstype: any, sid: any, oname: any) {
    this.showbetform = true
    this.betFor = betfor
    this.rate = rate
    this.betType = bettype
    this.oddsType = oddstype
    this.sid = sid
    this.profit = 0; this.matchOPreBook = [];
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
    this.matchOPreBook = [];
  }

  // calculatePreBook(rate_temp: number, book: any[]) {
  //   return book.map((m: any) => {
  //     let amt = 0; let name = m.selectionName || m.nat;
  //     if (this.betFor == name) {
  //       amt = (this.betType == 'back') ? (this.stake * rate_temp) : -(this.stake * rate_temp);
  //     } else {
  //       amt = this.betType == 'back' ? -this.stake : this.stake;
  //     }
  //     let oldAmt = m?.amount || 0;
  //     return { selectionName: name, oldAmount: oldAmt, amount: (Math.round(amt * 100) / 100) + oldAmt };
  //   });
  // }


  // calcProfit() {
  //   //if (!this.stake) return;
  //   if (this.stake.toString().includes('.')) this.stake = Math.floor(this.stake);

  //   let rate_temp = 0; let book: any[] = [];
  //   if (this.oddsType == 'MATCH_ODDS') {
  //     rate_temp = this.rate - 1;
  //     book = this.matchOddsBook.length > 0 ? this.matchOddsBook : this.match_odds.section;
  //    this.preBook=  this.calculatePreBook(rate_temp, book);
  //    this.matchOPreBook =this.calculatePreBook(rate_temp, book);
  //    console.log(this.matchOddsBook);
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
      return { selectionName: name, amount: (Math.round(amt * 100) / 100) + oldAmt };
    });
  }

  calcProfit() {
    if (!this.stake) return;
    if (this.stake.toString().includes('.')) this.stake = Math.floor(this.stake);

    let rate_temp = 0; let book: any[] = [];
    if (this.oddsType == 'MATCH_ODDS') {
      rate_temp = this.rate - 1;
      book = this.matchOddsBook.length > 0 ? this.matchOddsBook : this.match_odds.section;
      this.matchOPreBook = this.calculatePreBook(rate_temp, book);
    } else {
      this.profit = 0;
      return;
    }
    this.profit = this.betType == 'back' ? Math.round((this.stake * rate_temp) * 100) / 100 : this.stake;
  }
  betsubmit() {
    this.placeLoader = true;
    let dt = { eventid: this.eventId, eventname: this.eventName, betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, rate: this.rate, stake: this.stake, sid: this.sid, oname: this.oname }
    this.auth.placeGreyhoundRacingBet(dt).subscribe({
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
    this.showbetform = false; this.matchOPreBook = [];
    this.betFor = ""; this.rate = 0; this.betType = ""; this.oddsType = ""; this.sid = 0; this.profit = 0; this.loss = 0; this.stake = 0; this.oname = "";
  }

  getOpenBets() {
    this.auth.getGreyhoundRacingOpenBet(this.eventId).subscribe({
      next: (res: any) => {
        this.openBets = res.openbets;
        this.book = res.books;
        this.book.forEach((item: any) => {
          if (item.oddsType == "MATCH_ODDS") {
            this.matchOddsBook = item.book;
          }
        });
      },
      error: (e) => console.log(e)
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
  calculateRemainingTime() {
    const now = new Date();
    let Mdate = new Date(this.date);
    const difference = Mdate.getTime() - now.getTime();
    //console.log(difference)
    if (difference > 0) {
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      //const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      if (hours == 0) {
        this.remainingTime = `${minutes}`;
      } else {
        this.remainingTime = `${hours} ${minutes}`;
        //console.log(this.remainingTime)
      }
      this.hour = hours;
      this.minute = minutes;
    } else {
      this.remainingTime = "";
    }
  }
  twoDecimal(num: number) {
    if (num) return num.toFixed(2);
    return 0.00;
  }

  marketNotAvailable() {
    this.noMarketInterval = setInterval(() => {
      if (this.data?.length != 0) {
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
