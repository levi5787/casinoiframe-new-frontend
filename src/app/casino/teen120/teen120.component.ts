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
  selector: 'app-teen120',
  standalone: true,
  imports: [FormsModule,CommonModule, ShortNumberPipe],
  templateUrl: './teen120.component.html',
  styleUrl: './teen120.component.css'
})
export class Teen120Component implements OnInit {
  player:any; dealer:any; tie:any; pair:any;  b:any; cards="";   temptime="";
  bettab=false; gametab=true; loader=false; placeLoader=false; userButtons: any = {}; setButtonTab='casino';
  isSticky = false; sidebarTopOffset = 124; placebetButton:any=[]; cvideoURL:any;
  data:any;safeURL:any;autotime=0;clock:any;beforeNum=0;mybets:any=[]; mybooks:any=[]; playerBook:any=[]; dealerBook:any=[]; tieBook:any=[]; pairBook:any=[];
  c1="";c2=""; rc1=""; rc2=""; gtype="";
  roundId=""; min:any; max:any;
  results:any = [];
  betFor = ""; betType="";odds="";showbetform = false; stake: any = null; profit = 0; oddsType=""; sid=0;
  tempCards:any = []; tempWinner:any = ""; temprId = ""; tempPair="";
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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL+'?id=3071');
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino','teen120').subscribe((data:any)=>{
      this.data = data['data'];
      if(data){
        this.autotime = parseInt(data['data']['lt']);
        if(this.beforeNum!=this.autotime){
          this.updateClock(this.autotime);
        }
        this.beforeNum = this.autotime;
        //code for flipclock end
        if(this.roundId!=data['data']['mid']){
          this.clearBooks(); this.mybets=[];
        }
        const cards = data['data']['card'].split(',');

        this.roundId = data['data']['mid'];
        this.player=data['data']['sub'][0];
        this.dealer=data['data']['sub'][1];
        this.tie=data['data']['sub'][2];
        this.pair=data['data']['sub'][3];
        this.c1 = "/img/cards-new/" + cards[0] + ".png";
        this.c2 = "/img/cards-new/" + cards[1] + ".png";
        this.gtype =data['data']['gtype'];
      }
    })
    this.socket_service.casinolast10('Last10','teen120').subscribe((resultdata:any)=>{
      if(resultdata){
        this.results = resultdata['data'].res;
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
    this.match_service.getCVideo('teen120').subscribe({
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
  openBetForm(content:any,betfor:string,odds:any,type:string,sid:number,oddstype:string,min:any,max:any){
    // console.log(odds)
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
      this.temprId = rid;
      this.temptime = winnerdata['data']['0']['mtime'];
      this.tempWinner=winnerdata['data']['0']['winnat']
      const cards = winnerdata['data']['0']['card'].split(',');
      this.rc1 = "/img/cards-new/" + cards[0] + ".png";
      this.rc2 = "/img/cards-new/" + cards[1] + ".png";
      const desc = winnerdata['data']['0']['rdesc'].split('#');
      this.tempPair=desc[1];
    })
  }
  submitbet(){
    this.placeLoader=true;
    var dt = { roundid: this.roundId, matchcode:'teen120', matchname: '1 Card 20-20 ', betfor: this.betFor, bettype: 'back', oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid};
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
    this.userauth.getCasinoOpenBet("teen120",this.roundId).subscribe({
      next:(res:any)=>{
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item:any) => {
          if(item.oddsType=="Player"){this.playerBook=item.book}
          else if(item.oddsType=="Dealer"){this.dealerBook=item.book}
          else if(item.oddsType=="Tie"){this.tieBook=item.book}
          else if(item.oddsType=="Pair"){this.pairBook=item.book}
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
   this.playerBook=[]; this.dealerBook=[]; this.tieBook=[]; this.pairBook=[];
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
