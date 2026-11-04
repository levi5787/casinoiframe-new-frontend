import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { MatchService } from '../../services/match.service';
import { SocketService } from '../../services/socket.service';
import { UserauthService } from '../../services/userauth.service';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';

/**
 * Trio (`trio`)
 * -----------------------------------------------------------------------------
 * One shared 3-card hand is dealt; every bet is a property of that same hand
 * (session total, red/black count, odd/even count, or the hand rank). Board is
 * a generic `groups` model: groups[] = { title, items: [{ label, rate, lay?,
 * sid, oddstype, gstatus, min, max }] }. Live-wired; see subscribeLiveData().
 * The "Session" item is special: `rate`/`lay` are the session LINE (21, from
 * the in-app Rules), and `volBack`/`volLay` are the actual tradeable back/lay
 * prices (confirmed live via the feed's bbhav/lbhav fields, which matched the
 * board's own pre-existing "80"/"100" volume numbers exactly).
 */
@Component({
  selector: 'app-trio',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './trio.component.html',
  styleUrl: './trio.component.css',
})
export class TrioComponent implements OnInit {
  gametab = true;
  bettab = false;
  loader = false;
  placeLoader = false;
  isSticky = false;
  sidebarTopOffset = 124;
  setButtonTab = 'casino';
  userButtons: any = {};
  placebetButton: any = [];

  cvideoURL: any;
  safeURL: any;
  data: any;
  roundId = '';
  autotime = 0;
  beforeNum = 0;
  cfirstnum = 0;
  clastnum = 0;
  flipfirst = false;
  flipsecond = false;

  cardsTop = ["/img/cards/1.png", "/img/cards/1.png", "/img/cards/1.png"];
  results: any = [];
  mybets: any = [];
  mybooks: any = [];

  showbetform = false;
  betFor = '';
  betType = 'back';
  oddsType = '';
  /** Session uses the bookmaker/fancy-style rate/100 profit factor, not decimal odds - see calcProfit(). */
  isSessionBet = false;
  odds: any = 0;
  stake: any = null;
  profit = 0;
  loss = 0;
  sid = 0;
  min: any = 0;
  max: any = 0;

  temprId = '';
  tempMatchTime = '';
  tempWinner: any = '';
  tempCards: any = [];
  tempSessionDesc = '';
  tempJudgeDesc = '';
  tempRedBlackDesc = '';
  tempOddEvenDesc = '';
  tempPatternDesc = '';

  /** sid/label/order confirmed live (console-verified) */
  groups: any[] = [
  {
    "title": "Session",
    "items": [
      { "label": "Session", "rate": "0", "lay": "0", "volBack": "0", "volLay": "0", "oddstype": "Session", "sid": 1, "gstatus": "1", "min": 100, "max": 100000 }
    ]
  },
  {
    "title": "3 Card Judgement",
    "items": [
      { "label": "1 2 4", "rate": "0", "lay": "0", "oddstype": "Judge124", "sid": 2, "gstatus": "1", "min": 100, "max": 100000 },
      { "label": "J Q K", "rate": "0", "lay": "0", "oddstype": "JudgeJQK", "sid": 3, "gstatus": "1", "min": 100, "max": 100000 }
    ]
  },
  {
    "title": "Pairs",
    "items": [
      { "label": "Two Red Only", "rate": "0", "lay": "0", "oddstype": "TwoRed", "sid": 4, "gstatus": "1", "min": 100, "max": 100000 },
      { "label": "Two Black Only", "rate": "0", "lay": "0", "oddstype": "TwoBlack", "sid": 5, "gstatus": "1", "min": 100, "max": 100000 },
      { "label": "Two Odd Only", "rate": "0", "lay": "0", "oddstype": "TwoOdd", "sid": 6, "gstatus": "1", "min": 100, "max": 100000 },
      { "label": "Two Even Only", "rate": "0", "lay": "0", "oddstype": "TwoEven", "sid": 7, "gstatus": "1", "min": 100, "max": 100000 }
    ]
  },
  {
    "title": "Hand",
    "items": [
      { "label": "Pair", "rate": "0", "oddstype": "Pair", "sid": 8, "gstatus": "1", "min": 100, "max": 50000 },
      { "label": "Flush", "rate": "0", "oddstype": "Flush", "sid": 9, "gstatus": "1", "min": 100, "max": 50000 },
      { "label": "Straight", "rate": "0", "oddstype": "Straight", "sid": 10, "gstatus": "1", "min": 100, "max": 50000 },
      { "label": "Trio", "rate": "0", "oddstype": "Trio", "sid": 11, "gstatus": "1", "min": 100, "max": 50000 },
      { "label": "Straight Flush", "rate": "0", "oddstype": "StraightFlush", "sid": 12, "gstatus": "1", "min": 100, "max": 50000 }
    ]
  }
];

  protected readonly CODE = 'trio';
  protected readonly NAME = 'Trio';

  constructor(
    private _sanitizer: DomSanitizer,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private match_service: MatchService,
    private socket_service: SocketService,
    private userauth: UserauthService,
  ) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = window.pageYOffset >= this.sidebarTopOffset;
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo();
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3010'); // TODO(data)
    this.subscribeLiveData();
    this.placeBetButton();
  }

  ngOnDestroy() {
    this.socket_service.leavaAllRooms;
  }

  /**
   * Confirmed feed shape (console-verified): flat `data` = { mid, lt, card (3
   * cards, one shared hand; undealt = "1"), gtype:"trio", sub: [
   *   sid 1     nat:"Session"                       subtype "trio"       (rate/lay ARE the session
   *             line, e.g. 21; bbhav/lbhav are the real back/lay prices for that line)
   *   sid 2/3   nat:"3 Card Judgement(1 2 4)"/"(J Q K)" subtype "124"/"jqk1" (back+lay)
   *   sid 4-7   nat:"Two Red/Black/Odd/Even Only"    subtype "red2" etc.  (back+lay)
   *   sid 8-12  nat:"Pair"/"Flush"/"Straight"/"Trio"/"Straight Flush"       (back only)
   * ] }. gstatus is "OPEN"/"SUSPENDED". casinolast10 rows are { mid, win } — win stayed "0" for
   * every round observed (most 3-card hands are plain high-card, i.e. no named hand), so its
   * non-zero meaning is unconfirmed; the raw value is passed through as-is rather than guessed.
   */
  private subscribeLiveData(): void {
    this.socket_service.casinodata('Casino', this.CODE).subscribe((raw: any) => {
      const d = raw?.data;
      if (!d) return;
      this.data = d;

      const at = parseInt(String(d.lt ?? '0'), 10) || 0;
      if (this.beforeNum !== at) this.updateClock(at);
      this.beforeNum = at;
      this.autotime = at;

      const mid = d.mid ?? '';
      if (mid && this.roundId !== mid) { this.mybets = []; this.mybooks = []; this.roundId = mid; this.getopenbet(); }
      this.roundId = mid || this.roundId;

      const cards = String(d.card ?? '').split(',').map((c: string) => c.trim());
      this.cardsTop = cards.map((c) => '/img/cards-new/' + (c || '1') + '.png');

      const rows: any[] = d.sub || [];
      const bySid = (sid: number) => rows.find((r: any) => Number(r.sid) === sid);
      this.groups.forEach((g) => g.items.forEach((item: any) => {
        const row = bySid(item.sid);
        if (!row) return;
        item.rate = row.b ?? item.rate;
        if (item.oddstype === 'Session') {
          item.lay = row.l ?? item.lay;
          item.volBack = row.bbhav ?? item.volBack;
          item.volLay = row.lbhav ?? item.volLay;
        } else if (row.l !== undefined) {
          item.lay = row.l ?? item.lay;
        }
        item.gstatus = String(row.gstatus ?? '1');
        item.min = row.min ?? item.min;
        item.max = row.bs ?? row.max ?? item.max;
      }));
    });

    this.socket_service.casinolast10('Last10', this.CODE).subscribe((raw: any) => {
      const list = raw?.data?.res ?? raw?.data ?? [];
      // trio's Last10 rows only carry { mid, win }, and win stays "0" for every round observed
      // (see openResult()'s rdesc parse below) - there's no single letter that can summarize a
      // multi-attribute hand (session/judge/red-black/odd-even/pattern), so the strip is just a
      // uniform "R" (Result) button per round that opens that round's detail - confirmed against
      // the live site's own markup (every badge is `<span class="result result-b">R</span>`).
      if (Array.isArray(list) && list.length) this.results = list.slice(0, 10).map((r: any) => ({ mid: r.mid }));
    });

    setTimeout(() => { this.getopenbet(); setTimeout(() => this.getopenbet(), 2000); }, 1500);

    this.socket_service.updateCheck('User', this.userauth.getUsername()).subscribe((u: any) => {
      if (u?.update) { this.userauth.getUserBalance(); this.getopenbet(); }
    });
  }

  isSuspended(item: any): boolean {
    const g = String(item?.gstatus ?? '').trim().toUpperCase();
    return !(g === '1' || g === 'OPEN' || g === 'ACTIVE' || g === 'TRUE');
  }

  bet(content: any, item: any, type: 'back' | 'lay' = 'back') {
    const isSession = item.oddstype === 'Session';
    this.isSessionBet = isSession;
    this.showbetform = true;
    this.betFor = isSession ? item.label + ' ' + item.rate : item.label;
    this.odds = isSession ? (type === 'lay' ? item.volLay : item.volBack) : (type === 'lay' ? (item.lay ?? item.rate) : item.rate);
    this.betType = type;
    this.oddsType = item.oddstype || item.label;
    this.sid = item.sid || 0;
    this.min = item.min || 100;
    this.max = item.max || 100000;
    this.stake = null;
    this.profit = 0;
    this.loss = 0;
    if (window.innerWidth < 1100) this.modalService.open(content);
  }
  hideBetPlace() {
    this.showbetform = false;
  }
  placeStake(val: number) {
    this.stake = (this.stake || 0) + val;
    this.calcProfit();
  }
  resetStake() {
    this.stake = null;
    this.profit = 0;
    this.loss = 0;
  }
  /** Session is a bookmaker/fancy-style market: bbhav/lbhav are prices out of 100 (e.g. 80 ->
   * 0.80x), not decimal odds - same convention as superover3's Fancy markets. Every other
   * trio market uses standard decimal odds (profit factor = odds - 1). */
  calcProfit() {
    const factor = this.isSessionBet ? this.odds / 100 : this.odds - 1;
    this.profit = this.stake ? Math.round(this.stake * factor * 100) / 100 : 0;
  }

  submitbet() {
    this.placeLoader = true;
    const dt = {
      roundid: this.roundId, matchcode: this.CODE, matchname: this.NAME,
      betfor: this.betFor, bettype: this.betType, oddstype: this.oddsType,
      odds: this.odds, stake: this.stake, sid: this.sid,
    };
    this.userauth.placeCasinoBet(dt).subscribe({
      next: (res: any) => {
        this.placeLoader = false; this.showbetform = false;
        this.displayToast(res.message, res.status);
        this.getopenbet(); this.userauth.getUserBalance(); this.modalService.dismissAll();
      },
      error: (e) => {
        this.placeLoader = false; this.showbetform = false;
        this.displayToast(e.error?.message || 'Bet failed', 'failed'); this.modalService.dismissAll();
      },
    });
  }

  /**
   * Session/Judge124/JudgeJQK/TwoRed/TwoBlack/TwoOdd/TwoEven are netted single back+lay
   * propositions -> `book` is a [{selectionName,amount}] array there. Pair/Flush/Straight/
   * Trio/StraightFlush are independent back-only props -> `book` is a plain positive
   * exposure number there, shown negated as a liability (same convention as dolidana).
   */
  bookAmount(oddsType: string, selectionName?: string): number {
    const row = (this.mybooks || []).find((b: any) => b.oddsType === oddsType);
    if (!row) return 0;
    if (Array.isArray(row.book)) {
      const entry = row.book.find((m: any) => m.selectionName === selectionName);
      return entry ? entry.amount : 0;
    }
    return typeof row.book === 'number' ? -row.book : 0;
  }

  getopenbet() {
    this.userauth.getCasinoOpenBet(this.CODE, this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
      },
      error: (e) => console.log(e),
    });
  }

  open(content: any) {
    this.modalService.open(content, { size: 'lg' });
  }
  /**
   * `/casino/getresult/:roundid` returns `t1.rdesc`, a single '#'-joined string with the 5
   * result-modal rows already computed by the vendor, e.g. "Yes (25)#1 2 4  |  J Q K##Even#Pair"
   * (Session desc, Judge desc, Red/Black, Odd/Even, Pattern - confirmed live across many rounds,
   * including the empty-field cases: Judge/Pattern are blank when neither resolves, and Red/Black
   * is blank specifically when all 3 cards share one color, i.e. not a 2-1 split). Card field is
   * `t1.card` (singular), not `cards`.
   */
  openResult(content: any, rid: any) {
    this.loader = true;
    this.match_service.getResult(rid).subscribe({
      next: (winnerdata: any) => {
        this.loader = false;
        this.modalService.open(content, { size: 'xl' });
        const r = winnerdata['data']?.[0];
        this.temprId = rid;
        this.tempMatchTime = r?.mtime || winnerdata?.mtime || '';
        this.tempWinner = r?.win || '';
        this.tempCards = String(r?.card ?? r?.cards ?? '').split(',').map((c: string) => c.trim()).filter((c: string) => c && c !== '1');
        const parts = String(r?.rdesc ?? '').split('#');
        this.tempSessionDesc = parts[0] || '';
        this.tempJudgeDesc = parts[1] || '';
        this.tempRedBlackDesc = parts[2] || '';
        this.tempOddEvenDesc = parts[3] || '';
        this.tempPatternDesc = parts[4] || '';
      },
      error: () => (this.loader = false),
    });
  }

  updateClock(time: number) {
    if (time < 10) { this.cfirstnum = 0; this.clastnum = time; }
    else { const s = time.toString(); this.cfirstnum = parseInt(s.charAt(0)); this.clastnum = parseInt(s.charAt(1)); }
    this.flipsecond = true;
    setTimeout(() => this.flipNumber(), 500);
  }
  flipNumber() {
    this.flipfirst = false;
    this.flipsecond = false;
  }

  trackByFunc(index: number, item: any) { return item.sid ?? index; }
  trackByMid(index: number, item: any) { return item.mid ?? index; }
  twoDecimal(num: number) { return num ? num.toFixed(2) : 0.0; }
  gameTabClicked() { this.bettab = false; this.gametab = true; }
  betTabClicked() { this.bettab = true; this.gametab = false; }
  displayToast(msg: any, type: any) {
    const opts = { timeOut: 3000, positionClass: 'toast-top-center', closeButton: true };
    type === 'success' ? this.toastr.success(msg, '', opts) : this.toastr.error(msg, '', opts);
  }
  placeBetButton() {
    this.userauth.getButtons().subscribe({ next: (res: any) => (this.placebetButton = res.casinobutton), error: (e) => console.log(e) });
  }
  clickSetButtonTab(name: any) { this.setButtonTab = name; }
  openButtons(content: any) {
    this.userauth.getButtons().subscribe({
      next: (res) => { this.userButtons = res; this.modalService.open(content, { size: 'md' }); },
      error: (e) => console.log(e),
    });
  }
  updateButtons() {
    this.userauth.updateButtons(this.userButtons).subscribe({
      next: (res: any) => { this.displayToast(res.message, 'success'); this.modalService.dismissAll(); },
      error: (e) => { this.displayToast(e.error?.message || 'Update failed', 'failed'); this.modalService.dismissAll(); },
    });
  }
}
