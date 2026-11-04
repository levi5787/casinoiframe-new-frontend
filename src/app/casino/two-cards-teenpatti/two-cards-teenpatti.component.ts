import { Component, HostListener, inject, NgModule } from "@angular/core";
import { Router, RouterOutlet, RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DomSanitizer } from "@angular/platform-browser";
import { MatchService } from "../../services/match.service";
import { SocketService } from "../../services/socket.service";
import { UserauthService } from "../../services/userauth.service";
import { ToastrService } from "ngx-toastr";
import { CommonModule } from "@angular/common";
import { ShortNumberPipe } from "../../pipes/short-number.pipe";

@Component({
  selector: "app-two-cards-teenpatti",
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: "./two-cards-teenpatti.component.html",
  styleUrl: "./two-cards-teenpatti.component.css",
})
export class TwoCardsTeenpattiComponent {
  gametab = true;
  bettab = false;
  loader = false;
  placeLoader = false;
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
  winnerBook: any = [];
  miniBaccaratABook: any = [];
  miniBaccaratBBook: any = [];
  totalABook: any = [];
  totalBBook: any = [];
  colourplusBook: any = [];

  datas: any;
  autotime = 0;
  clock: any;
  beforeNum = 0;
  results: any = [];
  showbetform = false;
  c1 = "";
  c2 = "";
  c3 = "";
  c4 = "";
  roundId = "";
  min: any;
  max: any;
  playerAmin: any;
  playerAmax: any;
  playerBmin: any;
  playerBmax: any;
  totalAmin: any;
  totalAmax: any;
  totalBmin: any;
  totalBmax: any;
  miniBaccaratAmin: any;
  miniBaccaratAmax: any;
  miniBaccaratBmin: any;
  miniBaccaratBmax: any;
  colorPlusmin: any;
  colorPlusmax: any;
  playerA: any;
  playerB: any;
  totalA: any;
  totalB: any;
  miniBaccaratA: any;
  miniBaccaratB: any;
  colorPlus: any;
  gtype = "";
  betFor = "";
  odds = 0;
  betType = "";
  stake: any = null;
  profit = 0;
  loss = 0;
  oddsType = "";
  sid = 0;
  tempCards: any = [];
  tempWinner: any = "";
  temprdesc = "";
  temprId = "";
  temptime = "";
  cfirstnum = 0;
  clastnum = 0;
  flipfirst = false;
  flipsecond = false;

  constructor(
    private _sanitizer: DomSanitizer,
    private socket_service: SocketService,
    private match_service: MatchService,
    private modalService: NgbModal,
    private userauth: UserauthService,
    private toastr: ToastrService,
  ) {}

  @HostListener("window:scroll", [])
  onWindowScroll() {
    this.isSticky = window.pageYOffset >= this.sidebarTopOffset;
    //console.log(this.sidebarTopOffset)
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo();
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(
      this.cvideoURL + "?id=3087",
    );
    //this.getCvideoURL();
    this.socket_service.casinodata("Casino", "patti2").subscribe((data) => {
      //console.log(data)
      if (data) {
        this.datas = data;
        // console.log(this.datas)
        //code for flipclock
        this.autotime = parseInt(this.datas["data"]["lt"]);
        // console.log(this.autotime)
        if (this.beforeNum != this.autotime) {
          this.updateClock(this.autotime);
        }
        this.beforeNum = this.autotime;
        //code for flipclock end

        if (this.roundId != this.datas["data"]["mid"]) {
          this.winnerBook = [];
          this.mybets = [];
          this.miniBaccaratABook = [];
          this.miniBaccaratBBook = [];
          this.colourplusBook = [];
        }
        this.roundId = this.datas["data"]["mid"];

        // this.min = this.datas["data"]["sub"][0]["min"];
        // this.max = this.datas["data"]["sub"][0]["max"];
        // console.log("min:", this.min);
        // console.log("max:", this.max);
        this.gtype = this.datas["data"]["gtype"];

        const cards = this.datas["data"]["card"].split(",");
        this.c1 = "/img/cards-new/" + cards[0] + ".png";
        this.c2 = "/img/cards-new/" + cards[1] + ".png";
        this.c3 = "/img/cards-new/" + cards[2] + ".png";
        this.c4 = "/img/cards-new/" + cards[3] + ".png";
        //console.log(cards)

        // players Data
        this.playerA = this.datas["data"]["sub"][0];
        this.playerB = this.datas["data"]["sub"][1];
        //total date
        this.totalA = this.datas["data"]["sub"][2];
        this.totalB = this.datas["data"]["sub"][3];
        // mini baccarat data
        this.miniBaccaratA = this.datas["data"]["sub"][4];
        this.miniBaccaratB = this.datas["data"]["sub"][5];
        //color plus data
        this.colorPlus = this.datas["data"]["sub"][6];

        // min/max
        this.playerAmin = this.playerA?.min;
        this.playerAmax = this.playerA?.max;
        this.playerBmin = this.playerB?.min;
        this.playerBmax = this.playerB?.max;
        this.totalAmin = this.totalA?.min;
        this.totalAmax = this.totalA?.max;
        this.totalBmin = this.totalB?.min;
        this.totalBmax = this.totalB?.max;
        this.miniBaccaratAmin = this.miniBaccaratA?.min;
        this.miniBaccaratAmax = this.miniBaccaratA?.max;
        this.miniBaccaratBmin = this.miniBaccaratB?.min;
        this.miniBaccaratBmax = this.miniBaccaratB?.max;
        this.colorPlusmin = this.colorPlus?.min;
        this.colorPlusmax = this.colorPlus?.max;
      }
    });
    this.socket_service
      .casinolast10("Last10", "patti2")
      .subscribe((resultdata: any) => {
        //  console.log("resultdata:", resultdata);
        if (resultdata) {
          this.results = resultdata["data"];
          // this.results = this.results.reverse();
          // console.log(this.results)
        }
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
    this.match_service.getCVideo("patti2").subscribe({
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
  trackByFunc(index: number, item: any) {
    return item.sid;
  }
  openBetForm(
    content: any,
    betfor: string,
    odds: any,
    type: string,
    sid: number,
    oddstype: string,
    min: number = 0,
    max: number = 0,
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
  calcProfit(stake: any) {
    if (this.betType == "back") {
      this.profit = (this.odds * stake) / 100;
      this.loss = stake;
    }
    if (this.betType == "lay") {
      this.loss = (this.odds * stake) / 100;
      this.profit = stake;
    }
  }
  open(content: any) {
    this.modalService.open(content, { size: "lg" });
  }
  openResult(content: any, rid: any) {
    this.loader = true;
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      this.loader = false;
      this.modalService.open(content, { size: "xl" });
      console.log("winnerdata:", winnerdata);

      const result = winnerdata["data"][0];
      if (!result) {
        console.error("No result data found");
        return;
      }

      this.temprId = rid;
      this.temptime = result["mtime"];
      this.tempWinner = result["winnat"];
      this.tempCards = (result["card"]?.split(",") || []).map(
        (c: string) => `/img/cards-new/${c}.png`,
      );
      this.temprdesc = result["rdesc"]?.split("#") || [];
    });
  }
  submitbet() {
    this.placeLoader = true;
    var dt = {
      roundid: this.roundId,
      matchcode: "patti2",
      matchname: "2 Cards Teenpatti",
      betfor: this.betFor,
      bettype: this.betType,
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
    this.userauth.getCasinoOpenBet("patti2", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          if (item.oddsType == "Winner") {
            this.winnerBook = item.book;
          } else if (item.oddsType == "Mini Baccarat A") {
            this.miniBaccaratABook = item.book;
          } else if (item.oddsType == "Mini Baccarat B") {
            this.miniBaccaratBBook = item.book;
          } else if (item.oddsType == "totalA") {
            this.totalABook = item.book;
          } else if (item.oddsType == "totalB") {
            this.totalBBook = item.book;
          } else if (item.oddsType == "colourPlus") {
            this.colourplusBook = item.book;
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
