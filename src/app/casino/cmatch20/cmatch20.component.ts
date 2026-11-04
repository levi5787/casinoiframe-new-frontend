import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { MatchService } from '../../services/match.service';
import { SocketService } from '../../services/socket.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserauthService } from '../../services/userauth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';


@Component({
  selector: 'app-cmatch20',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './cmatch20.component.html',
  styleUrl: './cmatch20.component.css'
})
export class Cmatch20Component {
  loader=false; placeLoader=false; gametab=true; bettab=false; userButtons: any = {}; setButtonTab='casino';
  isSticky = false; sidebarTopOffset = 124; placebetButton:any=[]; cvideoURL:any;
  safeURL:any;mybets:any=[];mybooks:any=[]; runBook:any=[]; runsmin=0; runsmax=0; min:any; max:any;
  roundId="";autotime=0;clock:any;beforeNum=0; bounceEnter=false; bannerShow=false; run2Status="";
  data:any;c1="1";teamArun="";teamAwicket="";teamAover="";teamBrun:any="";teamBwicket="";teamBover="";
  run2:any={};run3:any={};run4:any={};run5:any={};run6:any={};
  run7:any={};run8:any={};run9:any={};run10:any={};

  betFor = "";  odds = 0; betType=""; stake: any = null; profit = 0; loss = 0;showbetform = false; oddsType=""; sid=0;
  results:any = []; temprId="";tempCard="";
  cfirstnum=0;clastnum=0;flipfirst=false;flipsecond=false;
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
    // console.log(this.sidebarTopOffset)
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo()
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL+'?id=3045');
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino','cmatch20').subscribe((data:any)=>{
      this.data = data.data;
      //code for flipclock
      this.autotime = parseInt(this.data['t1'][0]['autotime']);
      if(this.beforeNum!=this.autotime){
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end

      if(this.roundId!=this.data.t1[0].mid){
        this.bannerShow = true; this.mybets=[]; this.runBook=[];
        setTimeout(() => {
          this.bannerShow = false;
        }, 3*1000);
      }
      this.roundId = this.data['t1'][0]['mid'];
      this.runsmin = this.data['t2'][0]['min'];
      this.runsmax = this.data['t2'][0]['max'];
      this.c1 = this.data.t1[0].C1;
      this.teamArun = this.data.t1[0].C2; this.teamAwicket = this.data.t1[0].C3; this.teamAover = this.data.t1[0].C4;
      this.teamBrun = this.data.t1[0].C5; this.teamBwicket = this.data.t1[0].C6;  this.teamBover = this.data.t1[0].C7;
      if(this.run2Status=='SUSPENDED'){
        this.teamBover = '19.5'
      }
      if(this.c1!='1'){
        this.teamBover = '20'
        this.teamBrun = parseInt(this.getcardnumber(this.c1)) + parseInt( this.data.t1[0].C5);
      }
      if(this.run2Status!=this.data.t2[0].gstatus&&this.data.t2[0].gstatus=='SUSPENDED'){
        this.bounceEnter = true;
        setTimeout(() => {
          this.bounceEnter = false;
        }, 1.5*1000);
      }
      this.run2Status = this.data.t2[0].gstatus;
      this.run2=this.data.t2[0]; this.run3=this.data.t2[1]; this.run4=this.data.t2[2];
      this.run5=this.data.t2[3]; this.run6=this.data.t2[4]; this.run7=this.data.t2[5];
      this.run8=this.data.t2[6]; this.run9=this.data.t2[7]; this.run10=this.data.t2[8];
    })
    this.socket_service.casinolast10('Last10','cmatch20').subscribe((winnerdata:any)=>{
      this.results = winnerdata['data']
      //this.results = this.results.reverse()
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
    this.match_service.getCVideo('cmatch20').subscribe({
      next: (res: any) => {
        //console.log(res)
        const url = res.url;
        this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(url)
      }, error: (e) => {
        console.log(e)
      }
    })
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
    this.modalService.open(content,{ size: 'xl' });
  }
  openResult(content:any,rid:any){
    this.loader=true;
    this.match_service.getResult(rid).subscribe((winnerdata:any)=>{
      this.loader=false;
      this.modalService.open(content,{ size: 'xl' })
      //console.log(winnerdata)
      this.temprId=rid;
      this.tempCard = winnerdata.data[0].cards;
    })
  }
  submitbet(){
    this.placeLoader=true;
    var dt = { roundid: this.roundId, matchcode:'cmatch20', matchname: '20-20 Cricket Match', betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid};
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
    this.userauth.getCasinoOpenBet("cmatch20",this.roundId).subscribe({
      next:(res:any)=>{
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item:any) => {
          if(item.oddsType=='Run'){
            this.runBook = item.book;
          }
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
  getcardnumber(c1: string) {
    return c1.slice(0, -2);
  }
  flipNumber(){
    this.flipfirst = false;
    this.flipsecond = false;
  }
  trackByFunc(index:number, item:any){
    return item.sid; 
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
