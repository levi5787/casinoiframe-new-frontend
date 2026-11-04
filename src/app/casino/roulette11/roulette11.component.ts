import { Component, HostListener, OnInit, } from '@angular/core';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { SocketService } from '../../services/socket.service';
import { MatchService } from '../../services/match.service';
import { UserauthService } from '../../services/userauth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-roulette11',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './roulette11.component.html',
  styleUrl: './roulette11.component.css'
})
export class Roulette11Component {

  isSticky = false; sidebarTopOffset = 124; placebetButton: any = []; cvideoURL: any;
  data: any; safeURL: any; autotime = 0; clock: any; beforeNum = 0; mybets: any = []; mybooks: any = [];
  sub: any; sub2: any; roundId = ""; min: any; max: any; results: any = []; winCard: any;
  temptime = ""; bettab = false; gametab = true; loader = false; placeLoader = false; userButtons: any = {}; setButtonTab = 'casino';

  backlayTab = "back"; statistics: any = [];
  betFor = ""; betType = ""; odds = ""; showbetform = false; stake: any = null; profit = 0; oddsType = ""; sid = 0;
  tempCards: any = []; tempWinner: any = ""; temprId = ""; tempOdd: any = ""; tempCard: any = ""; tempLine: any = ""; tempColour: any = "";
  cfirstnum = 0; clastnum = 0; flipfirst = false; flipsecond = false;

  selectedCoin: number | null = null;
  blackCards: any = ["02", "04", "06", "08", "10", "11", "13", "15", "17", "20", "22", "24", "26", "28", "29", "31", "33", "35"];
  isHovered: string[] = []; lossAmount: any;
  selectionCoin: number | null = null;
  lossMap: { [key: string]: number } = {};
  backMap: { [key: string]: number } = {};
  layMap: { [key: string]: number } = {}
  hoverMap: { [key: string]: string[] } = {
    // 0
    "1": ["0"],
    // 1
    "38": ["0", "1"],
    "2": ["1"],
    "110": ["0", "1", "2", "3"],
    "74": ["1", "2"],
    // 2
    "39": ["0", "1"],
    "3": ["2"],
    "145": ["0", "1", "2"],
    "75": ["2", "3"],
    // 3
    "40": ["0", "3"],
    "4": ["3"],
    "146": ["0", "2", "3"],
    "98": ["1", "2", "3"],
    // 4
    "41": ["1", "4"],
    "5": ["4"],
    "76": ["4", "5"],
    // 5
    "52": ["2", "5"],
    "6": ["5"],
    "111": ["1", "2", "4", "5"],
    "77": ["5", "6"],
    // 6
    "63": ["3", "6"],
    "7": ["6"],
    "112": ["2", "3", "5", "6"],
    "99": ["4", "5", "6"],
    // 7
    "42": ["4", "7"],
    "8": ["7"],
    "78": ["7", "8"],
    // 8
    "53": ["5", "8"],
    "9": ["8"],
    "113": ["4", "5", "7", "8"],
    "79": ["8", "9"],
    // 9
    "64": ["6", "9"],
    "10": ["9"],
    "114": ["5", "6", "8", "9"],
    "100": ["7", "8", "9"],
    // 10
    "43": ["7", "10"],
    "11": ["10"],
    "80": ["10", "11"],
    // 11
    "54": ["8", "11"],
    "12": ["11"],
    "115": ["7", "8", "9", "10"],
    "81": ["11", "12"],
    // 12
    "65": ["9", "12"],
    "13": ["12"],
    "116": ["8", "9", "11", "12"],
    "101": ["10", "11", "12"],
    // 13
    "44": ["10", "13"],
    "14": ["13"],
    "82": ["13", "14"],
    // 14
    "55": ["11", "14"],
    "15": ["14"],
    "117": ["10", "11", "13", "14"],
    "83": ["14", "15"],
    // 15
    "66": ["13", "15"],
    "16": ["15"],
    "118": ["11", "12", "14", "15"],
    "102": ["13", "14", "15"],
    // 16
    "45": ["13", "16"],
    "17": ["16"],
    "84": ["16", "17"],
    // 17
    "56": ["14", "17"],
    "18": ["17"],
    "119": ["13", "14", "16", "17"],
    "85": ["17", "18"],
    // 18
    "67": ["13", "18"],
    "19": ["18"],
    "120": ["14", "15", "17", "18"],
    "103": ["16", "17", "18"],
    // 19
    "46": ["16", "19"],
    "20": ["19"],
    "86": ["19", "20"],
    //35
    "97": ["36", "35"],
    "131": ["31", "32", "34", "35"],
    "36": ["35"],
    "62": ["32", "35"],
    //36
    "73": ["33", "36"],
    "132": ["35", "36", "32", "33"],
    "37": ["36"],
    "109": ["36", "35", "34"],
    //34
    "51": ["31", "34"],
    "35": ["34"],
    "96": ["34", "35"],
    //31
    "50": ["31", "28"],
    "32": ["31"],
    "94": ["31", "32"],
    //32
    "61": ["29", "32"],
    "129": ["29", "28", "31", "32"],
    "33": ["32"],
    "95": ["32", "33"],
    //33
    "72": ["30", "33"],
    "34": ["33"],
    "130": ["33", "30", "29", "32"],
    "108": ["32", "33", "31"],
    //28
    "49": ["25", "28"],
    "29": ["28"],
    "92": ["28", "29"],
    //29
    "60": ["26", "29"],
    "30": ["29"],
    "127": ["26", "29", "25", "28"],
    "93": ["29", "30", "31"],
    //30
    "71": ["27", "30"],
    "31": ["30"],
    "128": ["29", "26", "27", "30"],
    "107": ["29", "30", "28"],
    //25
    "48": ["22", "25"],
    "26": ["25"],
    "90": ["25", "26"],
    //26
    "59": ["23", "26"],
    "27": ["26"],
    "125": ["22", "26", "25", "23"],
    "91": ["26", "27"],
    //27
    "70": ["24", "27"],
    "28": ["27"],
    "126": ["24", "26", "27", "23"],
    "106": ["25", "26", "27"],
    //22
    "47": ["19", "22"],
    "23": ["22"],
    "88": ["22", "23"],
    //23
    "58": ["20", "23"],
    "24": ["23"],
    "123": ["19", "20", "22", "23"],
    "89": ["23", "24"],
    //24
    "69": ["21", "24"],
    "25": ["24"],
    "124": ["20", "21", "24", "23"],
    "105": ["22", "23", "24"],
    //21
    "68": ["18", "21"],
    "22": ["21"],
    "122": ["17", "18", "20", "21"],
    "104": ["19", "20", "21"],
    //20
    "57": ["17", "20"],
    "21": ["20"],
    "121": ["17", "16", "20", "19"],
    "87": ["20", "21"],
    //1st12
    "133": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    //2nd12
    "134": ["13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "22", "24"],
    //3rd12
    "135": ["25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36"],
    //1-18
    "139": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"],
    //19-36
    "140": ["19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36"],
    //2to1 1st 
    "138": ["3", "6", "9", "12", "15", "18", "21", "24", "27", "30", "33", "36"],
    //2to1 2nd 
    "137": ["2", "5", "8", "11", "14", "17", "20", "23", "26", "29", "32", "35"],
    //2to1 3rd 
    "136": ["1", "4", "7", "10", "13", "16", "19", "22", "25", "28", "31", "34"],
    //even
    "144": ["2", "4", "6", "8", "10", "12", "14", "16", "18", "20", "22", "24", "26", "28", "30", "32", "34", "36"],
    //odd
    "143": ["1", "3", "5", "7", "9", "11", "13", "15", "17", "19", "21", "23", "25", "27", "29", "31", "33", "35"],
    //red
    "141": ["1", "3", "5", "7", "9", "12", "14", "16", "18", "19", "21", "23", "25", "27", "30", "32", "34", "36"],
    //black
    "142": ["2", "4", "6", "8", "10", "11", "13", "15", "17", "20", "22", "24", "26", "28", "29", "31", "33", "35"]
  };

  constructor(
    private _sanitizer: DomSanitizer,
    private socket_service: SocketService,
    private match_service: MatchService,
    private userauth: UserauthService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = (window.pageYOffset >= this.sidebarTopOffset);
    //console.log(this.sidebarTopOffset)
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo()
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3078');
    this.socket_service.casinodata('Casino', 'roulette11').subscribe((data: any) => {
      this.data = data['data'];
      if (data) {
        this.autotime = parseInt(data['data']['lt']);
        if (this.beforeNum != this.autotime) {
          this.updateClock(this.autotime);
        }
        this.beforeNum = this.autotime;
        //code for flipclock end
        if (this.roundId != data['data']['mid']) {
          this.clearBooks(); this.mybets = [];
        }
        this.roundId = data['data']['mid'];
        this.min = data['data']['min'];
        this.max = data['data']['max'];

        this.winCard = data['data']['card'];

        this.sub = data['data']['sub'];
        this.sub2 = data['data']['sub2'];
        //console.log(this.winCard)
      }
    })
    this.socket_service.casinolast10('Last10', 'roulette11').subscribe((resultdata: any) => {
      if (resultdata) {
        this.results = resultdata['data'].res;
        this.statistics = resultdata['data']?.g;
        //console.log(this.statistics);
      }
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
    this, this.placeBetButton();
  }

  ngOnDestroy() {
    this.socket_service.leavaAllRooms;
  }
  trackByFunc(index: number, item: any) {
    return item.sid;
  }
  open(content: any) {
    this.modalService.open(content, { size: 'lg' });
  }

  openResult(content: any, rid: any) {
    this.loader = true;
    this.match_service.getResult(rid).subscribe((winnerdata: any) => {
      this.loader = false;
      this.modalService.open(content, { size: 'xl' });

      //console.log(winnerdata);

      const result = winnerdata.data?.[0];

      if (result) {
        this.temprId = result.rid;
        this.temptime = result.mtime;
        this.tempWinner = result.win;
      } else {
        console.error("No game result found.");
      }
    });
  }

  getOddsTypeByKey(key: string): string {
    const numbers = this.hoverMap[key]; // get array of numbers for the key

    if (!numbers) return "UNKNOWN";

    const length = numbers.length;

    // Single number
    if (length === 1) return "SINGLE";

    // Split (2 numbers)
    if (length === 2) return "SPLIT";

    // Street (3 numbers)
    if (length === 3) return "STREET";

    // Corner (4 numbers)
    if (length === 4) return "CORNER";

    // Special bets
    switch (key) {
      case "133": return "1ST12";
      case "134": return "2ND12";
      case "135": return "3RD12";
      case "136": return "2TO1_1ST";
      case "137": return "2TO1_2ND";
      case "138": return "2TO1_3RD";
      case "139": return "1TO18";
      case "140": return "19TO36";
      case "141": return "RED";
      case "142": return "BLACK";
      case "143": return "ODD";
      case "144": return "EVEN";
      default: return "UNKNOWN";
    }
  }

  undoBet() {
    this.selectedCoin = null;
  }

  submitbet(boardId: string, bettype: string, betFor: string, odds: number, sid: number) {
    if (!this.selectedCoin) {
      this.toastr.error("Please select a coin before placing a bet.", '', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        closeButton: true
      });
      return;
    }
    const numbers = this.hoverMap[boardId];
    if (!numbers || numbers.length === 0) {
      return;
    }


    // Build payload
    const payload = {
      roundid: this.roundId,
      matchcode: 'roulette11',
      matchname: 'Golden Roulette',
      betfor: betFor,
      bettype: bettype,
      oddstype: boardId,
      odds: odds,
      stake: this.selectedCoin,
      sid: sid
    };

    // console.log(payload)
    // return;

    // Send to backend
    this.userauth.placeCasinoBet(payload).subscribe({
      next: (res: any) => {
        this.toastr.success(res.message, '', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          closeButton: true
        });
        this.getopenbet(); // refresh bets
        this.userauth.getUserBalance(); // update balance
      },
      error: (err: any) => {
        this.toastr.error(err.error?.message || "Bet failed.", '', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          closeButton: true
        });
      }
    });
  }
  getSubItem(boardId: number) {
    return this.sub.find((s: any) => s.i === boardId);
  }
  getopenbet() {
    this.userauth.getCasinoOpenBet("roulette11", this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        console.log(res)
        this.mybooks = res.books;
        console.log(this.mybooks)

        // Build a reactive loss map
        this.backMap = {};
        this.layMap = {};
        this.mybets.forEach((bet: any) => {
          if (bet.betType == 'back') {
            this.backMap[bet.oddsType] = (this.backMap[bet.oddsType] || 0) + bet.stake
          } else if (bet.betType === 'lay') {
            this.layMap[bet.oddsType] = (this.layMap[bet.oddsType] || 0) + bet.stake;
          }
        });

        //console.log("Updated Loss Map:", this.lossMap);
      },
      error: (e) => console.log(e)
    });
  }

  getBookAmount(id: string) {
    return this.lossMap[id] ?? null;
  }


  getColorByAmount(amount: number): string {
    if (!amount || amount >= 0) return '#138cf5';  // default
    const absAmount = Math.abs(amount);

    if (absAmount <= 100) return '#00ddff';
    if (absAmount <= 500) return '#99cc00';
    if (absAmount <= 1000) return '#ffaa00';
    return '#aa66cc';
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
  clearBooks() {
    this.mybooks = [];
    this.lossMap = {};
    this.layMap = {};
    this.backMap = {};  
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

  selectCoin(value: number) {
    this.selectedCoin = value;
  }

  // onMouseEnter(id: string | string[]) {
  //   if (Array.isArray(id)) {
  //     this.isHovered = id;
  //   } else if (this.hoverMap[id]) {
  //     this.isHovered = this.hoverMap[id];
  //   } else {
  //     this.isHovered = [id];
  //   }
  // }
  onMouseEnter(id: string | string[]) {
    let targets: string[] = [];

    if (Array.isArray(id)) {
      targets = id;
    } else if (this.hoverMap[id]) {
      targets = this.hoverMap[id];
    } else {
      targets = [id];
    }

    // filter out locked cells
    this.isHovered = targets.filter(cellId => this.sub[cellId]?.s === 1);
  }

  onMouseLeave() {
    this.isHovered = [];
  }

  changeblTab(name: any) {
    this.backlayTab = name;
  }

}
