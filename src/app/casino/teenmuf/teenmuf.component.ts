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
declare var $: any;


@Component({
  selector: 'app-teenmuf',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './teenmuf.component.html',
  styleUrl: './teenmuf.component.css'
})
export class TeenmufComponent implements OnInit {
  selectedItem = "1"; playerA:any; playerB:any; nineA:any; nineB:any; baccaratB:any; baccaratA:any;  b:any; 
  bettab=false; gametab=true; loader=false; placeLoader=false; userButtons: any = {}; setButtonTab='casino';
  isSticky = false; sidebarTopOffset = 124; placebetButton:any=[]; cvideoURL:any;
  data:any;safeURL:any;autotime=0;clock:any;beforeNum=0;mybets:any=[]; mybooks:any=[]; playerABook:any=[];  playerBBook:any=[]; nineABook:any=[]; nineBBook:any=[];
  baccaratABook:any=[];   baccaratBBook:any=[];
  c1="";c2=""; c3=""; c4="";  c5=""; c6="";  rc1=""; rc2=""; rc3=""; rc4="";  rc5=""; rc6=""; top9=""; mBaccarat=""; gtype="";
  roundId=""; min:any; max:any;
  results:any = [];
  betFor = ""; betType="";odds="";showbetform = false; stake: any = null; profit = 0; oddsType=""; sid=0;
  tempCards:any = []; tempWinner:any = ""; temprId = "";  temptime="";
  cfirstnum=0;clastnum=0;flipfirst=false;flipsecond=false; 


  betInfo: any = { total: 0, amount: 0 }; bets:any=[];



  statement: any = []; statementDetail: any = []; fancyOddsTypes = ["Fancy", "Fancy1", "Meter", "Khado", "OddEven", "Cricket Casino"];
  from_date = ""; to_date = ""; selectedSportId = ""; selectedEventId = ""; selectedRoundId = ""; selectedOddsType = ""; selectedFName = "";
  stmtvalues: any = {}; stmtdetailtotal = 0;

  
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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL+'?id=3066');
    //this.getCurrentDate();
    this.socket_service.casinodata('Casino','teenmuf').subscribe((data:any)=>{
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
        this.playerA=data['data']['sub'][0];
        this.playerB=data['data']['sub'][1];
        this.nineA=data['data']['sub'][2];
        this.nineB=data['data']['sub'][3];
        this.baccaratA=data['data']['sub'][4];
        this.baccaratB=data['data']['sub'][5];
        this.c1 = "/img/cards-new/" + cards[0] + ".png";
        this.c2 = "/img/cards-new/" + cards[1] + ".png";
        this.c3 = "/img/cards-new/" + cards[2] + ".png";
        this.c4 = "/img/cards-new/" + cards[3] + ".png";
        this.c5 = "/img/cards-new/" + cards[4] + ".png";
        this.c6 = "/img/cards-new/" + cards[5] + ".png";
        this.gtype =data['data']['gtype'];
      }
    })
    this.socket_service.casinolast10('Last10','teenmuf').subscribe((resultdata:any)=>{
      if(resultdata){
        this.results = resultdata['data'].res;
        // this.results = this.results.reverse();
        // console.log(resultdata)
        
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
    this.match_service.getCVideo('teenmuf').subscribe({
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
    return item.rid;
  }
  open(content:any) {
    this.modalService.open(content ,{size:'lg'});
  }
  openBetForm(content:any,betfor:string,odds:any,type:string,sid:number,oddstype:string,min:any,max:any){
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
      this.temptime = winnerdata['data']['0']['mtime'];
      this.tempWinner=winnerdata['data']['0']['winnat']
      const cards = winnerdata['data']['0']['card'].split(',');
      this.rc1 = "/img/cards-new/" + cards[0] + ".png";
      this.rc2 = "/img/cards-new/" + cards[1] + ".png";
      this.rc3 = "/img/cards-new/" + cards[2] + ".png";
      this.rc4 = "/img/cards-new/" + cards[3] + ".png";
      this.rc5 = "/img/cards-new/" + cards[4] + ".png";
      this.rc6 = "/img/cards-new/" + cards[5] + ".png";
      const desc = winnerdata['data']['0']['rdesc'].split('#');
      this.top9=desc[1];
      this.mBaccarat=desc[2]
      // console.log(this.top9)
    })
  }
  submitbet(){
    this.placeLoader=true;
    var dt = { roundid: this.roundId, matchcode:'teenmuf', matchname: 'Muflis Teenpatti', betfor:this.betFor, bettype: 'back', oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid};
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
    this.userauth.getCasinoOpenBet("teenmuf",this.roundId).subscribe({
      next:(res:any)=>{
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item:any) => {
          if(item.oddsType=="Player A"){this.playerABook=item.book}
          else if(item.oddsType=="Player B"){this.playerBBook=item.book}
          else if(item.oddsType=="Top 9 A"){this.nineABook=item.book}
          else if(item.oddsType=="Top 9 B"){this.nineBBook=item.book}
          else if(item.oddsType=="M Baccarat A"){this.baccaratABook=item.book}
          else if(item.oddsType=="M Baccarat B"){this.baccaratBBook=item.book}

        });
        // console.log(this.mybooks);
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
    
    this.playerABook=[];  this.playerBBook=[]; this.nineABook=[]; this.nineBBook=[];
    this.baccaratABook=[];   this.baccaratBBook=[];
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


  ngAfterViewInit(): void {
    $('.datepicker#from_date').datepicker({
      format: 'yyyy-mm-dd',
      orientation: "bottom auto",
      startDate: this.getOneMonthAgoDate(),
      endDate: this.getCurrentDate(),
      autoclose: true
    }).datepicker('setDate', this.from_date);
    $('.datepicker#to_date').datepicker({
      format: 'yyyy-mm-dd',
      orientation: "bottom auto",
      endDate: this.getCurrentDate(),
      autoclose: true
    }).datepicker('setDate', this.to_date);
  }

 
  closeModal() {
    this.statementDetail = [];
    this.modalService.dismissAll();
  }

  // getStatement() {
  //   this.loader=true;
  //   this.statement = [];
  //   if (!this.selectedItem) return;
  //   let dt = {
  //     from_date: $('.datepicker#from_date').val(),
  //     to_date: $('.datepicker#to_date').val(),
  //     type: this.selectedItem,
  //     page: this.page,
  //     offset: this.offset,
  //     searchString: this.searchString
  //   };
  //   this.user_auth.getuserstatement(dt).subscribe({
  //     next: (res: any) => {
  //       this.loader=false;
  //       this.statement = res.data;
  //       this.totalStatement = res.total
  //       this.totalPage = Math.ceil(res.total / this.offset)
  //     }, error: (e) => {
  //       this.loader=false;
  //       console.log(e)
  //     }
  //   })
  // }

  getDetails(matchtype: any) {
    let dt: any = []
    if (this.selectedSportId == '6') {
      dt = { eventId: this.selectedEventId, roundId: this.selectedRoundId, oddsType: this.selectedOddsType, matchType: matchtype.target.value }
    } else {
      dt = { eventId: this.selectedEventId, oddsType: this.selectedOddsType, matchType: matchtype.target.value }
    }
    if (this.fancyOddsTypes.includes(this.selectedOddsType)) {
      dt.fancyName = this.selectedFName
    }
    this.userauth.getstatementdetail(dt).subscribe((res) => {
      this.statementDetail = res;
      this.stmtdetailtotal = this.statementDetail.reduce((acc: any, cur: any) => {
        if (cur.betstatus == 'won') {
          acc += cur.profit
        } else if (cur.betstatus == 'loss') {
          acc -= cur.loss
        }
        return acc;
      }, 0)
    })
  }

  getCurrentDate() {
    return this.formatDate(new Date())
  }
  getOneWeekAgoDate(): string {
    return this.formatDate(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }
  getOneMonthAgoDate(): string {
    var currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - 1);
    return this.formatDate(currentDate)
  }
  formatDate(dateString: any) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 to month because it's zero-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  getStatement() {
    this.loader=true;
    this.statement = [];
    if (!this.selectedItem) return;
    let dt = {
      from_date: $('.datepicker#from_date').val(),
      to_date: $('.datepicker#to_date').val(),
      type: this.selectedItem,
    };
    this.userauth.getuserstatement(dt).subscribe({
      next: (res: any) => {
        this.loader=false;
        this.statement = res.data;
      }, error: (e) => {
        this.loader=false;
        console.log(e)
      }
    })
  }

}
