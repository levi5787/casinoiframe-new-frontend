import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatchService } from '../../services/match.service';
import { SocketService } from '../../services/socket.service';
import { UserauthService } from '../../services/userauth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';

@Component({
  selector: 'app-race20',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './race20.component.html',
  styleUrl: './race20.component.css'
})
export class Race20Component {

  loader=false; placeLoader=false; gametab=true; bettab=false; userButtons: any = {}; setButtonTab='casino';
  isSticky = false; sidebarTopOffset = 124; placebetButton:any=[]; cvideoURL:any;
  data:any;safeURL: any; autotime = 0; clock: any; beforeNum = 0; activeRange = "";
  mybets:any=[];mybooks:any=[];winnerBook:any=[];totalpointBook:any=[];totalcardBook:any=[];winwithBook:any=[]
  cards: any = []; spadecards: any = []; clubcards: any = []; heartcards: any = []; diamondcards: any = [];
  totalpoint = 0; totalcard = 0;

  roundId = ""; min = 0; max = 0; desc: any = []
  kSpadeback = ""; kHeartback = ""; kClubback = ""; kDiamondback = "";
  kSpadebackSize = ""; kHeartbackSize = ""; kClubbackSize = ""; kDiamondbackSize = "";
  kSpadelay = ""; kHeartlay = ""; kClublay = ""; kDiamondlay = "";
  kSpadelaySize = ""; kHeartlaySize = ""; kClublaySize = ""; kDiamondlaySize = "";
  totalPointback = ""; totalPointlay = ""; totalPointbackSize = ""; totalPointlaySize = "";
  totalCardback = ""; totalCardlay = ""; totalCardbackSize = ""; totalCardlaySize = "";
  winWith5 = ""; winWith6 = ""; winWith7 = ""; winWith15 = ""; winWith16 = ""; winWith17 = "";

  kSpademin = ""; kSpademax = ""; kHeartmin = ""; kHeartmax = ""; kDiamondmin = ""; kDiamondmax = "";
  kClubmin = ""; kClubmax =""; totalPointmin = ""; totalPointmax = ""; totalCardmin = ""; totalCardmax = "";
  winWith5min = ""; winWith5max = ""; winWith15min = ""; winWith15max = ""; winWith6min = ""; winWith6max = "";
  winWith16min =""; winWith16max = ""; winWith7min = ""; winWith7max = ""; winWith17min = ""; winWith17max = "";

  kSpadegstatus = ""; kHeartgstatus = ""; kClubgstatus = ""; kDiamondgstatus = "";
  totalPointgstatus = ""; totalCardgstatus = "";
  winWith5gstatus = ""; winWith6gstatus = ""; winWith7gstatus = ""; winWith15gstatus = ""; winWith16gstatus = ""; winWith17gstatus = "";


  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false;
  showbetform = false; betFor = ""; betType = ""; odds = ""; stake: any = null; profit = 0; loss = 0; oddsType="";sid=0;
  results: any = []
  temprId = ""; tempWinner = ""; tempCards: any = []; tempDesc = ""; winnerPlayer = "";
  tempSpadecards: any = []; tempClubcards: any = []; tempHeartcards: any = []; tempDiamondcards: any = [];

  constructor(
    private modalService:NgbModal,
    private match_service:MatchService,
    private socket_service:SocketService,
    private _sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private userauth: UserauthService,
    private _activatedRoute: ActivatedRoute,
    private _router:Router
  ) { }
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = (window.pageYOffset >= this.sidebarTopOffset);
    //console.log(this.sidebarTopOffset)
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo()
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL+'?id=3036')
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'race20').subscribe((data: any) => {
      this.data = data['data'];
      //code for flipclock
      this.autotime = parseInt(data['data']['t1'][0]['autotime']);
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      // code for flipclock end
      this.desc = data['data']['t1'][0]['desc'];
      this.cards = this.desc.split(",");
      let tempPoint = 0; let tempCard = 0;
      this.cards.forEach((item: any) => {
        if (item != '1') {
          let card = this.getcardvalue(item);
          if (card == "SS") { if (!this.diamondcards.includes(item)) { this.diamondcards.push(item) } }
          else if (card == "HH") { if (!this.spadecards.includes(item)) { this.spadecards.push(item) } }
          else if (card == "CC") { if (!this.clubcards.includes(item)) { this.clubcards.push(item) } }
          else if (card == "DD") { if (!this.heartcards.includes(item)) { this.heartcards.push(item) } }
          tempPoint = tempPoint +  parseInt(this.getNumberValue(this.getcardnumber(item)));
          tempCard++;
        }
      });
      this.totalpoint = tempPoint; this.totalcard = tempCard;

      if (this.roundId != data['data']['t1'][0]['mid']) {
        this.totalpoint=0;this.totalcard=0;
        this.diamondcards = []; this.spadecards = []; this.clubcards = []; this.heartcards = [];
        this.clearBooks(); this.mybets=[];
      }
      this.roundId = data['data']['t1'][0]['mid'];
      this.kSpadeback = data['data']['t2'][0]['b1']; this.kSpadelay = data['data']['t2'][0]['l1'];
      this.kSpadebackSize = data['data']['t2'][0]['bs1']; this.kSpadelaySize = data['data']['t2'][0]['ls1'];
      this.kHeartback = data['data']['t2'][1]['b1']; this.kHeartlay = data['data']['t2'][1]['l1'];
      this.kHeartbackSize = data['data']['t2'][1]['bs1']; this.kHeartlaySize = data['data']['t2'][1]['ls1'];
      this.kClubback = data['data']['t2'][2]['b1']; this.kClublay = data['data']['t2'][2]['l1'];
      this.kClubbackSize = data['data']['t2'][2]['bs1']; this.kClublaySize = data['data']['t2'][2]['ls1'];
      this.kDiamondback = data['data']['t2'][3]['b1']; this.kDiamondlay = data['data']['t2'][3]['l1'];
      this.kDiamondbackSize = data['data']['t2'][3]['bs1']; this.kDiamondlaySize = data['data']['t2'][3]['ls1'];
      this.totalPointback = data['data']['t2'][4]['b1']; this.totalPointbackSize = data['data']['t2'][4]['bs1'];
      this.totalPointlay = data['data']['t2'][4]['l1']; this.totalPointlaySize = data['data']['t2'][4]['ls1'];
      this.totalCardback = data['data']['t2'][5]['b1']; this.totalCardbackSize = data['data']['t2'][5]['ls1'];
      this.totalCardlay = data['data']['t2'][5]['l1']; this.totalCardlaySize = data['data']['t2'][5]['ls1'];
      this.winWith5 = data['data']['t2'][6]['b1']; this.winWith6 = data['data']['t2'][7]['b1'];
      this.winWith7 = data['data']['t2'][8]['b1']; this.winWith15 = data['data']['t2'][9]['b1'];
      this.winWith16 = data['data']['t2'][10]['b1']; this.winWith17 = data['data']['t2'][11]['b1'];

      this.kSpademin = data['data']['t2'][0]['min']; this.kSpademax = data['data']['t2'][0]['max'];
      this.kHeartmin = data['data']['t2'][1]['min']; this.kHeartmax = data['data']['t2'][1]['max'];
      this.kClubmin = data['data']['t2'][2]['min']; this.kClubmax = data['data']['t2'][2]['max'];
      this.kDiamondmin = data['data']['t2'][3]['min']; this.kDiamondmax = data['data']['t2'][3]['max'];
      this.totalPointmin = data['data']['t2'][4]['min']; this.totalPointmax = data['data']['t2'][4]['max'];
      this.totalCardmin = data['data']['t2'][5]['min']; this.totalCardmax = data['data']['t2'][5]['max'];
      this.winWith5min = data['data']['t2'][6]['min']; this.winWith5max = data['data']['t2'][6]['max'];
      this.winWith6min = data['data']['t2'][7]['min']; this.winWith6max = data['data']['t2'][7]['max'];
      this.winWith7min = data['data']['t2'][8]['min']; this.winWith7max = data['data']['t2'][8]['max'];
      this.winWith15min = data['data']['t2'][9]['min']; this.winWith15max = data['data']['t2'][9]['max'];
      this.winWith16min = data['data']['t2'][10]['min']; this.winWith16max = data['data']['t2'][10]['max'];
      this.winWith17min = data['data']['t2'][11]['min']; this.winWith17max = data['data']['t2'][11]['max'];

      this.kSpadegstatus = data['data']['t2'][0]['gstatus']; this.kHeartgstatus = data['data']['t2'][1]['gstatus'];
      this.kClubgstatus = data['data']['t2'][2]['gstatus']; this.kDiamondgstatus = data['data']['t2'][3]['gstatus'];
      this.totalPointgstatus = data['data']['t2'][4]['gstatus']; this.totalCardgstatus = data['data']['t2'][5]['gstatus'];
      this.winWith5gstatus = data['data']['t2'][6]['gstatus']; this.winWith6gstatus = data['data']['t2'][7]['gstatus'];
      this.winWith7gstatus = data['data']['t2'][8]['gstatus']; this.winWith15gstatus = data['data']['t2'][9]['gstatus'];
      this.winWith16gstatus = data['data']['t2'][10]['gstatus']; this.winWith17gstatus = data['data']['t2'][11]['gstatus'];
    });
    this.socket_service.casinolast10('Last10', 'race20').subscribe((resultdata: any) => {
      this.results = resultdata['data'];
      // this.results = this.results.reverse();
    });
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
  trackByFunc(index: number, item: any) {
    return item.sid;
  }
  getCvideoURL() {
    this.match_service.getCVideo('race20').subscribe({
      next: (res: any) => {
        //console.log(res)
        const url = res.url;
        this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(url)
      }, error: (e) => {
        console.log(e)
      }
    })
  }
  open(content: any) {
    this.modalService.open(content, { size: 'lg' });
  }
  openResult(content: any, rid: any) {
    this.loader=true;
    this.tempDiamondcards = []; this.tempSpadecards = []; this.tempClubcards = []; this.tempHeartcards = [];
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      this.loader=false;
      this.modalService.open(content, { size: 'xl' })
      //console.log(winnerdata)
      this.temprId = rid;
      this.tempWinner = winnerdata['data'][0]['win'];
      this.tempCards = winnerdata['data'][0]['cards']
      this.tempCards = this.tempCards.split(",");
      this.tempCards.forEach((item: any) => {
        if (item != '1') {
          let card = this.getcardvalue(item);
          if (card == "SS") { if (!this.tempDiamondcards.includes(item)) { this.tempDiamondcards.push(item) } }
          else if (card == "HH") { if (!this.tempSpadecards.includes(item)) { this.tempSpadecards.push(item) } }
          else if (card == "CC") { if (!this.tempClubcards.includes(item)) { this.tempClubcards.push(item) } }
          else if (card == "DD") { if (!this.tempHeartcards.includes(item)) { this.tempHeartcards.push(item) } }
        }
      });
      this.tempDesc = winnerdata['data'][0]['desc'].split('|')
      if (this.tempWinner == '1') {
        this.winnerPlayer = 'Spade'
      } else if (this.tempWinner == '2') {
        this.winnerPlayer = 'Heart'
      } else if (this.tempWinner == '3') {
        this.winnerPlayer = 'Club'
      } else if (this.tempWinner == '4') {
        this.winnerPlayer = 'Diamond'
      }
      // console.log(this.tempDesc)
    })
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
    if(window.innerWidth<768){
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
  submitbet() {
    this.placeLoader=true;
    var dt = { roundid: this.roundId, matchcode:'race20', matchname: 'Race 20-20', betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid};
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
        this.displayToast(e.error.message,"failed")
        this.modalService.dismissAll();
      }
    })
  }
  getopenbet(){
    this.userauth.getCasinoOpenBet("race20",this.roundId).subscribe({
      next:(res:any)=>{
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item:any) => {
          if(item.oddsType=="Winner"){this.winnerBook=item.book}
          else if(item.oddsType=="TotalPoint"){this.totalpointBook=item.book}
          else if(item.oddsType=="TotalCard"){this.totalcardBook=item.book}
          else if(item.oddsType=="WinWith"){this.winwithBook=item.book}
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
  getcardvalue(cards: string) {
    return cards.slice(-2);
  }
  getcardnumber(cards: string) {
    return cards.slice(0, -2);
  }
  getNumberValue(num: any) {
    if (num == 'J') {
      return 11;
    } else if (num == 'Q') {
      return 12;
    } else if (num == 'K') {
      return 13;
    } else if (num == 'A') {
      return 1;
    } else {
      return num;
    }
  }
  clearBooks(){
    this.winnerBook=[]; this.totalcardBook=[]; this.totalpointBook=[]; this.winwithBook=[];
  }
  rangeClick(name: any) {
    if(this.activeRange==name){
      this.activeRange="";
    }else{
      this.activeRange = name;
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
}
