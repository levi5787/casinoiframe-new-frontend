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
  selector: 'app-queen',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './queen.component.html',
  styleUrl: './queen.component.css'
})
export class QueenComponent implements OnInit {
  gametab=true; bettab=false;loader=false; placeLoader=false; userButtons: any = {}; setButtonTab='casino';
  isSticky = false; sidebarTopOffset = 124; placebetButton:any=[]; cvideoURL:any;
  data:any;safeURL: any; autotime = 0; clock: any; beforeNum = 0; mybets: any = []; mybooks: any = []; winnerBook: any = [];
  roundId = ''; remark = ""; min = 0; max = 0; desc: any = [];
  cards = ""; total0c1 = ""; total0c2 = ""; total0c3 = ""; total1c1 = ""; total1c2 = ""; total1c3 = "";
  total2c1 = ""; total2c2 = ""; total2c3 = ""; total3c1 = ""; total3c2 = ""; total3c3 = "";
  total0 = 0; total1 = 0; total2 = 0; total3 = 0;

  total0back = ""; total0lay = ""; total0backSize = ""; total0laySize = "";
  total1back = ""; total1lay = ""; total1backSize = ""; total1laySize = "";
  total2back = ""; total2lay = ""; total2backSize = ""; total2laySize = "";
  total3back = ""; total3lay = ""; total3backSize = ""; total3laySize = "";
  total0gstatus = ""; total1gstatus = ""; total2gstatus = ""; total3gstatus = "";

  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false;
  showbetform = false; betFor = ""; betType = ""; odds = ""; stake: any = null; profit = 0; loss = 0; oddsType = ""; sid = 0;
  results: any = []
  temprId = ""; tempWinner = ""; tempCards: any = []; tempAdesc = ""; tempBdesc = ""; winnerPlayer = "";

  constructor(
    private _sanitizer: DomSanitizer,
    private match_service: MatchService,
    private socket_service: SocketService,
    private modalService: NgbModal,
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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL+'?id=3037')
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'queen').subscribe((data: any) => {
      this.data = data['data'];
      //code for flipclock
      this.autotime = parseInt(data['data']['t1'][0]['autotime']);
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock end
      this.desc = data['data']['t1'][0]['desc'];
      this.cards = this.desc.split(",");
      this.total0c1 = "/img/cards/" + this.cards[0] + ".png";
      this.total0c2 = "/img/cards/" + this.cards[4] + ".png";
      this.total0c3 = "/img/cards/" + this.cards[8] + ".png";
      this.total1c1 = "/img/cards/" + this.cards[1] + ".png";
      this.total1c2 = "/img/cards/" + this.cards[5] + ".png";
      this.total1c3 = "/img/cards/" + this.cards[9] + ".png";
      this.total2c1 = "/img/cards/" + this.cards[2] + ".png";
      this.total2c2 = "/img/cards/" + this.cards[6] + ".png";
      this.total2c3 = "/img/cards/" + this.cards[10] + ".png";
      this.total3c1 = "/img/cards/" + this.cards[3] + ".png";
      this.total3c2 = "/img/cards/" + this.cards[7] + ".png";
      this.total3c3 = "/img/cards/" + this.cards[11] + ".png";

      if (this.cards[0] != '1') {
        this.total0 = parseInt(this.getNumberValue(this.getcardvalue(this.cards[0]))) + 0;
        if (this.cards[4] != '1') {
          this.total0 = this.total0 + parseInt(this.getNumberValue(this.getcardvalue(this.cards[4])))
        } if (this.cards[8] != '1') {
          this.total0 = this.total0 + parseInt(this.getNumberValue(this.getcardvalue(this.cards[8])))
        }
      } else {
        this.total0 = 0;
      }
      if (this.cards[1] != '1') {
        this.total1 = parseInt(this.getNumberValue(this.getcardvalue(this.cards[1]))) + 1;
        if (this.cards[5] != '1') {
          this.total1 = this.total1 + parseInt(this.getNumberValue(this.getcardvalue(this.cards[5])))
        } if (this.cards[9] != '1') {
          this.total1 = this.total1 + parseInt(this.getNumberValue(this.getcardvalue(this.cards[9])))
        }
      } else {
        this.total1 = 0;
      }
      if (this.cards[2] != '1') {
        this.total2 = parseInt(this.getNumberValue(this.getcardvalue(this.cards[2]))) + 2;
        if (this.cards[6] != '1') {
          this.total2 = this.total2 + parseInt(this.getNumberValue(this.getcardvalue(this.cards[6])))
        } if (this.cards[10] != '1') {
          this.total2 = this.total2 + parseInt(this.getNumberValue(this.getcardvalue(this.cards[10])))
        }
      } else {
        this.total2 = 0;
      }
      if (this.cards[3] != '1') {
        this.total3 = parseInt(this.getNumberValue(this.getcardvalue(this.cards[3]))) + 3;
        if (this.cards[7] != '1') {
          this.total3 = this.total3 + parseInt(this.getNumberValue(this.getcardvalue(this.cards[7])))
        } if (this.cards[11] != '1') {
          this.total3 = this.total3 + parseInt(this.getNumberValue(this.getcardvalue(this.cards[11])))
        }
      } else {
        this.total3 = 0;
      }
      if(this.roundId!=data['data']['t1'][0]['mid']){
        this.winnerBook=[]; this.mybets=[];
      }
      this.roundId = data['data']['t1'][0]['mid'];
      this.min = data['data']['t1'][0]['min'];
      this.max = data['data']['t1'][0]['max'];
      this.remark = data['data']['t1'][0]['ramark'];
      this.total0back = data['data']['t2']['0']['b1']; this.total0backSize = data['data']['t2']['0']['bs1'];
      this.total0lay = data['data']['t2']['0']['l1']; this.total0laySize = data['data']['t2']['0']['ls1'];
      this.total1back = data['data']['t2']['1']['b1']; this.total1backSize = data['data']['t2']['1']['bs1'];
      this.total1lay = data['data']['t2']['1']['l1']; this.total1laySize = data['data']['t2']['1']['ls1'];
      this.total2back = data['data']['t2']['2']['b1']; this.total2backSize = data['data']['t2']['2']['bs1'];
      this.total2lay = data['data']['t2']['2']['l1']; this.total2laySize = data['data']['t2']['2']['ls1'];
      this.total3back = data['data']['t2']['3']['b1']; this.total3backSize = data['data']['t2']['3']['bs1'];
      this.total3lay = data['data']['t2']['3']['l1']; this.total3laySize = data['data']['t2']['3']['ls1'];
      this.total0gstatus = data['data']['t2']['0']['gstatus']; this.total1gstatus = data['data']['t2']['1']['gstatus'];
      this.total2gstatus = data['data']['t2']['2']['gstatus']; this.total3gstatus = data['data']['t2']['3']['gstatus'];
    })
    this.socket_service.casinolast10('Last10', 'queen').subscribe((resultdata: any) => {
      this.results = resultdata['data'];
      // this.results = this.results.reverse();
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
    this.match_service.getCVideo('queen').subscribe({
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
  openBetForm(content:any,betfor: string, odds: any, type: string, sid: number, oddstype: string,min:any,max:any) {
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
  submitbet() {
    this.placeLoader=true;
    var dt = { roundid: this.roundId, matchcode: 'queen', matchname: 'Queen', betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid };
    this.userauth.placeCasinoBet(dt).subscribe({
      next: (res: any) => {
        this.placeLoader=false;
        this.showbetform = false;
        this.displayToast(res.message,res.status);
        this.getopenbet();this.userauth.getUserBalance();
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
    this.userauth.getCasinoOpenBet("queen", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          if (item.oddsType == "Winner") { this.winnerBook = item.book }
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
  openResult(content: any, rid: any) {
    this.placeLoader=true;
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      this.placeLoader=false;
      this.modalService.open(content, { size: 'xl' })
      //console.log(winnerdata)
      this.temprId = rid;
      this.tempWinner = winnerdata['data'][0]['win'];
      this.tempCards = winnerdata['data'][0]['cards']
      this.tempCards = this.tempCards.split(",");
      this.tempAdesc = winnerdata['data'][0]['desc'].split('##')[1]
      this.tempBdesc = winnerdata['data'][0]['desc'].split('##')[2]
      if (this.tempWinner == '1') {
        this.winnerPlayer = 'Total 0'
      } else if (this.tempWinner == '2') {
        this.winnerPlayer = 'Total 1'
      } else if (this.tempWinner == '3') {
        this.winnerPlayer = 'Total 2'
      } else if (this.tempWinner == '4') {
        this.winnerPlayer = 'Total 3'
      }
      // console.log(winnerdata)
    })
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
