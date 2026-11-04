import { Component, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatchService } from '../../services/match.service';
import { SocketService } from '../../services/socket.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserauthService } from '../../services/userauth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';

@Component({
  selector: 'app-btable2',
  standalone: true,
  imports: [CommonModule, FormsModule, ShortNumberPipe],
  templateUrl: './btable2.component.html',
  styleUrl: './btable2.component.css'
})
export class Btable2Component {
  bettab = false; gametab = true; loader = false; placeLoader = false; userButtons: any = {}; setButtonTab = 'casino';
  isSticky = false; sidebarTopOffset = 124; placebetButton: any = []; cvideoURL: any;
  data: any; safeURL: any; autotime = 0; clock: any; beforeNum = 0; mybets: any = []; mybooks: any = [];
  card = ""; roundId = ""; winnerBook: any = []; oddevenBook: any = []; dulhadulhanBook: any = []; baratiBook: any = []; redBook: any = [];
  blackBook: any = []; cardJBook: any = []; cardQBook: any = []; cardKBook: any = []; cardABook: any = []
  aback: any = []; alay: any = []; bback: any = []; blay: any = []; cback: any = []; clay: any = []; dback: any = []; dlay: any = []; eback: any = []; elay: any = []; fback: any = []; flay: any = []; oddback: any = []; oddlay: any = [];
  dulhadulhan: any = []; barati: any = []; red: any = []; black: any = []; J: any = []; Q: any = []; K: any = []; A: any = [];

  agstatus = ""; bgstatus = ""; cgstatus = ""; dgstatus = ""; egstatus = ""; fgstatus = ""; oddgstatus = "";
  dulhadulhangstatus = ""; baratigstatus = ""; redgstatus = ""; blackgstatus = ""; Jgstatus = ""; Qgstatus = ""; Kgstatus = ""; Agstatus = "";

  min: any; max: any;
  playersmin = 0; playersmax = 0; oddmin = 0; oddmax = 0; ddmin = 0; ddmax = 0; baratimin = 0; baratimax = 0; redblackmin = 0; redblackmax = 0; cardsmin = 0; cardsmax = 0;

  betFor = ""; odds = 0; betType = ""; stake: any = null; profit = 0; loss = 0; showbetform = false; oddsType = ""; sid = 0;
  results: any = []; tempCard: any = []; tempWin = ""; temprId = ""; desc: any = [];
  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false; activeRname = "";
  mtime: any;
  tempDesc: any;

  constructor(
    private _sanitizer: DomSanitizer,
    private match_service: MatchService,
    private socket_service: SocketService,
    private modalService: NgbModal,
    private userauth: UserauthService,
    private toastr: ToastrService
  ) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = (window.pageYOffset >= this.sidebarTopOffset);
    //console.log(this.sidebarTopOffset)
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo()
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3072')
    //ßthis.getCvideoURL();
    this.socket_service.casinodata('Casino', 'btable2').subscribe((data: any) => {
      this.data = data.data;
      //code for flipclock
      this.autotime = parseInt(data['data']['lt']);
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end

      this.card = "/img/cards-new/" + data['data']['card'].replace("1,1,1,1,1,1", "1") + ".png";
      // console.log(this.card);
      if (this.roundId != data['data']['mid']) {
        this.clearBooks(); this.mybets = [];
      }
      this.roundId = data['data']['mid'];
      this.alay = this.data.sub[0]; this.aback = this.data.sub[0];
      this.blay = this.data.sub[1]; this.bback = this.data.sub[1];
      this.clay = this.data.sub[2]; this.cback = this.data.sub[2];
      this.dback = this.data.sub[3]; this.dlay = this.data.sub[3];
      this.eback = this.data.sub[4]; this.elay = this.data.sub[4];
      this.fback = this.data.sub[5]; this.flay = this.data.sub[5];
      this.oddback = this.data.sub[6]; this.oddlay = this.data.sub[6];
      this.dulhadulhan = this.data.sub[13]; this.barati = this.data.sub[14];
      this.red = this.data.sub[7]; this.black = this.data.sub[8];
      this.J = this.data.sub[9]; this.Q = this.data.sub[10];
      this.K = this.data.sub[11]; this.A = this.data.sub[12];

    })
    this.socket_service.casinolast10('Last10', 'btable2').subscribe((winnerdata: any) => {
      this.results = winnerdata['data'].res
      // console.log(this.results)
      // this.results = this.results.reverse()
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
    this.match_service.getCVideo('btable2').subscribe({
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
  openBetForm(content: any, betfor: string, odds: any, type: string, sid: number, oddstype: string, min: any, max: any) {
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
      console.log(rid)
      this.loader = false;
      this.modalService.open(content, { size: 'xl' })
     // console.log(winnerdata)
      this.temprId = rid;
      const result = winnerdata.data?.[0];
      this.tempCard = result.card;
      this.mtime =result.mtime;
      this.tempDesc = result.rdesc.split('#');
      //  console.log(this.tempDesc)
    })
  }
  submitbet() {
    this.placeLoader = true;
    var dt = { roundid: this.roundId, matchcode: 'btable2', matchname: 'Bollywood Casino 2', betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid };
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
    this.userauth.getCasinoOpenBet("btable2", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        //console.log(this.mybets)
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          if (item.oddsType == "Winner") { this.winnerBook = item.book }
          else if (item.oddsType == "OddEven") { this.oddevenBook = item.book }
          else if (item.oddsType == "Red") { this.redBook = item.book }
          else if (item.oddsType == "Black") { this.blackBook = item.book }
          else if (item.oddsType == "CardJ") { this.cardJBook = item.book }
          else if (item.oddsType == "CardQ") { this.cardQBook = item.book }
          else if (item.oddsType == "CardK") { this.cardKBook = item.book }
          else if (item.oddsType == "CardA") { this.cardABook = item.book }
          else if (item.oddsType == "DulhaDulhan") { this.dulhadulhanBook = item.book }
          else if (item.oddsType == "Barati") { this.baratiBook = item.book }
          // console.log(this.mybooks)
        });
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
    this.winnerBook = []; this.oddevenBook = []; this.redBook = []; this.blackBook = []; this.cardJBook = []; this.cardQBook = []; this.cardKBook = []; this.cardABook = []; this.baratiBook = [];
    this.dulhadulhanBook = []
  }
  clickInfo(name: any) {
    if (this.activeRname == name) {
      this.activeRname = "";
    } else {
      this.activeRname = name;
    }
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
  removeDecimal(num: any): string {
    if (isNaN(Number(num))) {
      return "Invalid input";
    }
    return parseFloat(num).toString();
  }
}
