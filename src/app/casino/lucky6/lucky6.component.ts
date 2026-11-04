import { Component, HostListener, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { MatchService } from "../../services/match.service";
import { SocketService } from "../../services/socket.service";
import { UserauthService } from "../../services/userauth.service";
import { DomSanitizer } from "@angular/platform-browser";
import { ToastrService } from "ngx-toastr";
import { CommonModule } from "@angular/common";
import { ShortNumberPipe } from "../../pipes/short-number.pipe";

@Component({
  selector: "app-lucky6",
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: "./lucky6.component.html",
  styleUrl: "./lucky6.component.css",
})
export class Lucky6Component {
  loader = false;
  placeLoader = false;
  gametab = true;
  bettab = false;
  userButtons: any = {};
  setButtonTab = "casino";
  isSticky = false;
  sidebarTopOffset = 124;
  placebetButton: any = [];
  cvideoURL: any;
  data: any;
  safeURL: any;
  mybets: any = [];
  mybooks: any = [];
  highlowBook: any = [];
  oddevenBook: any = [];
  redblackBook: any = [];
  cardBook: any = [];
  card = "";
  c1 = "";
  roundId = "";
  autotime = 0;
  clock: any;
  beforeNum = 0;
  lowodd = "";
  highodd = "";
  evenodd = "";
  oddodd = "";
  redodd = "";
  blackodd = "";
  cardsodd = "";
  lowgstatus = "";
  highgstatus = "";
  evengstatus = "";
  oddgstatus = "";
  redgstatus = "";
  blackgstatus = "";
  gstatus1 = "";
  gstatus2 = "";
  gstatus3 = "";
  gstatus4 = "";
  gstatus5 = "";
  gstatus6 = "";
  gstatus7 = "";
  gstatus8 = "";
  gstatus9 = "";
  gstatus10 = "";
  gstatus11 = "";
  gstatus12 = "";
  gstatus13 = "";
  lowhighmin = 0;
  lowhighmax = 0;
  oddevenmin = 0;
  oddevenmax = 0;
  min: any;
  max: any;
  redblackmin = 0;
  redblackmax = 0;
  cardsmin = 0;
  cardsmax = 0;

  betFor = "";
  odds = 0;
  betType = "";
  oddsType = "";
  stake: any = null;
  profit = 0;
  loss = 0;
  sid = 0;
  showbetform = false;
  results: any = [];
  temprId = "";
  tempCard = "";
  win = "";
  desc = "";
  cfirstnum = 0;
  clastnum = 0;
  flipfirst = false;
  flipsecond = false;
  dataChangedTime: any;
  dataCheckInterval: any;

  constructor(
    private modalService: NgbModal,
    private match_service: MatchService,
    private socket_service: SocketService,
    private _sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private userauth: UserauthService,
  ) {}

  @HostListener("window:scroll", [])
  onWindowScroll() {
    this.isSticky = window.pageYOffset >= this.sidebarTopOffset;
    //console.log(this.sidebarTopOffset)
  }
  removeDecimal(num: any): string {
    if (isNaN(Number(num))) {
      return "Invalid input";
    }
    return parseFloat(num).toString();
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo();
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(
      this.cvideoURL + "?id=3081",
    );
    //this.getCvideoURL();
    this.socket_service
      .casinodata("Casino", "lucky5")
      .subscribe((data: any) => {
        this.data = data["data"];

        //code for flipclock
        const d = this.data;
        this.autotime = parseInt(d["lt"]);
        // console.log( "autotime: ", this.autotime)

        if (this.beforeNum != this.autotime) {
          this.updateClock(this.autotime);
        }
        this.beforeNum = this.autotime;
        //code for flipclock end

        // cards -->
        this.card = this.data["card"];
        this.c1 = `/img/cards-new/${this.card}.png`;

        // roundId -->
        if (this.roundId != this.data["mid"]) {
          this.highlowBook = [];
          this.oddevenBook = [];
          this.redblackBook = [];
          this.cardBook = [];
          this.mybets = [];
        }
        this.roundId = this.data["mid"];

        //  market by nat -->
        const sub = this.data["sub"] || [];

        const lowCard = sub.find((s: any) => s.nat === "Low Card");
        const highCard = sub.find((s: any) => s.nat === "High Card");
        const even = sub.find((s: any) => s.nat === "Even");
        const odd = sub.find((s: any) => s.nat === "Odd");
        const red = sub.find((s: any) => s.nat === "Red");
        const black = sub.find((s: any) => s.nat === "Black");

        // cards -->
        // cards 1-13 by nat
        const card1 = sub.find((s: any) => s.nat === "Card 1");
        const card2 = sub.find((s: any) => s.nat === "Card 2");
        const card3 = sub.find((s: any) => s.nat === "Card 3");
        const card4 = sub.find((s: any) => s.nat === "Card 4");
        const card5 = sub.find((s: any) => s.nat === "Card 5");
        const card6 = sub.find((s: any) => s.nat === "Card 6");
        const card7 = sub.find((s: any) => s.nat === "Card 7");
        const card8 = sub.find((s: any) => s.nat === "Card 8");
        const card9 = sub.find((s: any) => s.nat === "Card 9");
        const card10 = sub.find((s: any) => s.nat === "Card 10");
        const cardJ = sub.find((s: any) => s.nat === "Card J");
        const cardQ = sub.find((s: any) => s.nat === "Card Q");
        const cardK = sub.find((s: any) => s.nat === "Card K");

        // odds -->
        this.lowodd = this.removeDecimal(lowCard?.b || 0);
        this.highodd = this.removeDecimal(highCard?.b || 0);
        this.evenodd = this.removeDecimal(even?.b || 0);
        this.oddodd = this.removeDecimal(odd?.b || 0);
        this.redodd = this.removeDecimal(red?.b || 0);
        this.blackodd = this.removeDecimal(black?.b || 0);
        this.cardsodd = this.removeDecimal(card1?.b || 0);

        // gstatus
        this.lowgstatus = lowCard?.gstatus;
        this.highgstatus = highCard?.gstatus;
        this.evengstatus = even?.gstatus;
        this.oddgstatus = odd?.gstatus;
        this.redgstatus = red?.gstatus;
        this.blackgstatus = black?.gstatus;
        this.gstatus1 = card1?.gstatus;
        this.gstatus2 = card2?.gstatus;
        this.gstatus3 = card3?.gstatus;
        this.gstatus4 = card4?.gstatus;
        this.gstatus5 = card5?.gstatus;
        this.gstatus6 = card6?.gstatus;
        this.gstatus7 = card7?.gstatus;
        this.gstatus8 = card8?.gstatus;
        this.gstatus9 = card9?.gstatus;
        this.gstatus10 = card10?.gstatus;
        this.gstatus11 = cardJ?.gstatus;
        this.gstatus12 = cardQ?.gstatus;
        this.gstatus13 = cardK?.gstatus;

        // min/max
        this.lowhighmin = lowCard?.min;
        this.lowhighmax = lowCard?.max;
        this.oddevenmin = even?.min;
        this.oddevenmax = even?.max;
        this.redblackmin = red?.min;
        this.redblackmax = red?.max;
        this.cardsmin = card1?.min;
        this.cardsmax = card1?.max;
      });
    this.socket_service
      .casinolast10("Last10", "lucky5")
      .subscribe((resultdata: any) => {
        // console.log("resultdata : ", resultdata);
        this.results = resultdata?.data?.res || [];
        //this.results = resultdata.data.reverse();
      });
    setTimeout(() => {
      this.getopenbet();
      setTimeout(() => {
        this.getopenbet();
      }, 2000);
    }, 1500);
    this.socket_service
      .updateCheck("User", this.userauth.getUsername())
      .subscribe((data: any) => {
        if (data.update) {
          this.userauth.getUserBalance();
          this.getopenbet();
        }
      });
    this.placeBetButton();
  }
  ngOnDestroy() {
    this.socket_service.leavaAllRooms;
  }

  getCvideoURL() {
    this.match_service.getCVideo("lucky5").subscribe({
      next: (res: any) => {
        //console.log(res)
        const url = res.url;
        this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(url);
      },
      error: (e) => {
        console.log(e);
      },
    });
  }

  openBetForm(
    content: any,
    betfor: string,
    odds: any,
    type: string,
    sid: number,
    oddstype: string,
    min: any,
    max: any,
  ) {
    this.showbetform = true;
    this.betFor = betfor;
    this.odds = odds;
    this.betType = type;
    this.oddsType = oddstype;
    this.profit = 0;
    this.loss = 0;
    this.stake = null;
    this.sid = sid;
    this.min = min;
    this.max = max;
    //this.modalService.open(content)
    if (window.innerWidth < 1100) {
      this.modalService.open(content);
    }
  }
  hideBetPlace() {
    this.showbetform = false;
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
  calcProfit(stake: any) {}
  open(content: any) {
    this.modalService.open(content, { size: "lg" });
  }
  openResult(content: any, rid: any) {
    this.loader = true;
    this.match_service.getResult(rid).subscribe({
      next: (winnerdata: any) => {
        this.loader = false;
        this.temprId = rid;
        const d = winnerdata?.data?.[0] || {};
        this.tempCard = d?.card || "1";
        this.win = d?.winnat || "";
        this.desc = d?.rdesc ? d.rdesc.split("#") : [];
        this.modalService.open(content, { size: "xl" });
      },
      error: (e) => {
        this.loader = false;
        console.log("getResult error:", e);
      },
    });
  }
  submitbet() {
    this.placeLoader = true;
    var dt = {
      roundid: this.roundId,
      matchcode: "lucky5",
      matchname: "lucky5",
      betfor: this.betFor,
      bettype: "back",
      oddstype: this.oddsType,
      odds: this.odds,
      stake: this.stake,
      sid: this.sid,
    };
    
    this.userauth.placeCasinoBet(dt).subscribe({
      next: (res: any) => {
        this.placeLoader = false;
        this.showbetform = false;
        this.displayToast(res.message, res.status);
        this.getopenbet();
        this.userauth.getUserBalance();
        this.modalService.dismissAll();
      },
      error: (e) => {
        this.placeLoader = false;
        this.showbetform = false;
        this.displayToast(e.error.message, "failed");
        this.modalService.dismissAll();
      },
    });
  }
  getopenbet() {
    this.userauth.getCasinoOpenBet("lucky5", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          if (item.oddsType == "HighLow") {
            this.highlowBook = item.book;
          } else if (item.oddsType == "OddEven") {
            this.oddevenBook = item.book;
          } else if (item.oddsType == "RedBlack") {
            this.redblackBook = item.book;
          } else if (item.oddsType == "Card") {
            this.cardBook = item.book;
          }
        });
        //console.log(this.mybooks);
      },
      error: (e) => console.log(e),
    });
  }
  displayToast(msg: any, type: any) {
    if (type == "success") {
      this.toastr.success(msg, "", {
        timeOut: 3000,
        positionClass: "toast-top-center",
        closeButton: true,
      });
    } else {
      this.toastr.error(msg, "", {
        timeOut: 3000,
        positionClass: "toast-top-center",
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
      let stime = time.toString();
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
  trackByFunc(index: number, item: any): number {
    return item.mid;
  }
  trackByMid(index: number, item: any) {
    return item.mid;
  }
  twoDecimal(num: number) {
    if (num) return num.toFixed(2);
    return 0.0;
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
      },
      error: (e) => console.log(e),
    });
  }
  clickSetButtonTab(name: any) {
    this.setButtonTab = name;
  }
  openButtons(content: any) {
    this.userauth.getButtons().subscribe({
      next: (res) => {
        this.userButtons = res;
        this.modalService.open(content, { size: "md" });
      },
      error: (e) => {
        console.log(e);
      },
    });
  }
  updateButtons() {
    this.userauth.updateButtons(this.userButtons).subscribe({
      next: (res: any) => {
        this.toastr.success(res.message, "", {
          timeOut: 3000,
          positionClass: "toast-top-center",
          closeButton: true,
        });
        this.modalService.dismissAll();
      },
      error: (e) => {
        this.toastr.error(e.error.message, "", {
          timeOut: 3000,
          positionClass: "toast-top-center",
          closeButton: true,
        });
        this.modalService.dismissAll();
      },
    });
  }
}
