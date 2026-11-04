import { Component, HostListener, OnInit, inject, NgModule, } from '@angular/core';
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
  selector: 'app-lucky7eu2',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './lucky7eu2.component.html',
  styleUrl: './lucky7eu2.component.css'
})
export class Lucky7eu2Component implements OnInit {
  lowCard: any = {}; highCard: any = {}; even: any = {}; odd: any = {}; red: any = {}; black: any = {}; card1: any; card2: any; card3: any; card4: any; card5: any; card6: any; card7: any; card8: any; card9: any; card10: any; cardJ: any; cardQ: any; cardK: any; b: any; cards = ""; temptime = "";
  line1: any = {}; line2: any = {}; line3: any = {}; line4: any = {}; bettab = false; gametab = true; loader = false; placeLoader = false; userButtons: any = {}; setButtonTab = 'casino';
  isSticky = false; sidebarTopOffset = 124; placebetButton: any = []; cvideoURL: any;
  data: any; safeURL: any; autotime = 0; clock: any; beforeNum = 0; mybets: any = []; mybooks: any = [];
  c1 = ""; c2 = ""; rc1 = ""; rc2 = ""; gtype = "";
  roundId = ""; min: any; max: any;

  results: any = [];

  lowBook: any = []; highBook: any = []; evenBook: any = []; oddBook: any = []; redBook: any = []; blackBook: any = []; card1Book: any = []; card2Book: any = []
  card3Book: any = []; card4Book: any = []; card5Book: any = []; card6Book: any = []; card7Book: any = []; card8Book: any = []; card9Book: any = []; card10Book: any = []
  cardJBook: any = []; cardQBook: any = []; cardKBook: any = []; line1Book: any = []; line2Book: any = []; line3Book: any = []; line4Book: any = [];



  betFor = ""; betType = ""; odds = ""; showbetform = false; stake: any = null; profit = 0; oddsType = ""; sid = 0;
  tempCards: any = []; tempWinner: any = ""; temprId = ""; tempOdd: any = ""; tempCard: any = ""; tempLine: any = ""; tempColour: any = "";
  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false;

  constructor(
    private _sanitizer: DomSanitizer,
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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3062');
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'lucky7eu2').subscribe((data: any) => {
      this.data = data['data'];
      if (data) {
        this.autotime = parseInt(data['data']['lt']);
        if (this.beforeNum != this.autotime) {
          this.updateClock(this.autotime);
        }
        this.beforeNum = this.autotime;
        //code for flipclock end
        if (this.roundId != data['data']['mid']) {
          this.clearBooks(); this.mybets = [];
        }
        const cards = data['data']['card'].split(',');

        this.roundId = data['data']['mid'];
        this.lowCard = data['data']['sub'][0];
        this.highCard = data['data']['sub'][1];
        this.even = data['data']['sub'][2];
        this.odd = data['data']['sub'][3];
        this.red = data['data']['sub'][4];
        this.black = data['data']['sub'][5];
        this.card1 = data['data']['sub'][6];
        this.card2 = data['data']['sub'][7];
        this.card3 = data['data']['sub'][8];
        this.card4 = data['data']['sub'][9];
        this.card5 = data['data']['sub'][10];
        this.card6 = data['data']['sub'][11];
        this.card7 = data['data']['sub'][12];
        this.card8 = data['data']['sub'][13];
        this.card9 = data['data']['sub'][14]; this.card10 = data['data']['sub'][15];
        this.cardJ = data['data']['sub'][16]; this.cardQ = data['data']['sub'][17];
        this.cardK = data['data']['sub'][18]; this.line1 = data['data']['sub'][19];
        this.line2 = data['data']['sub'][20]; this.line3 = data['data']['sub'][21];
        this.line4 = data['data']['sub'][22];
        // console.log(this.lowCard)

        this.c1 = "/img/cards-new/" + cards[0] + ".png";
        //console.log(this.c1)
        this.c2 = "/img/cards-new/" + cards[1] + ".png";
        this.gtype = data['data']['gtype']

      }
    })
    this.socket_service.casinolast10('Last10', 'lucky7eu2').subscribe((resultdata: any) => {
      if (resultdata) {
        this.results = resultdata['data'].res;
        // console.log(this.results);
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
    this, this.placeBetButton();
  }

  ngOnDestroy() {
    this.socket_service.leavaAllRooms;
  }
  getCvideoURL() {
    this.match_service.getCVideo('lucky7eu2').subscribe({
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
  openBetForm(content: any, betfor: string, odds: any, type: string, sid: number, oddstype: string, min: number = 0, max: number = 0) {
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
    if (window.innerWidth < 1100) {
      this.modalService.open(content)
    }
  }
  hideBetPlace() {
    this.showbetform = false;
  }
  placeStake(val: number) {
    this.stake += val;
    this.profit = 0;
    this.calcProfit(val);
  }
  resetStake() {
    this.stake = null;
    this.profit = 0;
  }
  calcProfit(val: any) {
    //this.profit = (parseInt(this.betOdds)*this.stake)-this.stake;
  }

  // openResult(content: any, rid: any) {
  //   this.loader = true;
  //   this.match_service.getResult(rid).subscribe((winnerdata: any) => {
  //     this.loader = false;
  //     this.modalService.open(content, { size: 'xl' })
  //     console.log(winnerdata);
  //     this.temprId = rid;
  //     this.temptime = winnerdata['data']['t1']['mtime'];
  //     this.tempWinner = winnerdata['data']['t1']['winnat']
  //     const cards = winnerdata['data']['t1']['card'].split(',');
  //     this.rc1 = "/img/cards-new/" + cards[0] + ".png";
  //     this.rc2 = "/img/cards-new/" + cards[1] + ".png";
  //   })
  // }
  openResult(content: any, rid: any) {
    this.loader = true;
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      this.loader = false;
      this.modalService.open(content, { size: 'xl' });

      console.log(winnerdata);

      const result = winnerdata.data?.[0];

      if (result) {
        this.temprId = result.rid;
        this.temptime = result.mtime;
        this.tempWinner = result.winnat;
        const tempDesc = result.rdesc?.split('#') || [];
        this.tempOdd = tempDesc[1] || ' ';
        this.tempColour = tempDesc[2] || ' ';
        this.tempCards = tempDesc[3] || ' ';
        this.tempLine = tempDesc[4] || ' ';
        this.tempCard = result.card;
        console.log(this.tempCard)
      } else {
        console.error("No game result found.");
      }
    });
  }

  submitbet() {
    this.placeLoader = true;
    var dt = { roundid: this.roundId, matchcode: 'lucky7eu2', matchname: 'Test Teenpatti', betfor: this.betFor, bettype: 'back', oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid };
    this.userauth.placeCasinoBet(dt).subscribe({
      next: (res: any) => {
        this.placeLoader = false;
        this.showbetform = false;
        this.displayToast(res.message, res.status);
        this.getopenbet(); this.userauth.getUserBalance();
        this.modalService.dismissAll();
      },
      error: (e) => {
        this.placeLoader = false;
        this.showbetform = false;
        this.displayToast(e.error.message, "failed");
        this.modalService.dismissAll();
      }
    })
  }
  getopenbet() {
    this.userauth.getCasinoOpenBet("lucky7eu2", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          if (item.oddsType == "Low Card") { this.lowBook = item.book }
          else if (item.oddsType == "High Card") { this.highBook = item.book }
          else if (item.oddsType == "Even") { this.evenBook = item.book }
          else if (item.oddsType == "Odd") { this.oddBook = item.book }
          else if (item.oddsType == "Red") { this.redBook = item.book }
          else if (item.oddsType == "Black") { this.blackBook = item.book }
          else if (item.oddsType == "Line 1") { this.line1Book = item.book }
          else if (item.oddsType == "Line 2") { this.line2Book = item.book }
          else if (item.oddsType == "Line 3") { this.line3Book = item.book }
          else if (item.oddsType == "Line 4") { this.line4Book = item.book }
          else if (item.oddsType == "Card A") { this.card1Book = item.book }
          else if (item.oddsType == "Card 2") { this.card2Book = item.book }
          else if (item.oddsType == "Card 3") { this.card3Book = item.book }
          else if (item.oddsType == "Card 4") { this.card4Book = item.book }
          else if (item.oddsType == "Card 5") { this.card5Book = item.book }
          else if (item.oddsType == "Card 6") { this.card6Book = item.book }
          else if (item.oddsType == "Card 7") { this.card7Book = item.book }
          else if (item.oddsType == "Card 8") { this.card8Book = item.book }
          else if (item.oddsType == "Card 9") { this.card9Book = item.book }
          else if (item.oddsType == "Card 10") { this.card10Book = item.book }
          else if (item.oddsType == "Card J") { this.cardJBook = item.book }
          else if (item.oddsType == "Card Q") { this.cardQBook = item.book }
          else if (item.oddsType == "Card K") { this.cardKBook = item.book }
        });
        //  console.log(this.highBook);
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
  clearBooks() {
    this.lowBook = []; this.highBook = []; this.evenBook = []; this.oddBook = []; this.redBook = []; this.blackBook = []; this.card1Book = []; this.card2Book = [];
    this.card3Book = []; this.card4Book = []; this.card5Book = []; this.card6Book = []; this.card7Book = []; this.card8Book = []; this.card9Book = []; this.card10Book = []
    this.cardJBook = []; this.cardQBook = []; this.cardKBook = []; this.line1Book = []; this.line2Book = []; this.line3Book = []; this.line4Book = [];
  }
  trackByMid(index: number, item: any) {
    return item.mid;
  }
  twoDecimal(num: number) {
    if (num) return num.toFixed(2);
    return 0.00;
  }
  gameTabClicked() {
    this.bettab = false;
    this.gametab = true;
  }
  betTabClicked() {
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
