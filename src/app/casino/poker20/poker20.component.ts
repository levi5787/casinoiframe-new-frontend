import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { UserauthService } from '../../services/userauth.service';
import { SocketService } from '../../services/socket.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatchService } from '../../services/match.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';

@Component({
  selector: 'app-poker20',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './poker20.component.html',
  styleUrl: './poker20.component.css'
})
export class Poker20Component {
  loader=false; placeLoader=false; gametab=true; bettab=false; userButtons: any = {}; setButtonTab='casino';
  isSticky = false; sidebarTopOffset = 124; placebetButton:any=[]; cvideoURL:any;
  data:any;safeURL: any; autotime = 0; clock: any; beforeNum = 0; mybooks:any = []; mybets:any=[];
  winnerBook:any=[]; apairBook:any=[]; bpairBook:any=[]; atwopairBook:any=[]; btwopairBook:any=[]; athreeofakindBook:any=[];
  bthreeofakindBook:any=[]; astraightBook:any=[]; bstraightBook:any=[]; aflushBook:any=[]; bflushBook:any=[]; afullhouseBook:any=[];
  bfullhouseBook:any=[]; afourofakindBook:any=[]; bfourofakindBook:any=[]; astraightflushBook:any=[]; bstraightflushBook:any=[];
  c1 = ""; c2 = ""; c3 = ""; c4 = ""; c5 = ""; c6 = ""; c7 = ""; c8 = ""; c9 = "";
  roundId = ''; min = 0; max = 0; desc: any = []

  winnerOddA = ""; winnerOddB = ""; onePairOddA = ""; onePairOddB = ""; twoPairOddA = ""; twoPairOddB = ""; 
  threeOfKOddA = ""; threeOfKOddB = ""; straightOddA = ""; straightOddB = ""; flushOddA = ""; flushOddB = ""; 
  fullHouseOddA = ""; fullHouseOddB = ""; fourOfkOddA = ""; fourOfkOddB = ""; stFlushOddA = ""; stFlushOddB = "";

  winnerAgstatus = ""; winnerBgstatus = ""; onePairAgstatus = ""; onePairBgstatus = ""; twoPairAgstatus = ""; twoPairBgstatus = "";
  threeOfKAgstatus = ""; threeOfKBgstatus = ""; straightAgstatus = ""; straightBgstatus = ""; flushAgstatus = ""; flushBgstatus = "";
  fullHouseAgstatus = ""; fullHouseBgstatus = ""; fourOfkAgstatus = ""; fourOfkBgstatus = ""; stFlushAgstatus = ""; stFlushBgstatus = "";

  showbetform = false; betFor = ""; betType = ""; odds = ""; stake: any = null; profit = 0; loss = 0; oddsType=""; sid=0;
  results: any = [];
  temprId = ""; tempWinner = ""; tempCards: any = []; tempAdesc = ""; tempBdesc = ""; winnerPlayer = "";
  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false;

  constructor(
    private _sanitizer: DomSanitizer,
    private match_service: MatchService,
    private socket_service: SocketService,
    private modalService: NgbModal,
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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL+'?id=3052')
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'poker20').subscribe((data: any) => {
      this.data = data['data'];
      //console.log(data);
      //code for flipclock
      this.autotime = parseInt(data['data']['t1'][0]['autotime']);
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end
      this.c1 = "/img/cards/" + data['data']['t1'][0]['C1'] + ".png";
      this.c2 = "/img/cards/" + data['data']['t1'][0]['C2'] + ".png";
      this.c3 = "/img/cards/" + data['data']['t1'][0]['C3'] + ".png";
      this.c4 = "/img/cards/" + data['data']['t1'][0]['C4'] + ".png";
      this.c5 = "/img/cards/" + data['data']['t1'][0]['C5'] + ".png";
      this.c6 = "/img/cards/" + data['data']['t1'][0]['C6'] + ".png";
      this.c7 = "/img/cards/" + data['data']['t1'][0]['C7'] + ".png";
      this.c8 = "/img/cards/" + data['data']['t1'][0]['C8'] + ".png";
      this.c9 = "/img/cards/" + data['data']['t1'][0]['C9'] + ".png";

      if(this.roundId!=data['data']['t1'][0]['mid']){
        this.clearBooks(); this.mybets=[];
      }
      this.roundId = data['data']['t1'][0]['mid'];
      this.min = data['data']['t1'][0]['min']; this.max = data['data']['t1'][0]['max'];
      this.desc = data['data']['t1'][0]['desc'].split('##');
      this.winnerOddA = data['data']['t2'][0]['rate']; this.winnerOddB = data['data']['t2'][1]['rate'];
      this.onePairOddA = data['data']['t2'][2]['rate']; this.onePairOddB = data['data']['t2'][3]['rate'];
      this.twoPairOddA = data['data']['t2'][4]['rate']; this.twoPairOddB = data['data']['t2'][5]['rate'];
      this.threeOfKOddA = data['data']['t2'][6]['rate']; this.threeOfKOddB = data['data']['t2'][7]['rate'];
      this.straightOddA = data['data']['t2'][8]['rate']; this.straightOddB = data['data']['t2'][9]['rate'];
      this.flushOddA = data['data']['t2'][10]['rate']; this.flushOddB = data['data']['t2'][11]['rate'];
      this.fullHouseOddA = data['data']['t2'][12]['rate']; this.fullHouseOddB = data['data']['t2'][13]['rate'];
      this.fourOfkOddA = data['data']['t2'][14]['rate']; this.fourOfkOddB = data['data']['t2'][15]['rate'];
      this.stFlushOddA = data['data']['t2'][16]['rate']; this.stFlushOddB = data['data']['t2'][17]['rate'];

      this.winnerAgstatus = data['data']['t2'][0]['gstatus']; this.winnerBgstatus = data['data']['t2'][1]['gstatus'];
      this.onePairAgstatus = data['data']['t2'][2]['gstatus']; this.onePairBgstatus = data['data']['t2'][3]['gstatus'];
      this.twoPairAgstatus = data['data']['t2'][4]['gstatus']; this.twoPairBgstatus = data['data']['t2'][5]['gstatus'];
      this.threeOfKAgstatus = data['data']['t2'][6]['gstatus']; this.threeOfKBgstatus = data['data']['t2'][7]['gstatus'];
      this.straightAgstatus = data['data']['t2'][8]['gstatus']; this.straightBgstatus = data['data']['t2'][9]['gstatus'];
      this.flushAgstatus = data['data']['t2'][10]['gstatus']; this.flushBgstatus = data['data']['t2'][11]['gstatus'];
      this.fullHouseAgstatus = data['data']['t2'][12]['gstatus']; this.fullHouseBgstatus = data['data']['t2'][13]['gstatus'];
      this.fourOfkAgstatus = data['data']['t2'][14]['gstatus']; this.fourOfkBgstatus = data['data']['t2'][15]['gstatus'];
      this.stFlushAgstatus = data['data']['t2'][16]['gstatus']; this.stFlushBgstatus = data['data']['t2'][17]['gstatus'];
    })
    this.socket_service.casinolast10('Last10', 'poker20').subscribe((resultdata: any) => {
      this.results = resultdata['data'];
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
    this.match_service.getCVideo('poker20').subscribe({
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
  open(content: any) {
    this.modalService.open(content, { size: 'lg' });
  }
  openBetForm(content:any,betfor:string,odds:any,type:string,sid:number,oddstype:string,min:any,max:any){
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

  hideBetPlace() {
    this.showbetform = false;
  }

  placeStake(stake: number) {
    this.stake = stake;
  }
  calcProfit(val: number) {

  }
  resetStake() {
    this.profit = 0;
    this.stake = null;
    this.loss = 0;
  }

  openResult(content: any, rid: any) {
    this.loader=true;
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      this.loader=false;
      this.modalService.open(content, { size: 'xl' })
      //console.log(winnerdata)
      this.temprId = rid;
      this.tempWinner = winnerdata['data'][0]['win'];
      this.tempCards = winnerdata['data'][0]['cards']
      this.tempCards = this.tempCards.split(",");
      this.tempAdesc = winnerdata['data'][0]['desc'].split('##')[1]
      this.tempBdesc = winnerdata['data'][0]['desc'].split('##')[2]
      if (this.tempWinner == '11') {
        this.winnerPlayer = 'Player A'
      } else if (this.tempWinner == '21') {
        this.winnerPlayer = 'Player B'
      }
      // console.log(winnerdata)
    })
  }
  submitbet() {
    this.placeLoader=true;
    var dt = { roundid: this.roundId, matchcode:'poker20', matchname: '20-20 Poker', betfor: this.betFor, bettype: 'back', oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid};
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
    this.userauth.getCasinoOpenBet("poker20",this.roundId).subscribe({
      next:(res:any)=>{
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item:any) => {
          if(item.oddsType=="Winner"){this.winnerBook=item.book}
          else if(item.oddsType=="APair"){this.apairBook=item.book}
          else if(item.oddsType=="BPair"){this.bpairBook=item.book}
          else if(item.oddsType=="ATwoPair"){this.atwopairBook=item.book}
          else if(item.oddsType=="BTwoPair"){this.btwopairBook=item.book}
          else if(item.oddsType=="AThreeofaKind"){this.athreeofakindBook=item.book}
          else if(item.oddsType=="BThreeofaKind"){this.bthreeofakindBook=item.book}
          else if(item.oddsType=="AStraight"){this.astraightBook=item.book}
          else if(item.oddsType=="BStraight"){this.bstraightBook=item.book}
          else if(item.oddsType=="AFlush"){this.aflushBook=item.book}
          else if(item.oddsType=="BFlush"){this.bflushBook=item.book}
          else if(item.oddsType=="AFullHouse"){this.afullhouseBook=item.book}
          else if(item.oddsType=="BFullHouse"){this.bfullhouseBook=item.book}
          else if(item.oddsType=="AFourofaKind"){this.afourofakindBook=item.book}
          else if(item.oddsType=="BFourofaKind"){this.bfourofakindBook=item.book}
          else if(item.oddsType=="AStraightFlush"){this.astraightflushBook=item.book}
          else if(item.oddsType=="BStraightFlush"){this.bstraightflushBook=item.book}
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
  clearBooks(){
    this.winnerBook=[]; this.apairBook=[]; this.bpairBook=[]; this.atwopairBook=[]; this.btwopairBook=[]; this.athreeofakindBook=[];
    this.bthreeofakindBook=[]; this.astraightBook=[]; this.bstraightBook=[]; this.aflushBook=[]; this.bflushBook=[]; this.afullhouseBook=[];
    this.bfullhouseBook=[]; this.afourofakindBook=[]; this.bfourofakindBook=[]; this.astraightflushBook=[]; this.bstraightflushBook=[];
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
