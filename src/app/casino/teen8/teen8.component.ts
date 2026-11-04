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

@Component({
  selector: 'app-teen8',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './teen8.component.html',
  styleUrl: './teen8.component.css'
})
export class Teen8Component {
 gametab=true;bettab=false;  loader=false; placeLoader=false; userButtons: any = {}; setButtonTab='casino';
  data:any; safeURL: any; mybets: any = []; mybooks: any = []; placebetButton:any=[]; cvideoURL:any;
  p1book: any = []; p2book: any = []; p3book: any = []; p4book: any = []; p5book: any = []; p6book: any = []; p7book: any = []; p8book: any = [];
  pp1book: any = []; pp2book: any = []; pp3book: any = []; pp4book: any = []; pp5book: any = []; pp6book: any = []; pp7book: any = []; pp8book: any = [];
  isSticky = false; sidebarTopOffset = 124;
  roundId = ""; autotime = 0; clock: any; beforeNum = 0;
  results: any = []; min:any; max:any; odmin = 0; odmax = 0; ppmin = 0; ppmax = 0; c1 = ""; c2 = ""; c3 = "";
  cards: any = []; playersCard: any = [];
  cardColor: any = ["card-black", "card-black", "card-black", "card-black", "card-black", "card-black", "card-black", "card-black", "card-black", "card-black", "card-black", "card-black", "card-black", "card-black", "card-black", "card-black", "card-black", "card-black", "card-black", "card-black", "card-black", "card-black", "card-black", "card-black", "card-black", "card-black", "card-black"];
  p1odds = ""; p2odds = ""; p3odds = ""; p4odds = ""; p5odds = ""; p6odds = ""; p7odds = ""; p8odds = "";
  p1pplus = ""; p2pplus = ""; p3pplus = ""; p4pplus = ""; p5pplus = ""; p6pplus = ""; p7pplus = ""; p8pplus = "";
  p1gstatus = ""; p2gstatus = ""; p3gstatus = ""; p4gstatus = ""; p5gstatus = ""; p6gstatus = ""; p7gstatus = ""; p8gstatus = "";

  showbetform = false; odds = 0; betFor = ""; betType = ""; stake: any = null; profit = 0; loss = 0; oddsType = ""; sid = 0;
  temprId = ""; tempCards: any = []; tempwinner: any = []; is1winner = false; is2winner = false;
  is3winner = false; is4winner = false; is5winner = false; is6winner = false; is7winner = false; is8winner = false;
  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false;

  constructor(
    private _sanitizer: DomSanitizer,
    private userauth: UserauthService,
    private toastr: ToastrService,
    private socket_service: SocketService,
    private match_service: MatchService,
    private modalService: NgbModal
  ) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = (window.pageYOffset >= this.sidebarTopOffset);
    //console.log(this.sidebarTopOffset)
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo()
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL+'?id=3049')
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'teen8').subscribe((data: any) => {
      if (data) {
        this.data = data['data'];
        //console.log(data)
        //code for flipclock
        this.autotime = parseInt(data['data']['t1'][0]['autotime']);
        if (this.beforeNum != this.autotime) {
          this.updateClock(this.autotime);
        }
        this.beforeNum = this.autotime;
        //code for flipclock end
        this.cards = data['data']['t1'][0]['cards'];
        if (this.roundId != data['data']['t1'][0]['mid']) {
          this.clearbooks(); this.mybets=[];
        }
        this.roundId = data['data']['t1'][0]['mid'];
        this.odmin = data['data']['t2'][0]['min'];
        this.odmax = data['data']['t2'][0]['max'];
        this.ppmin = data['data']['t2'][15]['min'];
        this.ppmax = data['data']['t2'][15]['max'];
        if (this.cards.includes('#')) {
          this.cards = this.cards.split('#')[0];
        }
        this.cards = this.cards.split(',');
        this.playersCard = this.cards;
        this.c1 = "/img/cards/" + this.cards[8] + ".png"
        this.c2 = "/img/cards/" + this.cards[17] + ".png"
        this.c3 = "/img/cards/" + this.cards[26] + ".png"

        for (let i = 0; i < this.playersCard.length; i++) {
          if (this.playersCard[i].includes('DD')) {
            this.playersCard[i] = this.playersCard[i].replace('DD', '{');
            this.cardColor[i] = "card-red";
          } else if (this.playersCard[i].includes('SS')) {
            this.playersCard[i] = this.playersCard[i].replace('SS', '[');
            this.cardColor[i] = "card-red";
          } else if (this.playersCard[i].includes('CC')) {
            this.playersCard[i] = this.playersCard[i].replace('CC', ']');
            this.cardColor[i] = "card-black";
          } else if (this.playersCard[i].includes('HH')) {
            this.playersCard[i] = this.playersCard[i].replace('HH', '}');
            this.cardColor[i] = "card-black";
          }
        }
        this.p1odds = data['data']['t2'][0]['rate']; this.p2odds = data['data']['t2'][1]['rate'];
        this.p3odds = data['data']['t2'][2]['rate']; this.p4odds = data['data']['t2'][3]['rate'];
        this.p5odds = data['data']['t2'][4]['rate']; this.p6odds = data['data']['t2'][5]['rate'];
        this.p7odds = data['data']['t2'][6]['rate']; this.p8odds = data['data']['t2'][7]['rate'];

        this.p1pplus = data['data']['t2'][8]['rate']; this.p2pplus = data['data']['t2'][9]['rate'];
        this.p3pplus = data['data']['t2'][10]['rate']; this.p4pplus = data['data']['t2'][11]['rate'];
        this.p5pplus = data['data']['t2'][12]['rate']; this.p6pplus = data['data']['t2'][13]['rate'];
        this.p7pplus = data['data']['t2'][14]['rate']; this.p8pplus = data['data']['t2'][15]['rate'];

        this.p1gstatus = data['data']['t2'][0]['gstatus']; this.p2gstatus = data['data']['t2'][1]['gstatus'];
        this.p3gstatus = data['data']['t2'][2]['gstatus']; this.p4gstatus = data['data']['t2'][3]['gstatus'];
        this.p5gstatus = data['data']['t2'][4]['gstatus']; this.p6gstatus = data['data']['t2'][5]['gstatus'];
        this.p7gstatus = data['data']['t2'][6]['gstatus']; this.p8gstatus = data['data']['t2'][7]['gstatus'];
      }
    })
    this.socket_service.casinolast10('Last10', 'teen8').subscribe((resultdata: any) => {
      if (resultdata) {
        this.results = resultdata['data'];
        this.results = this.results.reverse();
      }
    })
    setTimeout(() => {
      this.getopenbet();
      setTimeout(() => {
        this.getopenbet()
      }, 2000);
    }, 1500);
    this.socket_service.updateCheck('User', this.userauth.getUsername()).subscribe((data: any) => {
      if (data.update) {
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
    this.match_service.getCVideo('teen8').subscribe({
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
  openBetForm( content:any,betfor: string, odds: any, type: string, sid: number, oddstype: string,min:any, max:any) {
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
    this.profit = 0
    this.stake += val;
    this.calcProfit(val);
  }
  resetStake() {
    this.stake = null;
    this.profit = 0;
    this.loss = 0;
  }
  calcProfit(val: any) {
    if (this.betType == "Back") {
      this.profit = (this.odds * val) - val;
    } else if (this.betType == "Pair Plus") {
      this.profit = val;
    }
  }
  open(content: any) {
    this.modalService.open(content,{size:'lg'});
  }
  openResult(content: any, rid: any) {
    this.is1winner = false; this.is2winner = false; this.is3winner = false; this.is4winner = false;
    this.is5winner = false; this.is6winner = false; this.is7winner = false; this.is8winner = false;
    this.loader=true;
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      this.loader=false;
      this.modalService.open(content, { size: 'xl' })
      //console.log(winnerdata);
      this.temprId = rid;
      this.tempwinner = winnerdata['data'][0]['sid'];
      this.tempwinner = this.tempwinner.split('|')[0]
      this.tempCards = winnerdata['data'][0]['cards']
      this.tempCards = this.tempCards.split(",");
      //console.log(this.tempwinner)
      if (this.tempwinner.includes('1')) {
        this.is1winner = true
      }
      if (this.tempwinner.includes('2')) {
        this.is2winner = true
      }
      if (this.tempwinner.includes('3')) {
        this.is3winner = true
      }
      if (this.tempwinner.includes('4')) {
        this.is4winner = true
      }
      if (this.tempwinner.includes('5')) {
        this.is5winner = true
      }
      if (this.tempwinner.includes('6')) {
        this.is6winner = true
      }
      if (this.tempwinner.includes('7')) {
        this.is7winner = true
      }
      if (this.tempwinner.includes('8')) {
        this.is8winner = true
      }
    })
  }
  submitbet() {
    this.placeLoader=true;
    var dt = { roundid: this.roundId, matchcode: 'teen8', matchname: 'Open Teenpatti', betfor: this.betFor, bettype: 'back', oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid };
    this.userauth.placeCasinoBet(dt).subscribe({
      next: (res: any) => {
        this.placeLoader=false;
        this.showbetform = false;
        this.displayToast(res.message, res.status);
        this.getopenbet(); this.userauth.getUserBalance();
        this.modalService.dismissAll();
      },
      error: (e) => {
        this.placeLoader=false;
        this.showbetform = false;
        this.displayToast(e.error.message, "failed");
        this.modalService.dismissAll();
      }
    })
  }
  getopenbet() {
    this.userauth.getCasinoOpenBet("teen8", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          if (item.oddsType == "Player 1") { this.p1book = item.book }
          else if (item.oddsType == "Player 2") { this.p2book = item.book }
          else if (item.oddsType == "Player 3") { this.p3book = item.book }
          else if (item.oddsType == "Player 4") { this.p4book = item.book }
          else if (item.oddsType == "Player 5") { this.p5book = item.book }
          else if (item.oddsType == "Player 6") { this.p6book = item.book }
          else if (item.oddsType == "Player 7") { this.p7book = item.book }
          else if (item.oddsType == "Player 8") { this.p8book = item.book }
          else if (item.oddsType == "Pair plus 1") { this.pp1book = item.book }
          else if (item.oddsType == "Pair plus 2") { this.pp2book = item.book }
          else if (item.oddsType == "Pair plus 3") { this.pp3book = item.book }
          else if (item.oddsType == "Pair plus 4") { this.pp4book = item.book }
          else if (item.oddsType == "Pair plus 5") { this.pp5book = item.book }
          else if (item.oddsType == "Pair plus 6") { this.pp6book = item.book }
          else if (item.oddsType == "Pair plus 7") { this.pp7book = item.book }
          else if (item.oddsType == "Pair plus 8") { this.pp8book = item.book }
        });
      }, error: (e) => console.log(e)
    })
  }
  displayToast(msg: any, type: any) {
    if (type == "success") {
      this.toastr.success(msg, '', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        closeButton: true,
      });
    } else {
      this.toastr.error(msg, '', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        closeButton: true,
      });
    }
  }
  clearbooks() {
    this.p1book = []; this.p2book = []; this.p3book = []; this.p4book = []; this.p5book = []; this.p6book = []; this.p7book = []; this.p8book = [];
    this.pp1book = []; this.pp2book = []; this.pp3book = []; this.pp4book = []; this.pp5book = []; this.pp6book = []; this.pp7book = []; this.pp8book = [];
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
