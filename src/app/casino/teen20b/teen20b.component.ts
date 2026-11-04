import { Component, HostListener, OnInit, inject, NgModule, } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { MatchService } from '../../services/match.service';
import { SocketService } from '../../services/socket.service';
import { UserauthService } from '../../services/userauth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';

@Component({
  selector: 'app-teen20b',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './teen20b.component.html',
  styleUrl: './teen20b.component.css'
})
export class Teen20bComponent implements OnInit {
  playerA: any; playerB: any; redA: any; redB: any; blackA: any; blackB: any; baccaratB: any; baccaratA: any; pairA: any; pairB: any; totalA: any; totalB: any; b: any;
  bettab = false; gametab = true; loader = false; placeLoader = false; userButtons: any = {}; setButtonTab = 'casino';
  isSticky = false; sidebarTopOffset = 124; placebetButton: any = []; cvideoURL: any;
  data:any;safeURL: any; autotime = 0; clock: any; beforeNum = 0; mybets: any = []; mybooks: any = []; playerABook: any = []; playerBBook: any = []; totalABook: any = []; totalBBook: any = [];
  baccaratABook: any = []; baccaratBBook: any = [];  pairABook: any = [];  pairBBook: any = [];  blackABook: any = [];  blackBBook: any = [];  redBBook: any = []; redABook: any = []; 
  c1 = ""; c2 = ""; c3 = ""; c4 = ""; c5 = ""; c6 = ""; rc1 = ""; rc2 = ""; rc3 = ""; rc4 = ""; rc5 = ""; rc6 = ""; tempPair = ""; tempBaccarat2 = ""; tempBaccarat1 = ""; tempTotal=""; tempRedBlack=""; gtype = "";
  roundId = ""; min:any; max:any;
  results: any = [];
  betFor = ""; betType = ""; odds = ""; showbetform = false; stake: any = null; profit = 0; oddsType = ""; sid = 0;
  tempCards: any = []; tempWinner: any = ""; temprId = ""; temptime = "";
  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false;

  constructor(private _sanitizer: DomSanitizer,
    private socket_service: SocketService,
    private match_service: MatchService,
    private userauth: UserauthService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = (window.pageYOffset >= this.sidebarTopOffset);
    //console.log(this.sidebarTopOffset)
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo()
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3063');
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'teen20b').subscribe((data: any) => {
      this.data = data['data'];
      if (data) {
        this.autotime = parseInt(data['data']['lt']);
        if (this.beforeNum != this.autotime) {
          this.updateClock(this.autotime);
        }
        this.beforeNum = this.autotime;
        //code for flipclock end
        if (this.roundId != data['data']['mid']) {
          this.clearBooks(); this.mybets = [];
        }
        const cards = data['data']['card'].split(',');
        this.roundId = data['data']['mid'];
        this.playerA = data['data']['sub'][0];
        this.playerB = data['data']['sub'][1];
        this.pairA = data['data']['sub'][2];
        this.pairB = data['data']['sub'][3];
        this.baccaratA = data['data']['sub'][4];
        this.baccaratB = data['data']['sub'][5];
        this.blackA = data['data']['sub'][6];
        this.redA = data['data']['sub'][7];
        this.blackB = data['data']['sub'][8];
        this.redB = data['data']['sub'][9];
        this.totalA = data['data']['sub'][10];
        this.totalB = data['data']['sub'][11];
        this.c1 = "/img/cards-new/" + cards[0] + ".png";
        this.c2 = "/img/cards-new/" + cards[1] + ".png";
        this.c3 = "/img/cards-new/" + cards[2] + ".png";
        this.c4 = "/img/cards-new/" + cards[3] + ".png";
        this.c5 = "/img/cards-new/" + cards[4] + ".png";
        this.c6 = "/img/cards-new/" + cards[5] + ".png";
        this.gtype = data['data']['gtype'];
       
      }
    })
    this.socket_service.casinolast10('Last10', 'teen20b').subscribe((resultdata: any) => {
      if (resultdata) {
        this.results = resultdata['data'].res;
        // this.results = this.results.reverse();
        // console.log(resultdata)

      }
    })
    setTimeout(() => {
      this.getopenbet();
      setTimeout(() => {
        this.getopenbet()
      }, 2000);
    }, 1500);
    this.socket_service.updateCheck('User', this.userauth.getUsername()).subscribe((data: any) => {
      if (data.update) {
        this.userauth.getUserBalance();
        this.getopenbet();
      }
    })
    this, this.placeBetButton();
  }

  ngOnDestroy() {
    this.socket_service.leavaAllRooms;
  }
  getCvideoURL() {
    this.match_service.getCVideo('teen20b').subscribe({
      next: (res: any) => {
        //console.log(res)
        const url = res.url;
        this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(url)
      }, error: (e) => {
        console.log(e)
      }
    })
  }
  trackByFunc(index: number, item: any) {
    return item.rid;
  }
  open(content: any) {
    this.modalService.open(content, { size: 'lg' });
  }
  openBetForm(content: any, betfor: string, odds: any, type: string, sid: number, oddstype: string,min:any,max:any) {
    this.showbetform = true
    this.betFor = betfor;
    this.odds = odds;
    this.betType = type;
    this.oddsType = oddstype;
    this.profit = 0
    this.stake = null;
    this.sid = sid;
    this.min = min;
    this.max = max;
    if (window.innerWidth < 1100) {
      this.modalService.open(content)
    }
  }
  hideBetPlace() {
    this.showbetform = false;
  }
  placeStake(val: number) {
    this.stake += val;
    this.profit = 0;
    this.calcProfit(val);
  }
  resetStake() {
    this.stake = null;
    this.profit = 0;
  }
  calcProfit(val: any) {
    //this.profit = (parseInt(this.betOdds)*this.stake)-this.stake;
  }

  openResult(content: any, rid: any) {
    this.loader = true;
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      this.loader = false;
      this.modalService.open(content, { size: 'xl' })
      this.temprId = rid;
      this.temptime = winnerdata['data']['0']['mtime'];
      const cards = winnerdata['data']['0']['card'].split(',');
      this.rc1 = "/img/cards-new/" + cards[0] + ".png";
      this.rc2 = "/img/cards-new/" + cards[1] + ".png";
      this.rc3 = "/img/cards-new/" + cards[2] + ".png";
      this.rc4 = "/img/cards-new/" + cards[3] + ".png";
      this.rc5 = "/img/cards-new/" + cards[4] + ".png";
      this.rc6 = "/img/cards-new/" + cards[5] + ".png";
      const desc = winnerdata['data']['0']['rdesc'].split('#');
      this.tempWinner =winnerdata['data']['0']['winnat'];
      // this.tempBaccarat = desc[1]
      const Baccarat =desc[1].split('~');
      this.tempBaccarat1=Baccarat[0];
      this.tempBaccarat2=Baccarat[1];
      this.tempTotal=desc[2];
      this.tempPair = desc[3];
      this.tempRedBlack=desc[4]
      // console.log(this.top9)
    })
  }
  submitbet() {
    this.placeLoader = true;
    var dt = { roundid: this.roundId, matchcode: 'teen20b', matchname: '20-20 Teenpatti B', betfor: this.betFor, bettype: 'back', oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid };
    this.userauth.placeCasinoBet(dt).subscribe({
      next: (res: any) => {
        this.placeLoader = false;
        this.showbetform = false;
        this.displayToast(res.message, res.status);
        this.getopenbet(); this.userauth.getUserBalance();
        this.modalService.dismissAll();
      },
      error: (e) => {
        this.placeLoader = false;
        this.showbetform = false;
        this.displayToast(e.error.message, "failed");
        this.modalService.dismissAll();
      }
    })
  }
  getopenbet() {
    this.userauth.getCasinoOpenBet("teen20b", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          if (item.oddsType == "Player A") { this.playerABook = item.book }
          else if (item.oddsType == "Player B") { this.playerBBook = item.book }
          else if (item.oddsType == "Total A") { this.totalABook = item.book }
          else if (item.oddsType == "Total B") { this.totalBBook = item.book }
          else if (item.oddsType == "3 Baccarat A") { this.baccaratABook = item.book }
          else if (item.oddsType == "3 Baccarat B") { this.baccaratBBook = item.book }
          else if (item.oddsType == "Pair Plus A") { this.pairABook = item.book }
          else if (item.oddsType == "Pair Plus B") { this.pairBBook = item.book }
          else if (item.oddsType == "Black A") { this.blackABook = item.book }
          else if (item.oddsType == "Red A") { this.redABook = item.book }
          else if (item.oddsType == "Black B") { this.blackBBook = item.book }
          else if (item.oddsType == "Red B") { this.redBBook = item.book}
        });
        // console.log(this.mybooks)
      }, error: (e) => console.log(e)
    })
  }
  displayToast(msg: any, type: any) {
    if (type == "success") {
      this.toastr.success(msg, '', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        closeButton: true,
      });
    } else {
      this.toastr.error(msg, '', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        closeButton: true,
      });
    }
  }
  updateClock(time: number) {
    if (time < 10) {
      this.cfirstnum = 0;
      this.clastnum = time;
      //flip number
      this.flipsecond = true;
      setTimeout(() => {
        this.flipNumber();
      }, 500);

    } else {
      let stime = time.toString()
      this.cfirstnum = parseInt(stime.charAt(0));
      this.clastnum = parseInt(stime.charAt(1));
      //flip number
      //this.flipfirst=true;
      this.flipsecond = true;
      setTimeout(() => {
        this.flipNumber();
      }, 500);
    }
  }
  flipNumber() {
    this.flipfirst = false;
    this.flipsecond = false;
  }
  clearBooks() {
    this.playerABook = []; this.playerBBook = []; this.totalABook = []; this.totalBBook = [];
    this.baccaratABook = []; this.baccaratBBook = []; this.pairABook = []; this.pairBBook = [];
    this.blackABook = []; this.blackBBook = []; this.redABook = []; this.redBBook = [];
  }
  trackByMid(index: number, item: any) {
    return item.mid;
  }
  twoDecimal(num: number) {
    if (num) return num.toFixed(2);
    return 0.00;
  }
  gameTabClicked() {
    this.bettab = false;
    this.gametab = true;
  }
  betTabClicked() {
    this.bettab = true;
    this.gametab = false;
  }
  placeBetButton() {
    this.userauth.getButtons().subscribe({
      next: (res: any) => {
        this.placebetButton = res.casinobutton;
        //console.log(this.placebetButton)
      }, error: (e) => console.log(e)
    })
  }
  clickSetButtonTab(name: any) {
    this.setButtonTab = name
  }
  openButtons(content: any) {
    this.userauth.getButtons().subscribe({
      next: (res) => {
        this.userButtons = res;
        this.modalService.open(content, { size: 'md' });
      }, error: (e) => {
        console.log(e)
      }
    })
  }
  updateButtons() {
    this.userauth.updateButtons(this.userButtons).subscribe({
      next: (res: any) => {
        this.toastr.success(res.message, '', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          closeButton: true,
        });
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
