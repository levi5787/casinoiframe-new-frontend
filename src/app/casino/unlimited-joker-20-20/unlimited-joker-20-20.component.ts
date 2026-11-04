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
  selector: "app-unlimited-joker-20-20",
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: "./unlimited-joker-20-20.component.html",
  styleUrl: "./unlimited-joker-20-20.component.css",
})
export class UnlimitedJoker2020Component {
  isSticky = false;
  sidebarTopOffset = 124;
  cvideoURL: string = "";
  safeURL: any;
  datas: any;
  autotime: number = 0;
  loader: boolean = false;
  temprId = "";
  tempWinner: any = "";
  tempCards: any = [];

  beforeNum: number = 0;
  card1: string = "";
  card2: string = "";
  card3: string = "";
  card4: string = "";
  card5: string = "";
  card6: string = "";
  card7: string = "";
  min: number = 0;
  max: number = 0;
  roundId: any = 0;
  playerA: any = "";
  isSuspendedPlayerA: any = "";
  playerB: any = "";
  isSuspendedPlayerB: any = "";

  showbetform = false;
  betFor = "";
  odds = 0;
  betType = "";
  stake: any = null;
  profit = 0;
  loss = 0;
  oddsType = "";
  sid = 0;
  placeLoader = false;
  mybets: any = [];
  mybooks: any = [];
  winnerBook: any = [];
  tempTime: any;
  aPPBook: any = [];
  bPPBook: any = [];
  showCards: any = [];
  cfirstnum = 0;
  clastnum = 0;
  flipfirst = false;
  flipsecond = false;
  bettab = false;
  gametab = true;
  userButtons: any = {};
  setButtonTab = "casino";
  placebetButton: any = [];
  displayToast: any = "";
  results: { mid: number; win: string }[] = [];
  cname: string = "";

  constructor(
    private _sanitizer: DomSanitizer,
    private socket_service: SocketService,
    private match_service: MatchService,
    private modalService: NgbModal,
    private userauth: UserauthService,
    private toastr: ToastrService,
  ) { }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    this.isSticky = window.pageYOffset >= this.sidebarTopOffset;
    //console.log(this.sidebarTopOffset)
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo();
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(
      this.cvideoURL + "?id=3089",
    );
    //this.getCvideoURL();
    this.socket_service.casinodata("Casino", "joker120").subscribe((data) => {
      if (data) {
        this.datas = data;

        if (this.roundId != this.datas["data"]["mid"]) {
          this.winnerBook = [];
          this.mybets = [];
        }

        this.roundId = this.datas["data"]["mid"];
        this.playerA = this.datas["data"]["sub"][0];
        this.isSuspendedPlayerA = this.datas["data"]["sub"][0]["gstatus"];
        this.playerB = this.datas["data"]["sub"][1];
        this.isSuspendedPlayerB = this.datas["data"]["sub"][1]["gstatus"];
        this.min = this.datas["data"]["sub"][0]["min"];
        this.max = this.datas["data"]["sub"][0]["max"];

        //code for flipclock
        this.autotime = parseInt(this.datas["data"]["lt"]);
        if (this.beforeNum != this.autotime) {
          this.updateClock(this.autotime);
        }
        this.beforeNum = this.autotime;
        //code for flipclock end

        // console.log(this.datas["data"]["card"][5]);
        let splittedCard = this.datas["data"]["card"].split(",");

        this.card1 = "/img/cards-new/" + splittedCard[0] + ".png";
        this.card2 = "/img/cards-new/" + splittedCard[1] + ".png";
        this.card3 = "/img/cards-new/" + splittedCard[2] + ".png";
        this.card4 = "/img/cards-new/" + splittedCard[3] + ".png";
        this.card5 = "/img/cards-new/" + splittedCard[4] + ".png";
        this.card6 = "/img/cards-new/" + splittedCard[5] + ".png";
        
      }
    });
    this.socket_service
      .casinolast10("Last10", "joker120")
      .subscribe((resultdata: any) => {
        if (resultdata) {
          this.results = resultdata["data"]["res"];
          this.cname = resultdata["data"]["res1"]["cname"];

          // console.log(this.results);
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
          // this.getopenbet();
        }
      });
    this.placeBetButton();
  }

  openResult(content: any, rid: any) {
    this.loader = true;
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      this.loader = false;

      this.showCards = [];

      console.log(winnerdata);
      this.modalService.open(content, { size: "xl" });
      this.temprId = rid;
      this.tempTime = winnerdata["data"][0]["mtime"];
      this.tempWinner = winnerdata["data"][0]["win"];
      this.tempCards = winnerdata["data"][0]["card"].split(",");

      this.tempCards.forEach((card: any) => {
        let newCard = "/img/cards-new/" + card + ".png";
        this.showCards.push(newCard);
      });
    });

    console.log(this.showCards);
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
  calcProfit(stake: any) { }

  open(content: any) {
    this.modalService.open(content, { size: "lg" });
  }

  submitbet() {
    this.placeLoader = true;
    var dt = {
      roundid: this.roundId,
      matchcode: "joker120",
      matchname: "Unlimited Joker 20-20",
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

        if (res.status === "success" || res.status === true) {
          this.toastr.success(res.message, "", {
            timeOut: 3000,
            positionClass: "toast-top-center",
            closeButton: true,
          });
        }
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

  trackByFunc(index: number, item: any) {
    return item.value || index;
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

  getopenbet() {
    this.userauth.getCasinoOpenBet("joker120", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          //console.log(item);
          if (item.oddsType == "winner") {
            this.winnerBook = item.book;
          }
        });
      },
      error: (e) => console.log(e),
    });
  }

  placeBetButton() {
    this.userauth.getButtons().subscribe({
      next: (res: any) => {
        this.placebetButton = res.casinobutton;
      },
      error: (e) => console.log(e),
    });
  }
}
