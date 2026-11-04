import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { SocketService } from '../../services/socket.service';
import { MatchService } from '../../services/match.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserauthService } from '../../services/userauth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';

@Component({
  selector: 'app-dt202',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './dt202.component.html',
  styleUrl: './dt202.component.css'
})
export class Dt202Component {
  loader = false; placeLoader = false; gametab = true; bettab = false; userButtons: any = {}; setButtonTab = 'casino';
  isSticky = false; sidebarTopOffset = 124; placebetButton: any = []; cvideoURL: any;
  data: any; safeURL: any; winnerBook: any = []; pairBook: any = []; doddevenBook: any = []; dredblackBook: any = []; dcardBook: any = [];
  toddevenBook: any = []; tredblackBook: any = []; tcardBook: any = [];
  c1 = ""; c2 = ""; mybets: any = []; mybooks: any = [];
  roundId = ""; autotime = 0; clock: any; beforeNum = 0;

  dragonrate = ""; tigerrate = ""; tierate = ""; pairrate = "";
  dragonevenrate = ""; dragonoddrate = ""; dragonredrate = ""; dragonblackrate = "";
  D1rate = ""; D2rate = ""; D3rate = ""; D4rate = ""; D5rate = ""; D6rate = ""; D7rate = ""; D8rate = ""; D9rate = ""; D10rate = ""; D11rate = ""; D12rate = ""; D13rate = "";
  tigerevenrate = ""; tigeroddrate = ""; tigerredrate = ""; tigerblackrate = "";
  T1rate = ""; T2rate = ""; T3rate = ""; T4rate = ""; T5rate = ""; T6rate = ""; T7rate = ""; T8rate = ""; T9rate = ""; T10rate = ""; T11rate = ""; T12rate = ""; T13rate = "";

  dragongstatus = ""; tigergstatus = ""; tiegstatus = ""; pairgstatus = "";
  dragonevengstatus = ""; dragonoddgstatus = ""; dragonredgstatus = ""; dragonblackgstatus = "";
  D1gstatus = ""; D2gstatus = ""; D3gstatus = ""; D4gstatus = ""; D5gstatus = ""; D6gstatus = ""; D7gstatus = ""; D8gstatus = ""; D9gstatus = ""; D10gstatus = ""; D11gstatus = ""; D12gstatus = ""; D13gstatus = "";
  tigerevengstatus = ""; tigeroddgstatus = ""; tigerredgstatus = ""; tigerblackgstatus = "";
  T1gstatus = ""; T2gstatus = ""; T3gstatus = ""; T4gstatus = ""; T5gstatus = ""; T6gstatus = ""; T7gstatus = ""; T8gstatus = ""; T9gstatus = ""; T10gstatus = ""; T11gstatus = ""; T12gstatus = ""; T13gstatus = "";

  Dttpmin = 0; Dttpmax = 0; min:any; max:any;
  Doddevenmin = 0; Doddevenmax = 0; Dredblackmin = 0; Dredblackmax = 0; Dcardsmin = 0; Dcardsmax = 0;
  Toddevenmin = 0; Toddevenmax = 0; Tredblackmin = 0; Tredblackmax = 0; Tcardsmin = 0; Tcardsmax = 0;
  betFor = ""; odds = 0; betType = ""; stake: any = null; profit = 0; loss = 0; showbetform = false; oddsType = ""; sid = 0;
  results: any = []; tempCard: any = []; tempWin = ""; temprId = ""; desc: any = [];
  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false;

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
    // console.log(this.sidebarTopOffset)
  }

  removeDecimal(num: any): string {
    if (isNaN(Number(num))) {
      return "Invalid input";
    }
    return parseFloat(num).toString();
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo()
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3059')
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'dt202').subscribe((data: any) => {
      this.data = data['data'];
      this.c1 = "/img/cards/" + data['data']['t1'][0]['C1'] + ".png";
      this.c2 = "/img/cards/" + data['data']['t1'][0]['C2'] + ".png";
      if (this.roundId != data['data']['t1'][0]['mid']) {
        this.clearBooks(); this.mybets = [];
      }
      this.roundId = data['data']['t1'][0]['mid'];
      //code for flipclock
      this.autotime = parseInt(data['data']['t1'][0]['autotime']);
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end

      this.dragonrate = this.removeDecimal(data['data']['t2'][0]['rate']); this.tigerrate = this.removeDecimal(data['data']['t2'][1]['rate']);
      this.tierate = this.removeDecimal(data['data']['t2'][2]['rate']); this.pairrate = this.removeDecimal(data['data']['t2'][3]['rate']);
      this.dragonevenrate = this.removeDecimal(data['data']['t2'][4]['rate']); this.dragonoddrate = this.removeDecimal(data['data']['t2'][5]['rate']);
      this.dragonredrate = this.removeDecimal(data['data']['t2'][6]['rate']); this.dragonblackrate = (data['data']['t2'][7]['rate']);
      this.D1rate = this.removeDecimal(data['data']['t2'][8]['rate']); this.D2rate = this.removeDecimal(data['data']['t2'][9]['rate']);
      this.D3rate = this.removeDecimal(data['data']['t2'][10]['rate']); this.D4rate = this.removeDecimal(data['data']['t2'][11]['rate']);
      this.D5rate = this.removeDecimal(data['data']['t2'][12]['rate']); this.D6rate = this.removeDecimal(data['data']['t2'][13]['rate']);
      this.D9rate = this.removeDecimal(data['data']['t2'][16]['rate']); this.D10rate = this.removeDecimal(data['data']['t2'][17]['rate']);
      this.D11rate = this.removeDecimal(data['data']['t2'][18]['rate']); this.D12rate = this.removeDecimal(data['data']['t2'][19]['rate']);
      this.D13rate = this.removeDecimal(data['data']['t2'][20]['rate']); this.tigerevenrate = this.removeDecimal(data['data']['t2'][21]['rate']);
      this.tigeroddrate = this.removeDecimal(data['data']['t2'][22]['rate']); this.tigerredrate = this.removeDecimal(data['data']['t2'][23]['rate']);
      this.tigerblackrate = this.removeDecimal(data['data']['t2'][24]['rate']); this.T1rate = this.removeDecimal(data['data']['t2'][25]['rate']);
      this.T2rate = this.removeDecimal(data['data']['t2'][26]['rate']); this.T3rate = this.removeDecimal(data['data']['t2'][27]['rate']);
      this.T4rate = this.removeDecimal(data['data']['t2'][28]['rate']); this.T5rate = this.removeDecimal(data['data']['t2'][29]['rate']);
      this.T6rate = this.removeDecimal(data['data']['t2'][30]['rate']); this.T7rate = this.removeDecimal(data['data']['t2'][31]['rate']);
      this.T8rate = this.removeDecimal(data['data']['t2'][32]['rate']); this.T9rate = this.removeDecimal(data['data']['t2'][33]['rate']);
      this.T10rate = this.removeDecimal(data['data']['t2'][34]['rate']); this.T11rate = this.removeDecimal(data['data']['t2'][35]['rate']);
      this.T12rate = this.removeDecimal(data['data']['t2'][36]['rate']); this.T13rate = this.removeDecimal(data['data']['t2'][37]['rate']);

      this.dragongstatus = data['data']['t2'][0]['gstatus']; this.tigergstatus = data['data']['t2'][1]['gstatus'];
      this.tiegstatus = data['data']['t2'][2]['gstatus']; this.pairgstatus = data['data']['t2'][3]['gstatus'];
      this.dragonevengstatus = data['data']['t2'][4]['gstatus']; this.dragonoddgstatus = data['data']['t2'][5]['gstatus'];
      this.dragonredgstatus = data['data']['t2'][6]['gstatus']; this.dragonblackgstatus = data['data']['t2'][7]['gstatus'];
      this.D1gstatus = data['data']['t2'][8]['gstatus']; this.D2gstatus = data['data']['t2'][9]['gstatus'];
      this.D3gstatus = data['data']['t2'][10]['gstatus']; this.D4gstatus = data['data']['t2'][11]['gstatus'];
      this.D5gstatus = data['data']['t2'][12]['gstatus']; this.D6gstatus = data['data']['t2'][13]['gstatus'];
      this.D7gstatus = data['data']['t2'][14]['gstatus']; this.D8gstatus = data['data']['t2'][15]['gstatus'];
      this.D9gstatus = data['data']['t2'][16]['gstatus']; this.D10gstatus = data['data']['t2'][17]['gstatus'];
      this.D11gstatus = data['data']['t2'][18]['gstatus']; this.D12gstatus = data['data']['t2'][19]['gstatus'];
      this.D13gstatus = data['data']['t2'][20]['gstatus'];

      this.tigerevengstatus = data['data']['t2'][21]['gstatus']; this.tigeroddgstatus = data['data']['t2'][22]['gstatus'];
      this.tigerredgstatus = data['data']['t2'][23]['gstatus']; this.tigerblackgstatus = data['data']['t2'][24]['gstatus'];
      this.T1gstatus = data['data']['t2'][25]['gstatus']; this.T2gstatus = data['data']['t2'][26]['gstatus'];
      this.T3gstatus = data['data']['t2'][27]['gstatus']; this.T4gstatus = data['data']['t2'][28]['gstatus'];
      this.T5gstatus = data['data']['t2'][29]['gstatus']; this.T6gstatus = data['data']['t2'][30]['gstatus'];
      this.T7gstatus = data['data']['t2'][31]['gstatus']; this.T8gstatus = data['data']['t2'][32]['gstatus'];
      this.T9gstatus = data['data']['t2'][33]['gstatus']; this.T10gstatus = data['data']['t2'][34]['gstatus'];
      this.T11gstatus = data['data']['t2'][35]['gstatus']; this.T12gstatus = data['data']['t2'][36]['gstatus'];
      this.T13gstatus = data['data']['t2'][37]['gstatus'];

      this.Dttpmin = data['data']['t2'][0]['min']; this.Dttpmax = data['data']['t2'][0]['max'];
      this.Doddevenmin = data['data']['t2'][4]['min']; this.Doddevenmax = data['data']['t2'][4]['max'];
      this.Dredblackmin = data['data']['t2'][6]['min']; this.Dredblackmax = data['data']['t2'][6]['max'];
      this.Dcardsmin = data['data']['t2'][8]['min']; this.Dcardsmax = data['data']['t2'][8]['max'];
      this.Toddevenmin = data['data']['t2'][21]['min']; this.Toddevenmax = data['data']['t2'][21]['max'];
      this.Tredblackmin = data['data']['t2'][23]['min']; this.Tredblackmax = data['data']['t2'][23]['max'];
      this.Tcardsmin = data['data']['t2'][25]['min']; this.Tcardsmax = data['data']['t2'][25]['max'];
    })
    this.socket_service.casinolast10('Last10', 'dt202').subscribe((winnerdata: any) => {
      //console.log(winnerdata)
      this.results = winnerdata['data']
      // this.results = this.results.reverse();
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
    this.match_service.getCVideo('dt202').subscribe({
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
      //console.log(winnerdata)
      this.temprId = rid;
      this.tempCard = winnerdata['data'][0]['cards'].split(',');
      this.tempWin = winnerdata['data'][0]['win'];
      this.desc = winnerdata['data'][0]['desc'].split('*');
    })
  }
  submitbet() {
    this.placeLoader = true;
    var dt = { roundid: this.roundId, matchcode: 'dt202', matchname: '20-20 Dragon Tiger 2', betfor: this.betFor, bettype: 'back', oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid };
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
    this.userauth.getCasinoOpenBet("dt202", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          if (item.oddsType == "Winner") { this.winnerBook = item.book }
          else if (item.oddsType == "Pair") { this.pairBook = item.book }
          else if (item.oddsType == "DOddEven") { this.doddevenBook = item.book }
          else if (item.oddsType == "DRedBlack") { this.dredblackBook = item.book }
          else if (item.oddsType == "DCard") { this.dcardBook = item.book }
          else if (item.oddsType == "TOddEven") { this.toddevenBook = item.book }
          else if (item.oddsType == "TRedBlack") { this.tredblackBook = item.book }
          else if (item.oddsType == "TCard") { this.tcardBook = item.book }
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
    this.winnerBook = []; this.pairBook = []; this.doddevenBook = []; this.dredblackBook = []; this.dcardBook = [];
    this.toddevenBook = []; this.tredblackBook = []; this.tcardBook = [];
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
