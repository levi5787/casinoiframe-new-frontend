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
  selector: 'app-card32b',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './card32b.component.html',
  styleUrl: './card32b.component.css'
})
export class Card32bComponent {

  loader=false; placeLoader=false; userButtons: any = {}; setButtonTab='casino';
  gametab=true; bettab=false; isSticky = false; 
  sidebarTopOffset = 124; placebetButton:any=[]; cvideoURL:any;
  data:any;safeURL: any; mybets: any = []; mybooks: any = []; winnerBook: any = []; colorBook: any = []; oddeven8Book: any = [];
  oddeven9Book: any = []; oddeven10Book: any = []; oddeven11Book: any = []; totalBook: any = []; singleBook: any = [];
  autotime = 0; clock: any; beforeNum = 0; roundId = ""; min = 0; max = 0; cards: any = [];
  p8 = ""; p9 = ""; p10 = ""; p11 = ""; p8gstatus = ""; p9gstatus = ""; p10gstatus = ""; p11gstatus = "";
  p8back = ""; p9back = ""; p10back = ""; p11back = ""; p8lay = ""; p9lay = ""; p10lay = ""; p11lay = "";
  backlaymin = 0; backlaymax = 0; oddevenmin = 0; oddevenmax = 0; anymin = 0; anymax = 0; totalmin = 0; totalmax = 0; singlemin = 0; singlemax = 0;

  p8odd = ""; p8even = ""; p9odd = ""; p9even = ""; p10odd = ""; p10even = ""; p11odd = ""; p11even = "";
  any3cardblackback = ""; any3cardredback = ""; any3cardblacklay = ""; any3cardredlay = "";
  single1 = ""; single2 = ""; single3 = ""; single4 = ""; single5 = ""; single6 = ""; single7 = ""; single8 = ""; single9 = ""; single0 = "";
  total89 = ""; total1011 = ""; twoblack2redback = ""; twoblack2redlay = "";

  p8oddgstatus = ""; p8evengstatus = ""; p9oddgstatus = ""; p9evengstatus = ""; p10oddgstatus = ""; p10evengstatus = ""; p11oddgstatus = ""; p11evengstatus = "";
  any3cardblackgstatus = ""; any3cardredgstatus = "";
  single1gstatus = ""; single2gstatus = ""; single3gstatus = ""; single4gstatus = ""; single5gstatus = ""; single6gstatus = ""; single7gstatus = ""; single8gstatus = ""; single9gstatus = ""; single0gstatus = "";
  total89gstatus = ""; total1011gstatus = ""; twoblack2redgstatus = "";

  betFor = ""; odds = 0; betType = ""; oddsType = ""; stake: any = null; profit = 0; loss = 0; showbetform = false; sid = 0;
  results: any = [];
  temprId = ""; tempWinner = ""; tempCards: any = []; tempAdesc = ""; tempDesc = ""; winnerPlayer = "";
  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false; activeRange="";

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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL+'?id=3034')
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'card32eu').subscribe((data: any) => {
      this.data = data['data'];
      // console.log(data)
      //code for flipclock
      this.autotime = parseInt(data['data']['t1'][0]['autotime']);
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end

      if(this.roundId!=data['data']['t1'][0]['mid']){
        this.clearBooks(); this.mybets=[];
      }
      this.roundId = data['data']['t1'][0]['mid'];
      // this.min = data['data']['t1'][0]['min'];
      // this.max = data['data']['t1'][0]['max'];
      this.p8 = data['data']['t1'][0]['C1']
      this.p9 = data['data']['t1'][0]['C2']
      this.p10 = data['data']['t1'][0]['C3']
      this.p11 = data['data']['t1'][0]['C4']
      this.cards = data['data']['t1'][0]['desc'].split(',');
      //console.log(this.cards)

      this.p8back = data['data']['t2'][0]['b1']; this.p9back = data['data']['t2'][1]['b1'];
      this.p10back = data['data']['t2'][2]['b1']; this.p11back = data['data']['t2'][3]['b1'];

      this.p8lay = data['data']['t2'][0]['l1']; this.p9lay = data['data']['t2'][1]['l1'];
      this.p10lay = data['data']['t2'][2]['l1']; this.p11lay = data['data']['t2'][3]['l1'];

      this.backlaymin = data['data']['t2'][0]['min']; this.backlaymax = data['data']['t2'][0]['max'];
      this.oddevenmin = data['data']['t2'][4]['min']; this.oddevenmax = data['data']['t2'][4]['max'];
      this.anymin = data['data']['t2'][26]['min']; this.anymax = data['data']['t2'][26]['max'];
      this.totalmin = data['data']['t2'][25]['min']; this.totalmax = data['data']['t2'][25]['max'];
      this.singlemin = data['data']['t2'][14]['min']; this.singlemax = data['data']['t2'][14]['max'];

      this.p8gstatus = data['data']['t2'][0]['gstatus']; this.p9gstatus = data['data']['t2'][1]['gstatus'];
      this.p10gstatus = data['data']['t2'][2]['gstatus']; this.p11gstatus = data['data']['t2'][3]['gstatus'];

      this.p8odd = data['data']['t2'][4]['b1']; this.p8even = data['data']['t2'][5]['b1'];
      this.p9odd = data['data']['t2'][6]['b1']; this.p9even = data['data']['t2'][7]['b1'];
      this.p10odd = data['data']['t2'][8]['b1']; this.p10even = data['data']['t2'][9]['b1'];
      this.p11odd = data['data']['t2'][10]['b1']; this.p11even = data['data']['t2'][11]['b1'];
      this.any3cardblackback = data['data']['t2'][12]['b1']; this.any3cardblacklay = data['data']['t2'][12]['l1'];
      this.any3cardredback = data['data']['t2'][13]['b1']; this.any3cardredlay = data['data']['t2'][13]['l1'];
      this.single1 = data['data']['t2'][14]['b1']; this.single2 = data['data']['t2'][15]['b1'];
      this.single3 = data['data']['t2'][16]['b1']; this.single4 = data['data']['t2'][17]['b1'];
      this.single5 = data['data']['t2'][18]['b1']; this.single6 = data['data']['t2'][19]['b1'];
      this.single7 = data['data']['t2'][20]['b1']; this.single8 = data['data']['t2'][21]['b1'];
      this.single9 = data['data']['t2'][22]['b1']; this.single0 = data['data']['t2'][23]['b1'];
      this.total89 = data['data']['t2'][24]['b1']; this.total1011 = data['data']['t2'][25]['b1'];
      this.twoblack2redback = data['data']['t2'][26]['b1']; this.twoblack2redlay = data['data']['t2'][26]['l1'];


      this.p8oddgstatus = data['data']['t2'][4]['gstatus']; this.p8evengstatus = data['data']['t2'][5]['gstatus'];
      this.p9oddgstatus = data['data']['t2'][6]['gstatus']; this.p9evengstatus = data['data']['t2'][7]['gstatus'];
      this.p10oddgstatus = data['data']['t2'][8]['gstatus']; this.p10evengstatus = data['data']['t2'][9]['gstatus'];
      this.p11oddgstatus = data['data']['t2'][10]['gstatus']; this.p11evengstatus = data['data']['t2'][11]['gstatus'];
      this.any3cardblackgstatus = data['data']['t2'][12]['gstatus']; this.any3cardredgstatus = data['data']['t2'][13]['gstatus'];
      this.single1gstatus = data['data']['t2'][14]['gstatus']; this.single2gstatus = data['data']['t2'][15]['gstatus'];
      this.single3gstatus = data['data']['t2'][16]['gstatus']; this.single4gstatus = data['data']['t2'][17]['gstatus'];
      this.single5gstatus = data['data']['t2'][18]['gstatus']; this.single6gstatus = data['data']['t2'][19]['gstatus'];
      this.single7gstatus = data['data']['t2'][20]['gstatus']; this.single8gstatus = data['data']['t2'][21]['gstatus'];
      this.single9gstatus = data['data']['t2'][22]['gstatus']; this.single0gstatus = data['data']['t2'][23]['gstatus'];
      this.total89gstatus = data['data']['t2'][24]['gstatus']; this.total1011gstatus = data['data']['t2'][25]['gstatus'];
      this.twoblack2redgstatus = data['data']['t2'][26]['gstatus'];
    })
    this.socket_service.casinolast10('Last10', 'card32eu').subscribe((winnerdata: any) => {
      this.results = winnerdata['data']
      this.results = this.results.reverse();
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
    this.match_service.getCVideo('card32eu').subscribe({
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
  open(content: any ,) {
    this.modalService.open(content ,{size : 'lg'});
  }
  openResult(content: any, rid: any) {
    this.loader=true;
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      this.loader=false;
      this.modalService.open(content, { size: 'xl' })
      //console.log(winnerdata)
      this.temprId = rid;
      this.tempCards = winnerdata['data'][0]['cards'].split(',');
      this.tempWinner = winnerdata['data'][0]['win'];
      this.tempDesc = winnerdata['data'][0]['desc'];
    })
  }
  submitbet() {
    let bf = this.betFor;
    if (bf == "Black" || bf == "Red" || bf == "2-2") {
      bf = bf + ':Yes';
    }
    this.placeLoader=true;
    var dt = { roundid: this.roundId, matchcode: 'card32eu', matchname: '32 Cards - B', betfor: bf, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid };
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
    this.userauth.getCasinoOpenBet("card32eu", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          item.oddsType == 'Winner' ? this.winnerBook = item.book : item.oddsType == 'Color' ? this.colorBook = item.book
            : item.oddsType == 'OddEven8' ? this.oddeven8Book = item.book : item.oddsType == 'OddEven9' ? this.oddeven9Book = item.book
              : item.oddsType == 'OddEven10' ? this.oddeven10Book = item.book : item.oddsType == 'OddEven11' ? this.oddeven11Book = item.book
                : item.oddsType == 'Total' ? this.totalBook = item.book : item.oddsType == 'Single' ? this.singleBook = item.book : null
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
  clearBooks(){
    this.winnerBook=[];this.colorBook=[];this.oddeven8Book=[]; this.oddeven9Book=[];
    this.oddeven10Book=[];this.oddeven11Book=[];this.totalBook=[];this.singleBook=[];
  }
  clickRange(name:any){
    if(this.activeRange==name){
      this.activeRange="";
    }else{
      this.activeRange=name;
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
