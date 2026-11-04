import { Component, HostListener } from '@angular/core';
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
  selector: 'app-mogambo',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './mogambo.component.html',
  styleUrl: './mogambo.component.css'
})
export class MogamboComponent {
  loader = false; placeLoader = false; gametab = true; bettab = false; userButtons: any = {}; setButtonTab = 'casino';
  isSticky = false; sidebarTopOffset = 124; placebetButton: any = []; cvideoURL: any;
  safeURL: any; mybets: any = []; mybooks: any = []; bookmakerBook: any = []; fancyBook: any = {}; fancy1Book: any = {}; winnerBook: any = [];
  fancy2Book: any = [];
  roundId = ""; autotime = 0; beforeNum = 0; countdownInterval: any;
  data: any = {}; c1 = ""; c2 = ""; c3 = "";
  betFor = ""; odds = 0; betType = ""; stake: any = null; profit = 0; loss = 0; showbetform = false; oddsType = ""; sid = 0; rc1 = ""; rc2 = ""; rc3 = "";
  results: any = []; min: any; max: any;
  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false;
  temprId = ""; tempWinner = ""; tempdesc = ""; tempScore: any = []; tempCard: any = []; temptime: any = "";
  total: number = 0;

  // parsed market data
  mogambo: any = null;
  dagaTeja: any = null;
  cardTotal: any = null;

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
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo();
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3080');

    this.socket_service.casinodata('Casino', 'mogambo').subscribe((data: any) => {
      this.data = data.data;

      this.autotime = parseInt(data["data"]["lt"]);
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end
      if (this.roundId != data["data"]["mid"]) {
        this.mybets=[];
        this.winnerBook=[];
      }

      this.roundId = this.data['mid'];

      // parse sub array
      const sub = this.data['sub'] || [];
      this.mogambo = sub[0];
      this.dagaTeja = sub[1];
      this.cardTotal = sub[2];

      this.min = this.mogambo?.min || 100;
      this.max = this.mogambo?.max || 0;


      const cards = this.data['card'] ? this.data['card'].split(',') : ['1', '1', '1'];
      this.c1 = cards[0]; // Mogambo card
      this.c2 = cards[1]; // Daga/Teja card 1
      this.c3 = cards[2]; // Daga/Teja card 2

      // calculate total card
      this.total = this.calculateCardTotal(this.data['card']);

      // console.log("cards:",cards)
      // console.log("c1:",this.c1,"c2:",this.c2,"c3:",this.c3)

    });

    this.socket_service.casinolast10('Last10', 'mogambo').subscribe((winnerdata: any) => {
      // console.log(winnerdata);
      this.results = winnerdata?.data?.res || [];
    });

    setTimeout(() => {
      this.getopenbet();
      setTimeout(() => { this.getopenbet(); }, 2000);
    }, 1500);

    this.socket_service.updateCheck('User', this.userauth.getUsername()).subscribe((data: any) => {
      if (data.update) {
        this.userauth.getUserBalance();
        this.getopenbet();
      }
    });

    this.placeBetButton();
  }

  ngOnDestroy() {
    this.socket_service.leavaAllRooms;
  }

  getCardImg(card: string): string {
    if (!card || card === '1') return '/img/cards-new/1.png';
    return `/img/cards-new/${card}.png`;
  }

  // calculate total card -->
  calculateCardTotal(cardStr: string): number {
    if (!cardStr) return 0;

    const rankValues: { [key: string]: number } = { J: 11, Q: 12, K: 13, A: 1 };

    return cardStr.split('').reduce((sum, part) => {
      const match = part.trim().match(/^(10|[2-9]|[JQKA])/i);
      if (!match) return sum;

      const rank = match[1].toUpperCase();
      let value = rankValues[rank] !== undefined ? rankValues[rank] : parseInt(rank, 10);

      if (value === 1) value = 0; // treat 1 as zero

      return sum + value;
    }, 0);
  };

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

  hideBetPlace() { this.showbetform = false; }
  placeStake(val: number) { this.stake += val; }
  resetStake() { this.stake = null; this.profit = 0; this.loss = 0; }
  calcProfit(stake: any) { }

  submitbet() {
    this.placeLoader = true;
    const dt = { roundid: this.roundId, matchcode: 'mogambo', matchname: 'Mogambo', betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid };
    this.userauth.placeCasinoBet(dt).subscribe({
      next: (res: any) => {
        this.placeLoader = false; this.showbetform = false;
        this.displayToast(res.message, res.status);
        this.getopenbet(); this.userauth.getUserBalance();
        this.modalService.dismissAll();
      },
      error: (e) => {
        this.placeLoader = false; this.showbetform = false;
        this.displayToast(e.error.message, 'failed');
        this.modalService.dismissAll();
      }
    });
  }

  getopenbet() {
    this.mybooks = []; this.bookmakerBook = []; this.fancyBook = {}; this.fancy1Book = {};
    this.userauth.getCasinoOpenBet('mogambo', this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          if (item.oddsType === "winner") {
            this.winnerBook = item.book;
          } else if (item.oddsType === "fancy2") {
            this.fancy2Book = item.book
          }

        });
      }, error: (e) => console.log(e)
    });
  }

  placeBetButton() {
    this.userauth.getButtons().subscribe({
      next: (res: any) => { this.placebetButton = res.casinobutton; },
      error: (e) => console.log(e)
    });
  }

  displayToast(msg: any, type: any) {
    if (type === 'success') {
      this.toastr.success(msg, '', { timeOut: 3000, positionClass: 'toast-top-center', closeButton: true });
    } else {
      this.toastr.error(msg, '', { timeOut: 3000, positionClass: 'toast-top-center', closeButton: true });
    }
  }

  open(content: any) { this.modalService.open(content, { size: 'lg' }); }

  openRule(content: any) { this.modalService.open(content, { size: 'lg' }); }

  openResult(content: any, rid: any) {
    this.loader = true; this.tempScore = [];

    this.match_service.getResult(rid).subscribe({
      next: (winnerdata: any) => {
        this.loader = false;
        this.temprId = rid;
        const d = winnerdata?.data?.[0] || {};
        this.tempCard = d?.card || "1";
        this.tempWinner = d?.winnat || "";
        this.temptime = d?.mtime || "";
        this.tempdesc = d?.rdesc ? d.rdesc.split("#") : [];
        this.tempScore = this.calculateCardTotal(d['card']);
        this.modalService.open(content, { size: "xl" });
        // console.log(d); 

        const cards = d?.card?.split(",") || [];
        this.rc1 = cards[0] ? `/img/cards-new/${cards[0]}.png` : "";
        this.rc2 = cards[1] ? `/img/cards-new/${cards[1]}.png` : "";
        this.rc3 = cards[2] ? `/img/cards-new/${cards[2]}.png` : "";
      },
      error: (e) => {
        this.loader = false;
        console.log("getResult error:", e);
      },
    });
  }


  getObjectKeys(obj: any) { return Object.keys(obj); }

  twoDecimal(num: number) { if (num) return num.toFixed(2); return '0.00'; }

  gameTabClicked() { this.bettab = false; this.gametab = true; }

  betTabClicked() { this.bettab = true; this.gametab = false; }

  clickSetButtonTab(name: any) { this.setButtonTab = name; }

  trackByFunc(index: number, item: any) { return item?.sid || index; }

  trackByMid(index: number, item: any) { return item?.mid || index; }


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