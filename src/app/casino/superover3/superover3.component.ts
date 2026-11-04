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
  selector: 'app-superover3',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './superover3.component.html',
  styleUrl: './superover3.component.css'
})
export class Superover3Component {

  loader = false; placeLoader = false; gametab = true; bettab = false; userButtons: any = {}; setButtonTab = 'casino';
  isSticky = false; sidebarTopOffset = 124; placebetButton: any = []; cvideoURL: any;
  safeURL: any; mybets: any = []; mybooks: any = []; bookmakerBook = []; fancyBook: any = {}; fancy1Book: any = {}; tieBook: any = {};
  roundId = ""; autotime = 0; clock: any; beforeNum = 0;
  data: any = []; t2: any = []; bookmaker: any = []; fancy: any = []; fancy1: any = []; tie: any = [];
  c1 = ""; c2 = ""; c3 = ""; c4 = "";
  min:any; max:any;

  betFor = ""; odds = 0; betType = ""; stake: any = null; profit = 0; loss = 0; showbetform = false; oddsType = ""; sid = 0;
  results: any = [];
  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false; Score: any; balls: any = [];

  temprId = ""; tempDate=""; tempWinner = ""; tempdesc = "";
  tempScore: any = { indScore: [], ausScore: [], indWkt: 0, indRun: 0, ausWkt: 0, ausRun: 0 };

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
    this.cvideoURL = this.match_service.getCasinoVideo()
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3064');
    this.socket_service.casinodata('Casino', 'superover3').subscribe((data: any) => {
      this.data = data.data;
      //console.log(data)
      //code for flipclock
      this.autotime = parseInt(this.data['t1']['lt']);
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end

      if (this.roundId != this.data['t1']['gmid']) {
        this.bookmakerBook = []; this.fancyBook = []; this.fancy1Book = []; this.tieBook = []; this.mybets = [];
      }
      this.roundId = this.data['t1']['gmid'];
      // cards
      let cards = this.data['t1']['card'];
      cards = cards.split('|')
      this.c1 = this.getImg(cards[0]);
      this.c2 = this.getImg(cards[1]);
      this.c3 = this.getImg(cards[2]);
      this.c4 = this.getImg(cards[3]);

      this.t2 = this.data['t2'];
      this.t2.forEach((item: any) => {
        if (item.mname == "Bookmaker") {
          this.bookmaker = {
            ...item, section: item.section.map((m: any) => {
              //console.log(m.odds.sort((a: any, b: any) => b.otype - a.otype))
              const sortedOdds = m.odds.sort((a: any, b: any) => a.otype.localeCompare(b.otype));
              return {
                ...m, odds: sortedOdds
              }
            })
          }
          //console.log(this.bookmaker)
        } else if (item.mname == 'Fancy') {
          this.fancy = {
            ...item, section: item.section.map((m: any) => {
              //console.log(m.odds.sort((a: any, b: any) => b.otype - a.otype))
              const sortedOdds = m.odds.sort((a: any, b: any) => b.otype.localeCompare(a.otype));
              return {
                ...m, odds: sortedOdds
              }
            })
          }
        } else if (item.mname == "Fancy1") {
          let fancy1All = item;
          this.fancy1 = { ...fancy1All, section: fancy1All.section.filter((f: any) => f.nat != 'Tie') }
          this.tie = fancy1All.section.find((f: any) => f.nat == 'Tie')
          //console.log(this.tie)
        }
      })
    })
    this.socket_service.casinolast10('Last10', 'superover3').subscribe((winnerdata: any) => {
      this.results = winnerdata['data']
      //this.results = this.results.reverse()
      //console.log(this.results)
    })
    this.socket_service.scoredata('Score', 'superover3').subscribe((data: any) => {
      if (!data) {
        this.Score = { spnnation1: 'IND', spnnation2: 'AUS', spnrunrate1: '0.00', score1: '0-0 (0.0)', score2: '0-0 (0.0)' }; this.balls = [];
        return;
      }
      if (data.data) {
        this.Score = data.data;
        this.balls = this.Score.balls;
        //console.log(this.Score)
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
  openBetForm(content: any, betfor: string, odds: any, type: string, sid: number, oddstype: string,min:number=0, max:number=0) {
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
      this.tempScore['ausScore'] = Score.filter((f: any) => f.nat == 'AUS')
      this.tempScore['indWkt'] = this.tempScore['indScore'].some((s: any) => s.wkt == true) ? 1 : 0;
      this.tempScore['ausWkt'] = this.tempScore['ausScore'].some((s: any) => s.wkt == true) ? 1 : 0;
      let rdscsplit = this.tempdesc.split(' | ')
      this.tempScore['indRun'] = rdscsplit[0].split(' : ')[1]
      this.tempScore['ausRun'] = rdscsplit[1].split(' : ')[1]
      this.modalService.open(content, { size: 'xl' })
    })
  }
  submitbet() {
    this.placeLoader = true;
    var dt = { roundid: this.roundId, matchcode: 'superover3', matchname: 'Mini SuperOver', betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid };
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
    this.mybooks = []; this.bookmakerBook = []; this.fancyBook = {}; this.fancy1Book = {}; this.tieBook = {};
    this.userauth.getCasinoOpenBet("superover3", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        console.log(this.mybooks)
        let fancy: any = []; let fancy1: any = [];
        this.mybooks.forEach((item: any) => {
          if (item.oddsType == "Bookmaker") {
            this.bookmakerBook = item.book;
          } else if (item.oddsType == "Tie") {
            this.tieBook = item.book;
            console.log(this.tieBook)
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
  getObjectKeys(obj: any) {
    return Object.keys(obj);
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
