import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatchService } from '../../services/match.service';
import { SocketService } from '../../services/socket.service';
import { UserauthService } from '../../services/userauth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';

@Component({
  selector: 'app-superover2',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './superover2.component.html',
  styleUrl: './superover2.component.css'
})
export class Superover2Component {
  loader = false; placeLoader = false; gametab = true; bettab = false; userButtons: any = {}; setButtonTab = 'casino';
  isSticky = false; sidebarTopOffset = 124; placebetButton: any = []; cvideoURL: any;
  safeURL: any; mybets: any = []; mybooks: any = []; bookmakerBook = []; fancyBook: any = {}; fancy1Book: any = {};
  roundId = ""; autotime = 0; clock: any; beforeNum = 0;
  data: any = []; c1 = ""; c2 = ""; c3 = ""; c4 = ""; c5 = ""; c6 = ""; t2: any = []; t3: any = []; t4: any = [];

  betFor = ""; odds = 0; betType = ""; stake: any = null; profit = 0; loss = 0; showbetform = false; oddsType = ""; sid = 0;
  results: any = []; min: any; max: any;
  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false; Score: any; balls: any = [];

  temprId = ""; tempWinner = ""; tempdesc = ""; tempScore: any = []; tempDate:any =[];

  constructor(
    private modalService: NgbModal,
    private match_service: MatchService,
    private socket_service: SocketService,
    private _sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private userauth: UserauthService
  ) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = (window.pageYOffset >= this.sidebarTopOffset);
    //console.log(this.sidebarTopOffset)
  }
  ngOnInit(): void {
    console.log('ngOnInit called');
    this.cvideoURL = this.match_service.getCasinoVideo()
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3073');
    //  console.log('subscribing to socket...')
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'superover2').subscribe((data: any) => {
      // console.log('socket data received:', data);
      this.data = data.data;
      //code for flipclock
      const t1 = this.data['t1'];

      this.autotime = parseInt(t1['lt']);
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end

      if (this.roundId != t1['gmid']) {
        this.bookmakerBook = []; this.fancy1Book = []; this.fancy1Book = [];
        this.mybets = [];
      }
      this.roundId = t1['gmid'];

      const bookmakerMarket = this.data.t2.find((m: any) => m.mname === 'Bookmaker');
      const fancy1Market = this.data.t2.find((m: any) => m.mname === 'Fancy1');
      const fancyMarket = this.data.t2.find((m: any) => m.mname === 'Fancy');

      this.min = this.data.t2[0]['min'];
      this.max = this.data.t2[0]['max'];

      this.t2 = bookmakerMarket ? this.mapSection(bookmakerMarket.section) : [];
      this.t3 = fancyMarket ? this.mapSection(fancyMarket.section) : [];
      this.t4 = fancy1Market ? this.mapSection(fancy1Market.section) : [];
      // cards -->
      const cards = t1['card'].split('|');
      this.c1 = this.getImg(cards[0]);
      this.c2 = this.getImg(cards[1]);
      this.c3 = this.getImg(cards[2]);
      this.c4 = this.getImg(cards[3]);
      this.c5 = this.getImg(cards[4]);
      this.c6 = this.getImg(cards[5]);
    })
    this.socket_service.casinolast10('Last10', 'superover2').subscribe((winnerdata: any) => {
      // console.log('winnerdata:', winnerdata);
      // this.results = winnerdata['data']
      this.results = winnerdata['data']['res'];
      //this.results = this.results.reverse()
    })
    this.socket_service.scoredata('Score', 'superover2').subscribe((data: any) => {
      if (!data) {
        this.Score = { spnnation1: 'ENG', spnnation2: 'RSA', spnrunrate1: '0.00', score1: '0-0 (0.0)', score2: '0-0 (0.0)' }; this.balls = [];
        return;
      }
      if (data.data) {
        this.Score = data.data;
        this.balls = this.Score.balls;
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
    this.placeBetButton();
  }
  ngOnDestroy() {
    this.socket_service.leavaAllRooms;
  }
  mapSection(section: any[]) {
    return section.map((item: any) => {
      const backodds = item.odds?.find((odd: any) => odd.otype === 'back') || {};
      const layodds = item.odds?.find((odd: any) => odd.otype === 'lay') || {};
      return {
        nat: item.nat,
        status: item.gstatus,
        sid: item.sid,
        b1: backodds.odds || 0,
        bs1: backodds.size || 0,
        l1: layodds.odds || 0,
        ls1: layodds.size || 0,
        min: item.min,
        max: item.max,
      }
    })
  }
  getCvideoURL() {
    this.match_service.getCVideo('superover2').subscribe({
      next: (res: any) => {
        //console.log(res)
        const url = res.url;
        this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(url)
      }, error: (e) => {
        console.log(e)
      }
    })
  }

  openBetForm(content: any, betfor: string, odds: any, type: string, sid: number, oddstype: string) {
    this.showbetform = true
    this.betFor = betfor;
    this.odds = odds;
    this.betType = type;
    this.oddsType = oddstype;
    this.profit = 0
    this.loss = 0
    this.stake = null;
    this.sid = sid;
    if (window.innerWidth < 768) {
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
  getopenbet() {
    this.mybooks = []; this.bookmakerBook = []; this.fancyBook = {}; this.fancy1Book = {};
    this.userauth.getCasinoOpenBet("superover2", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        let fancy: any = []; let fancy1: any = [];
        this.mybooks.forEach((item: any) => {
          if (item.oddsType == "Bookmaker") {
            this.bookmakerBook = item.book;
          } else if (item.oddsType == "Fancy") {
            fancy.push(item);
          } else if (item.oddsType == "Fancy1") {
            fancy1.push(item);
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
      }, error: (e) => console.log(e)
    })
  }
  placeBetButton() {
    this.userauth.getButtons().subscribe({
      next: (res: any) => {
        this.placebetButton = res.casinobutton;
        //console.log(this.placebetButton)
      }, error: (e) => console.log(e)
    })
  }

  open(content: any) {
    this.modalService.open(content, { size: 'lg' });
  }
  openRule(content: any) {
    this.modalService.open(content, { size: 'lg' });
  }
  openResult(content: any, rid: any) {
    this.loader = true;
    this.tempScore = [];
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      this.loader = false;
      //console.log(winnerdata)
      this.temprId = rid;
      this.tempDate = winnerdata['data']['0'].mtime;
      this.tempWinner = winnerdata['data']['0'].winnat;
      this.tempdesc = winnerdata['data']['0'].rdesc;
      let Score = winnerdata['data']['0'].score;

      this.tempScore['indScore'] = Score.filter((f: any) => f.nat == 'IND')
      this.tempScore['ausScore'] = Score.filter((f: any) => f.nat == 'ENG')
      this.tempScore['indWkt'] = this.tempScore['indScore'].some((s: any) => s.wkt == true) ? 1 : 0;
      this.tempScore['ausWkt'] = this.tempScore['ausScore'].some((s: any) => s.wkt == true) ? 1 : 0;
      let rdscsplit = this.tempdesc.split(' | ')
      this.tempScore['indRun'] = rdscsplit[0].split(' : ')[1]
      this.tempScore['ausRun'] = rdscsplit[1].split(' : ')[1]
      this.modalService.open(content, { size: 'xl' })
    })
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

  getImg(card: string) {
    let cardImg = card.includes('10') ? '0.png' : card.includes('A') ? '1.png' : card.includes('2') ? '2.png' : card.includes('3') ? '3.png' : card.includes('4') ? '4.png' : card.includes('6') ? '6.png' : card.includes('K') ? 'wicket.png' : card;
    return cardImg;
  }

  trackByFunc(index: number, item: any) {
    return item.sid;
  }
  trackByMid(index: number, item: any) {
    return item.mid;
  }
  submitbet() {
    this.placeLoader = true;
    var dt = { roundid: this.roundId, matchcode: 'superover2', matchname: 'Super Over 2', betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid };
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
  displayToast(msg: any, type: any) {
    if (type == "success") {
      this.toastr.success(msg, '', { timeOut: 3000, positionClass: 'toast-top-center', closeButton: true });
    } else {
      this.toastr.error(msg, '', { timeOut: 3000, positionClass: 'toast-top-center', closeButton: true });
    }
  }
  getObjectKeys(obj: any) {
    return Object.keys(obj);
  }
  twoDecimal(num: number) {
    if (num) return num.toFixed(2);
    return 0.00;
  }
  gameTabClicked() { this.bettab = false; this.gametab = true; }

  betTabClicked() { this.bettab = true; this.gametab = false; }

  clickSetButtonTab(name: any) { this.setButtonTab = name; }

  openButtons(content: any) {
    this.userauth.getButtons().subscribe({
      next: (res) => {
        this.userButtons = res;
        this.modalService.open(content, { size: 'md' });
      }, error: (e) => console.log(e)
    })
  }
  updateButtons() {
    this.userauth.updateButtons(this.userButtons).subscribe({
      next: (res: any) => {
        this.toastr.success(res.message, '', { timeOut: 3000, positionClass: 'toast-top-center', closeButton: true });
        this.modalService.dismissAll();
      }, error: (e) => {
        this.toastr.error(e.error.message, '', { timeOut: 3000, positionClass: 'toast-top-center', closeButton: true });
        this.modalService.dismissAll();
      }
    })
  }

}
