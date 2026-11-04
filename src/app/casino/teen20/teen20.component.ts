import {
  Component,
  HostListener,
  OnInit,
  inject,
  NgModule,
} from "@angular/core";
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
  selector: "app-teen20",
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: "./teen20.component.html",
  styleUrl: "./teen20.component.css",
})
export class Teen20Component implements OnInit {
  bettab = false;
  gametab = true;
  loader = false;
  placeLoader = false;
  userButtons: any = {};
  setButtonTab = "casino";
  isSticky = false;
  sidebarTopOffset = 124;
  placebetButton: any = [];
  cvideoURL: any;
  safeURL: any;
  mybets: any = [];
  mybooks: any = [];
  winnerBook: any = [];
  aPPBook: any = [];
  bPPBook: any = [];
  autotime = 0;
  clock: any;
  beforeNum = 0;
  datas: any;
  results: any = [];
  Ac1 = "";
  Ac2 = "";
  Ac3 = "";
  Bc1 = "";
  Bc2 = "";
  Bc3 = "";
  roundId = "";
  min: any;
  max: any;
  playermin: any;
  playermax: any;
  pairmin: any;
  pairmax: any;
  Aback = "";
  Bback = "";
  App = "";
  Bpp = "";
  backAgstatus = "";
  backBgstatus = "";
  ppAgstatus = "";
  ppBgstatus = "";
  showbetform = false;
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
  temprId = "";
  cfirstnum = 0;
  clastnum = 0;
  flipfirst = false;
  flipsecond = false;

  constructor(
    private _sanitizer: DomSanitizer,
    private userauth: UserauthService,
    private toastr: ToastrService,
    private socket_service: SocketService,
    private match_service: MatchService,
    private modalService: NgbModal,
  ) {}

  @HostListener("window:scroll", [])
  onWindowScroll() {
    this.isSticky = window.pageYOffset >= this.sidebarTopOffset;
    //console.log(this.sidebarTopOffset)
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo();
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(
      this.cvideoURL + "?id=3030",
    );
    //this.getCvideoURL();
    this.socket_service.casinodata("Casino", "teen20").subscribe((data) => {
      //console.log(data);
      if (data) {
        this.datas = data;
        //code for flipclock
        this.autotime = parseInt(this.datas["data"]["t1"][0]["autotime"]);
        if (this.beforeNum != this.autotime) {
          this.updateClock(this.autotime);
        }
        this.beforeNum = this.autotime;
        //code for flipclock end
        if (this.roundId != this.datas["data"]["t1"][0]["mid"]) {
          this.winnerBook = [];
          this.aPPBook = [];
          this.bPPBook = [];
          this.mybets = [];
        }
        this.roundId = this.datas["data"]["t1"][0]["mid"];
        // this.min = this.datas['data']['t1'][0]['min'];
        // this.max = this.datas['data']['t1'][0]['max'];
        this.Ac1 = "/img/cards/" + this.datas["data"]["t1"][0]["C1"] + ".png";
        this.Ac2 = "/img/cards/" + this.datas["data"]["t1"][0]["C2"] + ".png";
        this.Ac3 = "/img/cards/" + this.datas["data"]["t1"][0]["C3"] + ".png";
        this.Bc1 = "/img/cards/" + this.datas["data"]["t1"][0]["C4"] + ".png";
        this.Bc2 = "/img/cards/" + this.datas["data"]["t1"][0]["C5"] + ".png";
        this.Bc3 = "/img/cards/" + this.datas["data"]["t1"][0]["C6"] + ".png";

        this.backAgstatus = this.datas["data"]["t2"][0]["gstatus"];
        this.backBgstatus = this.datas["data"]["t2"][2]["gstatus"];
        this.ppAgstatus = this.datas["data"]["t2"][1]["gstatus"];
        this.ppBgstatus = this.datas["data"]["t2"][3]["gstatus"];

        this.Aback = this.datas["data"]["t2"][0]["rate"];
        this.Bback = this.datas["data"]["t2"][2]["rate"];
        this.App = this.datas["data"]["t2"][1]["rate"];
        this.Bpp = this.datas["data"]["t2"][3]["rate"];

        this.playermin = this.datas["data"]["t2"][0]["min"];
        this.playermax = this.datas["data"]["t2"][0]["max"];
        this.pairmin = this.datas["data"]["t2"][1]["min"];
        this.pairmax = this.datas["data"]["t2"][1]["max"];
      }
    });
    this.socket_service
      .casinolast10("Last10", "teen20")
      .subscribe((resultdata: any) => {
        if (resultdata) {
          this.results = resultdata["data"];
          // this.results = this.results.reverse();
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
    this.match_service.getCVideo("teen20").subscribe({
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
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      this.loader = false;
      console.log(winnerdata);
      this.modalService.open(content, { size: "xl" });
      this.temprId = rid;
      this.tempWinner = winnerdata["data"][0]["win"];
      this.tempCards = winnerdata["data"][0]["cards"];
      this.tempCards = this.tempCards.split(",");
    });
  }
  submitbet() {
    this.placeLoader = true;
    var dt = {
      roundid: this.roundId,
      matchcode: "teen20",
      matchname: "Teenpatti 20-20",
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
    this.userauth.getCasinoOpenBet("teen20", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          if (item.oddsType == "Winner") {
            this.winnerBook = item.book;
          } else if (item.oddsType == "APairPlus") {
            this.aPPBook = item.book;
          } else if (item.oddsType == "BPairPlus") {
            this.bPPBook = item.book;
          }
        });
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
