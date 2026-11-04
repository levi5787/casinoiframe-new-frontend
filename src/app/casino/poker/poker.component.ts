import { Component, HostListener, inject, NgModule, OnInit, } from '@angular/core';
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
  selector: 'app-poker',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './poker.component.html',
  styleUrl: './poker.component.css'
})
export class PokerComponent implements OnInit {

  loader=false; placeLoader=false; userButtons: any = {}; setButtonTab='casino';
  gametab=true; bettab=false; isSticky = false; sidebarTopOffset = 124; placebetButton:any=[]; cvideoURL:any;
  data:any;safeURL: any; autotime = 0; clock: any; beforeNum = 0; mybets:any=[]; mybooks:any=[]; 
  winnerBook:any=[]; a2cardbonusBook:any=[]; b2cardbonusBook:any=[]; a7cardbonusBook:any=[]; b7cardbonusBook:any=[];
  c1 = ""; c2 = ""; c3 = ""; c4 = "";
  c5 = ""; c6 = ""; c7 = ""; c8 = ""; c9 = "";
  roundId = ""; min = 0; max = 0; winnermin:any; winnermax:any; bonusmin:any; bonusmax:any; desc: any = [];
  aback = ""; alay = ""; bback = ""; blay = "";
  abacks = ""; alays = ""; bbacks = ""; blays = "";
  a2cardbonus = ""; a7cardbonus = ""; a2cardbonuss = ""; a7cardbonuss = "";
  b2cardbonus = ""; b7cardbonus = ""; b2cardbonuss = ""; b7cardbonuss = "";
  pagstatus = ""; pbgstatus = "";
  pa2cardgstatus = ""; pa7cardgstatus = "";
  pb2cardgstatus = ""; pb7cardgstatus = "";

  showbetform = false;
  betFor = ""; odds = 0; betType = ""; stake: any = null; profit = 0; loss = 0; oddsType=""; sid=0;
  results: any = [];
  temprId = ""; tempWinner = ""; tempCards: any = []; tempAdesc = ""; tempBdesc = ""; winnerPlayer = "";
  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false;

  constructor(
    private _sanitizer: DomSanitizer,
    private socket_service: SocketService,
    private modalService: NgbModal,
    private match_service: MatchService,
    private userauth: UserauthService,
    private toastr: ToastrService
  ) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = (window.pageYOffset >= this.sidebarTopOffset);
    //console.log(this.sidebarTopOffset)
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo()
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL+'?id=3051')
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'poker').subscribe((data: any) => {
      this.data = data['data'];
      //console.log(data)
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
      this.roundId = data['data']['t1'][0]['mid']
      // this.min = data['data']['t1'][0]['min']
      // this.max = data['data']['t1'][0]['max']
      this.winnermin = data['data']['t2'][0]['min'];
      this.winnermax = data['data']['t2'][0]['max'];
      this.bonusmin = data['data']['t3'][0]['min'];
      this.bonusmax = data['data']['t3'][0]['max'];
      this.desc = data['data']['t1'][0]['desc'].split('##');

      this.aback = data['data']['t2'][0]['b1']; this.alay = data['data']['t2'][0]['l1'];
      this.bback = data['data']['t2'][1]['b1']; this.blay = data['data']['t2'][1]['l1'];
      this.abacks = data['data']['t2'][0]['bs1']; this.alays = data['data']['t2'][0]['ls1'];
      this.bbacks = data['data']['t2'][1]['bs1']; this.blays = data['data']['t2'][1]['ls1'];

      this.a2cardbonus = data['data']['t3'][0]['b1']; this.a2cardbonuss = data['data']['t3'][0]['bs1'];
      this.a7cardbonus = data['data']['t3'][1]['b1']; this.a7cardbonuss = data['data']['t3'][1]['bs1'];

      this.b2cardbonus = data['data']['t3'][2]['b1']; this.b2cardbonuss = data['data']['t3'][2]['bs1'];
      this.b7cardbonus = data['data']['t3'][3]['b1']; this.b7cardbonuss = data['data']['t3'][3]['bs1'];

      this.pagstatus = data['data']['t2'][0]['gstatus'];
      this.pbgstatus = data['data']['t2'][1]['gstatus'];

      this.pa2cardgstatus = data['data']['t3'][0]['gstatus'];
      this.pa7cardgstatus = data['data']['t3'][1]['gstatus'];
      this.pb2cardgstatus = data['data']['t3'][2]['gstatus'];
      this.pb7cardgstatus = data['data']['t3'][3]['gstatus'];
    })
    this.socket_service.casinolast10('Last10', 'poker').subscribe((resultdata: any) => {
      if (resultdata) {
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
    this.match_service.getCVideo('poker').subscribe({
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
  hideBetPlace() {
    this.showbetform = false
  }
  placeStake(val: number) {
    this.stake += val;
    this.calcProfit(val);
  }
  resetStake() {
    this.stake = null;
    this.profit = 0;
    this.loss = 0;
  }
  calcProfit(stake: any) {

  }
  open(content: any) {
    this.modalService.open(content ,{size:'lg'});
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
      this.tempAdesc = winnerdata['data'][0]['desc'].split('##')
      // this.tempBdesc = winnerdata['data'][0]['desc'].split('##')[2]
      if (this.tempWinner == '11') {
        this.winnerPlayer = 'Player A'
      } else if (this.tempWinner == '21') {
        this.winnerPlayer = 'Player B'
      }
      // console.log(this.tempAdesc)
    
    })
  }
  submitbet() {
    this.placeLoader=true;
    var dt = { roundid: this.roundId, matchcode:'poker', matchname: 'Oneday Poker', betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid};
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
    this.userauth.getCasinoOpenBet("poker",this.roundId).subscribe({
      next:(res:any)=>{
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item:any) => {
          if(item.oddsType=="Winner"){this.winnerBook=item.book}
          else if(item.oddsType=="A7CardBonus"){this.a7cardbonusBook=item.book}
          else if(item.oddsType=="B7CardBonus"){this.b7cardbonusBook=item.book}
          else if(item.oddsType=="A2CardBonus"){this.a2cardbonusBook=item.book}
          else if(item.oddsType=="B2CardBonus"){this.b2cardbonusBook=item.book}
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
    this.winnerBook=[];this.a7cardbonusBook=[];this.b7cardbonusBook=[];
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

