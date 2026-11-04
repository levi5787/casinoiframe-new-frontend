import { Component, HostListener, OnInit, inject, NgModule, } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { MatchService } from '../../services/match.service';
import { SocketService } from '../../services/socket.service';
import { UserauthService } from '../../services/userauth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';import { ShortNumberPipe } from '../../pipes/short-number.pipe';
;
declare var FlipDown: any
@Component({
  selector: 'app-war',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './war.component.html',
  styleUrl: './war.component.css'
})
export class WarComponent implements OnInit {
  gametab = true; bettab = false; loader = false; placeLoader = false;
  isSticky = false; sidebarTopOffset = 124; placebetButton: any = []; setButtonTab = 'casino'; userButtons: any = {}; cvideoURL: any;
  safeURL: any; mybets: any = []; mybooks: any = []; activeRange = ""; warPlayerTab='p1';
  winner1Book: any = []; winner2Book: any = []; winner3Book: any = []; winner4Book: any = []; winner5Book: any = []; winner6Book: any = [];
  redblack1Book: any = []; redblack2Book: any = []; redblack3Book: any = []; redblack4Book: any = []; redblack5Book: any = []; redblack6Book: any = [];
  oddeven1Book: any = []; oddeven2Book: any = []; oddeven3Book: any = []; oddeven4Book: any = []; oddeven5Book: any = []; oddeven6Book: any = [];
  suits1Book: any = []; suits2Book: any = []; suits3Book: any = []; suits4Book: any = []; suits5Book: any = []; suits6Book: any = [];
  data: any; results: any = []; roundId = ""; autotime = 0; clock: any; beforeNum = 0;
  c1 = ""; c2 = ""; c3 = ""; c4 = ""; c5 = ""; c6 = ""; c7 = "";
  winner1 = ""; winner2 = ""; winner3 = ""; winner4 = ""; winner5 = ""; winner6 = "";
  black1 = ""; black2 = ""; black3 = ""; black4 = ""; black5 = ""; black6 = "";
  red1 = ""; red2 = ""; red3 = ""; red4 = ""; red5 = ""; red6 = "";
  odd1 = ""; odd2 = ""; odd3 = ""; odd4 = ""; odd5 = ""; odd6 = "";
  even1 = ""; even2 = ""; even3 = ""; even4 = ""; even5 = ""; even6 = "";
  spade1 = ""; spade2 = ""; spade3 = ""; spade4 = ""; spade5 = ""; spade6 = "";
  club1 = ""; club2 = ""; club3 = ""; club4 = ""; club5 = ""; club6 = "";
  heart1 = ""; heart2 = ""; heart3 = ""; heart4 = ""; heart5 = ""; heart6 = "";
  diamond1 = ""; diamond2 = ""; diamond3 = ""; diamond4 = ""; diamond5 = ""; diamond6 = "";

  min:any; max:any; winnermin = 0; winnermax = 0; blackmin = 0; blackmax = 0; redmin = 0; redmax = 0;
  oddmin = 0; oddmax = 0; evenmin = 0; evenmax = 0; spademin = 0; spademax = 0;
  clubmin = 0; clubmax = 0; heartmin = 0; heartmax = 0; diamondmin = 0; diamondmax = 0;

  winner1gstatus = ""; winner2gstatus = ""; winner3gstatus = ""; winner4gstatus = ""; winner5gstatus = ""; winner6gstatus = "";
  black1gstatus = ""; black2gstatus = ""; black3gstatus = ""; black4gstatus = ""; black5gstatus = ""; black6gstatus = "";
  red1gstatus = ""; red2gstatus = ""; red3gstatus = ""; red4gstatus = ""; red5gstatus = ""; red6gstatus = "";
  odd1gstatus = ""; odd2gstatus = ""; odd3gstatus = ""; odd4gstatus = ""; odd5gstatus = ""; odd6gstatus = "";
  even1gstatus = ""; even2gstatus = ""; even3gstatus = ""; even4gstatus = ""; even5gstatus = ""; even6gstatus = "";
  spade1gstatus = ""; spade2gstatus = ""; spade3gstatus = ""; spade4gstatus = ""; spade5gstatus = ""; spade6gstatus = "";
  club1gstatus = ""; club2gstatus = ""; club3gstatus = ""; club4gstatus = ""; club5gstatus = ""; club6gstatus = "";
  heart1gstatus = ""; heart2gstatus = ""; heart3gstatus = ""; heart4gstatus = ""; heart5gstatus = ""; heart6gstatus = "";
  diamond1gstatus = ""; diamond2gstatus = ""; diamond3gstatus = ""; diamond4gstatus = ""; diamond5gstatus = ""; diamond6gstatus = "";

  showbetForm = false; odds = 0; betFor = ""; betType = ""; stake: any = null; profit = 0; loss = 0; oddsType = ""; sid = 0;
  temprId = ""; tempCards: any = []; tempwinner: any = [];
  is1winner = false; is2winner = false; is3winner = false; is4winner = false; is5winner = false; is6winner = false;
  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false;

  constructor(
    private _sanitizer: DomSanitizer,
    private match_service: MatchService,
    private socket_service: SocketService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private userauth: UserauthService
  ) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = (window.pageYOffset >= this.sidebarTopOffset);
    //console.log(this.sidebarTopOffset)
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo()
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3038')
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'war').subscribe((data: any) => {
      this.data = data['data']
      //console.log(this.data);
      //code for flipclock
      this.autotime = parseInt(data['data']['t1'][0]['autotime']);
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end
      if (this.roundId != data['data']['t1'][0]['mid']) {
        this.clearBooks(); this.mybets=[];
      }
      this.roundId = data['data']['t1'][0]['mid'];
      this.c1 = "/img/cards/" + data['data']['t1'][0]['C1'] + ".png";
      this.c2 = "/img/cards/" + data['data']['t1'][0]['C2'] + ".png";
      this.c3 = "/img/cards/" + data['data']['t1'][0]['C3'] + ".png";
      this.c4 = "/img/cards/" + data['data']['t1'][0]['C4'] + ".png";
      this.c5 = "/img/cards/" + data['data']['t1'][0]['C5'] + ".png";
      this.c6 = "/img/cards/" + data['data']['t1'][0]['C6'] + ".png";
      this.c7 = "/img/cards/" + data['data']['t1'][0]['C7'] + ".png";
      //winner odds all
      this.winner1 = data['data']['t2'][0]['b1']; this.winner2 = data['data']['t2'][9]['b1'];
      this.winner3 = data['data']['t2'][18]['b1']; this.winner4 = data['data']['t2'][27]['b1'];
      this.winner5 = data['data']['t2'][36]['b1']; this.winner6 = data['data']['t2'][45]['b1'];
      //black odds all
      this.black1 = data['data']['t2'][1]['b1']; this.black2 = data['data']['t2'][10]['b1'];
      this.black3 = data['data']['t2'][19]['b1']; this.black4 = data['data']['t2'][28]['b1'];
      this.black5 = data['data']['t2'][37]['b1']; this.black6 = data['data']['t2'][46]['b1'];
      //red odds all
      this.red1 = data['data']['t2'][2]['b1']; this.red2 = data['data']['t2'][11]['b1'];
      this.red3 = data['data']['t2'][20]['b1']; this.red4 = data['data']['t2'][29]['b1'];
      this.red5 = data['data']['t2'][38]['b1']; this.red6 = data['data']['t2'][47]['b1'];
      //odd odds all
      this.odd1 = data['data']['t2'][3]['b1']; this.odd2 = data['data']['t2'][12]['b1'];
      this.odd3 = data['data']['t2'][21]['b1']; this.odd4 = data['data']['t2'][30]['b1'];
      this.odd5 = data['data']['t2'][39]['b1']; this.odd6 = data['data']['t2'][48]['b1'];
      //even odds all
      this.even1 = data['data']['t2'][4]['b1']; this.even2 = data['data']['t2'][13]['b1'];
      this.even3 = data['data']['t2'][22]['b1']; this.even4 = data['data']['t2'][31]['b1'];
      this.even5 = data['data']['t2'][40]['b1']; this.even6 = data['data']['t2'][49]['b1'];
      //spade odds all
      this.spade1 = data['data']['t2'][5]['b1']; this.spade2 = data['data']['t2'][14]['b1'];
      this.spade3 = data['data']['t2'][23]['b1']; this.spade4 = data['data']['t2'][32]['b1'];
      this.spade5 = data['data']['t2'][41]['b1']; this.spade6 = data['data']['t2'][0]['b1'];
      //club odds all
      this.club1 = data['data']['t2'][6]['b1']; this.club2 = data['data']['t2'][15]['b1'];
      this.club3 = data['data']['t2'][24]['b1']; this.club4 = data['data']['t2'][33]['b1'];
      this.club5 = data['data']['t2'][42]['b1']; this.club6 = data['data']['t2'][50]['b1'];
      //heart odds all
      this.heart1 = data['data']['t2'][7]['b1']; this.heart2 = data['data']['t2'][16]['b1'];
      this.heart3 = data['data']['t2'][25]['b1']; this.heart4 = data['data']['t2'][34]['b1'];
      this.heart5 = data['data']['t2'][43]['b1']; this.heart6 = data['data']['t2'][51]['b1'];
      //diamond odds all
      this.diamond1 = data['data']['t2'][8]['b1']; this.diamond2 = data['data']['t2'][17]['b1'];
      this.diamond3 = data['data']['t2'][26]['b1']; this.diamond4 = data['data']['t2'][35]['b1'];
      this.diamond5 = data['data']['t2'][44]['b1']; this.diamond6 = data['data']['t2'][52]['b1'];

      //all min max
      this.winnermin = data['data']['t2'][0]['min']; this.winnermax = data['data']['t2'][0]['max'];
      this.blackmin = data['data']['t2'][1]['min']; this.blackmax = data['data']['t2'][1]['max'];
      this.redmin = data['data']['t2'][2]['min']; this.redmax = data['data']['t2'][2]['max'];
      this.oddmin = data['data']['t2'][3]['min']; this.oddmax = data['data']['t2'][3]['max'];
      this.evenmin = data['data']['t2'][4]['min']; this.evenmax = data['data']['t2'][4]['max'];
      this.spademin = data['data']['t2'][5]['min']; this.spademax = data['data']['t2'][5]['max'];
      this.clubmin = data['data']['t2'][6]['min']; this.clubmax = data['data']['t2'][6]['max'];
      this.heartmin = data['data']['t2'][7]['min']; this.heartmax = data['data']['t2'][7]['max'];
      this.diamondmin = data['data']['t2'][8]['min']; this.diamondmax = data['data']['t2'][8]['max'];

      //winner gstatus all
      this.winner1gstatus = data['data']['t2'][0]['gstatus']; this.winner2gstatus = data['data']['t2'][9]['gstatus'];
      this.winner3gstatus = data['data']['t2'][18]['gstatus']; this.winner4gstatus = data['data']['t2'][27]['gstatus'];
      this.winner5gstatus = data['data']['t2'][36]['gstatus']; this.winner6gstatus = data['data']['t2'][45]['gstatus'];
      //black gstatus all
      this.black1gstatus = data['data']['t2'][1]['gstatus']; this.black2gstatus = data['data']['t2'][10]['gstatus'];
      this.black3gstatus = data['data']['t2'][19]['gstatus']; this.black4gstatus = data['data']['t2'][28]['gstatus'];
      this.black5gstatus = data['data']['t2'][37]['gstatus']; this.black6gstatus = data['data']['t2'][46]['gstatus'];
      //red gstatus all
      this.red1gstatus = data['data']['t2'][2]['gstatus']; this.red2gstatus = data['data']['t2'][11]['gstatus'];
      this.red3gstatus = data['data']['t2'][20]['gstatus']; this.red4gstatus = data['data']['t2'][29]['gstatus'];
      this.red5gstatus = data['data']['t2'][38]['gstatus']; this.red6gstatus = data['data']['t2'][47]['gstatus'];
      //odd gstatus all
      this.odd1gstatus = data['data']['t2'][3]['gstatus']; this.odd2gstatus = data['data']['t2'][12]['gstatus'];
      this.odd3gstatus = data['data']['t2'][21]['gstatus']; this.odd4gstatus = data['data']['t2'][30]['gstatus'];
      this.odd5gstatus = data['data']['t2'][39]['gstatus']; this.odd6gstatus = data['data']['t2'][48]['gstatus'];
      //even gstatus all
      this.even1gstatus = data['data']['t2'][4]['gstatus']; this.even2gstatus = data['data']['t2'][13]['gstatus'];
      this.even3gstatus = data['data']['t2'][22]['gstatus']; this.even4gstatus = data['data']['t2'][31]['gstatus'];
      this.even5gstatus = data['data']['t2'][40]['gstatus']; this.even6gstatus = data['data']['t2'][49]['gstatus'];
      //spade gstatus all
      this.spade1gstatus = data['data']['t2'][5]['gstatus']; this.spade2gstatus = data['data']['t2'][14]['gstatus'];
      this.spade3gstatus = data['data']['t2'][23]['gstatus']; this.spade4gstatus = data['data']['t2'][32]['gstatus'];
      this.spade5gstatus = data['data']['t2'][41]['gstatus']; this.spade6gstatus = data['data']['t2'][0]['gstatus'];
      //club gstatus all
      this.club1gstatus = data['data']['t2'][6]['gstatus']; this.club2gstatus = data['data']['t2'][15]['gstatus'];
      this.club3gstatus = data['data']['t2'][24]['gstatus']; this.club4gstatus = data['data']['t2'][33]['gstatus'];
      this.club5gstatus = data['data']['t2'][42]['gstatus']; this.club6gstatus = data['data']['t2'][50]['gstatus'];
      //heart gstatus all
      this.heart1gstatus = data['data']['t2'][7]['gstatus']; this.heart2gstatus = data['data']['t2'][16]['gstatus'];
      this.heart3gstatus = data['data']['t2'][25]['gstatus']; this.heart4gstatus = data['data']['t2'][34]['gstatus'];
      this.heart5gstatus = data['data']['t2'][43]['gstatus']; this.heart6gstatus = data['data']['t2'][51]['gstatus'];
      //diamond gstatus all
      this.diamond1gstatus = data['data']['t2'][8]['gstatus']; this.diamond2gstatus = data['data']['t2'][17]['gstatus'];
      this.diamond3gstatus = data['data']['t2'][26]['gstatus']; this.diamond4gstatus = data['data']['t2'][35]['gstatus'];
      this.diamond5gstatus = data['data']['t2'][44]['gstatus']; this.diamond6gstatus = data['data']['t2'][52]['gstatus'];

    })
    this.socket_service.casinolast10('Last10', 'war').subscribe((resultdata: any) => {
      this.results = resultdata['data'];
      //console.log(this.results)
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
    this.match_service.getCVideo('war').subscribe({
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
  openBetForm(content: any, betfor: string, odds: any, type: string, sid: number, oddstype: string, min:any, max:any) {
    this.showbetForm = true
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
    if (window.innerWidth < 768) {
      this.modalService.open(content)
    }
  }
  hideBetPlace() {
    this.showbetForm = false
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

  }
  open(content: any) {
    this.modalService.open(content, { size: 'lg' });
  }
  openResult(content: any, rid: any) {
    this.is1winner = false; this.is2winner = false; this.is3winner = false; this.is4winner = false; this.is5winner = false; this.is6winner = false;
    this.loader = true;
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      this.loader = false;
      this.modalService.open(content, { size: 'xl' })
      //console.log(winnerdata);
      this.temprId = rid;
      this.tempCards = winnerdata['data'][0]['cards'].split(',')
      this.tempwinner = winnerdata['data'][0]['sid'].split(',')
      if (this.tempwinner.includes('1')) {
        this.is1winner = true;
      }
      if (this.tempwinner.includes('2')) {
        this.is2winner = true;
      }
      if (this.tempwinner.includes('3')) {
        this.is3winner = true;
      }
      if (this.tempwinner.includes('4')) {
        this.is4winner = true;
      }
      if (this.tempwinner.includes('5')) {
        this.is5winner = true;
      }
      if (this.tempwinner.includes('6')) {
        this.is6winner = true;
      }
    })
  }
  submitbet() {
    this.placeLoader = true;
    var dt = { roundid: this.roundId, matchcode: 'war', matchname: 'War', betfor: this.betFor, bettype: 'back', oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid };
    this.userauth.placeCasinoBet(dt).subscribe({
      next: (res: any) => {
        this.placeLoader = false;
        this.showbetForm = false;
        this.displayToast(res.message, res.status);
        this.getopenbet(); this.userauth.getUserBalance();
      },
      error: (e) => {
        this.placeLoader = false;
        this.showbetForm = false;
        this.displayToast(e.error.message, "failed")
      }
    })
  }
  getopenbet() {
    this.userauth.getCasinoOpenBet("war", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          item.oddsType == "Winner1" ? this.winner1Book = item.book : item.oddsType == "Winner2" ? this.winner2Book = item.book
            : item.oddsType == "Winner3" ? this.winner3Book = item.book : item.oddsType == "Winner4" ? this.winner4Book = item.book
              : item.oddsType == "Winner5" ? this.winner5Book = item.book : item.oddsType == "Winner6" ? this.winner6Book = item.book
                : item.oddsType == "OddEven1" ? this.oddeven1Book = item.book : item.oddsType == "OddEven2" ? this.oddeven2Book = item.book
                  : item.oddsType == "OddEven3" ? this.oddeven3Book = item.book : item.oddsType == "OddEven4" ? this.oddeven4Book = item.book
                    : item.oddsType == "OddEven5" ? this.oddeven5Book = item.book : item.oddsType == "OddEven6" ? this.oddeven6Book = item.book
                      : item.oddsType == "RedBlack1" ? this.redblack1Book = item.book : item.oddsType == "RedBlack2" ? this.redblack2Book = item.book
                        : item.oddsType == "RedBlack3" ? this.redblack3Book = item.book : item.oddsType == "RedBlack4" ? this.redblack4Book = item.book
                          : item.oddsType == "RedBlack5" ? this.redblack5Book = item.book : item.oddsType == "RedBlack6" ? this.redblack6Book = item.book
                            : item.oddsType == "Suits1" ? this.suits1Book = item.book : item.oddsType == "Suits2" ? this.suits2Book = item.book
                              : item.oddsType == "Suits3" ? this.suits3Book = item.book : item.oddsType == "Suits4" ? this.suits4Book = item.book
                                : item.oddsType == "Suits5" ? this.suits5Book = item.book : item.oddsType == "Suits6" ? this.suits6Book = item.book : null

        });
        //console.log(this.mybooks);
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
    this.winner1Book = []; this.winner2Book = []; this.winner3Book = []; this.winner4Book = []; this.winner5Book = []; this.winner6Book = [];
    this.redblack1Book = []; this.redblack2Book = []; this.redblack3Book = []; this.redblack4Book = []; this.redblack5Book = []; this.redblack6Book = [];
    this.oddeven1Book = []; this.oddeven2Book = []; this.oddeven3Book = []; this.oddeven4Book = []; this.oddeven5Book = []; this.oddeven6Book = [];
    this.suits1Book = []; this.suits2Book = []; this.suits3Book = []; this.suits4Book = []; this.suits5Book = []; this.suits6Book = [];
  }
  rangeClick(name: any) {
    if (this.activeRange == name) {
      this.activeRange = "";
    } else {
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
  gameTabClicked() {
    this.bettab = false;
    this.gametab = true;
  }
  betTabClicked() {
    this.bettab = true;
    this.gametab = false;
  }
  clickWarTab(name:any){
    this.warPlayerTab=name;
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
