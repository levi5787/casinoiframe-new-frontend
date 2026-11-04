import { Component, HostListener,OnInit, inject, NgModule ,} from '@angular/core';
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
  selector: 'app-teen9',
  standalone: true,
  imports: [FormsModule , CommonModule, ShortNumberPipe],
  templateUrl: './teen9.component.html',
  styleUrl: './teen9.component.css'
})
export class Teen9Component implements OnInit {
  bettab=false; gametab=true; loader=false; placeLoader=false; userButtons: any = {}; setButtonTab='casino';
  isSticky = false; sidebarTopOffset = 124; placebetButton:any=[]; cvideoURL:any;
  data:any;safeURL:any;autotime=0;clock:any;beforeNum=0;mybets:any=[]; mybooks:any=[];
  winnerBook:any=[];tpairBook:any=[];lpairBook:any=[];dpairBook:any=[];tflushBook:any=[];lflushBook:any=[];dflushBook:any=[];
  tstraightBook:any=[];lstraightBook:any=[];dstraightBook:any=[];ttrioBook:any=[];ltrioBook:any=[];dtrioBook:any=[];
  tstraightflushBook:any=[];lstraightflushBook:any=[];dstraightflushBook:any=[];
  dc1="";dc2="";dc3="";
  tc1="";tc2="";tc3="";
  lc1="";lc2="";lc3="";
  roundId=""; min:any; max:any; 
  dWinner="";dPair="";dFlush="";dStraight="";dTrio="";dSFlush="";
  tWinner="";tPair="";tFlush="";tStraight="";tTrio="";tSFlush="";
  lWinner="";lPair="";lFlush="";lStraight="";lTrio="";lSFlush="";
  results:any = [];

  winnerStatus:any;pairStatus:any;flushStatus:any;straightStatus:any;trioStatus:any; sFlushStatus:any;
  betFor = ""; betType="";odds="";showbetform = false; stake: any = null; profit = 0; oddsType=""; sid=0;
  tempCards:any = []; tempWinner:any = ""; temprId = "";
  cfirstnum=0;clastnum=0;flipfirst=false;flipsecond=false; 

  constructor(private _sanitizer: DomSanitizer,
    private socket_service: SocketService,
    private match_service: MatchService,
    private userauth: UserauthService,
    private modalService: NgbModal,
    private toastr: ToastrService
    ) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = (window.pageYOffset >= this.sidebarTopOffset);
    //console.log(this.sidebarTopOffset)
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo()
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL+'?id=3048');
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino','teen9').subscribe((data:any)=>{
      this.data = data['data'];
      if(data){
        //code for flipclock
        this.autotime = parseInt(data['data']['t1'][0]['autotime']);
        if(this.beforeNum!=this.autotime){
          this.updateClock(this.autotime);
        }
        this.beforeNum = this.autotime;
        //code for flipclock end
        if(this.roundId!=data['data']['t1'][0]['mid']){
          this.clearBooks(); this.mybets=[];
        }
        this.roundId = data['data']['t1'][0]['mid'];
        this.min = data['data']['t1'][0]['min'];
        this.max = data['data']['t1'][0]['max'];
        this.tc1="/img/cards/"+data['data']['t1'][0]['C1']+".png";
        this.tc2="/img/cards/"+data['data']['t1'][0]['C2']+".png";
        this.tc3="/img/cards/"+data['data']['t1'][0]['C3']+".png";
        this.lc1="/img/cards/"+data['data']['t1'][0]['C4']+".png";
        this.lc2="/img/cards/"+data['data']['t1'][0]['C5']+".png";
        this.lc3="/img/cards/"+data['data']['t1'][0]['C6']+".png";
        this.dc1="/img/cards/"+data['data']['t1'][0]['C7']+".png";
        this.dc2="/img/cards/"+data['data']['t1'][0]['C8']+".png";
        this.dc3="/img/cards/"+data['data']['t1'][0]['C9']+".png";

        this.dWinner=data['data']['t2'][0]['drate'];this.dPair=data['data']['t2'][1]['drate'];this.dFlush=data['data']['t2'][2]['drate'];
        this.dStraight=data['data']['t2'][3]['drate'];this.dTrio=data['data']['t2'][4]['drate'];this.dSFlush=data['data']['t2'][5]['drate'];
        this.tWinner=data['data']['t2'][0]['trate'];this.tPair=data['data']['t2'][1]['trate'];this.tFlush=data['data']['t2'][2]['trate'];
        this.tStraight=data['data']['t2'][3]['trate'];this.tTrio=data['data']['t2'][4]['trate'];this.tSFlush=data['data']['t2'][5]['trate'];
        this.lWinner=data['data']['t2'][0]['lrate'];this.lPair=data['data']['t2'][1]['lrate'];this.lFlush=data['data']['t2'][2]['lrate'];
        this.lStraight=data['data']['t2'][3]['lrate'];this.lTrio=data['data']['t2'][4]['lrate'];this.lSFlush=data['data']['t2'][5]['lrate'];
        /*
        if(data['data']['t2'][0]['tstatus']==data['data']['t2'][0]['lstatus']==data['data']['t2'][0]['dstatus']=="true"){
          this.winnerStatus = "true";
        }*/
        this.winnerStatus = data['data']['t2'][0]['tstatus'];
        this.pairStatus = data['data']['t2'][1]['tstatus'];
        this.flushStatus = data['data']['t2'][2]['tstatus'];
        this.straightStatus = data['data']['t2'][3]['tstatus'];
        this.trioStatus = data['data']['t2'][5]['tstatus'];
        this.sFlushStatus = data['data']['t2'][4]['tstatus'];
      }
    })
    this.socket_service.casinolast10('Last10','teen9').subscribe((resultdata:any)=>{
      if(resultdata){
        this.results = resultdata['data'];
        // this.results = this.results.reverse();
      }
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
    this,this.placeBetButton();
  }

  ngOnDestroy() {
    this.socket_service.leavaAllRooms;
  }
  getCvideoURL() {
    this.match_service.getCVideo('teen9').subscribe({
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
  open(content:any) {
    this.modalService.open(content ,{size:'lg'});
  }
  openBetForm(content:any,betfor:string,odds:any,type:string,sid:number,oddstype:string,min:number=0, max:number=0){
    this.showbetform = true
    this.betFor = betfor;
    this.odds = odds;
    this.betType = type;
    this.oddsType = oddstype;
    this.profit = 0
    this.stake = null;
    this.sid = sid;
    this.min = min;
    this.max = max;
    if(window.innerWidth<1100){
      this.modalService.open(content)
    }
  }
  hideBetPlace(){
    this.showbetform = false;
  }
  placeStake(val:number){
    this.stake += val;
    this.profit = 0;
    this.calcProfit(val);
  }
  resetStake(){
    this.stake = null;
    this.profit = 0;
  }
  calcProfit(val:any){
    //this.profit = (parseInt(this.betOdds)*this.stake)-this.stake;
  }
  
  openResult(content:any,rid:any){
    this.loader=true;
    this.match_service.getResult(rid).subscribe((winnerdata:any)=>{
      this.loader=false;
      this.modalService.open(content,{ size: 'xl' })
      //console.log(winnerdata);
      this.temprId = rid;
      this.tempWinner = winnerdata['data'][0]['win'];
      this.tempCards = winnerdata['data'][0]['cards']
      this.tempCards = this.tempCards.split(",");
    })
  }
  submitbet(){
    this.placeLoader=true;
    var dt = { roundid: this.roundId, matchcode:'teen9', matchname: 'Test Teenpatti', betfor: this.betFor, bettype: 'back', oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid};
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
    this.userauth.getCasinoOpenBet("teen9",this.roundId).subscribe({
      next:(res:any)=>{
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item:any) => {
          if(item.oddsType=="Winner"){this.winnerBook=item.book}
          else if(item.oddsType=="TPair"){this.tpairBook=item.book}
          else if(item.oddsType=="LPair"){this.lpairBook=item.book}
          else if(item.oddsType=="DPair"){this.dpairBook=item.book}
          else if(item.oddsType=="TFlush"){this.tflushBook=item.book}
          else if(item.oddsType=="LFlush"){this.lflushBook=item.book}
          else if(item.oddsType=="DFlush"){this.dflushBook=item.book}
          else if(item.oddsType=="TStraight"){this.tstraightBook=item.book}
          else if(item.oddsType=="LStraight"){this.lstraightBook=item.book}
          else if(item.oddsType=="DStraight"){this.dstraightBook=item.book}
          else if(item.oddsType=="TTrio"){this.ttrioBook=item.book}
          else if(item.oddsType=="LTrio"){this.ltrioBook=item.book}
          else if(item.oddsType=="DTrio"){this.dtrioBook=item.book}
          else if(item.oddsType=="TStraightFlush"){this.tstraightflushBook=item.book}
          else if(item.oddsType=="LStraightFlush"){this.lstraightflushBook=item.book}
          else if(item.oddsType=="DStraightFlush"){this.dstraightflushBook=item.book}
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
  updateClock(time:number){
    if(time<10){
      this.cfirstnum=0;
      this.clastnum=time;
      //flip number
      this.flipsecond=true;
      setTimeout(()=>{                
        this.flipNumber();
      }, 500);

    }else{
      let stime = time.toString()
      this.cfirstnum = parseInt(stime.charAt(0));
      this.clastnum = parseInt(stime.charAt(1));
      //flip number
      //this.flipfirst=true;
      this.flipsecond=true;
      setTimeout(()=>{                
        this.flipNumber();
      }, 500);
    }
  }
  flipNumber(){
    this.flipfirst = false;
    this.flipsecond = false;
  }
  clearBooks(){
    this.winnerBook=[];this.tpairBook=[];this.lpairBook=[];this.dpairBook=[];this.tflushBook=[];this.lflushBook=[];this.dflushBook=[];
    this.tstraightBook=[];this.lstraightBook=[];this.dstraightBook=[];this.ttrioBook=[];this.ltrioBook=[];this.dtrioBook=[];
    this.tstraightflushBook=[];this.lstraightflushBook=[];this.dstraightflushBook=[];
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
