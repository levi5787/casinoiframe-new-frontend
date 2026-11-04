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
  selector: 'app-dum10',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './dum10.component.html',
  styleUrl: './dum10.component.css'
})
export class Dum10Component {

  gametab = true; bettab = false;
  isSticky = false; sidebarTopOffset = 124; userButtons: any = {}; setButtonTab = 'casino';
  placebetButton: any = []; cvideoURL: any; loader = false; placeLoader = false;
  safeURL: any; mybets: any = []; mybooks: any = [];
  nextTotalBook:any=[];oddBook:any=[];evenBook:any=[];redBook:any=[]; blackBook:any=[];

  data: any; results: any; card:any = ""; cards: String[] = [];
  roundId = ""; autotime = 0; clock: any; beforeNum = 0; min = 0; max = 0;
  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false;
  cardSum = 0; dumData:any=[];

  temprId = ""; temprDate = ""; tempCard:any = ""; tempRdesc:any= [];
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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3077')
    //this.getCvideoURL();
    this.socket_service.casinodata('Casino', 'dum10').subscribe((data: any) => {
      this.data = data.data;
      this.card = "/img/cards-new/" + this.data.card + ".png";
      this.cards = this.data.lcard.split(",");
      const $cardslider = $('.cardslider');
      if (!$cardslider.hasClass('slick-initialized')) {
        this.sliderInitialize();
      }
      this.cards.map((img: any) => this.addslickItem(img))

      //console.log(data)
      if (this.roundId != this.data.mid) {
        this.clearBooks(); this.mybets = [];
      }
      this.roundId = this.data.mid;
      this.autotime = this.data.lt;
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.cardSum = this.data.csum;
      this.dumData = this.data.sub;
    })
    this.socket_service.casinolast10('Last10', 'dum10').subscribe((resultdata: any) => {
      this.results = resultdata['data']['res'];
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

  ngOnDestroy() {
    this.socket_service.leavaAllRooms;
  }

  sliderInitialize() {
    $('.cardslider').slick({
      slidesToShow: 3,
      slidesToScroll: 3,
      infinite: false,
    });
    for (const img of this.cards) {
      this.addslickItem(img);
    }
  }
  addslickItem(img: any) {
    if (!img) return;
    const $cardslider = $('.cardslider');
    if ($cardslider.hasClass('slick-initialized')) {
      const imageExists = $cardslider.find(`img[src="/img/cards-new/${img}.png"]`).length > 0;
      if (!imageExists) {
        $cardslider.slick('slickAdd', `<div><img src="/img/cards-new/${img}.png">`);
        $cardslider.slick('slickGoTo', this.cards.length - 1);
      }
    }
  }

  getCvideoURL() {
    this.match_service.getCVideo('dum10').subscribe({
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

  open(content: any) {
    this.modalService.open(content, { size: 'lg' });
  }

  openResult(content: any, rid: any) {
    this.loader = true;
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      this.loader = false;
      this.modalService.open(content, { size: 'xl' })
      this.temprId = rid;
      this.temprDate = winnerdata.data[0].mtime;
      const cards = winnerdata.data[0].card.split(",");
      this.tempCard = "/img/cards-new/" + cards.pop() + ".png";
      this.tempRdesc = winnerdata.data[0].rdesc.split("#");
      //initialize slick slider
      $('.resultcardslider').slick({
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
      for (const img of cards) {
        $('.resultcardslider').slick('slickAdd', `<div><img src="/img/cards-new/${img}.png">`);
      }
    })
  }

  submitbet() {
    this.placeLoader = true;
    var dt = { roundid: this.roundId, matchcode: 'dum10', matchname: 'Dus ka Dum', betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType, odds: this.odds, stake: this.stake, sid: this.sid };
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
    this.userauth.getCasinoOpenBet("dum10", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          if(item.oddsType=="Next Total"){this.nextTotalBook=item.book}
          else if(item.oddsType=="Odd"){this.oddBook=item.book}
          else if(item.oddsType=="Even"){this.evenBook=item.book}
          else if(item.oddsType=="Red"){this.redBook=item.book}
          else if(item.oddsType=="Black"){this.blackBook=item.book}
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
    this.nextTotalBook = []; this.oddBook = []; this.evenBook = []; this.redBook = []; this.blackBook = [];
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
