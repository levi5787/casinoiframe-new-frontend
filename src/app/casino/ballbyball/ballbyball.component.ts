import { Component, HostListener, inject, NgModule, } from '@angular/core';
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
  selector: 'app-ballbyball',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './ballbyball.component.html',
  styleUrl: './ballbyball.component.css'
})
export class BallbyballComponent {
  gametab=true; bettab=false; safeURL: any; isSticky = false; userButtons: any = {}; setButtonTab='casino'; placeLoader=false;
  sidebarTopOffset = 124; mybets: any = []; mybooks: any = []; placebetButton: any = []; cvideoURL: any;
  runs0Book: any = []; runs1Book: any = []; runs2Book: any = []; runs3Book: any = []; runs4Book: any = []; runs5Book: any = []; runs6Book: any = [];
  boundaryBook: any = []; wicketBook: any = []; extraRunsBook: any = [];
  roundId = ""; autotime = 0; clock: any; beforeNum = 0; bounceEnter = false; rdesc = "";
  data: any; min:any; max:any; remark = "";
  zeroRundata: any = {}; oneRundata: any = {}; twoRundata: any = {}; threeRundata: any = {}; fourRundata: any = {}; sixRundata: any = {};
  boundaryRundata: any = {}; wicketdata: any = {}; extraRundata: any = {};


  betFor = ""; odds = 0; betType = ""; stake: any = null; profit = 0; loss = 0; showbetform = false; oddsType = ""; sid = 0;
  results: any = []; temprId = ""; tempDesc = "";
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

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo()
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3061');
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'ballbyball').subscribe((data: any) => {
      this.data = data.data.t1;
      //code for flipclock
      this.autotime = parseInt(this.data['lt']);
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end
      this.rdesc = this.data['rdesc'];

      if (this.rdesc != '') {
        this.bounceEnter = true;
        setTimeout(() => {
          this.bounceEnter = false;
        }, 2 * 1000);
      }
      if(this.roundId != this.data['mid']){
        this.clearBooks(); this.mybets=[];
      }
      this.roundId = this.data['mid'];
      this.min = this.data.sub[0]['min'];
      this.max = this.data.sub[0]['max'];
      this.remark = this.data.remark;

      this.zeroRundata = this.data.sub[0]; this.oneRundata = this.data.sub[1];
      this.twoRundata = this.data.sub[2]; this.threeRundata = this.data.sub[3];
      this.fourRundata = this.data.sub[4]; this.sixRundata = this.data.sub[5];
      this.boundaryRundata = this.data.sub[6]; this.wicketdata = this.data.sub[7];
      this.extraRundata = this.data.sub[8];
    })
    this.socket_service.casinolast10('Last10', 'ballbyball').subscribe((winnerdata: any) => {
      this.results = winnerdata['data']['res']
      //this.results = this.results.reverse()
      // console.log(winnerdata);
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
    this.socket_service.leavaAllRooms();
  }
  getCvideoURL() {
    this.match_service.getCVideo('ballbyball').subscribe({
      next: (res: any) => {
        //console.log(res)
        const url = res.url;
        this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(url)
      }, error: (e) => {
        console.log(e)
      }
    })
  }
  openBetForm(content: any, betfor: string, odds: any, type: string, sid: number, oddstype: string, min:number=0, max:number=0) {
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
    this.modalService.open(content, { size: 'lg' });;
  }
  openResult(content: any, rid: any) {
    this.modalService.open(content, { size: 'xl' })
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      //console.log(winnerdata)
      this.temprId = rid;
      //console.log(this.temprId);
      this.tempDesc = winnerdata.data[0].desc;
    })
  }
  submitbet() {
    this.placeLoader = true;
    var dt = { roundid: this.roundId, matchcode: 'ballbyball', matchname: 'Ball By Ball', betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid };
    this.userauth.placeCasinoBet(dt).subscribe({
      next: (res: any) => {
        this.placeLoader = false;
        this.displayToast(res.message, res.status);
        this.getopenbet(); this.userauth.getUserBalance();
        this.modalService.dismissAll();
      },
      error: (e) => {
        this.placeLoader = false;
        this.displayToast(e.error.message, "failed");
        this.modalService.dismissAll();
      }
    })
    this.showbetform = false;
  }
  getopenbet() {
    this.userauth.getCasinoOpenBet("ballbyball", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          if (item.oddsType == "0 Runs") { this.runs0Book = item.book }
          else if (item.oddsType == "1 Runs") { this.runs1Book = item.book }
          else if (item.oddsType == "2 Runs") { this.runs2Book = item.book }
          else if (item.oddsType == "3 Runs") { this.runs3Book = item.book }
          else if (item.oddsType == "4 Runs") { this.runs4Book = item.book }
          else if (item.oddsType == "5 Runs") { this.runs5Book = item.book }
          else if (item.oddsType == "6 Runs") { this.runs6Book = item.book }
          else if (item.oddsType == "Boundary") { this.boundaryBook = item.book }
          else if (item.oddsType == "Wicket") { this.wicketBook = item.book }
          else if (item.oddsType == "Extra Runs") { this.extraRunsBook = item.book }
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
  trackByFunc(index: number, item: any) {
    return item.sid;
  }
  trackByMid(index: number, item: any) {
    return item.mid;
  }
  clearBooks() {
    this.runs0Book = []; this.runs1Book = []; this.runs2Book = []; this.runs3Book = []; this.runs4Book = []; this.runs5Book = []; this.runs6Book = [];
    this.boundaryBook = []; this.wicketBook = []; this.extraRunsBook = [];
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
