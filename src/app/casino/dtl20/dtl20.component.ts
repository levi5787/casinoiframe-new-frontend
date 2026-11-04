import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { MatchService } from '../../services/match.service';
import { SocketService } from '../../services/socket.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UserauthService } from '../../services/userauth.service';
import { CommonModule } from '@angular/common';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';

@Component({
  selector: 'app-dtl20',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './dtl20.component.html',
  styleUrl: './dtl20.component.css'
})
export class Dtl20Component implements OnInit {
  loader = false; placeLoader = false; userButtons: any = {}; setButtonTab='casino';
  dtlTab = "dragon"; gametab = true; bettab = false;
  activeRange = ""; isSticky = false; sidebarTopOffset = 124; placebetButton: any = []; cvideoURL: any;
  data:any;safeURL: any; mybets: any = []; mybooks: any = []; winnerBook: any = []; doddevenBook: any = []; toddevenBook: any = []; loddevenBook: any = [];
  dredblackBook: any = []; tredblackBook: any = []; lredblackBook: any = []; dcardBook: any = []; tcardBook: any = []; lcardBook: any = [];
  c1 = ""; c2 = ""; c3 = ""; roundId = ""; autotime = 0; clock: any; beforeNum = 0;
  winnerDodd = ""; blackDodd = ""; redDodd = ""; oddDodd = ""; evenDodd = "";
  D1odd = ""; D2odd = ""; D3odd = ""; D4odd = ""; D5odd = ""; D6odd = ""; D7odd = ""; D8odd = ""; D9odd = ""; D10odd = ""; D11odd = ""; D12odd = ""; D13odd = "";
  winnerTodd = ""; blackTodd = ""; redTodd = ""; oddTodd = ""; evenTodd = "";
  T1odd = ""; T2odd = ""; T3odd = ""; T4odd = ""; T5odd = ""; T6odd = ""; T7odd = ""; T8odd = ""; T9odd = ""; T10odd = ""; T11odd = ""; T12odd = ""; T13odd = "";
  winnerLodd = ""; blackLodd = ""; redLodd = ""; oddLodd = ""; evenLodd = "";
  L1odd = ""; L2odd = ""; L3odd = ""; L4odd = ""; L5odd = ""; L6odd = ""; L7odd = ""; L8odd = ""; L9odd = ""; L10odd = ""; L11odd = ""; L12odd = ""; L13odd = "";

  winnerDgstatus = ""; blackDgstatus = ""; redDgstatus = ""; oddDgstatus = ""; evenDgstatus = "";
  D1gstatus = ""; D2gstatus = ""; D3gstatus = ""; D4gstatus = ""; D5gstatus = ""; D6gstatus = ""; D7gstatus = ""; D8gstatus = ""; D9gstatus = ""; D10gstatus = ""; D11gstatus = ""; D12gstatus = ""; D13gstatus = "";

  winnerTgstatus = ""; blackTgstatus = ""; redTgstatus = ""; oddTgstatus = ""; evenTgstatus = "";
  T1gstatus = ""; T2gstatus = ""; T3gstatus = ""; T4gstatus = ""; T5gstatus = ""; T6gstatus = ""; T7gstatus = ""; T8gstatus = ""; T9gstatus = ""; T10gstatus = ""; T11gstatus = ""; T12gstatus = ""; T13gstatus = "";

  winnerLgstatus = ""; blackLgstatus = ""; redLgstatus = ""; oddLgstatus = ""; evenLgstatus = "";
  L1gstatus = ""; L2gstatus = ""; L3gstatus = ""; L4gstatus = ""; L5gstatus = ""; L6gstatus = ""; L7gstatus = ""; L8gstatus = ""; L9gstatus = ""; L10gstatus = ""; L11gstatus = ""; L12gstatus = ""; L13gstatus = "";

  min:any; max:any; winnermin = 0; winnermax = 0; blackmin = 0; blackmax = 0; redmin = 0; redmax = 0; oddmin = 0; oddmax = 0; evenmin = 0; evenmax = 0; cardsmin = 0; cardsmax = 0;

  betFor = ""; odds = 0; betType = ""; oddsType = ""; stake: any = null; profit = 0; loss = 0; showbetform = false; sid = 0;
  results: any = []; tempCard: any = []; tempWin = ""; temprId = "";
  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false;

  constructor(
    private _sanitizer: DomSanitizer,
    private match_service: MatchService,
    private socket_service: SocketService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private userauth: UserauthService
  ) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = (window.pageYOffset >= this.sidebarTopOffset);
    //console.log(this.sidebarTopOffset)
  }
  removeDecimal(num: any): string {
    if (isNaN(Number(num))) {
      return "Invalid input";
    }
    return parseFloat(num).toString();
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo()
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3047');
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'dtl20').subscribe((data: any) => {
      this.data = data['data'];
      this.c1 = "/img/cards/" + data['data']['t1'][0]['C1'] + ".png";
      this.c2 = "/img/cards/" + data['data']['t1'][0]['C2'] + ".png";
      this.c3 = "/img/cards/" + data['data']['t1'][0]['C3'] + ".png";
      if(this.roundId!=data['data']['t1'][0]['mid']){
        this.clearBooks(); this.mybets=[];
      }
      this.roundId = data['data']['t1'][0]['mid'];

      //code for flipclock
      this.autotime = parseInt(data['data']['t1'][0]['autotime']);
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end
      this.winnermin =  data['data']['t2'][0]['min'];
       this.winnermax = data['data']['t2'][0]['max'];
      this.blackmin = data['data']['t2'][1]['min']; 
      this.blackmax = data['data']['t2'][1]['max'];
      this.redmin = data['data']['t2'][2]['min']; 
      this.redmax = data['data']['t2'][2]['max'];
      this.oddmin = data['data']['t2'][3]['min']; 
      this.oddmax = data['data']['t2'][3]['max'];
      this.evenmin = data['data']['t2'][4]['min']; 
      this.evenmax = data['data']['t2'][4]['max'];
      this.cardsmin = data['data']['t2'][5]['min']; 
      this.cardsmax = data['data']['t2'][5]['max'];

      this.winnerDodd = this.removeDecimal(data['data']['t2'][0]['b1']);
      this.blackDodd = this.removeDecimal(data['data']['t2'][1]['b1']);
      this.redDodd = this.removeDecimal(data['data']['t2'][2]['b1']);
      this.oddDodd = this.removeDecimal(data['data']['t2'][3]['b1']);
      this.evenDodd = this.removeDecimal(data['data']['t2'][4]['b1']);
      this.D1odd = this.removeDecimal(data['data']['t2'][5]['b1']);
      this.D2odd = this.removeDecimal(data['data']['t2'][6]['b1']);
      this.D3odd = this.removeDecimal(data['data']['t2'][7]['b1']);
      this.D4odd = this.removeDecimal(data['data']['t2'][8]['b1']);
      this.D5odd = this.removeDecimal(data['data']['t2'][9]['b1']);
      this.D6odd = this.removeDecimal(data['data']['t2'][10]['b1']);
      this.D7odd = this.removeDecimal(data['data']['t2'][11]['b1']);
      this.D8odd = this.removeDecimal(data['data']['t2'][12]['b1']);
      this.D9odd = this.removeDecimal(data['data']['t2'][13]['b1']);
      this.D10odd = this.removeDecimal(data['data']['t2'][14]['b1']);
      this.D11odd = this.removeDecimal(data['data']['t2'][15]['b1']);
      this.D12odd = this.removeDecimal(data['data']['t2'][16]['b1']);
      this.D13odd = this.removeDecimal(data['data']['t2'][17]['b1']);

      this.winnerTodd = this.removeDecimal(data['data']['t2'][18]['b1']);
      this.blackTodd = this.removeDecimal(data['data']['t2'][19]['b1']);
      this.redTodd = this.removeDecimal(data['data']['t2'][20]['b1']);
      this.oddTodd = this.removeDecimal(data['data']['t2'][21]['b1']);
      this.evenTodd = this.removeDecimal(data['data']['t2'][22]['b1']);
      this.T1odd = this.removeDecimal(data['data']['t2'][23]['b1']);
      this.T2odd = this.removeDecimal(data['data']['t2'][24]['b1']);
      this.T3odd = this.removeDecimal(data['data']['t2'][25]['b1']);
      this.T4odd = this.removeDecimal(data['data']['t2'][26]['b1']);
      this.T5odd = this.removeDecimal(data['data']['t2'][27]['b1']);
      this.T6odd = this.removeDecimal(data['data']['t2'][28]['b1']);
      this.T7odd = this.removeDecimal(data['data']['t2'][29]['b1']);
      this.T8odd = this.removeDecimal(data['data']['t2'][30]['b1']);
      this.T9odd = this.removeDecimal(data['data']['t2'][31]['b1']);
      this.T10odd = this.removeDecimal(data['data']['t2'][32]['b1']);
      this.T11odd = this.removeDecimal(data['data']['t2'][33]['b1']);
      this.T12odd = this.removeDecimal(data['data']['t2'][34]['b1']);
      this.T13odd = this.removeDecimal(data['data']['t2'][35]['b1']);

      this.winnerLodd = this.removeDecimal(data['data']['t2'][36]['b1']);
      this.blackLodd = this.removeDecimal(data['data']['t2'][37]['b1']);
      this.redLodd = this.removeDecimal(data['data']['t2'][38]['b1']);
      this.oddLodd = this.removeDecimal(data['data']['t2'][39]['b1']);
      this.evenLodd = this.removeDecimal(data['data']['t2'][40]['b1']);
      this.L1odd = this.removeDecimal(data['data']['t2'][41]['b1']);
      this.L2odd = this.removeDecimal(data['data']['t2'][42]['b1']);
      this.L3odd = this.removeDecimal(data['data']['t2'][43]['b1']);
      this.L4odd = this.removeDecimal(data['data']['t2'][44]['b1']);
      this.L5odd = this.removeDecimal(data['data']['t2'][45]['b1']);
      this.L6odd = this.removeDecimal(data['data']['t2'][46]['b1']);
      this.L7odd = this.removeDecimal(data['data']['t2'][47]['b1']);
      this.L8odd = this.removeDecimal(data['data']['t2'][48]['b1']);
      this.L9odd = this.removeDecimal(data['data']['t2'][49]['b1']);
      this.L10odd = this.removeDecimal(data['data']['t2'][50]['b1']);
      this.L11odd = this.removeDecimal(data['data']['t2'][51]['b1']);
      this.L12odd = this.removeDecimal(data['data']['t2'][52]['b1']);
      this.L13odd = this.removeDecimal(data['data']['t2'][53]['b1']);

      this.winnerDgstatus = data['data']['t2'][0]['gstatus']; this.blackDgstatus = data['data']['t2'][1]['gstatus'];
      this.redDgstatus = data['data']['t2'][2]['gstatus']; this.oddDgstatus = data['data']['t2'][3]['gstatus'];
      this.evenDgstatus = data['data']['t2'][4]['gstatus']; this.D1gstatus = data['data']['t2'][5]['gstatus'];
      this.D2gstatus = data['data']['t2'][6]['gstatus']; this.D3gstatus = data['data']['t2'][7]['gstatus'];
      this.D4gstatus = data['data']['t2'][8]['gstatus']; this.D5gstatus = data['data']['t2'][9]['gstatus'];
      this.D6gstatus = data['data']['t2'][10]['gstatus']; this.D7gstatus = data['data']['t2'][11]['gstatus'];
      this.D8gstatus = data['data']['t2'][12]['gstatus']; this.D9gstatus = data['data']['t2'][13]['gstatus'];
      this.D10gstatus = data['data']['t2'][14]['gstatus']; this.D11gstatus = data['data']['t2'][15]['gstatus'];
      this.D12gstatus = data['data']['t2'][16]['gstatus']; this.D13gstatus = data['data']['t2'][17]['gstatus'];

      this.winnerTgstatus = data['data']['t2'][18]['gstatus']; this.blackTgstatus = data['data']['t2'][19]['gstatus'];
      this.redTgstatus = data['data']['t2'][20]['gstatus']; this.oddTgstatus = data['data']['t2'][21]['gstatus'];
      this.evenTgstatus = data['data']['t2'][22]['gstatus']; this.T1gstatus = data['data']['t2'][23]['gstatus'];
      this.T2gstatus = data['data']['t2'][24]['gstatus']; this.T3gstatus = data['data']['t2'][25]['gstatus'];
      this.T4gstatus = data['data']['t2'][26]['gstatus']; this.T5gstatus = data['data']['t2'][27]['gstatus'];
      this.T6gstatus = data['data']['t2'][28]['gstatus']; this.T7gstatus = data['data']['t2'][29]['gstatus'];
      this.T8gstatus = data['data']['t2'][30]['gstatus']; this.T9gstatus = data['data']['t2'][31]['gstatus'];
      this.T10gstatus = data['data']['t2'][32]['gstatus']; this.T11gstatus = data['data']['t2'][33]['gstatus'];
      this.T12gstatus = data['data']['t2'][34]['gstatus']; this.T13gstatus = data['data']['t2'][35]['gstatus'];

      this.winnerLgstatus = data['data']['t2'][36]['gstatus']; this.blackLgstatus = data['data']['t2'][37]['gstatus'];
      this.redLgstatus = data['data']['t2'][38]['gstatus']; this.oddLgstatus = data['data']['t2'][39]['gstatus'];
      this.evenLgstatus = data['data']['t2'][40]['gstatus']; this.L1gstatus = data['data']['t2'][41]['gstatus'];
      this.L2gstatus = data['data']['t2'][42]['gstatus']; this.L3gstatus = data['data']['t2'][43]['gstatus'];
      this.L4gstatus = data['data']['t2'][44]['gstatus']; this.L5gstatus = data['data']['t2'][45]['gstatus'];
      this.L6gstatus = data['data']['t2'][46]['gstatus']; this.L7gstatus = data['data']['t2'][47]['gstatus'];
      this.L8gstatus = data['data']['t2'][48]['gstatus']; this.L9gstatus = data['data']['t2'][49]['gstatus'];
      this.L10gstatus = data['data']['t2'][50]['gstatus']; this.L11gstatus = data['data']['t2'][51]['gstatus'];
      this.L12gstatus = data['data']['t2'][52]['gstatus']; this.L13gstatus = data['data']['t2'][53]['gstatus'];
    })
    this.socket_service.casinolast10('Last10', 'dtl20').subscribe((winnerdata: any) => {
      //console.log(winnerdata)
      this.results = winnerdata['data'];
      //this.results = this.results.reverse();
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
    this.placeBetButton();
  }

  ngOnDestroy() {
    this.socket_service.leavaAllRooms;
  }
  getCvideoURL() {
    this.match_service.getCVideo('dtl20').subscribe({
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
    return item.sid;
  }
  openBetForm(content: any, betfor: string, odds: any, type: string, sid: number, oddstype: string, min:any, max:any) {
    this.showbetform = true
    this.betFor = betfor;
    this.odds = odds;
    this.betType = type;
    this.oddsType = oddstype;
    this.profit = 0
    this.loss = 0
    this.stake = null;
    this.sid = sid;
    this.min = min;
    this.max = max;
    if (window.innerWidth < 1100) {
      this.modalService.open(content)
    }
  }
  hideBetPlace() {
    this.showbetform = false
  }
  placeStake(val: number) {
    this.stake += val;
    this.calcProfit(val);
  }
  resetStake() {
    this.stake = null;
    this.profit = 0;
    this.loss = 0;
  }
  calcProfit(stake: any) {

  }
  open(content: any) {
    this.modalService.open(content, { size: 'lg' });
  }
  openResult(content: any, rid: any) {
    this.loader = true;
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      this.loader = false;
      this.modalService.open(content, { size: 'xl' })
      this.tempCard = winnerdata['data'][0]['cards']
      this.tempCard = this.tempCard.split(',')
      this.tempWin = winnerdata['data'][0]['win']
      this.temprId = rid;
    })
  }

  submitbet() {
    this.placeLoader = true;
    var dt = { roundid: this.roundId, matchcode: 'dtl20', matchname: '20-20 Dragon Tiger Lion', betfor: this.betFor, bettype: 'back', oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid };
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
        this.displayToast(e.error.message, "failed")
        this.modalService.dismissAll();
      }
    })
  }
  getopenbet() {
    this.userauth.getCasinoOpenBet("dtl20", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          item.oddsType == "Winner" ? this.winnerBook = item.book : item.oddsType == "DRedBlack" ? this.dredblackBook = item.book
            : item.oddsType == "TRedBlack" ? this.tredblackBook = item.book : item.oddsType == "LRedBlack" ? this.lredblackBook = item.book
              : item.oddsType == "DOddEven" ? this.doddevenBook = item.book : item.oddsType == "TOddEven" ? this.toddevenBook = item.book
                : item.oddsType == "LOddEven" ? this.loddevenBook = item.book : item.oddsType == "DCard" ? this.dcardBook = item.book
                  : item.oddsType == "TCard" ? this.tcardBook = item.book : item.oddsType == "LCard" ? this.lcardBook = item.book : null
        });
        //console.log(this.mybooks);
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
    this.winnerBook = []; this.doddevenBook = []; this.toddevenBook = []; this.loddevenBook = []; this.dredblackBook = [];
    this.tredblackBook = []; this.lredblackBook = []; this.dcardBook = []; this.tcardBook = []; this.lcardBook = [];
  }
  rangeClick(name: any) {
    if (this.activeRange == name) {
      this.activeRange = "";
    } else {
      this.activeRange = name;
    }
  }
  trackByMid(index: number, item: any) {
    return item.mid;
  }
  twoDecimal(num: number) {
    if (num) return num.toFixed(2);
    return 0.00;
  }
  dtlTabClick(name: any) {
    if (this.dtlTab == name) {
      this.dtlTab = "";
    } else {
      this.dtlTab = name;
    }
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
