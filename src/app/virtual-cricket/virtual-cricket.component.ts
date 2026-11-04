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
  selector: 'app-virtual-cricket',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent, FooterComponent, SidebarComponent,ShortNumberPipe],
  templateUrl: './virtual-cricket.component.html',
  styleUrl: './virtual-cricket.component.css'
})
export class VirtualCricketComponent {

  isSticky = false; sidebarTopOffset = 124; loader=false; placeLoader=false; gametab=true; bettab=false;
  eventId: any; channel: any; T10Array = []; vidURL: any; placebetButton: any = []; cvideoURL: any;
  betFor = ""; rate = 0; oddsType = ""; betType = ""; markettype = ""; stake = 0; profit = 0; loss = 0; showbetform = false; sid = 0;
  t2: any = []; t3: any = []; t4: any = []; SM: any = []; OvO: any = []; BM: any = []; Score: any; balls: any = [];
  team1 = ""; team2 = ""; eventName = ""; date: any;
  openBets: any = []; book: any = []; matchOddsBook = []; bookmakerBook = []; fancyBook: any = {};
  matchOPreBook: any = []; bmPrebook: any = [];

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
    this.cvideoURL = this.match_service.getCasinoVideo();
    this.eventId = this.activated_route.snapshot.paramMap.get('gameid');
    this.match_service.getMatchDetail(this.eventId).subscribe({
      next: (res: any) => {
        this.eventName = res.eventName;
        this.date = res.date;
        this.channel = res.channel;
        this.vidURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + "?id=" + this.channel);
      },
      error: (e) => console.log(e)
    })
    this.game_socket.gamedata('Market', this.eventId).subscribe((data: any) => {
      let SM_temp: any = []; let OvO_temp: any = [];
      this.t2 = data.t2;
      this.t3 = data.t3;
      this.t4 = data.t4;
      if (this.checkObjectLength(this.t3) > 0) {
        this.t3.forEach((item: any) => {
          if (item.ballsess == "1") {
            SM_temp.push(item)
          } else if (item.ballsess == "2") {
            OvO_temp.push(item)
          }
        });
        this.SM = SM_temp; this.OvO = OvO_temp;
      }
      if (this.checkObjectLength(this.t2) > 0) {
        this.BM = this.t2[0].bm1.sort((a: any, b: any) => a.sid - b.sid);
      }
      this.team1 = this.BM[0].nat;
      this.team2 = this.BM[1].nat;
    })
    this.game_socket.scoredata('Score', this.eventId).subscribe((data: any) => {
      if (!data) return;
      if (data.data) {
        this.Score = data.data;
        this.balls = this.Score.balls;
      }
    })
    this.getOpenBets();
    this.placeBetButton();
  }
  placeBetButton() {
    this.auth.getButtons().subscribe({
      next: (res) => {
        this.placebetButton = res;
        //console.log(this.placebetButton)
      }, error: (e) => console.log(e)
    })
  }
  ngOnDestroy() {
    this.game_socket.leavaAllRooms;
  }
  openRule(content: any) {
    this.modalService.open(content, { size: 'xl' });
  }
  openBetForm(content:any,betfor: any, rate: any, bettype: any, oddstype: any, sid: any) {
    this.showbetform = true
    this.betFor = betfor
    this.rate = rate
    this.betType = bettype
    this.oddsType = oddstype
    this.sid = sid
    this.profit = 0
    this.loss = 0
    this.stake = 0
    this.bmPrebook = [];
    if(window.innerWidth<768){
      this.modalService.open(content)
    }
  }
  hideBetPlace() {
    this.showbetform = false
  }
  placeStake(val: number) {
    this.stake += val;
    this.calcProfit();
  }
  resetStake() {
    this.stake = 0;
    this.profit = 0;
    this.loss = 0;
    this.bmPrebook = [];
  }
  calcProfit() {
    if (!this.stake) return;
    if (this.stake.toString().includes('.')) this.stake = Math.floor(this.stake)

    let rate_temp = 0; //let existBook = [];
    if (this.oddsType == "Bookmaker") {
      rate_temp = (this.rate / 100);
      let book = this.bookmakerBook
      //console.log(book)
      let preBook: any = [];
      if (book.length > 0) {
        preBook = book.map((m: any) => {
          let amt = 0;
          if (this.betFor == m.selectionName) {
            console.log('aayo')
            amt = (this.betType == 'back') ? (this.stake * rate_temp) : -(this.stake * rate_temp)
          } else {
            amt = this.betType == 'back' ? -this.stake : this.stake;
          }

          return { selectionName: m.selectionName, amount: (Math.round(amt * 100) / 100) + m.amount }
        });
      } else {
        let data = this.BM;
        preBook = data.map((m: any) => {
          let amt = 0;
          if (this.betFor == m.nat) {
            amt = (this.betType == 'back') ? (this.stake * rate_temp) : -(this.stake * rate_temp)
          } else {
            amt = this.betType == 'back' ? -this.stake : this.stake;
          }
          return { selectionName: m.nat, amount: Math.round(amt * 100) / 100 }
        });
      }
      this.bmPrebook = preBook
    } else {
      this.profit = 0;
      return;
    }
    this.profit = this.betType == 'back' ? Math.round((this.stake * rate_temp) * 100) / 100 : this.stake;
  }
  submitbet() {
    this.placeLoader=true;
    let dt = { eventid: this.eventId, eventname: this.eventName, betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, rate: this.rate, stake: this.stake, sid: this.sid }
    this.auth.placeVirtualT10Bet(dt).subscribe({
      next: (res: any) => {
        this.placeLoader=false;
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
          this.bmPrebook = [];
        }
      },
      error: (e) => {
        console.log(e)
        this.placeLoader=false;
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
    this.showbetform = false; this.bmPrebook = [];
    this.betFor = ""; this.rate = 0; this.betType = ""; this.oddsType = ""; this.sid = 0; this.profit = 0; this.loss = 0; this.stake = 0;
    this.modalService.dismissAll();
  }
  getOpenBets() {
    this.auth.getopenbet(this.eventId).subscribe({
      next: (res: any) => {
        this.openBets = res.openbets;
        this.book = res.books;
        let fancy: any = [];
        this.book.forEach((item: any) => {
          if (item.oddsType == "MATCH_ODDS") {
            this.matchOddsBook = item.book;
          } else if (item.oddsType == "Bookmaker") {
            this.bookmakerBook = item.book;
          } else if (item.oddsType == "Fancy") {
            fancy.push(item);
          }
        });
        this.fancyBook = fancy.reduce((result: any, item: any) => {
          result[item.fancyName] = -Math.abs(item.book);
          return result;
        }, {});
      },
      error: (e) => console.log(e)
    })
  }
  trackByFunc(index: number, item: any) {
    return item.sid;
  }
  checkObjectLength(obj: any) {
    if (obj == '' || obj == null) {
      return 0;
    } else {
      return Object.keys(obj).length
    }
  }
  removeDecimal(num: any) {
    return Math.floor(num);
  }
  twoDecimal(num: number) {
    if (num) return num.toFixed(2);
    return 0.00;
  }
  gameTabClicked(){
    this.bettab = false;
    this.gametab = true;
  }
  betTabClicked(){
    this.bettab = true;
    this.gametab = false;
  }
}
