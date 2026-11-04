import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { MatchService } from '../../services/match.service';
import { SocketService } from '../../services/socket.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserauthService } from '../../services/userauth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';


@Component({
  selector: 'app-aaa',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './aaa.component.html',
  styleUrl: './aaa.component.css'
})
export class AaaComponent implements OnInit{

  isSticky = false; sidebarTopOffset = 124; userButtons: any = {}; setButtonTab='casino';
  placebetButton:any=[]; loader=false; placeLoader=false;gametab=true; bettab=false;
  data:any;safeURL:any; cvideoURL:any;mybets:any=[];mybooks:any=[];winnerBook:any=[];oddevenBook:any=[];redblackBook:any=[];cardBook:any=[];underover7Book:any=[];
  card="";roundId="";autotime=0;clock:any;beforeNum=0;
  ammarb1="";ammarl1="";akbarb1="";akbarl1="";anthonyb1="";anthonyl1="";
  even=""; odd=""; red=""; black="";
  c1="";c2="";c3="";c4="";c5="";c6="";c7="";c8="";c9="";c10="";c11="";c12="";c13="";
  under7="";over7="";

  ammargstatus="";akbargstatus="";anthonygstatus="";
  evengstatus=""; oddgstatus=""; redgstatus=""; blackgstatus="";
  c1gstatus="";c2gstatus="";c3gstatus="";c4gstatus="";c5gstatus="";c6gstatus="";c7gstatus="";c8gstatus="";c9gstatus="";c10gstatus="";c11gstatus="";c12gstatus="";c13gstatus="";
  under7gstatus="";over7gstatus="";

  aaamin=0; aaamax=0; oddevenmin=0; oddevenmax=0; redblackmin=0; redblackmax=0; underover7min=0; underover7max=0; scardsmin=0; scardsmax=0;

  betFor = "";  odds = 0; betType=""; stake: any = null; profit = 0; loss = 0;showbetform = false; oddsType=""; sid=0; min:any;max:any;
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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL+'?id=3056')
    //this.getCvideoURL()
    this.socket_service.casinodata('Casino','aaa').subscribe((data:any)=> {
      //console.log(data)
      //code for flipclock
      this.data = data['data'];
      this.autotime = parseInt(data['data']['t1'][0]['autotime']);
      if(this.beforeNum!=this.autotime){
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end
      this.card = "/img/cards/"+data['data']['t1'][0]['C1']+".png";
      if(this.roundId!=data['data']['t1'][0]['mid']){
        this.clearBooks();
        this.mybets=[];
      }
      this.roundId = data['data']['t1'][0]['mid'];
      this.ammarb1=data['data']['t2'][0]['b1'];this.ammarl1=data['data']['t2'][0]['l1'];
      this.akbarb1=data['data']['t2'][1]['b1'];this.akbarl1=data['data']['t2'][1]['l1'];
      this.anthonyb1=data['data']['t2'][2]['b1'];this.anthonyl1=data['data']['t2'][2]['l1'];
      this.even=data['data']['t2'][3]['b1'];this. odd=data['data']['t2'][4]['b1'];
      this.red=data['data']['t2'][5]['b1'];this. black=data['data']['t2'][6]['b1'];
      this.c1=data['data']['t2'][7]['b1'];this.c2=data['data']['t2'][8]['b1'];
      this.c3=data['data']['t2'][9]['b1'];this.c4=data['data']['t2'][10]['b1'];
      this.c5=data['data']['t2'][11]['b1'];this.c6=data['data']['t2'][12]['b1'];
      this.c7=data['data']['t2'][13]['b1'];this.c8=data['data']['t2'][14]['b1'];
      this.c9=data['data']['t2'][15]['b1'];this.c10=data['data']['t2'][16]['b1'];
      this.c11=data['data']['t2'][17]['b1'];this.c12=data['data']['t2'][18]['b1'];
      this.c13=data['data']['t2'][19]['b1'];this.under7=data['data']['t2'][20]['b1'];
      this.over7=data['data']['t2'][21]['b1'];

      this.ammargstatus=data['data']['t2'][0]['gstatus'];
      this.akbargstatus=data['data']['t2'][1]['gstatus'];this.anthonygstatus=data['data']['t2'][2]['gstatus'];
      this.evengstatus=data['data']['t2'][3]['gstatus'];this. oddgstatus=data['data']['t2'][4]['gstatus'];
      this. redgstatus=data['data']['t2'][5]['gstatus'];this. blackgstatus=data['data']['t2'][6]['gstatus'];
      this.c1gstatus=data['data']['t2'][7]['gstatus'];this.c2gstatus=data['data']['t2'][8]['gstatus'];
      this.c3gstatus=data['data']['t2'][9]['gstatus'];this.c4gstatus=data['data']['t2'][10]['gstatus'];
      this.c5gstatus=data['data']['t2'][11]['gstatus'];this.c6gstatus=data['data']['t2'][12]['gstatus'];
      this.c7gstatus=data['data']['t2'][13]['gstatus'];this.c8gstatus=data['data']['t2'][14]['gstatus'];
      this.c9gstatus=data['data']['t2'][15]['gstatus'];this.c10gstatus=data['data']['t2'][16]['gstatus'];
      this.c11gstatus=data['data']['t2'][17]['gstatus'];this.c12gstatus=data['data']['t2'][18]['gstatus'];
      this.c13gstatus=data['data']['t2'][19]['gstatus'];this.under7gstatus=data['data']['t2'][20]['gstatus'];
      this.over7gstatus=data['data']['t2'][21]['gstatus'];

      this.aaamin=data['data']['t2'][0]['min']; this.aaamax=data['data']['t2'][0]['max'];
      this.oddevenmin=data['data']['t2'][3]['min']; this.oddevenmax=data['data']['t2'][3]['max'];
      this.redblackmin=data['data']['t2'][5]['min']; this.redblackmax=data['data']['t2'][5]['max'];
      this.underover7min=data['data']['t2'][20]['min']; this.underover7max=data['data']['t2'][20]['max'];
      this.scardsmin=data['data']['t2'][7]['min']; this.scardsmax=data['data']['t2'][7]['max'];

    })
    this.socket_service.casinolast10('Last10','aaa').subscribe((winnerdata:any)=>{
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
    this.socket_service.leavaAllRooms();
  }
  getCvideoURL() {
    this.match_service.getCVideo('aaa').subscribe({
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
    this.modalService.open(content, { size: 'lg' });
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
    var dt = { roundid: this.roundId, matchcode:'aaa', matchname: 'Amar Akbar Anthony', betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid};
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
    this.userauth.getCasinoOpenBet("aaa",this.roundId).subscribe({
      next:(res:any)=>{
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item:any) => {
          if(item.oddsType=="Winner"){this.winnerBook=item.book}
          else if(item.oddsType=="OddEven"){this.oddevenBook=item.book}
          else if(item.oddsType=="RedBlack"){this.redblackBook=item.book}
          else if(item.oddsType=="Card"){this.cardBook=item.book}
          else if(item.oddsType=="UnderOver7"){this.underover7Book=item.book}
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
    this.winnerBook=[];this.oddevenBook=[];this.redblackBook=[];this.cardBook=[];this.underover7Book=[];
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
