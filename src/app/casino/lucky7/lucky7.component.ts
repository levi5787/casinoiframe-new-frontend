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
  selector: "app-lucky7",
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: "./lucky7.component.html",
  styleUrl: "./lucky7.component.css",
})
export class Lucky7Component {
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
      this.cvideoURL + "?id=3058",
    );
    //this.getCvideoURL();
    this.socket_service
      .casinodata("Casino", "lucky7")
      .subscribe((data: any) => {
        this.data = data["data"];

        //code for flipclock
        this.autotime = parseInt(data["data"]["t1"][0]["autotime"]);
        if (this.beforeNum != this.autotime) {
          this.updateClock(this.autotime);
        }
        this.beforeNum = this.autotime;
        //code for flipclock end

        this.card = data["data"]["t1"][0]["C1"];
        this.c1 = "/img/cards/" + data["data"]["t1"][0]["C1"] + ".png";
        if (this.roundId != data["data"]["t1"][0]["mid"]) {
          this.highlowBook = [];
          this.oddevenBook = [];
          this.redblackBook = [];
          this.cardBook = [];
          this.mybets = [];
        }
        this.roundId = data["data"]["t1"][0]["mid"];
        this.lowodd = this.removeDecimal(data["data"]["t2"][0]["rate"]);
        this.highodd = this.removeDecimal(data["data"]["t2"][1]["rate"]);
        this.evenodd = this.removeDecimal(data["data"]["t2"][2]["rate"]);
        this.oddodd = this.removeDecimal(data["data"]["t2"][3]["rate"]);
        this.redodd = this.removeDecimal(data["data"]["t2"][4]["rate"]);
        this.blackodd = this.removeDecimal(data["data"]["t2"][5]["rate"]);
        this.cardsodd = this.removeDecimal(data["data"]["t2"][6]["rate"]);

        this.lowgstatus = data["data"]["t2"][0]["gstatus"];
        this.highgstatus = data["data"]["t2"][1]["gstatus"];
        this.evengstatus = data["data"]["t2"][2]["gstatus"];
        this.oddgstatus = data["data"]["t2"][3]["gstatus"];
        this.redgstatus = data["data"]["t2"][4]["gstatus"];
        this.blackgstatus = data["data"]["t2"][5]["gstatus"];
        this.gstatus1 = data["data"]["t2"][6]["gstatus"];
        this.gstatus2 = data["data"]["t2"][7]["gstatus"];
        this.gstatus3 = data["data"]["t2"][8]["gstatus"];
        this.gstatus4 = data["data"]["t2"][9]["gstatus"];
        this.gstatus5 = data["data"]["t2"][10]["gstatus"];
        this.gstatus6 = data["data"]["t2"][11]["gstatus"];
        this.gstatus7 = data["data"]["t2"][12]["gstatus"];
        this.gstatus8 = data["data"]["t2"][13]["gstatus"];
        this.gstatus9 = data["data"]["t2"][14]["gstatus"];
        this.gstatus10 = data["data"]["t2"][15]["gstatus"];
        this.gstatus11 = data["data"]["t2"][16]["gstatus"];
        this.gstatus12 = data["data"]["t2"][17]["gstatus"];
        this.gstatus13 = data["data"]["t2"][18]["gstatus"];

        this.lowhighmin = data["data"]["t2"][0]["min"];
        this.lowhighmax = data["data"]["t2"][0]["max"];
        this.oddevenmin = data["data"]["t2"][2]["min"];
        this.oddevenmax = data["data"]["t2"][2]["max"];
        this.redblackmin = data["data"]["t2"][4]["min"];
        this.redblackmax = data["data"]["t2"][4]["max"];
        this.cardsmin = data["data"]["t2"][6]["min"];
        this.cardsmax = data["data"]["t2"][6]["max"];
      });
    this.socket_service
      .casinolast10("Last10", "lucky7")
      .subscribe((resultdata: any) => {
        this.results = resultdata.data;
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
    this.match_service.getCVideo("lucky7").subscribe({
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
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      this.loader = false;
      this.modalService.open(content, { size: "xl" });
      //console.log(winnerdata)
      this.temprId = rid;
      this.tempCard = winnerdata["data"][0]["cards"].split(",")[0];
      this.win = winnerdata["data"][0]["win"];
      this.desc = winnerdata["data"][0]["desc"].replace("", "").split("||");
    });
  }
  submitbet() {
    this.placeLoader = true;
    var dt = {
      roundid: this.roundId,
      matchcode: "lucky7",
      matchname: "Lucky 7-A",
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
    this.userauth.getCasinoOpenBet("lucky7", this.roundId).subscribe({
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
