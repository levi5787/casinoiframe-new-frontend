import { Component, HostListener } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { MatchService } from "../../services/match.service";
import { SocketService } from "../../services/socket.service";
import { DomSanitizer } from "@angular/platform-browser";
import { ToastrService } from "ngx-toastr";
import { UserauthService } from "../../services/userauth.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ShortNumberPipe } from "../../pipes/short-number.pipe";

@Component({
  selector: "app-goal2",
  standalone: true,
  imports: [CommonModule, FormsModule, ShortNumberPipe],
  templateUrl: "./goal2.component.html",
  styleUrl: "./goal2.component.css",
})
export class Goal2Component {
  loader = false;

  isSticky = false;
  sidebarTopOffset = 124;
  cvideoURL: any;
  safeURL: any;
  data: any;
  autotime = 0;
  beforeNum = 0;
  rdesc: any;
  bounceEnter = false;
  roundId: any;
  mybets: any = [];
  min: any;
  max: any;
  remark: any;
  results: any = [];
  betFor = "";
  odds: any;
  betType = "";
  profit = 0;
  loss = 0;
  stake: any = null;
  sid = 0;
  temprId: any;
  tempDesc: any;
  tempDesc1: any;
  placeLoader = false;
  mybooks: any;
  clastnum = 0;
  flipsecond = false;
  cfirstnum = 0;
  flipfirst = false;
  bettab = false;
  gametab = true;
  setButtonTab = "casino";
  userButtons: any = {};
  mtime: any;
  placebetButton: any;
  showbetform = false;
  oddsType = "";
  // CRBook: any = [];
  // LMBook: any = [];
  // RLBook: any = []
  // NJBook: any = [];
  // HKBook: any = [];
  // RuLBook: any = [];
  // EHBook: any = [];
  // ZIBook: any = [];
  // KMBook: any = [];
  // NoGoalBook: any = [];
  // ShotGoalBook: any = [];
  // PenaltyGoalBook: any = [];
  // HeaderGoalBook: any = [];
  // FreeKickGoalBook: any = [];
  // NoGoalBookOne: any = [];

  winnerBook: any = [];
  methodOfNextGoalBook: any = [];
  combinationGoalBook: any = [];

  CRdata: any = {};
  LMdata: any = {};
  RLdata: any = {};
  NJdata: any = {};
  HKdata: any = {};
  RuLdata: any = {};
  ShotGoaldata: any = {};
  PenaltyGoaldata: any = {};
  EHdata: any = {};
  KMdata: any = {};
  NoGoaldata: any = {};
  HeaderGoaldata: any = {};
  ZIdata: any = {};
  FreeKickGoaldata: any = {};
  NoGoaldata1: any = {};
  NoGoalPlayerdata: any = {}; // sid 12 - No Goal (player)
  NoGoalMethoddata: any = {}; // sid 25 - No Goal (method)
  // NoGoalPlayerBook: any = [];
  // NoGoalMethodBook: any = [];
  // combo data
  CRCombodata: any[] = []; // Cristiano Ronaldo combos
  LMCombodata: any[] = [];
  RLCombodata: any[] = [];
  NJCombodata: any[] = []; // Karim Benzema combos
  HKCombodata: any[] = []; // Edinson Cavani combos
  ZICombodata: any[] = []; // Luis Suarez combos
  RuLCombodata: any[] = []; // Neymar combos
  KMCombodata: any[] = []; // Sergio Aguero combos
  EHCombodata: any[] = []; // Olivier Giroud combos
  MSCombodata: any[] = []; // Mohamed Salah combos
  KMbCombodata: any[] = []; // Kylian Mbappe combos
  constructor(
    private _sanitizer: DomSanitizer,
    private match_service: MatchService,
    private socket_service: SocketService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private userauth: UserauthService,
  ) {}

  @HostListener("window:scroll", [])
  onWindowScroll() {
    this.isSticky = window.pageYOffset >= this.sidebarTopOffset;
    //console.log(this.sidebarTopOffset)
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo();
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(
      this.cvideoURL + "?id=3082",
    );
    //this.getCvideoURL();
    this.socket_service.casinodata("Casino", "goal2").subscribe((data: any) => {
      //  console.log(data)
      this.data = data.data;
      //code for flipclock
      this.autotime = parseInt(this.data["lt"]);
      if (this.beforeNum != this.autotime) {
        this.updateClock(this.autotime);
      }
      this.beforeNum = this.autotime;
      //code for flipclock
      this.rdesc = this.data["rdesc"];

      if (this.rdesc != "") {
        this.bounceEnter = true;
        setTimeout(() => {
          this.bounceEnter = false;
        }, 1.5 * 1000);
      }
      if (this.roundId != this.data["mid"]) {
        this.clearBooks();
        this.mybets = [];
      }
      this.roundId = this.data["mid"];
      // console.log(this.roundId)
      this.min = this.data.sub[0]["min"];
      this.max = this.data.sub[0]["max"];
      this.remark = this.data.remark;


      const sub = this.data.sub;

      // Players (subtype === 'player')
      this.CRdata = sub.find((s: any) => s.nat === "Cristiano Ronaldo") || {};
      this.LMdata = sub.find((s: any) => s.nat === "Lionel Messi") || {};
      this.RLdata = sub.find((s: any) => s.nat === "Robert Lewandowski") || {};
      this.NJdata = sub.find((s: any) => s.nat === "Karim Benzema") || {};
      this.HKdata = sub.find((s: any) => s.nat === "Edinson Cavani") || {};
      this.ZIdata = sub.find((s: any) => s.nat === "Luis Suarez") || {};
      this.RuLdata = sub.find((s: any) => s.nat === "Neymar") || {};
      this.KMdata = sub.find((s: any) => s.nat === "Sergio Aguero") || {};
      this.EHdata = sub.find((s: any) => s.nat === "Olivier Giroud") || {};
      this.NoGoaldata = sub.find((s: any) => s.nat === "Mohamed Salah") || {};
      this.NoGoaldata1 = sub.find((s: any) => s.nat === "Kylian Mbappe") || {};
      this.NoGoalPlayerdata =
        sub.find((s: any) => s.nat === "No Goal" && s.subtype === "player") ||
        {};

      // Methods (subtype === 'method')
      this.ShotGoaldata = sub.find((s: any) => s.nat === "Shot Goal") || {};
      this.HeaderGoaldata = sub.find((s: any) => s.nat === "Header Goal") || {};
      this.PenaltyGoaldata =
        sub.find((s: any) => s.nat === "Penalty Goal") || {};
      this.FreeKickGoaldata =
        sub.find((s: any) => s.nat === "Free Kick Goal") || {};
      this.NoGoalMethoddata =
        sub.find((s: any) => s.nat === "No Goal" && s.subtype === "method") ||
        {};

      // Combos — filter by subtype and exact player name in nat
      this.CRCombodata = sub.filter(
        (s: any) =>
          s.subtype === "combo" && s.nat.includes("Cristiano Ronaldo"),
      );
      this.LMCombodata = sub.filter(
        (s: any) => s.subtype === "combo" && s.nat.includes("Lionel Messi"),
      );
      this.RLCombodata = sub.filter(
        (s: any) =>
          s.subtype === "combo" && s.nat.includes("Robert Lewandowski"),
      );
      this.NJCombodata = sub.filter(
        (s: any) => s.subtype === "combo" && s.nat.includes("Karim Benzema"),
      );
      this.HKCombodata = sub.filter(
        (s: any) => s.subtype === "combo" && s.nat.includes("Edinson Cavani"),
      );
      this.ZICombodata = sub.filter(
        (s: any) => s.subtype === "combo" && s.nat.includes("Luis Suarez"),
      );
      this.RuLCombodata = sub.filter(
        (s: any) => s.subtype === "combo" && s.nat.includes("Neymar"),
      );
      this.KMCombodata = sub.filter(
        (s: any) => s.subtype === "combo" && s.nat.includes("Sergio Aguero"),
      );
      this.EHCombodata = sub.filter(
        (s: any) => s.subtype === "combo" && s.nat.includes("Olivier Giroud"),
      );
      this.MSCombodata = sub.filter(
        (s: any) => s.subtype === "combo" && s.nat.includes("Mohamed Salah"),
      );
      this.KMbCombodata = sub.filter(
        (s: any) => s.subtype === "combo" && s.nat.includes("Kylian Mbappe"),
      );
    });
    this.socket_service
      .casinolast10("Last10", "goal2")
      .subscribe((winnerdata: any) => {
        this.results = winnerdata["data"]["res"];
        //this.results = this.results.reverse()
        // console.log(winnerdata);
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
    this.socket_service.leavaAllRooms();
  }
  getCvideoURL() {
    this.match_service.getCVideo("goal").subscribe({
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
    this.modalService.open(content, { size: "xl" });
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      //console.log(winnerdata)
      this.temprId = rid;
      //console.log(this.temprId);
      this.mtime = winnerdata.data[0].mtime;
      this.tempDesc = winnerdata.data[0].rdesc.split("#");
      this.tempDesc1 = this.tempDesc[1] + " By " + this.tempDesc[0];
    });
  }
  submitbet() {
    this.placeLoader = true;
    var dt = {
      roundid: this.roundId,
      matchcode: "goal2",
      matchname: "Goal2",
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
        this.displayToast(res.message, res.status);
        this.getopenbet();
        this.userauth.getUserBalance();
        this.modalService.dismissAll();
      },
      error: (e) => {
        this.placeLoader = false;
        this.displayToast(e.error.message, "failed");
        this.modalService.dismissAll();
      },
    });
    this.showbetform = false;
  }
  getopenbet() {
    this.userauth.getCasinoOpenBet("goal2", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          if (item.oddsType === "winner") {
            this.winnerBook = item.book;
          }else if (item.oddsType === "methodOfNextGoal"){
            this.methodOfNextGoalBook = item.book;
          }else if (item.oddsType === "combination Goal"){
            this.combinationGoalBook = item.book;
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
  trackByFunc(index: number, item: any) {
    return item.sid;
  }
  trackByMid(index: number, item: any) {
    return item.mid;
  }
  clearBooks() {
    this.winnerBook = [];
    this.methodOfNextGoalBook = [];
    this.combinationGoalBook = [];
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
