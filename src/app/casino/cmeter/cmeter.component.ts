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
  selector: 'app-cmeter',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './cmeter.component.html',
  styleUrl: './cmeter.component.css'
})
export class CmeterComponent {

  gametab=true; bettab=false; userButtons: any = {}; setButtonTab='casino';
  data:any;safeURL: any; isSticky = false; sidebarTopOffset = 124; placebetButton:any=[]; loader=false; placeLoader=false;
  mybets:any=[];mybooks:any=[]; lowBook:any = []; highBook:any = []; cvideoURL:any;
  roundId = ""; autotime = 0; clock: any; beforeNum = 0; 
  cards: any = []; highcards: any = []; lowcards: any = []; lowp:any = 0; highp:any = 0; runPosition:any=0;
  lowrate = ""; highrate = ""; lowmin = 0; lowmax = 0; highmin = 0; highmax = 0; min:any; max:any;
  lowgstatus = ""; highgstatus = "";

  betFor = ""; odds = 0; betType = ""; stake: any = null; profit = 0; loss = 0; showbetform = false; oddsType=""; sid=0;
  results: any = [];
  temprId = ""; tempWinner = ""; tempCards: any = []; tempDesc = ""; tempBdesc = ""; winnerPlayer = "";
  templowcards: any = []; temphighcards: any = []; hukum9: any = []; hukum10: any = [];
  lowselected = false; highselected = false; lowplaced = false;highplaced = false;
  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false;

  constructor(
    private modalService:NgbModal,
    private match_service:MatchService,
    private socket_service:SocketService,
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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL+'?id=3046')
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'cmeter').subscribe((data: any) => {
      this.data = data['data'];
      this.roundId = data['data']['t1'][0]['mid']

      //code for flipclock
      this.autotime = parseInt(data['data']['t1'][0]['autotime']);
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end

      if(!this.lowplaced&&!this.highplaced){
        this.lowp = data['data']['t1'][0]['C1']
        this.highp = data['data']['t1'][0]['C2']
      }
      
      this.cards = data['data']['t1'][0]['cards'].split(',').filter((c:any)=>c!='1');
      if (this.roundId != '0') {
        this.checkHighLow();
      } else {
        this.lowcards = []
        this.highcards = []
        this.highp = 0;
        this.lowp = 0;
        this.lowplaced = false; this.highplaced = false;
        this.mybooks = [];this.lowBook=[]; this.highBook=[];
      }
      this.lowrate = data['data']['t2'][0]['b1']
      this.lowmin = data['data']['t2'][0]['min']
      this.lowmax = data['data']['t2'][0]['max']
      this.highrate = data['data']['t2'][1]['b1']
      this.highmin = data['data']['t2'][1]['min']
      this.highmax = data['data']['t2'][1]['max']
      this.lowgstatus = data['data']['t2'][0]['gstatus'];
      this.highgstatus = data['data']['t2'][1]['gstatus'];
    })
    this.socket_service.casinolast10('Last10', 'cmeter').subscribe((winnerdata: any) => {
      //console.log(winnerdata)
      this.results = winnerdata['data'];
      //this.results = this.results.reverse();
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
    this.match_service.getCVideo('cmeter').subscribe({
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
  checkHighLow() {
    if(this.lowplaced){
      let {lhigh,llow} = this.cards.reduce((acc:any,curr:any,i:any)=>{
        let num = this.getNumberValue(this.getcardvalue(curr))
        if(curr=='9HH') { //9 spade is calculated in high card if bet placed on Low
          acc.lhigh += num
          if(!this.highcards.includes(curr)){
            this.highcards.push(curr)
          }
        }else{
          acc[num <= 9 ? 'llow' : 'lhigh'] += num;
          if(num<=9&&!this.lowcards.includes(curr)){
            this.lowcards.push(curr)
          }else if(num>9&&!this.highcards.includes(curr)){
            this.highcards.push(curr)
          }
        }
        return acc
      },{lhigh:0,llow:0})
      this.lowp = llow; this.highp = lhigh; this.runPosition = this.lowp - this.highp
    }else if(this.highplaced){
      let {hhigh,hlow} = this.cards.reduce((acc:any,curr:any,i:any)=>{
        let num = this.getNumberValue(this.getcardvalue(curr))
        if(curr=='10HH') { //10 spade is calculated in low card if bet placed on High
          acc.hlow += num;
          if(!this.lowcards.includes(curr)){
            this.lowcards.push(curr)
          }
        }else{
          acc[num <= 9 ? 'hlow' : 'hhigh'] += num;
          if(num<=9&&!this.lowcards.includes(curr)){
            this.lowcards.push(curr)
          }else if(num>9&&!this.highcards.includes(curr)){
            this.highcards.push(curr)
          }
        }
        return acc
      },{hhigh:0,hlow:0})
      this.lowp = hlow; this.highp = hhigh; this.runPosition = this.highp - this.lowp
    }else{
      this.cards.forEach((c:any) => {
        if (c.match(/[A2-9]/) && !this.lowcards.includes(c)) {
          this.lowcards.push(c);
        }
        if (c.match(/10|[JQK]/) && !this.highcards.includes(c)) {
          this.highcards.push(c);
        }
      });
    }
    
  }
  //return card value except last 2 characters
  getcardvalue(card:any) {
    return card.slice(0, -2);
  }
  //function to return number value of card
  getNumberValue(num:any) {
    if (num == 'J') {
      return 11;
    } else if (num == 'Q') {
      return 12;
    } else if (num == 'K') {
      return 13;
    } else if (num == 'A') {
      return 1;
    } else {
      return parseInt(num);
    }
  }
  openBetForm(content:any,betfor:string,odds:any,type:string,sid:number,oddstype:string, min:any, max:any){
    this.lowselected = betfor=='Low'?true:false;
    this.highselected = betfor=='High'?true:false;
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
    if(window.innerWidth<768){
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
    this.modalService.open(content, {size:'lg'});
  }
  openResult(content: any, rid: any) {
    this.loader=true;
    this.templowcards = []
    this.temphighcards = []
    this.hukum10 = []
    this.hukum9 = []
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      //console.log(winnerdata)
      this.loader=false;
      this.modalService.open(content, { size: 'xl' })
      this.temprId = rid;
      this.tempCards = winnerdata['data'][0]['cards'].split(',');
      this.tempCards.forEach((element: any) => {
        this.checkHighLowTemp(element);
      });
      this.tempWinner = winnerdata['data'][0]['win'];
      this.tempDesc = winnerdata['data'][0]['desc'];
    })
  }
  checkHighLowTemp(c: any) {
    const lowArray = ['A', '2', '3', '4', '5', '6', '7', '8', '9'];
    const highArray = ['10', 'J', 'Q', 'K'];
    if (lowArray.some(val => c.includes(val))) {
      if (!this.templowcards.includes(c)) {
        if (c.includes('9HH')) {
          this.hukum9.push(c);
        } else {
          this.templowcards.push(c);
        }
      }
    }
    if (highArray.some(val => c.includes(val))) {
      if (!this.temphighcards.includes(c)) {
        if (c.includes('10HH')) {
          this.hukum10.push(c);
        } else {
          this.temphighcards.push(c);
        }
      }
    }
  }
  submitbet(){
    this.placeLoader=true;
    var dt = { roundid: this.roundId, matchcode:'cmeter', matchname: 'Casino Meter', betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid};
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
    this.userauth.getCasinoOpenBet("cmeter",this.roundId).subscribe({
      next:(res:any)=>{
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item:any) => {
          if(item.oddsType=="Low"){this.lowBook=item.book; this.lowplaced = true}
          else if(item.oddsType=="High"){this.highBook=item.book; this.highplaced = true}
        });
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
}
