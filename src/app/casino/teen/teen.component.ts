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
  selector: 'app-teen',
  standalone: true,
  imports: [FormsModule, CommonModule , ShortNumberPipe],
  templateUrl: './teen.component.html',
  styleUrl: './teen.component.css'
})
export class TeenComponent {
  gametab=true; bettab=false; loader=false; placeLoader=false; userButtons: any = {}; setButtonTab='casino';
  isSticky = false; sidebarTopOffset = 124; placebetButton:any=[]; cvideoURL:any;
  data:any;safeURL:any; mybets:any=[]; mybooks:any=[]; winnerBook:any=[];
  datas:any;autotime=0;clock:any;beforeNum=0;results:any = []
  Ac1 = ""; Ac2 = "";Ac3 = "";Bc1 = "";Bc2 = "";Bc3 = ""; roundId = ""; min:any; max:any;
  Alay = 0;Als = 0;Aback = 0;Abs = 0; Blay = 0;Bls = 0;Bback = 0;Bbs = 0;
  Agstatus = ""; Bgstatus = "";showbetform = false;
  betFor = "";  odds = 0; betType=""; stake: any = null; profit = 0; loss = 0; oddsType=""; sid=0;
  tempCards:any = []; tempWinner:any = ""; temprId = "";
  cfirstnum=0;clastnum=0;flipfirst=false;flipsecond=false;

  constructor(
    private _sanitizer: DomSanitizer, 
    private socket_service: SocketService,
    private match_service: MatchService,
    private modalService: NgbModal,
    private userauth: UserauthService,
    private toastr:ToastrService
    ) {}
  
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = (window.pageYOffset >= this.sidebarTopOffset);
    //console.log(this.sidebarTopOffset)
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo()
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL+'?id=3031')
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino','Teen').subscribe((data)=>{
      //console.log(data)
      if(data){
        this.datas = data;
        //console.log(this.datas)
        //code for flipclock
        this.autotime = parseInt(this.datas['data']['t1'][0]['lasttime']);
        if(this.beforeNum!=this.autotime){
          this.updateClock(this.autotime);
        }
        this.beforeNum = this.autotime;
        //code for flipclock end

        if(this.roundId!=this.datas['data']['t1'][0]['mid']){
          this.winnerBook=[]; this.mybets=[];
        }
        this.roundId = this.datas['data']['t1'][0]['mid'];
        this.min = this.datas['data']['t1'][0]['min'];
        this.max = this.datas['data']['t1'][0]['max'];
        //console.log(this.datas['data']['t1'][0]['C1'])
        //console.log(this.datas['data']['t1'][1]['C1'])
        this.Ac1 = "/img/cards/"+this.datas['data']['t1'][0]['C1']+".png"
        this.Ac2 = "/img/cards/"+this.datas['data']['t1'][0]['C2']+".png"
        this.Ac3 = "/img/cards/"+this.datas['data']['t1'][0]['C3']+".png"
        this.Bc1 = "/img/cards/"+this.datas['data']['t1'][1]['C1']+".png"
        this.Bc2 = "/img/cards/"+this.datas['data']['t1'][1]['C2']+".png"
        this.Bc3 = "/img/cards/"+this.datas['data']['t1'][1]['C3']+".png"

        this.Agstatus = this.datas['data']['t1'][0]['gstatus'];
        this.Bgstatus = this.datas['data']['t1'][1]['gstatus'];

        this.Alay = this.datas['data']['t1'][0]['l1']
        this.Als = this.datas['data']['t1'][0]['ls1']
        this.Aback = this.datas['data']['t1'][0]['b1']
        this.Abs = this.datas['data']['t1'][0]['bs1']

        this.Blay = this.datas['data']['t1'][1]['l1']
        this.Bls = this.datas['data']['t1'][1]['ls1']
        this.Bback = this.datas['data']['t1'][1]['b1']
        this.Bbs = this.datas['data']['t1'][1]['bs1']
      }
    })
    this.socket_service.casinolast10('Last10','Teen').subscribe((resultdata:any)=>{
      if(resultdata){
        this.results = resultdata['data'];
        // this.results = this.results.reverse();
        //console.log(this.results)
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
    this.placeBetButton();
  }

  ngOnDestroy() {
    this.socket_service.leavaAllRooms;
  }
  getCvideoURL() {
    this.match_service.getCVideo('teen').subscribe({
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
  openBetForm(content:any,betfor:string,odds:any,type:string,sid:number,oddstype:string,min:number=0,max:number=0){
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
    if(this.betType=='back'){
      this.profit = (this.odds*stake)/100;
      this.loss = stake;
    }
    if(this.betType=='lay'){
      this.loss = (this.odds*stake)/100;
      this.profit = stake;
    }
  }
  open(content:any) {
    this.modalService.open(content, {size : 'lg'});
  }
  openResult(content:any,rid:any){
    this.loader=true;
    this.match_service.getResult(rid).subscribe((winnerdata:any)=>{
      this.loader=false;
      this.modalService.open(content,{ size: 'xl' })
      console.log(winnerdata);
      this.temprId = rid;
      this.tempWinner = winnerdata['data'][0]['win'];
      this.tempCards = winnerdata['data'][0]['cards']
      this.tempCards = this.tempCards.split(",");
    })
  }
  submitbet(){
    this.placeLoader=true;
    var dt = { roundid: this.roundId, matchcode:'Teen', matchname: 'Oneday Teenpatti', betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid};
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
    this.userauth.getCasinoOpenBet("Teen",this.roundId).subscribe({
      next:(res:any)=>{
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item:any) => {
          if(item.oddsType=="Winner"){
            this.winnerBook = item.book;
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
  flipNumber(){
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
