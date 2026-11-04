import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { MatchService } from '../../services/match.service';
import { SocketService } from '../../services/socket.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserauthService } from '../../services/userauth.service';
import { CommonModule } from '@angular/common';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';
declare const $: any;

@Component({
  selector: 'app-ab20',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './ab20.component.html',
  styleUrl: './ab20.component.css'
})
export class Ab20Component {
  gametab = true; bettab = false;
  isSticky = false; sidebarTopOffset = 124; userButtons: any = {}; setButtonTab = 'casino';
  placebetButton: any = []; cvideoURL: any; loader = false; placeLoader = false;
  safeURL: any; mybets: any = []; mybooks: any = []; cardABook: any = []; card2Book: any = []; card3Book: any = []; card4Book: any = []; card5Book: any = [];
  card6Book: any = []; card7Book: any = []; card8Book: any = []; card9Book: any = []; card10Book: any = []; cardJBook: any = []; cardQBook: any = []; cardKBook: any = [];
  data: any; results: any;
  aall: String[] = []; ball: String[] = []; ar: String[] = []; br: String[] = [];

  roundId = ""; autotime = 0; clock: any; beforeNum = 0; min = 0; max = 0;
  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false;

  a1 = ""; a2 = ""; a3 = ""; a4 = ""; a5 = ""; a6 = ""; a7 = ""; a8 = ""; a9 = ""; a10 = ""; a11 = ""; a12 = ""; a13 = "";
  b1 = ""; b2 = ""; b3 = ""; b4 = ""; b5 = ""; b6 = ""; b7 = ""; b8 = ""; b9 = ""; b10 = ""; b11 = ""; b12 = ""; b13 = "";
  a1Status = ""; a2Status = ""; a3Status = ""; a4Status = ""; a5Status = ""; a6Status = ""; a7Status = ""; a8Status = ""; a9Status = ""; a10Status = ""; a11Status = ""; a12Status = ""; a13Status = "";
  b1Status = ""; b2Status = ""; b3Status = ""; b4Status = ""; b5Status = ""; b6Status = ""; b7Status = ""; b8Status = ""; b9Status = ""; b10Status = ""; b11Status = ""; b12Status = ""; b13Status = "";
  temprId = ""; tempAndar: String[] = []; tempBahar: String[] = [];

  betFor = ""; odds = 0; betType = ""; stake: any = null; profit = 0; loss = 0; showbetform = false; oddsType = ""; sid = 0;
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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3053')
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'ab20').subscribe((data: any) => {
      this.data = data.data;
      this.aall = this.data.t3[0].aall.split(","); this.ball = this.data.t3[0].ball.split(",");
      const $andarslider = $('.andarslider');
      if (!$andarslider.hasClass('slick-initialized')) {
        this.andarsliderInitialize();
      }
      this.aall.map((img: any) => this.addandarSlickItem(img))
      const $baharslider = $('.baharslider');
      if (!$baharslider.hasClass('slick-initialized')) {
        this.baharsliderInitialize();
      }
      this.ball.map((img: any) => this.addbaharSlickItem(img))
      this.ar = this.data.t3[0].ar.split(",");
      this.br = this.data.t3[0].br.split(",");
      this.min = this.data.t2[0].min;
      this.max = this.data.t2[0].max;
      if (this.roundId != data['data']['t1'][0]['mid']) {
        this.clearBooks(); this.mybets = [];
      }
      this.roundId = this.data.t1[0].mid;
      this.autotime = this.data.t1[0].autotime;
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      this.a1 = this.data.t2[0].rate; this.a2 = this.data.t2[1].rate; this.a3 = this.data.t2[2].rate; this.a4 = this.data.t2[3].rate; this.a5 = this.data.t2[4].rate; this.a6 = this.data.t2[5].rate; this.a7 = this.data.t2[6].rate; this.a8 = this.data.t2[7].rate; this.a9 = this.data.t2[8].rate; this.a10 = this.data.t2[9].rate; this.a11 = this.data.t2[10].rate; this.a12 = this.data.t2[11].rate; this.a13 = this.data.t2[12].rate;
      this.b1 = this.data.t2[13].rate; this.b2 = this.data.t2[14].rate; this.b3 = this.data.t2[15].rate; this.b4 = this.data.t2[16].rate; this.b5 = this.data.t2[17].rate; this.b6 = this.data.t2[18].rate; this.b7 = this.data.t2[19].rate; this.b8 = this.data.t2[20].rate; this.b9 = this.data.t2[21].rate; this.b10 = this.data.t2[22].rate; this.b11 = this.data.t2[23].rate; this.b12 = this.data.t2[24].rate; this.b13 = this.data.t2[25].rate;

      this.a1Status = this.data.t2[0].gstatus; this.a2Status = this.data.t2[1].gstatus; this.a3Status = this.data.t2[2].gstatus; this.a4Status = this.data.t2[3].gstatus; this.a5Status = this.data.t2[4].gstatus; this.a6Status = this.data.t2[5].gstatus; this.a7Status = this.data.t2[6].gstatus; this.a8Status = this.data.t2[7].gstatus; this.a9Status = this.data.t2[8].gstatus; this.a10Status = this.data.t2[9].gstatus; this.a11Status = this.data.t2[10].gstatus; this.a12Status = this.data.t2[11].gstatus; this.a13Status = this.data.t2[12].gstatus;
      this.b1Status = this.data.t2[13].gstatus; this.b2Status = this.data.t2[14].gstatus; this.b3Status = this.data.t2[15].gstatus; this.b4Status = this.data.t2[16].gstatus; this.b5Status = this.data.t2[17].gstatus; this.b6Status = this.data.t2[18].gstatus; this.b7Status = this.data.t2[19].gstatus; this.b8Status = this.data.t2[20].gstatus; this.b9Status = this.data.t2[21].gstatus; this.b10Status = this.data.t2[22].gstatus; this.b11Status = this.data.t2[23].gstatus; this.b12Status = this.data.t2[24].gstatus; this.b13Status = this.data.t2[25].gstatus;
    })
    this.socket_service.casinolast10('Last10', 'ab20').subscribe((resultdata: any) => {
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

  ngAfterViewInit() {

  }

  andarsliderInitialize() {
    $('.andarslider').slick({
      slidesToShow: 3,
      slidesToScroll: 3,
      infinite: false,
    });
    for (const img of this.aall) {
      this.addandarSlickItem(img);
    }
  }

  baharsliderInitialize() {
    $('.baharslider').slick({
      slidesToShow: 3,
      slidesToScroll: 3,
      infinite: false,
    });
    for (const img of this.ball) {
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
        $andarslider.slick('slickGoTo', this.aall.length - 1);
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
        $baharslider.slick('slickGoTo', this.ball.length - 1);
      }
    }
  }
  ngOnDestroy() {
    this.socket_service.leavaAllRooms;
  }
  getCvideoURL() {
    this.match_service.getCVideo('ab20').subscribe({
      next: (res: any) => {
        //console.log(res)
        const url = res.url;
        this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(url)
      }, error: (e) => {
        console.log(e)
      }
    })
  }
  openBetForm(content: any, betfor: string, odds: any, type: string, sid: number, oddstype: string, min: any, max: any) {
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

  openResult(content: any, rid: any) {
    this.loader = true;
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      this.loader = false;
      this.modalService.open(content, { size: 'xl' })
      this.temprId = rid;
      let cards = winnerdata.data[0].cards;
      let andarbahar = cards.split(',*,');
      this.tempAndar = andarbahar[0].split(',');
      this.tempBahar = andarbahar[1].split(',');

      $('.andarresult').slick({
        slidesToShow: 15,
        slidesToScroll: 15,
        infinite: false,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 12,
              slidesToScroll: 12
            }
          },
          {
            breakpoint: 990,
            settings: {
              slidesToShow: 8,
              slidesToScroll: 8
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 5,
              slidesToScroll: 5
            }
          }
        ]
      });
      for (const img of this.tempAndar) {
        $('.andarresult').slick('slickAdd', `<div><img src="/img/cards/${img}.png">`);
      }
      $('.baharresult').slick({
        slidesToShow: 15,
        slidesToScroll: 15,
        infinite: false,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 12,
              slidesToScroll: 12
            }
          },
          {
            breakpoint: 990,
            settings: {
              slidesToShow: 8,
              slidesToScroll: 8
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 5,
              slidesToScroll: 5
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
    var dt = { roundid: this.roundId, matchcode: 'ab20', matchname: 'Andar Bahar 20-20', betfor: this.betFor, bettype: 'back', oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid };
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
    this.userauth.getCasinoOpenBet("ab20", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          if (item.oddsType == "CardA") { this.cardABook = item.book }
          else if (item.oddsType == "Card2") { this.card2Book = item.book }
          else if (item.oddsType == "Card3") { this.card3Book = item.book }
          else if (item.oddsType == "Card4") { this.card4Book = item.book }
          else if (item.oddsType == "Card5") { this.card5Book = item.book }
          else if (item.oddsType == "Card6") { this.card6Book = item.book }
          else if (item.oddsType == "Card7") { this.card7Book = item.book }
          else if (item.oddsType == "Card8") { this.card8Book = item.book }
          else if (item.oddsType == "Card9") { this.card9Book = item.book }
          else if (item.oddsType == "Card10") { this.card10Book = item.book }
          else if (item.oddsType == "CardJ") { this.cardJBook = item.book }
          else if (item.oddsType == "CardQ") { this.cardQBook = item.book }
          else if (item.oddsType == "CardK") { this.cardKBook = item.book }
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
  trackByFunc(index: any, item: any) {
    return item.mid;
  }
  clearBooks() {
    $('.andarslider').slick('unslick');
    $('.andarslider').empty();
    $('.baharslider').slick('unslick');
    $('.baharslider').empty();
    this.cardABook = []; this.card2Book = []; this.card3Book = []; this.card4Book = []; this.card5Book = [];
    this.card6Book = []; this.card7Book = []; this.card8Book = []; this.card9Book = []; this.card10Book = []; this.cardJBook = []; this.cardQBook = []; this.cardKBook = [];
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
