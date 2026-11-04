import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { MatchService } from '../../services/match.service';
import { SocketService } from '../../services/socket.service';
import { UserauthService } from '../../services/userauth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';

@Component({
  selector: 'app-threecardj',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './threecardj.component.html',
  styleUrl: './threecardj.component.css'
})
export class ThreecardjComponent {

  gametab=true; bettab=false;
  isSticky = false; sidebarTopOffset = 124; loader=false; placeLoader=false; userButtons: any = {}; setButtonTab='casino';
  data:any;safeURL:any;autotime=0;clock:any;beforeNum=0; placebetButton:any=[]; cvideoURL:any;
  c1="";c2="";c3="";roundId="";min:any;max:any; remark=""; rdesc="";
  yesrate="";norate="";yesgstatus="";nogstatus="";
  mybets: any = []; mybooks: any = []; yesBook: any = []; noBook: any = [];
  betFor:any = [];  odds = 0; betType=""; stake: any = null; profit = 0; loss = 0;showbetform = false;oddsType = ""; sid = 0;
  yesOrno="";
  results:any = []; tempCard:any=[];tempWin = "";temprId=""; desc:any=[];
  cfirstnum=0;clastnum=0;flipfirst=false;flipsecond=false;

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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL+'?id=3039')
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino','3cardj').subscribe((data:any)=>{
      this.data = data['data'];
      //code for flipclock
      this.autotime = parseInt(data['data']['t1'][0]['autotime']);
      if(this.beforeNum!=this.autotime){
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end
      if (this.roundId != data['data']['t1'][0]['mid']) {
        this.hideBetPlace(); this.noBook=[]; this.yesBook=[]; this.mybets=[];
      }
      this.roundId=data['data']['t1'][0]['mid']
      this.min=data['data']['t1'][0]['min']
      this.max=data['data']['t1'][0]['max']
      this.c1="/img/cards/"+data['data']['t1'][0]['C1']+".png"
      this.c2="/img/cards/"+data['data']['t1'][0]['C2']+".png"
      this.c3="/img/cards/"+data['data']['t1'][0]['C3']+".png"

      this.yesrate=data['data']['t2'][0]['rate'];this.norate=data['data']['t2'][1]['rate'];
      this.yesgstatus=data['data']['t2'][0]['gstatus'];this.nogstatus=data['data']['t2'][1]['gstatus'];
      this.remark=data['data']['t1'][0]['remark']
    })
    this.socket_service.casinolast10('Last10','3cardj').subscribe((winnerdata:any)=>{
      this.results = winnerdata['data']
      // this.results = this.results.reverse();
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
    this.match_service.getCVideo('3cardj').subscribe({
      next: (res: any) => {
        //console.log(res)
        const url = res.url;
        this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(url)
      }, error: (e) => {
        console.log(e)
      }
    })
  }
  check(card:any){
    if(this.betFor.includes(card)){
      return true;
    }else{
      return false;
    }
  }
  betFormYes(content:any,yesno:any,betfor:any,odds:any,type:any,sid:number,min:number=0,max:number=0){ 
    if(this.betFor.includes(betfor)) return;
    if (this.yesOrno != 'No' && this.betFor.length < 3) {
      this.showbetform = true
      this.yesOrno = yesno;
      this.oddsType = yesno
      this.betFor.push(betfor);
      this.odds = odds;
      this.sid = sid;
      this.betType = type;
      this.profit = 0
      this.loss = 0
      this.stake = null;
      this.min = min;
      this.max = max;
      if(window.innerWidth<1100){
        //this.modalService.open(content);
        if (this.betFor.length == 3) {
          // this.betFor = this.yesOrno + ' ' + this.betFor.join('');
          const modalOptions: NgbModalOptions = {
            beforeDismiss: () => this.hideBetPlace(),
          };
          this.modalService.open(content, modalOptions);
        }
      }
    }
  }
  betFormNo(content:any,yesno:any,betfor:any,odds:any,type:any,sid:number,min:number=0,max:number=0){ 
    if(this.betFor.includes(betfor)) return;
    if (this.yesOrno != 'Yes' && this.betFor.length < 3) {
      this.showbetform = true
      this.yesOrno = yesno;
      this.oddsType = yesno
      this.betFor.push(betfor);
      this.odds = odds;
      this.betType = type;
      this.sid = sid;
      this.profit = 0
      this.loss = 0
      this.stake = null;
      this.min = min;
      this.max = max;
      if(window.innerWidth<1100){
        //this.modalService.open(content);
        if (this.betFor.length == 3) {
          // this.betFor = this.yesOrno + ' ' + this.betFor.join('');
          const modalOptions: NgbModalOptions = {
            beforeDismiss: () => this.hideBetPlace(),
          };
          this.modalService.open(content, modalOptions);
        }
      }
    }
  }

  hideBetPlace(){
    this.showbetform = false;
    this.yesOrno = "";
    this.betFor = [];
    this.odds = 0;
    this.betType = "";
    this.stake = null;
    this.oddsType = "";
    this.sid = 0;
    return true;
  }

  placeStake(val:number){
    this.stake += val;
    this.calcProfit(val);
  }
  resetStake(){
    this.stake = null;
    this.profit = 0;
    this.loss = 0;
    this.betFor =[]
    this.showbetform = false
  }
  calcProfit(stake:any){
    
  }
  open(content:any) {
    this.modalService.open(content, {size: 'lg'});
  }
  openResult(content:any,rid:any){
    this.loader=true;
    this.match_service.getResult(rid).subscribe((winnerdata:any)=>{
      this.loader=false;
      this.modalService.open(content,{ size: 'xl' })
      //console.log(winnerdata)
      this.temprId = rid;
      this.tempCard = winnerdata['data'][0]['cards'].split(',');
      this.tempWin = winnerdata['data'][0]['win'];
      this.desc = winnerdata['data'][0]['desc'];
      this.rdesc = winnerdata['data'][0]['cards'].split(',').map((rdesc: string) => rdesc[0]).join(' ');
      // console.log(winnerdata)
    })
  }
  submitbet(){
    if(this.betFor.length<3){
      this.displayToast("Cards not valid.","error");
      return;
    }
    this.placeLoader=true;
    var dt = { roundid: this.roundId, matchcode:'3cardj', matchname: '3 Cards Judgement', betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid};
    this.userauth.placeCasinoBet(dt).subscribe({
      next:(res:any)=>{
        this.placeLoader=false;
        this.showbetform=false;
        this.displayToast(res.message,res.status);
        this.hideBetPlace();
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
    this.betFor=[];
  }
  getopenbet(){
    this.userauth.getCasinoOpenBet("3cardj",this.roundId).subscribe({
      next:(res:any)=>{
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          if (item.oddsType == "Yes") { this.yesBook = item.book }
          else if (item.oddsType == "No") { this.noBook = item.book }
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
  trackByFunc(index: number, item: any): number {
    return item.mid;
  }
  trackByMid(index: number, item: any) {
    return item.mid;
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
