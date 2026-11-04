import { Component, HostListener, inject } from '@angular/core';
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
  selector: 'app-poker6',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './poker6.component.html',
  styleUrl: './poker6.component.css'
})
export class Poker6Component {
  loader=false; placeLoader=false; gametab=true; bettab=false; userButtons: any = {}; setButtonTab='casino';
  isSticky = false; sidebarTopOffset = 124; placebetButton:any=[]; cvideoURL:any;
  data:any;safeURL: any; mybets:any=[]; mybooks:any=[]; winnerBook:any=[]; patternBook:any=[];
  roundId = ""; autotime = 0; clock: any; beforeNum = 0;
  c1 = ""; c2 = ""; c3 = ""; c4 = ""; c5 = ""; c6 = ""; c7 = ""; c8 = "";
  c9 = ""; c10 = ""; c11 = ""; c12 = ""; c13 = ""; c14 = ""; c15 = ""; c16 = ""; c17 = "";
  cardColor = ['card-black', 'card-black', 'card-black', 'card-black', 'card-black', 'card-black', 'card-black', 'card-black', 'card-black', 'card-black', 'card-black', 'card-black']
  hands = true; pattern = false;

  p1gstatus = ""; p2gstatus = ""; p3gstatus = ""; p4gstatus = ""; p5gstatus = ""; p6gstatus = "";
  p1odd = ""; p2odd = ""; p3odd = ""; p4odd = ""; p5odd = ""; p6odd = "";

  min:any; max:any;
  p1min = 0; p2min = 0; p3min = 0; p4min = 0; p5min = 0; p6min = 0;
  p1max = 0; p2max = 0; p3max = 0; p4max = 0; p5max = 0; p6max = 0;

  highCardgstatus = ""; pairgstatus = ""; twoPairgstatus = ""; threeOfkgstatus = ""; straightgstatus = "";
  flushgstatus = ""; fullHousegstatus = ""; fourOfkgstatus = ""; stFlushgstatus = "";

  highCardodd = ""; pairodd = ""; twoPairodd = ""; threeOfkodd = ""; straightodd = "";
  flushodd = ""; fullHouseodd = ""; fourOfkodd = ""; stFlushodd = "";

  highCardmin = ""; pairmin = ""; twoPairmin = ""; threeOfkmin = ""; straightmin = "";
  flushmin = ""; fullHousemin = ""; fourOfkmin = ""; stFlushmin = "";

  highCardmax = ""; pairmax = ""; twoPairmax = ""; threeOfkmax = ""; straightmax = "";
  flushmax = ""; fullHousemax = ""; fourOfkmax = ""; stFlushmax = "";

  betFor = ""; odds = 0; betType = ""; stake: any = null; profit = 0; loss = 0; oddsType="";sid=0;
  showbetform = false;
  results: any = []
  temprId = ""; tempWinner = ""; tempCards: any = []; tempAdesc = ""; tempBdesc = ""; winnerPlayer = ""; tempDesc="";
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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL+'?id=3050')
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'poker9').subscribe((data: any) => {
      this.data = data['data'];
      //console.log(data)
      this.c13 = "/img/cards/" + data['data']['t1'][0]['C13'] + ".png";
      this.c14 = "/img/cards/" + data['data']['t1'][0]['C14'] + ".png";
      this.c15 = "/img/cards/" + data['data']['t1'][0]['C15'] + ".png";
      this.c16 = "/img/cards/" + data['data']['t1'][0]['C16'] + ".png";
      this.c17 = "/img/cards/" + data['data']['t1'][0]['C17'] + ".png";

      if(this.roundId!=data['data']['t1'][0]['mid']){
        this.winnerBook=[];this.patternBook=[]; this.mybets=[];
      }
      this.roundId = data['data']['t1'][0]['mid'];
      //code for flipclock
      this.autotime = parseInt(data['data']['t1'][0]['autotime']);
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end


      this.c1 = this.geCardCharacter(data['data']['t1'][0]['C1'], 1);
      this.c2 = this.geCardCharacter(data['data']['t1'][0]['C2'], 2);
      this.c3 = this.geCardCharacter(data['data']['t1'][0]['C3'], 3);
      this.c4 = this.geCardCharacter(data['data']['t1'][0]['C4'], 4);
      this.c5 = this.geCardCharacter(data['data']['t1'][0]['C5'], 5);
      this.c6 = this.geCardCharacter(data['data']['t1'][0]['C6'], 6);
      this.c7 = this.geCardCharacter(data['data']['t1'][0]['C7'], 7);
      this.c8 = this.geCardCharacter(data['data']['t1'][0]['C8'], 8);
      this.c9 = this.geCardCharacter(data['data']['t1'][0]['C9'], 9);
      this.c10 = this.geCardCharacter(data['data']['t1'][0]['C10'], 10);
      this.c11 = this.geCardCharacter(data['data']['t1'][0]['C11'], 11);
      this.c12 = this.geCardCharacter(data['data']['t1'][0]['C12'], 12);

      this.p1gstatus = data['data']['t2'][0]['gstatus']; this.p2gstatus = data['data']['t2'][1]['gstatus'];
      this.p3gstatus = data['data']['t2'][2]['gstatus']; this.p4gstatus = data['data']['t2'][3]['gstatus'];
      this.p5gstatus = data['data']['t2'][4]['gstatus']; this.p6gstatus = data['data']['t2'][5]['gstatus'];

      this.p1odd = data['data']['t2'][0]['rate']; this.p2odd = data['data']['t2'][1]['rate'];
      this.p3odd = data['data']['t2'][2]['rate']; this.p4odd = data['data']['t2'][3]['rate'];
      this.p5odd = data['data']['t2'][4]['rate']; this.p6odd = data['data']['t2'][5]['rate'];

      this.p1min = data['data']['t2'][0]['min']; this.p2min = data['data']['t2'][1]['min'];
      this.p3min = data['data']['t2'][2]['min']; this.p4min = data['data']['t2'][3]['min'];
      this.p5min = data['data']['t2'][4]['min']; this.p6min = data['data']['t2'][5]['min'];

      this.p1max = data['data']['t2'][0]['max']; this.p2max = data['data']['t2'][1]['max'];
      this.p3max = data['data']['t2'][2]['max']; this.p4max = data['data']['t2'][3]['max'];
      this.p5max = data['data']['t2'][4]['max']; this.p6max = data['data']['t2'][5]['max'];

      this.highCardgstatus = data['data']['t2'][6]['gstatus']; this.pairgstatus = data['data']['t2'][7]['gstatus'];
      this.twoPairgstatus = data['data']['t2'][8]['gstatus']; this.threeOfkgstatus = data['data']['t2'][9]['gstatus'];
      this.straightgstatus = data['data']['t2'][10]['gstatus']; this.flushgstatus = data['data']['t2'][11]['gstatus'];
      this.fullHousegstatus = data['data']['t2'][12]['gstatus']; this.fourOfkgstatus = data['data']['t2'][13]['gstatus'];
      this.stFlushgstatus = data['data']['t2'][14]['gstatus'];

      this.highCardodd = data['data']['t2'][6]['rate']; this.pairodd = data['data']['t2'][7]['rate'];
      this.twoPairodd = data['data']['t2'][8]['rate']; this.threeOfkodd = data['data']['t2'][9]['rate'];
      this.straightodd = data['data']['t2'][10]['rate']; this.flushodd = data['data']['t2'][11]['rate'];
      this.fullHouseodd = data['data']['t2'][12]['rate']; this.fourOfkodd = data['data']['t2'][13]['rate'];
      this.stFlushodd = data['data']['t2'][14]['rate'];

      this.highCardmin = data['data']['t2'][6]['min']; this.pairmin = data['data']['t2'][7]['min'];
      this.twoPairmin = data['data']['t2'][8]['min']; this.threeOfkmin = data['data']['t2'][9]['min'];
      this.straightmin = data['data']['t2'][10]['min']; this.flushmin = data['data']['t2'][11]['min'];
      this.fullHousemin = data['data']['t2'][12]['min']; this.fourOfkmin = data['data']['t2'][13]['min'];
      this.stFlushmin = data['data']['t2'][14]['min'];

      this.highCardmax = data['data']['t2'][6]['max']; this.pairmax = data['data']['t2'][7]['max'];
      this.twoPairmax = data['data']['t2'][8]['max']; this.threeOfkmax = data['data']['t2'][9]['max'];
      this.straightmax = data['data']['t2'][10]['max']; this.flushmax = data['data']['t2'][11]['max'];
      this.fullHousemax = data['data']['t2'][12]['max']; this.fourOfkmax = data['data']['t2'][13]['max'];
      this.stFlushmax = data['data']['t2'][14]['max'];
    })

    this.socket_service.casinolast10('Last10', 'poker9').subscribe((resultdata: any) => {
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
    this.match_service.getCVideo('poker6').subscribe({
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
  geCardCharacter(card: any, colorIndex: number) {
    if (card.includes('DD')) {
      this.cardColor[colorIndex] = 'card-red';
      return card.replace('DD', '{');
    } else if (card.includes('SS')) {
      this.cardColor[colorIndex] = 'card-red';
      return card.replace('SS', '[');
    } else if (card.includes('CC')) {
      this.cardColor[colorIndex] = 'card-black';
      return card.replace('CC', ']');
    } else if (card.includes('HH')) {
      this.cardColor[colorIndex] = 'card-black';
      return card.replace('HH', '}');
    }
  }
  showhands() {
    this.hands = true;
    this.pattern = false
  }
  showpatterns() {
    this.hands = false;
    this.pattern = true;
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
    this.modalService.open(content , { size: 'lg' });
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
      this.tempDesc = winnerdata['data'][0]['desc'].replace("Won", "").replace("Pattern :", "").split('||');
      // console.log(this.tempDesc)
    })
  }
  submitbet() {
    this.placeLoader=true;
    var dt = { roundid: this.roundId, matchcode:'poker9', matchname: '6 Player Poker', betfor: this.betFor, bettype: 'back', oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid};
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
    this.userauth.getCasinoOpenBet("poker9",this.roundId).subscribe({
      next:(res:any)=>{
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item:any) => {
          if(item.oddsType=="Winner"){this.winnerBook=item.book}
          else if(item.oddsType=="Pattern"){this.patternBook=item.book}
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
