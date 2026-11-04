import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { MatchService } from '../../services/match.service';
import { SocketService } from '../../services/socket.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UserauthService } from '../../services/userauth.service';
import { CommonModule } from '@angular/common';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';

@Component({
  selector: 'app-dt6',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './dt6.component.html',
  styleUrl: './dt6.component.css'
})
export class Dt6Component  implements OnInit{
  loader=false; placeLoader=false; gametab=true; bettab=false; userButtons: any = {}; setButtonTab='casino';
  isSticky = false; sidebarTopOffset = 124; placebetButton:any=[]; cvideoURL:any;
  data:any;safeURL: any; mybets: any = []; mybooks: any = []; winnerBook: any = []; pairBook: any = []; doddevenBook: any = [];
  toddevenBook: any = []; dredblackBook: any = []; tredblackBook: any = []; dsuitsBook: any = []; tsuitsBook: any = [];
  c1 = ""; c2 = ""; roundId = ""; pair = ""; autotime = 0; clock: any; beforeNum = 0;
  Dback = ""; Dlay = ""; Deven = ""; Dodd = ""; Dred = ""; Dblack = ""; Dspade = ""; Dheart = ""; Dclub = ""; Ddiamond = "";
  Tback = ""; Tlay = ""; Teven = ""; Todd = ""; Tred = ""; Tblack = ""; Tspade = ""; Theart = ""; Tclub = ""; Tdiamond = "";

  min:any; max:any;
  backlaymin=0; backlaymax=0; oddevenmin=0; oddevenmax=0; redblackmin=0; redblackmax=0; pairmin=0; pairmax=0; dtgmin=0; dtgmax=0;

  pairgstatus = "";
  Dgstatus = ""; Devengstatus = ""; Doddgstatus = ""; Dredgstatus = ""; Dblackgstatus = ""; Dspadegstatus = ""; Dheartgstatus = ""; Dclubgstatus = ""; Ddiamondgstatus = "";
  Tgstatus = ""; Tevengstatus = ""; Toddgstatus = ""; Tredgstatus = ""; Tblackgstatus = ""; Tspadegstatus = ""; Theartgstatus = ""; Tclubgstatus = ""; Tdiamondgstatus = "";

  betFor = ""; odds = 0; betType = ""; oddsType = ""; stake: any = null; profit = 0; loss = 0; showbetform = false; sid = 0;
  results: any = []; tempCard: any = []; tempWin = ""; temprId = ""; desc: any = [];
  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false; activeRname="";

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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL+'?id=3057')
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'dt6').subscribe((data: any) => {
      this.data = data['data'];
      //code for flipclock
      this.autotime = parseInt(data['data']['t1'][0]['autotime']);
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end

      if (this.roundId != data['data']['t1'][0]['mid']) {
        this.clearBooks(); this.mybets=[];
      }
      this.roundId = data['data']['t1'][0]['mid'];
      this.c1 = "/img/cards/" + data['data']['t1'][0]['C1'] + ".png";
      this.c2 = "/img/cards/" + data['data']['t1'][0]['C2'] + ".png";
      this.Dback = data['data']['t2'][0]['b1']; this.Dlay = data['data']['t2'][0]['l1'];
      this.Tback = data['data']['t2'][1]['b1']; this.Tlay = data['data']['t2'][1]['l1'];

      this.pair = data['data']['t2'][2]['b1']; this.Deven = data['data']['t2'][3]['b1'];
      this.Dodd = data['data']['t2'][4]['b1']; this.Dred = data['data']['t2'][5]['b1'];
      this.Dblack = data['data']['t2'][6]['b1']; this.Dspade = data['data']['t2'][7]['b1'];
      this.Dheart = data['data']['t2'][8]['b1']; this.Ddiamond = data['data']['t2'][9]['b1'];
      this.Dclub = data['data']['t2'][10]['b1'];
      this.Teven = data['data']['t2'][11]['b1']; this.Todd = data['data']['t2'][12]['b1'];
      this.Tred = data['data']['t2'][13]['b1']; this.Tblack = data['data']['t2'][14]['b1'];
      this.Tspade = data['data']['t2'][15]['b1']; this.Theart = data['data']['t2'][16]['b1'];
      this.Tdiamond = data['data']['t2'][17]['b1']; this.Tclub = data['data']['t2'][18]['b1'];

      this.backlaymin = data['data']['t2'][0]['min']; this.backlaymax = data['data']['t2'][0]['max'];
      this.pairmin = data['data']['t2'][2]['min']; this.pairmax = data['data']['t2'][2]['max'];
      this.oddevenmin = data['data']['t2'][3]['min']; this.oddevenmax = data['data']['t2'][3]['max'];
      this.redblackmin = data['data']['t2'][5]['min']; this.redblackmax = data['data']['t2'][5]['max'];
      this.dtgmin = data['data']['t2'][7]['min']; this.dtgmax = data['data']['t2'][7]['max'];

      this.Dgstatus = data['data']['t2'][0]['gstatus']; this.Tgstatus = data['data']['t2'][1]['gstatus'];
      this.pairgstatus = data['data']['t2'][2]['gstatus']; this.Devengstatus = data['data']['t2'][3]['gstatus'];
      this.Doddgstatus = data['data']['t2'][4]['gstatus']; this.Dredgstatus = data['data']['t2'][5]['gstatus'];
      this.Dblackgstatus = data['data']['t2'][6]['gstatus']; this.Dspadegstatus = data['data']['t2'][7]['gstatus'];
      this.Dheartgstatus = data['data']['t2'][8]['gstatus']; this.Ddiamondgstatus = data['data']['t2'][9]['gstatus'];
      this.Dclubgstatus = data['data']['t2'][10]['gstatus']; this.Tevengstatus = data['data']['t2'][11]['gstatus'];
      this.Toddgstatus = data['data']['t2'][12]['gstatus']; this.Tredgstatus = data['data']['t2'][13]['gstatus'];
      this.Tblackgstatus = data['data']['t2'][14]['gstatus']; this.Tspadegstatus = data['data']['t2'][15]['gstatus'];
      this.Theartgstatus = data['data']['t2'][16]['gstatus']; this.Tdiamondgstatus = data['data']['t2'][17]['gstatus'];
      this.Tclubgstatus = data['data']['t2'][18]['gstatus'];
    })
    this.socket_service.casinolast10('Last10', 'dt6').subscribe((winnerdata: any) => {
      this.results = winnerdata['data'];
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
    this.match_service.getCVideo('dt6').subscribe({
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
  openBetForm(content:any,betfor: string, odds: any, type: string, sid: number, oddstype: string, min:any, max:any) {
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
    if(window.innerWidth<1100){
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
    this.modalService.open(content, { size: 'xl' });
  }
  openResult(content: any, rid: any) {
    this.loader=true;
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      this.loader=false;
      this.modalService.open(content, { size: 'xl' })
      //console.log(winnerdata)
      this.temprId = rid;
      this.tempCard = winnerdata['data'][0]['cards'].split(',');
      this.tempWin = winnerdata['data'][0]['win'];
      this.desc = winnerdata['data'][0]['desc'].split('*');
    })
  }
  submitbet() {
    this.placeLoader=true;
    var dt = { roundid: this.roundId, matchcode: 'dt6', matchname: 'Oneday Dragon Tiger', betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid };
    this.userauth.placeCasinoBet(dt).subscribe({
      next: (res: any) => {
        this.placeLoader=false;
        this.showbetform = false;
        this.displayToast(res.message,res.status);
        this.getopenbet();this.userauth.getUserBalance();
        this.modalService.dismissAll();
      },
      error: (e) => {
        this.placeLoader=false;
        this.showbetform = false;
        this.displayToast(e.error.message, "failed");
        this.modalService.dismissAll();
      }
    })
  }
  getopenbet() {
    this.userauth.getCasinoOpenBet("dt6", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          item.oddsType == 'Winner' ? this.winnerBook = item.book : item.oddsType == 'Pair' ? this.pairBook = item.book
            : item.oddsType == 'DOddEven' ? this.doddevenBook = item.book : item.oddsType == 'TOddEven' ? this.toddevenBook = item.book
              : item.oddsType == 'DRedBlack' ? this.dredblackBook = item.book : item.oddsType == 'TRedBlack' ? this.tredblackBook = item.book
                : item.oddsType == 'DSuits' ? this.dsuitsBook = item.book : item.oddsType == 'TSuits' ? this.tsuitsBook = item.book : null
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
    this.winnerBook = []; this.pairBook = []; this.doddevenBook = []; this.toddevenBook = [];
    this.dredblackBook = []; this.tredblackBook = []; this.dsuitsBook = []; this.tsuitsBook = [];
  }
  clickInfo(name:any){
    if(this.activeRname==name){
      this.activeRname = "";
    }else{
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
  removeDecimal(num: any): string {
    if (isNaN(Number(num))) {
      return "Invalid input";
    }
    return parseFloat(num).toString();
  }
}
