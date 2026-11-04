import { Component, HostListener, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { MatchService } from "../../services/match.service";
import { SocketService } from "../../services/socket.service";
import { UserauthService } from "../../services/userauth.service";
import { DomSanitizer } from "@angular/platform-browser";
import { ToastrService } from "ngx-toastr";
import { CommonModule } from "@angular/common";
import { Router, ActivatedRoute } from "@angular/router";
import { ShortNumberPipe } from "../../pipes/short-number.pipe";

@Component({
  selector: "app-race17",
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: "./race17.component.html",
  styleUrl: "./race17.component.css",
})
export class Race17Component {
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
  autotime = 0;
  clock: any;
  beforeNum = 0;
  activeRange = "";
  mybets: any = [];
  mybooks: any = [];
  winnerBook: any = [];
  totalpointBook: any = [];
  totalcardBook: any = [];
  winwithBook: any = [];
  cards: any = [];
  spadecards: any = [];
  clubcards: any = [];
  heartcards: any = [];
  diamondcards: any = [];
  totalpoint = 0;
  totalcard = 0;
  temptime: any;

  roundId = "";
  min = 0;
  max = 0;
  desc: any = [];
  kSpadeback = "";
  kHeartback = "";
  kClubback = "";
  kDiamondback = "";
  kSpadebackSize = "";
  kHeartbackSize = "";
  kClubbackSize = "";
  kDiamondbackSize = "";
  kSpadelay = "";
  kHeartlay = "";
  kClublay = "";
  kDiamondlay = "";
  kSpadelaySize = "";
  kHeartlaySize = "";
  kClublaySize = "";
  kDiamondlaySize = "";
  totalPointback = "";
  totalPointlay = "";
  totalPointbackSize = "";
  totalPointlaySize = "";
  totalCardback = "";
  totalCardlay = "";
  totalCardbackSize = "";
  totalCardlaySize = "";
  winWith5 = "";
  winWith6 = "";
  winWith7 = "";
  winWith15 = "";
  winWith16 = "";
  winWith17 = "";

  kSpademin = "";
  kSpademax = "";
  kHeartmin = "";
  kHeartmax = "";
  kDiamondmin = "";
  kDiamondmax = "";
  kClubmin = "";
  kClubmax = "";
  totalPointmin = "";
  totalPointmax = "";
  totalCardmin = "";
  totalCardmax = "";
  winWith5min = "";
  winWith5max = "";
  winWith15min = "";
  winWith15max = "";
  winWith6min = "";
  winWith6max = "";
  winWith16min = "";
  winWith16max = "";
  winWith7min = "";
  winWith7max = "";
  winWith17min = "";
  winWith17max = "";

  kSpadegstatus = "";
  kHeartgstatus = "";
  kClubgstatus = "";
  kDiamondgstatus = "";
  totalPointgstatus = "";
  totalCardgstatus = "";
  winWith5gstatus = "";
  winWith6gstatus = "";
  winWith7gstatus = "";
  winWith15gstatus = "";
  winWith16gstatus = "";
  winWith17gstatus = "";
  winnerValue: any;
  showTempCards: any = [];

  cfirstnum = 0;
  clastnum = 0;
  flipfirst = false;
  flipsecond = false;
  showbetform = false;
  betFor = "";
  betType = "";
  odds = "";
  stake: any = null;
  profit = 0;
  loss = 0;
  oddsType = "";
  sid = 0;
  results: any = [];
  temprId = "";
  tempWinner = "";
  tempCards: any = [];
  tempDesc = "";
  winnerPlayer = "";
  tempSpadecards: any = [];
  tempClubcards: any = [];
  tempHeartcards: any = [];
  tempDiamondcards: any = [];

  raceto17: any = {};
  israceto17Suspended: any = "";
  bigCard: any = {};
  isBigCardSuspended: any = "";
  zeroCard: any = {};
  isZeroCardSuspended: any = "";
  anyZero: any = {};
  isAnyZeroSuspended: any = "";
  card1: any = "";
  card2: any = "";
  card3: any = "";
  card4: any = "";
  card5: any = "";
  bigCardBook: any = {};
  zeroCardBook: any = {};
  anyZeroBook: any = [];

  constructor(
    private modalService: NgbModal,
    private match_service: MatchService,
    private socket_service: SocketService,
    private _sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private userauth: UserauthService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
  ) {}
  @HostListener("window:scroll", [])
  onWindowScroll() {
    this.isSticky = window.pageYOffset >= this.sidebarTopOffset;
    //console.log(this.sidebarTopOffset)
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo();
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(
      this.cvideoURL + "?id=3086",
    );
    //this.getCvideoURL();
    this.socket_service
      .casinodata("Casino", "race17")
      .subscribe((data: any) => {
        this.data = data["data"];
        let splittedCard = this.data["card"].split(",");

        //code for flipclock
        this.autotime = parseInt(data["data"]["lt"]);

        this.raceto17 = this.data["sub"][0];
        this.israceto17Suspended = this.data["sub"][0]["gstatus"];
        this.min = this.data["sub"][0]["min"];
        this.max = this.data["sub"][0]["max"];

        this.bigCard = this.data["sub"][1];
        this.isBigCardSuspended = this.data["sub"][1]["gstatus"];
        this.zeroCard = this.data["sub"][2];
        this.isZeroCardSuspended = this.data["sub"][2]["gstatus"];
        this.anyZero = this.data["sub"][3];
        this.isAnyZeroSuspended = this.data["sub"][3]["gstatus"];

        this.card1 = "/img/cards-new/" + splittedCard[0] + ".png";
        this.card2 = "/img/cards-new/" + splittedCard[1] + ".png";
        this.card3 = "/img/cards-new/" + splittedCard[2] + ".png";
        this.card4 = "/img/cards-new/" + splittedCard[3] + ".png";
        this.card5 = "/img/cards-new/" + splittedCard[4] + ".png";

        if (this.beforeNum != this.autotime) {
          this.updateClock(this.autotime);
        }
        this.beforeNum = this.autotime;
        // code for flipclock end

        if (this.roundId != data["data"]["mid"]) {
          this.totalpoint = 0;
          this.totalcard = 0;
          this.diamondcards = [];
          this.spadecards = [];
          this.clubcards = [];
          this.heartcards = [];
          this.clearBooks();
          this.mybets = [];
        }
        this.roundId = data["data"]["mid"];
      });
    this.socket_service
      .casinolast10("Last10", "race17")
      .subscribe((resultdata: any) => {
        this.results = resultdata["data"]["res"];

        // console.log(this.results);
        // this.results = this.results.reverse();
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
  trackByFunc(index: number, item: any) {
    return item.sid;
  }
  getCvideoURL() {
    this.match_service.getCVideo("race17").subscribe({
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
  open(content: any) {
    this.modalService.open(content, { size: "lg" });
  }
  openResult(content: any, rid: any) {
    this.loader = true;
    this.showTempCards = [];
    this.tempDiamondcards = [];
    this.tempSpadecards = [];
    this.tempClubcards = [];
    this.tempHeartcards = [];

    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      this.loader = false;
      this.modalService.open(content, { size: "xl" });
      //console.log(winnerdata);
      this.temprId = rid;
      this.temptime = winnerdata["data"][0]["mtime"];
      this.tempWinner = winnerdata["data"][0]["win"];
      this.tempCards = winnerdata["data"][0]["card"].split(",");
      this.winnerValue = winnerdata["data"][0]["rdesc"].split("#");

      console.log(this.tempCards);

      this.tempCards.forEach((item: any) => {
        let resultCard = "/img/cards-new/" + item + ".png";
        this.showTempCards.push(resultCard);
      });

      console.log(this.showTempCards);
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
    if (window.innerWidth < 768) {
      this.modalService.open(content);
    }
  }
  hideBetPlace() {
    this.showbetform = false;
  }

  placeStake(stake: number) {
    this.stake = stake;
  }
  calcProfit(val: number) {}
  resetStake() {
    this.profit = 0;
    this.stake = null;
    this.loss = 0;
  }
  submitbet() {
    this.placeLoader = true;
    var dt = {
      roundid: this.roundId,
      matchcode: "race17",
      matchname: "Race to 17",
      betfor: this.betFor,
      bettype: this.betType,
      oddstype: this.oddsType,
      odds: this.odds,
      stake: this.stake,
      sid: this.sid,
    };

    console.log(dt);
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
    this.userauth.getCasinoOpenBet("race17", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        //console.log(this.mybooks);
        this.mybooks.forEach((item: any) => {
          //console.log(item);
          if (item.oddsType == "Race to 17") {
            this.winnerBook = item.book;
          } else if (item.oddsType.startsWith("Big Card (7,8,9)")) {
            this.bigCardBook[item.oddsType] = item.book;
          } else if (item.oddsType.startsWith("Zero Card")) {
            this.zeroCardBook[item.oddsType] = item.book;
          } else if (item.oddsType == "Any Zero") {
            this.anyZeroBook = item.book;
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
  getcardvalue(cards: string) {
    return cards.slice(-2);
  }
  getcardnumber(cards: string) {
    return cards.slice(0, -2);
  }
  getNumberValue(num: any) {
    if (num == "J") {
      return 11;
    } else if (num == "Q") {
      return 12;
    } else if (num == "K") {
      return 13;
    } else if (num == "A") {
      return 1;
    } else {
      return num;
    }
  }
  clearBooks() {
    this.winnerBook = [];
    this.totalcardBook = [];
    this.totalpointBook = [];
    this.winwithBook = [];
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
