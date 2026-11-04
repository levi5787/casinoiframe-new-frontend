import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { SocketService } from '../../services/socket.service';
import { MatchService } from '../../services/match.service';
import { UserauthService } from '../../services/userauth.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';

@Component({
  selector: 'app-btable',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './btable.component.html',
  styleUrl: './btable.component.css'
})
export class BtableComponent {
  bettab=false; gametab=true;  loader=false; placeLoader=false; userButtons: any = {}; setButtonTab='casino';
  isSticky = false; sidebarTopOffset = 124; placebetButton:any=[]; cvideoURL:any;
  data:any;safeURL:any;autotime=0;clock:any;beforeNum=0;mybets:any=[];mybooks:any=[];
  card="";roundId="";winnerBook:any=[];oddevenBook:any=[];redblackBook:any=[];cardBook:any=[];ddbBook:any=[];
  aback="";alay="";bback="";blay="";cback="";clay="";dback="";dlay="";eback="";elay="";fback="";flay="";oddback="";oddlay="";
  dulhadulhan=""; barati="";red="";black="";J="";Q="";K="";A="";

  agstatus="";bgstatus="";cgstatus="";dgstatus="";egstatus="";fgstatus="";oddgstatus="";
  dulhadulhangstatus=""; baratigstatus="";redgstatus="";blackgstatus="";Jgstatus="";Qgstatus="";Kgstatus="";Agstatus="";

  min:any; max:any;
  playersmin=0; playersmax=0; oddmin=0; oddmax=0; ddmin=0; ddmax=0; baratimin=0; baratimax=0; redblackmin=0; redblackmax=0; cardsmin=0; cardsmax=0; 

  betFor = "";  odds = 0; betType=""; stake: any = null; profit = 0; loss = 0;showbetform = false; oddsType=""; sid=0;
  results:any = []; tempCard:any=[];tempWin = "";temprId=""; desc:any=[];
  cfirstnum=0;clastnum=0;flipfirst=false;flipsecond=false; activeRname="";

  constructor(
    private _sanitizer: DomSanitizer,
    private match_service:MatchService,
    private socket_service:SocketService,
    private modalService:NgbModal,
    private userauth:UserauthService,
    private toastr:ToastrService
    ) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = (window.pageYOffset >= this.sidebarTopOffset);
    //console.log(this.sidebarTopOffset)
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo()
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL+'?id=3041')
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino','btable').subscribe((data:any)=>{
      this.data = data['data'];
      //code for flipclock
      this.autotime = parseInt(data['data']['t1'][0]['autotime']);
      if(this.beforeNum!=this.autotime){
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end

      this.card = "/img/cards/"+data['data']['t1'][0]['C1']+".png";
      if (this.roundId != data['data']['t1'][0]['mid']) {
        this.clearBooks(); this.mybets=[];
      }
      this.roundId = data['data']['t1'][0]['mid'];
      this.aback=data['data']['t2'][0]['b1'];this.alay=data['data']['t2'][0]['l1'];
      this.bback=data['data']['t2'][1]['b1'];this.blay=data['data']['t2'][1]['l1'];
      this.cback=data['data']['t2'][2]['b1'];this.clay=data['data']['t2'][2]['l1'];
      this.dback=data['data']['t2'][3]['b1'];this.dlay=data['data']['t2'][3]['l1'];
      this.eback=data['data']['t2'][4]['b1'];this.elay=data['data']['t2'][4]['l1'];
      this.fback=data['data']['t2'][5]['b1'];this.flay=data['data']['t2'][5]['l1'];
      this.oddback=data['data']['t2'][6]['b1'];this.oddlay=data['data']['t2'][6]['l1'];

      this.red=data['data']['t2'][7]['b1'];this.black=data['data']['t2'][8]['b1'];
      this.J=data['data']['t2'][9]['b1'];this.Q=data['data']['t2'][10]['b1'];
      this.K=data['data']['t2'][11]['b1'];this.A=data['data']['t2'][12]['b1'];
      this.dulhadulhan=data['data']['t2'][13]['b1'];this.barati=data['data']['t2'][14]['b1'];

      this.agstatus=data['data']['t2'][0]['gstatus'];
      this.bgstatus=data['data']['t2'][1]['gstatus'];
      this.cgstatus=data['data']['t2'][2]['gstatus'];
      this.dgstatus=data['data']['t2'][3]['gstatus'];
      this.egstatus=data['data']['t2'][4]['gstatus'];
      this.fgstatus=data['data']['t2'][5]['gstatus'];
      this.oddgstatus=data['data']['t2'][6]['gstatus'];
      this.redgstatus=data['data']['t2'][7]['gstatus'];this.blackgstatus=data['data']['t2'][8]['gstatus'];
      this.Jgstatus=data['data']['t2'][9]['gstatus'];this.Qgstatus=data['data']['t2'][10]['gstatus'];
      this.Kgstatus=data['data']['t2'][11]['gstatus'];this.Agstatus=data['data']['t2'][12]['gstatus'];
      this.dulhadulhangstatus=data['data']['t2'][13]['gstatus'];this.baratigstatus=data['data']['t2'][14]['gstatus'];

      this.playersmin=data['data']['t2'][0]['min']; this.playersmax=data['data']['t2'][0]['max'];
      this.oddmin=data['data']['t2'][6]['min']; this.oddmax=data['data']['t2'][6]['max'];
      this.ddmin=data['data']['t2'][13]['min']; this.ddmax=data['data']['t2'][13]['max'];
      this.baratimin=data['data']['t2'][14]['min']; this.baratimax=data['data']['t2'][14]['max'];
      this.redblackmin=data['data']['t2'][7]['min']; this.redblackmax=data['data']['t2'][7]['max'];
      this.cardsmin=data['data']['t2'][9]['min']; this.cardsmax=data['data']['t2'][9]['max'];
    })
    this.socket_service.casinolast10('Last10','btable').subscribe((winnerdata:any)=>{
      this.results = winnerdata['data']
      this.results = this.results.reverse()
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
    this.match_service.getCVideo('btable').subscribe({
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
  openBetForm(content:any,betfor:string,odds:any,type:string,sid:number,oddstype:string, min:any, max:any){
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
  hideBetPlace(){
    this.showbetform = false
  }
  placeStake(val:number){
    this.stake += val;
    this.calcProfit(val);
  }
  resetStake(){
    this.stake = null;
    this.profit = 0;
    this.loss = 0;
  }
  calcProfit(stake:any){
    
  }
  open(content:any) {
    this.modalService.open(content ,{size:'lg'});
  }
  openResult(content:any,rid:any){
    this.loader=true;
    this.match_service.getResult(rid).subscribe((winnerdata:any)=>{
      this.loader=false;
      this.modalService.open(content,{ size: 'xl' })
      //console.log(winnerdata)
      this.temprId = rid;
      this.tempCard = winnerdata['data'][0]['cards'];
      this.tempWin = winnerdata['data'][0]['win'];
      this.desc = winnerdata['data'][0]['desc'].split('|');
    })
  }
  submitbet(){
    this.placeLoader=true;
    var dt = { roundid: this.roundId, matchcode:'btable', matchname: 'Bollywood Casino', betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid};
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
    this.userauth.getCasinoOpenBet("btable",this.roundId).subscribe({
      next:(res:any)=>{
        this.mybets = res.openbets;
        //console.log(this.mybets)
        this.mybooks = res.books;
        this.mybooks.forEach((item:any) => {
          if(item.oddsType=="Winner"){this.winnerBook=item.book}
          else if(item.oddsType=="OddEven"){this.oddevenBook=item.book}
          else if(item.oddsType=="RedBlack"){this.redblackBook=item.book}
          else if(item.oddsType=="Card"){this.cardBook=item.book}
          else if(item.oddsType=="DDB"){this.ddbBook=item.book}
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
    this.winnerBook=[];this.oddevenBook=[];this.redblackBook=[];this.cardBook=[];this.ddbBook=[];
  }
  clickInfo(name:any){
    if(this.activeRname==name){
      this.activeRname="";
    }else{
      this.activeRname=name;
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
