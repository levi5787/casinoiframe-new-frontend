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
  selector: 'app-unlimited-joker-oneday',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './unlimited-joker-oneday.component.html',
  styleUrl: './unlimited-joker-oneday.component.css'
})
export class UnlimitedJokerOnedayComponent {

  playerA: any;
  playerB: any;
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
  data: any;
  safeURL: any;
  autotime = 0;
  clock: any;
  beforeNum = 0;
  mybets: any = [];
  mybooks: any = [];
  winnerBook: any = [];
  c1 = "";
  c2 = "";
  c3 = "";
  c4 = "";
  c5 = "";
  c6 = "";
  rc1 = "";
  rc2 = "";
  rc3 = "";
  rc4 = "";
  rc5 = "";
  rc6 = "";
  rdesc = "";
  gtype = "";
  roundId: any = "";
  min: any;
  max: any;
  playerAMin: any;
  playerAMax: any;
  playerBMin: any;
  playerBMax: any;

  showJoker = false;
  lastJokerRoundId: any = null;

  results: any = [];
  betFor = "";
  betType = "";
  odds = "";
  showbetform = false;
  stake: any = null;
  profit = 0;
  oddsType = "";
  sid = 0;
  tempCards: any = [];
  tempWinner: any = "";
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
    private userauth: UserauthService,
    private modalService: NgbModal,
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
      this.cvideoURL + "?id=3088",
    );
    //this.getCvideoURL();
    this.socket_service.casinodata("Casino", "joker1").subscribe((data: any) => {
      // console.log("RAW SOCKET DATA:", data); 

      this.data = data["data"];
      if (data) {
        this.autotime = parseInt(data["data"]["lt"]);
        if (this.beforeNum != this.autotime) {
          this.updateClock(this.autotime);
        }
        // console.log("autotime:", this.autotime);
        this.beforeNum = this.autotime;
        //code for flipclock end
        console.log(this.roundId, data["data"]["mid"])
        if (this.roundId != data["data"]["mid"]) {
          this.winnerBook = [];
          this.mybets = [];
        }

        // show jocker card -->
        if (this.autotime === 0 && this.roundId !== this.lastJokerRoundId) {
          this.showJoker = true;
          this.lastJokerRoundId = this.roundId;
        } else if (this.autotime !== 0) {
          this.showJoker = false;
        }

        const cards = data["data"]["card"].split(",");
        // console.log("cards array:" , cards);
        this.roundId = data["data"]["mid"];
        this.min = data["data"]["sub"][0]["min"];
        this.max = data["data"]["sub"][0]["max"];
        this.playerA = data["data"]["sub"][0];
        this.playerB = data["data"]["sub"][1];
        this.c1 = "/img/cards-new/" + cards[0] + ".png";
        this.c2 = "/img/cards-new/" + cards[1] + ".png";
        this.c3 = "/img/cards-new/" + cards[2] + ".png";
        this.c4 = "/img/cards-new/" + cards[3] + ".png";
        this.c5 = "/img/cards-new/" + cards[4] + ".png";
        this.c6 = "/img/cards-new/" + cards[5] + ".png";
        this.gtype = data["data"]["gtype"];

        this.playerAMin = this.playerA?.min;
        this.playerAMax = this.playerA?.max;
        this.playerBMin = this.playerB?.min;
        this.playerBMax = this.playerB?.max;
      }
    });
    this.socket_service
      .casinolast10("Last10", "joker1")
      .subscribe((resultdata: any) => {
        // console.log("resultdata:", resultdata);
        if (resultdata) {
          this.results = resultdata["data"].res;
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
    (this, this.placeBetButton());
  }

  ngOnDestroy() {
    this.socket_service.leavaAllRooms;
  }
  getCvideoURL() {
    this.match_service.getCVideo("joker1").subscribe({
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
    return item.rid;
  }
  open(content: any) {
    this.modalService.open(content, { size: "lg" });
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
    this.profit = 0;
    this.calcProfit(val);
  }
  resetStake() {
    this.stake = null;
    this.profit = 0;
  }
  calcProfit(val: any) {
    //this.profit = (parseInt(this.betOdds)*this.stake)-this.stake;
  }

  openResult(content: any, rid: any) {
    this.loader = true;

    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      this.loader = false;
      this.modalService.open(content, { size: "xl" });

      //console.log(winnerdata);

      const result = winnerdata.data?.[0];

      if (result) {
        this.temprId = rid;
        this.temptime = result.mtime;
        this.tempWinner = result.rdesc;

        const cards = result.card?.split(",") || [];

        this.rc1 = cards[0] ? `/img/cards-new/${cards[0]}.png` : "";
        this.rc2 = cards[1] ? `/img/cards-new/${cards[1]}.png` : "";
        this.rc3 = cards[2] ? `/img/cards-new/${cards[2]}.png` : "";
        this.rc4 = cards[3] ? `/img/cards-new/${cards[3]}.png` : "";
        this.rc5 = cards[4] ? `/img/cards-new/${cards[4]}.png` : "";
        this.rc6 = cards[5] ? `/img/cards-new/${cards[5]}.png` : "";
      } else {
        console.error("No result found in data array.");
      }
    });
  }

  submitbet() {
    this.placeLoader = true;
    var dt = {
      roundid: this.roundId,
      matchcode: "joker1",
      matchname: "Unlimited Joker Oneday",
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
    this.userauth.getCasinoOpenBet("joker1", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          if (item.oddsType == "Winner") {
            this.winnerBook = item.book;
          }
        });
        console.log("mybets:", this.mybets);
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
  clearBooks() {
    this.winnerBook = [];
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

