import { Component, HostListener,OnInit, inject, NgModule ,} from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { MatchService } from '../../services/match.service';
import { SocketService } from '../../services/socket.service';
import { UserauthService } from '../../services/userauth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';import { ShortNumberPipe } from '../../pipes/short-number.pipe';
;
declare var FlipDown: any
@Component({
  selector: 'app-card32a',
  standalone: true,
  imports: [FormsModule,CommonModule, ShortNumberPipe],
  templateUrl: './card32a.component.html',
  styleUrl: './card32a.component.css'
})
export class Card32aComponent implements OnInit{
  gametab=true; bettab=false;   isSticky = false; userButtons: any = {}; setButtonTab='casino';
  sidebarTopOffset = 124; placebetButton:any=[]; loader=false; placeLoader=false;
  data:any;safeURL: any; mybets:any=[];mybooks:any=[];winnerBook:any=[]; cvideoURL:any;
  autotime = 0; clock: any; beforeNum = 0; roundId = ""; min = 0; max = 0; cards: any = []; 
  p8 = ""; p9 = ""; p10 = ""; p11 = ""; p8gstatus = ""; p9gstatus = ""; p10gstatus = ""; p11gstatus = "";
  p8back = ""; p9back = ""; p10back = ""; p11back = ""; p8lay = ""; p9lay = ""; p10lay = ""; p11lay = "";

  betFor = ""; odds = 0; betType = ""; oddsType=""; stake: any = null; profit = 0; loss = 0; showbetform = false;sid=0;
  results: any = [];
  temprId = ""; tempWinner = ""; tempCards: any = []; tempAdesc = ""; tempDesc = ""; winnerPlayer = "";
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
    console.log(this.sidebarTopOffset)
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo()
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL+'?id=3055')
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'card32').subscribe((data: any) => {
      this.data = data['data'];
      //code for flipclock
      this.autotime = parseInt(data['data']['t1'][0]['autotime']);
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end

      if(this.roundId!=data['data']['t1'][0]['mid']){
        this.winnerBook=[]; this.mybets=[];
      }
      this.roundId = data['data']['t1'][0]['mid'];
      this.min = data['data']['t1'][0]['min'];
      this.max = data['data']['t1'][0]['max'];
      this.p8 = data['data']['t1'][0]['C1']
      this.p9 = data['data']['t1'][0]['C2']
      this.p10 = data['data']['t1'][0]['C3']
      this.p11 = data['data']['t1'][0]['C4']
      this.cards = data['data']['t1'][0]['desc'].split(',');
      //console.log(this.cards)

      this.p8back = data['data']['t2'][0]['b1']; this.p9back = data['data']['t2'][1]['b1'];
      this.p10back = data['data']['t2'][2]['b1']; this.p11back = data['data']['t2'][3]['b1'];
      // console.log(this.p8back)

      this.p8lay = data['data']['t2'][0]['l1']; this.p9lay = data['data']['t2'][1]['l1'];
      this.p10lay = data['data']['t2'][2]['l1']; this.p11lay = data['data']['t2'][3]['l1'];

      this.p8gstatus = data['data']['t2'][0]['gstatus']; this.p9gstatus = data['data']['t2'][1]['gstatus'];
      this.p10gstatus = data['data']['t2'][2]['gstatus']; this.p11gstatus = data['data']['t2'][3]['gstatus'];
    })
    this.socket_service.casinolast10('Last10', 'card32').subscribe((winnerdata: any) => {
      this.results = winnerdata['data']
      this.results = this.results.reverse();
    })
    setTimeout(() => {
      this.getopenbet();
      setTimeout(() => {
        this.getopenbet()
      }, 2000);
    }, 1500);
    this.socket_service.updateCheck('User',this.userauth.getUsername()).subscribe((data:any)=>{
      if(data.update){
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
    this.match_service.getCVideo('card32').subscribe({
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
  openBetForm( content: any,betfor:string,odds:any,type:string,sid:number,oddstype:string, min:any, max:any){
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
    this,max = max;
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
    this.modalService.open(content, {size : 'lg'});
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
    this.placeLoader=true;
    var dt = { roundid: this.roundId, matchcode:'card32', matchname: '32 Cards - A', betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid};
    this.userauth.placeCasinoBet(dt).subscribe({
      next:(res:any)=>{
        this.placeLoader=false;
        this.showbetform=false;
        this.displayToast(res.message,res.status);
        this.getopenbet();this.userauth.getUserBalance();
        this.modalService.dismissAll();
      },
      error:(e)=>{
        this.placeLoader=false;
        this.showbetform=false;
        this.displayToast(e.error.message,"failed");
        this.modalService.dismissAll();
      }
    })
  }
  getopenbet(){
    this.userauth.getCasinoOpenBet("card32",this.roundId).subscribe({
      next:(res:any)=>{
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item:any) => {
          item.oddsType=='Winner' ? this.winnerBook=item.book : null;
        });
        //console.log(this.mybooks);
      },error:(e)=>console.log(e)
    })
  }
  displayToast(msg:any,type:any) {
    if(type=="success"){
      this.toastr.success(msg, '', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        closeButton:true,
      });
    }else{
      this.toastr.error(msg, '', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        closeButton:true,
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
