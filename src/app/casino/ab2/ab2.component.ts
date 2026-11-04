import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { MatchService } from '../../services/match.service';
import { SocketService } from '../../services/socket.service';
import { ToastrService } from 'ngx-toastr';
import { UserauthService } from '../../services/userauth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';
declare const $: any;

@Component({
  selector: 'app-ab2',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './ab2.component.html',
  styleUrl: './ab2.component.css'
})
export class Ab2Component {

  gametab = true; bettab = false;
  isSticky = false; sidebarTopOffset = 124; setButtonTab = 'casino'; userButtons: any = {};
  placebetButton: any = []; loader = false; placeLoader = false;
  safeURL: any; mybets: any = []; mybooks: any = []; cvideoURL: any;
  saBook: any = []; firstBetABook: any = []; secondBetABook: any = []; sbBook: any = []; firstBetBBook: any = []; secondBetBBook: any = [];
  jokerOddEvenBook: any = []; jokerSuitsBook: any = []; jokerCardsBook: any = [];
  data: any; results: any; roundId = ""; autotime = 0; clock: any; beforeNum = 0; min = 0; max = 0;
  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false;

  c1 = ""; cards = ""; firstcarda = ""; firstcardb = ""; baharCards: any = []; andarCards: any = [];
  sa: any = {}; afirstbet: any = {}; asecondbet: any = {}; sb: any = {}; bfirstbet: any = {}; bsecondbet: any = {}; jokerA: any = {}; joker2: any = {}; joker3: any = {};
  joker4: any = {}; joker5: any = {}; joker6: any = {}; joker7: any = {}; joker8: any = {}; joker9: any = {}; joker10: any = {}; jokerJ: any = {}; jokerQ: any = {}; jokerK: any = {};
  jokerSpade: any = {}; jokerClub: any = {}; jokerHeart: any = {}; jokerDiamond: any = {}; jokerOdd: any = {}; jokerEven: any = {};

  betFor = ""; odds = 0; betType = ""; stake: any = null; profit = 0; loss = 0; showbetform = false; oddsType = ""; sid = 0;
  temprId = ""; tempWin = ""; tempc1 = ""; tempfirstA = ""; tempfirstB = ""; tempAndar: any = []; tempBahar: any = [];
  constructor(
    private _sanitizer: DomSanitizer,
    private match_service: MatchService,
    private socket_service: SocketService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private userauth: UserauthService
  ) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = (window.pageYOffset >= this.sidebarTopOffset);
    //console.log(this.sidebarTopOffset)
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo()
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3043')
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'abj').subscribe((data: any) => {
      this.data = data.data;
      this.min = this.data.t1[0].min;
      this.max = this.data.t1[0].max;
      if (this.roundId!=data['data']['t1'][0]['mid']) {
        this.andarCards = []; this.baharCards = [];
        this.clearBooks(); this.mybets=[];
      }
      this.roundId = this.data.t1[0].mid;
      this.autotime = this.data.t1[0].autotime;
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      this.cards = this.data.t1[0].cards;
      const cardsArray = this.cards.split(',');
      this.c1 = cardsArray[0];
      this.firstcardb = cardsArray[1];
      this.firstcarda = cardsArray[2];
      let andarTemp: any = []; let baharTemp: any = [];
      cardsArray.forEach((item: string, index: number) => {
        if (index >= 3 && item != '1') {
          if (index % 2 == 0) {
            andarTemp.push(item)
          } else {
            baharTemp.push(item)
          }
        }
      });
      this.andarCards = andarTemp; this.baharCards = baharTemp//.reverse();
      const $andarslider = $('.andarslider');
      if (!$andarslider.hasClass('slick-initialized')) {
        this.andarsliderInitialize();
      }
      this.andarCards.map((img: any) => this.addandarSlickItem(img))
      const $baharslider = $('.baharslider');
      if (!$baharslider.hasClass('slick-initialized')) {
        this.baharsliderInitialize();
      }
      this.baharCards.map((img: any) => this.addbaharSlickItem(img))

      this.sa = this.data.t2[0]; this.afirstbet = this.data.t2[1]; this.asecondbet = this.data.t2[2]; this.sb = this.data.t2[3];
      this.bfirstbet = this.data.t2[4]; this.bsecondbet = this.data.t2[5]; this.jokerA = this.data.t2[6]; this.joker2 = this.data.t2[7];
      this.joker3 = this.data.t2[8]; this.joker4 = this.data.t2[9]; this.joker5 = this.data.t2[10]; this.joker6 = this.data.t2[11];
      this.joker7 = this.data.t2[12]; this.joker8 = this.data.t2[13]; this.joker9 = this.data.t2[14]; this.joker10 = this.data.t2[15];
      this.jokerJ = this.data.t2[16]; this.jokerQ = this.data.t2[17]; this.jokerK = this.data.t2[18]; this.jokerSpade = this.data.t2[19];
      this.jokerClub = this.data.t2[20]; this.jokerHeart = this.data.t2[21]; this.jokerDiamond = this.data.t2[22];
      this.jokerOdd = this.data.t2[23]; this.jokerEven = this.data.t2[24];
    })
    this.socket_service.casinolast10('Last10', 'abj').subscribe((resultdata: any) => {
      this.results = resultdata['data'];
      //this.results = this.results.reverse();
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
    this.socket_service.leavaAllRooms();
  }

  getCvideoURL() {
    this.match_service.getCVideo('abj').subscribe({
      next: (res: any) => {
        //console.log(res)
        const url = res.url;
        this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(url)
      }, error: (e) => {
        console.log(e)
      }
    })
  }

  andarsliderInitialize() {
    $('.andarslider').slick({
      slidesToShow: 3,
      slidesToScroll: 3,
      infinite: false,
    });
    for (const img of this.andarCards) {
      this.addandarSlickItem(img);
    }
  }

  baharsliderInitialize() {
    $('.baharslider').slick({
      slidesToShow: 3,
      slidesToScroll: 3,
      infinite: false,
    });
    for (const img of this.baharCards) {
      this.addbaharSlickItem(img);
    }
  }

  addandarSlickItem(img: any) {
    if (!img) return;
    const $andarslider = $('.andarslider');
    if ($andarslider.hasClass('slick-initialized')) {
      const imageExists = $andarslider.find(`img[src="/img/cards/${img}.png"]`).length > 0;
      if (!imageExists) {
        $andarslider.slick('slickAdd', `<div><img src="/img/cards/${img}.png">`);
        $andarslider.slick('slickGoTo', this.andarCards.length - 1);
      }
    }
  }


  addbaharSlickItem(img: any) {
    if (!img) return;
    const $baharslider = $('.baharslider');
    if ($baharslider.hasClass('slick-initialized')) {
      const imageExists = $baharslider.find(`img[src="/img/cards/${img}.png"]`).length > 0;
      if (!imageExists) {
        $baharslider.slick('slickAdd', `<div><img src="/img/cards/${img}.png">`);
        $baharslider.slick('slickGoTo', this.baharCards.length - 1);
      }
    }
  }
  openBetForm(content: any, betfor: string, odds: any, type: string, sid: number, oddstype: string, min:any, max:any) {
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
    if (window.innerWidth < 1100) {
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
    this.modalService.open(content, { size: 'lg' });
  }
  openResult(content: any, rid: any) {
    this.loader = true;
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      console.log(winnerdata)
      this.loader = false;
      this.modalService.open(content, { size: 'xl' })
      this.temprId = rid;
      let cards = winnerdata.data[0].cards;
      this.tempWin = winnerdata.data[0].win;
      const cardsArray = cards.split(',');
      this.tempc1 = cardsArray[0];
      this.tempfirstB = cardsArray[1];
      this.tempfirstA = cardsArray[2];
      let andarTemp: any = []; let baharTemp: any = [];
      cardsArray.forEach((item: string, index: number) => {
        if (index >= 3 && item != '1') {
          if (index % 2 == 0) {
            andarTemp.push(item)
          } else {
            baharTemp.push(item)
          }
        }
      });
      //this.tempAndar = andarTemp.reverse(); this.tempBahar = baharTemp.reverse();
      this.tempAndar = andarTemp; this.tempBahar = baharTemp;
      $('.andarresult').slick({
        slidesToShow: 12,
        slidesToScroll: 12,
        infinite: false,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 8,
              slidesToScroll: 8
            }
          },
          {
            breakpoint: 990,
            settings: {
              slidesToShow: 5,
              slidesToScroll: 5
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 3
            }
          }
        ]
      });
      for (const img of this.tempAndar) {
        $('.andarresult').slick('slickAdd', `<div><img src="/img/cards/${img}.png">`);
      }
      $('.baharresult').slick({
        slidesToShow: 12,
        slidesToScroll: 12,
        infinite: false,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 8,
              slidesToScroll: 8
            }
          },
          {
            breakpoint: 990,
            settings: {
              slidesToShow: 5,
              slidesToScroll: 5
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 3
            }
          }
        ]
      });
      for (const img of this.tempBahar) {
        $('.baharresult').slick('slickAdd', `<div><img src="/img/cards/${img}.png">`);
      }
    })
  }

  submitbet() {
    this.placeLoader = true;
    var dt = { roundid: this.roundId, matchcode: 'abj', matchname: 'Andar Bahar 2', betfor: this.betFor, bettype: 'back', oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid };
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
    this.userauth.getCasinoOpenBet("abj", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          if (item.oddsType == "SA") { this.saBook = item.book }
          else if (item.oddsType == "1st Bet A") { this.firstBetABook = item.book }
          else if (item.oddsType == "2nd Bet A") { this.secondBetABook = item.book }
          else if (item.oddsType == "SB") { this.sbBook = item.book }
          else if (item.oddsType == "1st Bet B") { this.firstBetBBook = item.book }
          else if (item.oddsType == "2nd Bet B") { this.secondBetBBook = item.book }
          else if (item.oddsType == "JokerOddEven") { this.jokerOddEvenBook = item.book }
          else if (item.oddsType == "JokerSuits") { this.jokerSuitsBook = item.book }
          else if (item.oddsType == "JokerCards") { this.jokerCardsBook = item.book }
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
    $('.andarslider').slick('unslick');
    $('.andarslider').empty();
    $('.baharslider').slick('unslick');
    $('.baharslider').empty();
    this.saBook = []; this.firstBetABook = []; this.secondBetABook = []; this.sbBook = []; this.firstBetBBook = []; this.secondBetBBook = [];
    this.jokerOddEvenBook = []; this.jokerSuitsBook = []; this.jokerCardsBook = [];
  }
  trackByFunc(index: any, item: any) {
    return item.mid;
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
  removeDecimal(num: any): string {
    if (isNaN(Number(num))) {
      return "Invalid input";
    }
    return parseFloat(num).toString();
  }
}
