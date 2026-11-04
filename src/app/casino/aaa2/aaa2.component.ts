import { Component, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatchService } from '../../services/match.service';
import { SocketService } from '../../services/socket.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserauthService } from '../../services/userauth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';

@Component({
  selector: 'app-aaa2',
  standalone: true,
  imports: [CommonModule,FormsModule, ShortNumberPipe],
  templateUrl: './aaa2.component.html',
  styleUrl: './aaa2.component.css'
})
export class Aaa2Component {
  isSticky = false; sidebarTopOffset = 124; userButtons: any = {}; setButtonTab='casino';
  placebetButton:any=[]; loader=false; placeLoader=false;gametab=true; bettab=false;
  data:any;safeURL:any; cvideoURL:any;mybets:any=[];mybooks:any=[];winnerBook:any=[];oddBook:any=[];evenBook:any=[];redBook:any=[]; blackBook:any=[];
  under7Book:any=[];over7Book:any=[];c1Book:any=[];c2Book:any=[];c3Book:any=[];c4Book:any=[];c5Book:any=[];c6Book:any=[];c7Book:any=[];c8Book:any=[];c9Book:any=[];
  c10Book:any=[];c11Book:any=[];c12Book:any=[];c13Book:any=[];
  card="";roundId="";autotime=0;clock:any;beforeNum=0;
  ammar:any=[];akbar:any=[];anthony:any=[];
  even:any=[]; odd:any=[]; red:any=[]; black:any=[];
  c1:any=[];c2:any=[];c3:any=[];c4:any=[];c5:any=[];c6:any=[];c7:any=[];c8:any=[];c9:any=[];c10:any=[];c11:any=[];c12:any=[];c13:any=[];
  under7:any=[];over7:any=[];

  ammargstatus="";akbargstatus="";anthonygstatus="";
  evengstatus=""; oddgstatus=""; redgstatus=""; blackgstatus="";
  c1gstatus="";c2gstatus="";c3gstatus="";c4gstatus="";c5gstatus="";c6gstatus="";c7gstatus="";c8gstatus="";c9gstatus="";c10gstatus="";c11gstatus="";c12gstatus="";c13gstatus="";
  under7gstatus="";over7gstatus="";

  min:any; max:any;
  aaamin=0; aaamax=0; oddevenmin=0; oddevenmax=0; redblackmin=0; redblackmax=0; underover7min=0; underover7max=0; scardsmin=0; scardsmax=0;

  betFor = "";  odds = 0; betType=""; stake: any = null; profit = 0; loss = 0;showbetform = false; oddsType=""; sid=0;
  results:any = []; tempCard:any=[];tempWin = "";temprId=""; desc:any=[];
  cfirstnum=0;clastnum=0;flipfirst=false;flipsecond=false; activeRname="";
  mtime: any;
  tempDesc: any;

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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL+'?id=3075')
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino','aaa2').subscribe((data:any)=>{
      //console.log(data)
      //code for flipclock
      this.data = data.data
      this.autotime = parseInt(data['data']['lt']);
      if(this.beforeNum!=this.autotime){
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end
      this.card = "/img/cards-new/"+data['data']['card']+".png";
      //  console.log(this.card)
     
      if(this.roundId!=data['data']['mid']){
        this.clearBooks();
        this.mybets=[];
      }
      this.roundId = data['data']['mid'];
      this.ammar=this.data.sub[0];
      this.akbar=this.data.sub[1];
      this.anthony=this.data.sub[2];
      //  console.log(this.ammar);
        this.even=this.data.sub[3];this. odd=this.data.sub[4];
        this.red=this.data.sub[5];this. black=this.data.sub[6];
        this.c1=this.data.sub[7];this.c2=this.data.sub[8];
        this.c3=this.data.sub[9];this.c4=this.data.sub[10];
        this.c5=this.data.sub[11];this.c6=this.data.sub[12];
        this.c7=this.data.sub[13];this.c8=this.data.sub[14];
        this.c9=this.data.sub[15];this.c10=this.data.sub[16];
        this.c11=this.data.sub[17];this.c12=this.data.sub[18];
        this.c13=this.data.sub[19];this.under7=this.data.sub[20];
        this.over7=this.data.sub[21];

      

      // this.aaamin=data['data']['t2'][0]['min']; this.aaamax=data['data']['t2'][0]['max'];
      // this.oddevenmin=data['data']['t2'][3]['min']; this.oddevenmax=data['data']['t2'][3]['max'];
      // this.redblackmin=data['data']['t2'][5]['min']; this.redblackmax=data['data']['t2'][5]['max'];
      // this.underover7min=data['data']['t2'][20]['min']; this.underover7max=data['data']['t2'][20]['max'];
      // this.scardsmin=data['data']['t2'][7]['min']; this.scardsmax=data['data']['t2'][7]['max'];

    })
    this.socket_service.casinolast10('Last10','aaa2').subscribe((winnerdata:any)=>{
      //  console.log(winnerdata)
      this.results = winnerdata['data'].res
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
    this.match_service.getCVideo('aaa2').subscribe({
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
openResult(content: any, rid: any) {
  this.loader = true;
  this.match_service.getResult(rid).subscribe((winnerdata: any) => {
    this.loader = false;
    this.modalService.open(content, { size: 'xl' });
    console.log(winnerdata);

    this.temprId = rid;

    // Use data[0] because the API returns an array of results
    const result = winnerdata.data[0];

    this.tempCard = result.card;
    this.mtime = result.mtime;
    this.tempDesc = result.rdesc.split('#');
    this.tempWin=result.winnat
    //this.tempOdd = this.tempDesc[1]; // index 1 = "Even" from example

    // You can access other parts too like:
    // this.tempColor = this.tempDesc[2]; // "Black"
    // this.tempRun = this.tempDesc[3];   // "Under 7"
    // this.tempNumber = this.tempDesc[4]; // "4"
  });
}

  submitbet(){
    this.placeLoader=true;
    var dt = { roundid: this.roundId, matchcode:'aaa2', matchname: 'Amar Akbar Anthony 2', betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid};
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
    this.userauth.getCasinoOpenBet("aaa2",this.roundId).subscribe({
      next:(res:any)=>{
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item:any) => {
          if(item.oddsType=="Winner"){this.winnerBook=item.book}
          else if(item.oddsType=="Odd"){this.oddBook=item.book}
          else if(item.oddsType=="Even"){this.evenBook=item.book}
          else if(item.oddsType=="Red"){this.redBook=item.book}
          else if(item.oddsType=="Black"){this.blackBook=item.book}
          else if(item.oddsType=="Card1"){this.c1Book=item.book}
          else if(item.oddsType=="Card2"){this.c2Book=item.book}
          else if(item.oddsType=="Card3"){this.c3Book=item.book}
          else if(item.oddsType=="Card4"){this.c4Book=item.book}
          else if(item.oddsType=="Card5"){this.c5Book=item.book}
          else if(item.oddsType=="Card6"){this.c6Book=item.book}
          else if(item.oddsType=="Card7"){this.c7Book=item.book}
          else if(item.oddsType=="Card8"){this.c8Book=item.book}
          else if(item.oddsType=="Card9"){this.c9Book=item.book}
          else if(item.oddsType=="Card10"){this.c10Book=item.book}
          else if(item.oddsType=="Card11"){this.c11Book=item.book}
          else if(item.oddsType=="Card12"){this.c12Book=item.book}
          else if(item.oddsType=="Card13"){this.c13Book=item.book}
          else if(item.oddsType=="Under7"){this.under7Book=item.book}
          else if(item.oddsType=="Over7"){this.over7Book=item.book}
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
    this.winnerBook=[];this.oddBook=[];this.evenBook=[];this.redBook=[];this.blackBook=[];this.c1Book=[];this.c2Book=[];this.c3Book=[];
    this.c4Book=[];this.c5Book=[];this.c6Book=[];this.c7Book=[];this.c8Book=[];this.c9Book=[];this.c10Book=[];this.c11Book=[];this.c12Book=[];
    this.c13Book=[];
    this.under7Book=[];this.over7Book=[];
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

