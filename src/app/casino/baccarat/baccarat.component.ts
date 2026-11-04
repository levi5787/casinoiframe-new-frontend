import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { MatchService } from '../../services/match.service';
import { SocketService } from '../../services/socket.service';
import { UserauthService } from '../../services/userauth.service';
import { CommonModule } from '@angular/common';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';
declare var google: any;

@Component({
  selector: 'app-baccarat',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './baccarat.component.html',
  styleUrl: './baccarat.component.css'
})
export class BaccaratComponent {
  isSticky = false; sidebarTopOffset = 124; placebetButton: any = [];  userButtons: any = {}; setButtonTab='casino';
  loader = false; placeLoader = false; gametab = true; bettab = false;
  data:any;safeURL: any; mybets: any = []; mybooks: any = []; cvideoURL: any;
  winnerBook: any = []; playerPairBook: any = []; bankerPairBook: any = []; perfectPairBook: any = []; eitherPairBook: any = []; bigSmallBook: any = [];
  cards: any = []; roundId = ""; autotime = 0; clock: any; beforeNum = 0; min = 0; max = 0;
  playerData: any = {}; bankerData: any = {}; tieData: any = {}; playerpairData: any = {}; bankerpairData: any = {}; perfectpairData: any = {};
  bigData: any = {}; smallData: any = {}; eitherpairData: any = {};

  betFor = ""; odds = 0; betType = ""; stake: any = null; profit = 0; loss = 0; showbetform = false; oddsType = ""; sid = 0;
  results: any = []; graphdata: any = {}; temprId = ""; tempCards: any = []; tempWin = "";
  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false;
  @ViewChild('chartContainer') chartContainer!: ElementRef; chartInterval: any;
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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3044');
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'baccarat').subscribe((data: any) => {
      this.data = data['data'];
      //code for flipclock
      this.autotime = parseInt(data['data']['t1'][0]['autotime']);
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end
      this.min = data['data']['t2'][0]['min'];
      this.max = data['data']['t2'][0]['max'];
      if (this.roundId != data['data']['t1'][0]['mid']) {
        this.clearBooks();
      }
      this.roundId = data['data']['t1'][0]['mid'];
      this.cards = [data.data.t1[0].C1, data.data.t1[0].C2, data.data.t1[0].C3, data.data.t1[0].C4, data.data.t1[0].C5, data.data.t1[0].C6]
      this.playerData = data.data.t2[0]; this.bankerData = data.data.t2[1]; this.tieData = data.data.t2[2];
      this.playerpairData = data.data.t2[3]; this.bankerpairData = data.data.t2[4]; this.perfectpairData = data.data.t2[5];
      this.bigData = data.data.t2[6]; this.smallData = data.data.t2[7]; this.eitherpairData = data.data.t2[8];
    });
    this.socket_service.casinolast10('Last10', 'baccarat').subscribe((winnerdata: any) => {
      this.results = winnerdata['data'];
      //this.results = this.results.reverse();
      this.graphdata = winnerdata.graphdata;
      this.drawChart();
    });
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(this.drawChart.bind(this));
    this.chartInterval = setInterval(() => {
      this.drawChart();
    }, 5000);
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
  trackByFunc(index: number, item: any) {
    return item.sid;
  }
  ngOnDestroy() {
    if (this.chartInterval) {
      clearInterval(this.chartInterval);
    }
    this.socket_service.leavaAllRooms();
  }
  getCvideoURL() {
    this.match_service.getCVideo('baccarat').subscribe({
      next: (res: any) => {
        //console.log(res)
        const url = res.url;
        this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(url)
      }, error: (e) => {
        console.log(e)
      }
    })
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
      console.log(winnerdata)
      this.temprId = rid;
      this.tempCards = winnerdata.data[0].cards.split(',');
      this.tempWin = winnerdata.data[0].win;
    })
  }
  submitbet() {
    this.placeLoader = true;
    var dt = { roundid: this.roundId, matchcode: 'baccarat', matchname: 'Baccarat', betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid };
    this.userauth.placeCasinoBet(dt).subscribe({
      next: (res: any) => {
        this.placeLoader = false;
        this.showbetform = false;
        this.displayToast(res.message, res.status);
        this.getopenbet(); this.userauth.getUserBalance();
        this.modalService.dismissAll();
      },
      error: (e) => {
        this.showbetform = false;
        this.placeLoader = false;
        this.displayToast(e.error.message, "failed")
        this.modalService.dismissAll();
      }
    })
  }
  getopenbet() {
    this.userauth.getCasinoOpenBet("baccarat", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          if (item.oddsType == "Winner") { this.winnerBook = item.book }
          else if (item.oddsType == "PlayerPair") { this.playerPairBook = item.book }
          else if (item.oddsType == "BankerPair") { this.bankerpairData = item.book }
          else if (item.oddsType == "PerfectPair") { this.perfectPairBook = item.book }
          else if (item.oddsType == "EitherPair") { this.eitherPairBook = item.book }
          else if (item.oddsType == "BigSmall") { this.bigSmallBook = item.book }
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
    this.winnerBook = []; this.playerPairBook = []; this.bankerPairBook = []; this.perfectPairBook = []; this.eitherPairBook = []; this.bigSmallBook = []; this.mybets=[];
  }
  drawChart() {
    const data = google.visualization.arrayToDataTable([
      ['Nation', 'Won'],
      ['Player', this.graphdata.P],
      ['Banker', this.graphdata.B],
      ['Tie', this.graphdata.T],
    ]);
    const options = {
      title: 'Statistics',
      is3D: true,
      backgroundColor: '#eee',
      colors: ['#086cb8', '#ae2130', '#279532'],
      titleTextStyle: {
        bold: true,
        fontSize: 16
      },
      chartArea: {
        top: 20,
        width: '100%',
        height: '90%'
      }
    };
    const chart = new google.visualization.PieChart(this.chartContainer.nativeElement);
    chart.draw(data, options);
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
