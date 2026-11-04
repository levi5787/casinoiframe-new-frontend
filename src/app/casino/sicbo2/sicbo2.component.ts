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
 * SIC BO 2 (`sicbo2`)
 * -----------------------------------------------------------------------------
 * Three-dice board: Small/Big (1:1), Odd/Even (1:1), total sums 4..17 (own
 * odds), Any Triple (30:1), single die 1..6, specific doubles (8:1), specific
 * triples (150:1) and two-dice combinations (5:1).
 * Board CSS ships in src/styles.css / responsive.css (`.sicbo-*`).
 * Dice pips reference `/img/dice/1..6.png`.
 * Live: casinodata('Casino','sicbo2') -> data.sub[] mapped onto the board model
 * by `sid` (see mapMarket); casinolast10 -> results; getResult -> result modal.
 */
@Component({
  selector: 'app-sicbo2',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './sicbo2.component.html',
  styleUrl: './sicbo2.component.css',
})
export class Sicbo2Component implements OnInit {
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

  results: any = [];
  mybets: any = [];
  mybooks: any = [];

  showbetform = false;
  betFor = '';
  betType = 'back';
  oddsType = '';
  odds: any = 0;
  stake: any = null;
  profit = 0;
  loss = 0;
  sid = 0;
  min: any = 0;
  max: any = 0;

  temprId = '';
  tempCards: any[] = [];   // the 3 dice values [d1,d2,d3]
  tempCardsRaw = '';       // raw `cards` string from the feed ("1,2,5")
  tempTotal: any = '';
  tempRaw: any;

  roundOpen = true;        // round-level betting state (false => whole board locks)
  liveCards: number[] = []; // current dice from t1.card

  dice = (n: number) => `/img/dice/${n}.png`;

  // --- board model: structure + standard Sic Bo payout ratios; rate/gstatus/min/max
  //     are overwritten per round from data.sub[] in mapMarket() ---
  smallBig = [
    { label: 'Small', sub: '4-10', rate: '1', oddstype: 'Small', sid: 1, gstatus: '1' },
    { label: 'Big', sub: '11-17', rate: '1', oddstype: 'Big', sid: 2, gstatus: '1' },
  ];
  oddEven = [
    { label: 'Odd', rate: '1', oddstype: 'Odd', sid: 3, gstatus: '1' },
    { label: 'Even', rate: '1', oddstype: 'Even', sid: 4, gstatus: '1' },
  ];
  anyTriple = { label: 'Any Triple', rate: '30', oddstype: 'AnyTriple', sid: 5, gstatus: '1' };
  sums = [
    { n: 4, rate: '50' }, { n: 5, rate: '20' }, { n: 6, rate: '15' }, { n: 7, rate: '12' },
    { n: 8, rate: '8' }, { n: 9, rate: '6' }, { n: 10, rate: '6' }, { n: 11, rate: '6' },
    { n: 12, rate: '6' }, { n: 13, rate: '8' }, { n: 14, rate: '12' }, { n: 15, rate: '15' },
    { n: 16, rate: '20' }, { n: 17, rate: '50' },
  ].map((s) => ({ ...s, label: 'Total ' + s.n, oddstype: 'Sum' + s.n, sid: 100 + s.n, gstatus: '1', min: 0, max: 0 }));
  // desktop board splits the totals row around the "Any Triple" box (4-10 | AnyTriple | 11-17)
  sumsLow = this.sums.slice(0, 7);
  sumsHigh = this.sums.slice(7);
  singles = [1, 2, 3, 4, 5, 6].map((n) => ({ n, label: 'Single ' + n, oddstype: 'Single' + n, sid: 200 + n, gstatus: '1' }));
  doubles = [1, 2, 3, 4, 5, 6].map((n) => ({ n, label: 'Double ' + n + '-' + n, rate: '8', oddstype: 'Double' + n, sid: 300 + n, gstatus: '1' }));
  triples = [1, 2, 3, 4, 5, 6].map((n) => ({ n, label: 'Triple ' + n + '-' + n + '-' + n, rate: '150', oddstype: 'Triple' + n, sid: 400 + n, gstatus: '1' }));
  combos = (() => {
    const out: any[] = [];
    for (let a = 1; a <= 6; a++) for (let b = a + 1; b <= 6; b++) {
      out.push({ a, b, label: `Two Dice ${a}-${b}`, rate: '5', oddstype: `Combo${a}${b}`, sid: 500 + a * 10 + b, gstatus: '1' });
    }
    return out;
  })();

  bookMap: { [k: string]: number } = {};

  protected readonly CODE = 'sicbo2';
  protected readonly NAME = 'Sic Bo 2';

  constructor(
    private _sanitizer: DomSanitizer,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private match_service: MatchService,
    private socket_service: SocketService,
    private userauth: UserauthService,
  ) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = window.pageYOffset >= this.sidebarTopOffset;
  }

  ngOnInit(): void {
    this.cvideoURL = this.match_service.getCasinoVideo();
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3090'); // TODO(data): real video channel id
    this.subscribeLiveData();
    this.placeBetButton();
  }

  ngOnDestroy() {
    this.socket_service.leavaAllRooms;
  }

  private removeDecimal(num: any): string {
    if (num === null || num === undefined || isNaN(Number(num))) return String(num ?? '');
    return parseFloat(num).toString();
  }

  /**
   * Live feed wiring (mirrors lucky7 / lucky6):
   *  - casinodata('Casino', CODE)  -> round meta + data.sub[] -> mapMarket()
   *  - casinolast10('Last10', CODE) -> this.results (last-10 strip)
   *  - updateCheck('User', username) -> balance + open-bet refresh
   */
  private subscribeLiveData(): void {
    this.socket_service.casinodata('Casino', this.CODE).subscribe((raw: any) => {
      const d = raw?.data;
      if (!d) return;

      // Feed shape (confirmed): flat `d` carries mid / lt / card / gtype and the
      // market in `d.sub[]`. (Older diamond games use `d.t1[0]` + `d.t2[]`.)
      const t1 = Array.isArray(d.t1) ? d.t1[0] : d;
      const rows: any[] = d.t2 || d.sub || [];

      this.data = d;

      const rg = String(t1?.gstatus ?? t1?.status ?? '').trim().toUpperCase();
      this.roundOpen = rg === '' || !['SUSPENDED', 'SUSPEND', 'CLOSE', 'CLOSED', '0', 'FALSE', 'NO'].includes(rg);

      // live dice from `card` ("1,2,5")
      this.liveCards = String(t1?.card ?? d?.card ?? '')
        .split(',').map((n: string) => parseInt(n, 10)).filter((n: number) => n >= 1 && n <= 6);

      const at = parseInt(String(t1?.autotime ?? t1?.lt ?? d?.lt ?? '0'), 10) || 0;
      if (this.beforeNum !== at) this.updateClock(at);
      this.beforeNum = at;
      this.autotime = at;

      const mid = t1?.mid ?? d?.mid ?? '';
      if (mid && this.roundId !== mid) {
        this.bookMap = {};
        this.mybets = [];
        this.getopenbet();
      }
      this.roundId = mid || this.roundId;

      this.mapMarket(rows);
    });

    this.socket_service.casinolast10('Last10', this.CODE).subscribe((raw: any) => {
      const list = raw?.data?.res ?? raw?.data ?? [];
      if (Array.isArray(list) && list.length) this.results = list.slice(0, 10);
    });

    setTimeout(() => {
      this.getopenbet();
      setTimeout(() => this.getopenbet(), 2000);
    }, 1500);

    this.socket_service.updateCheck('User', this.userauth.getUsername()).subscribe((u: any) => {
      if (u?.update) {
        this.userauth.getUserBalance();
        this.getopenbet();
      }
    });
  }

  /**
   * Map the live `sub[]` rows onto the board model. `sid` is the stable key
   * (confirmed layout below); `nat` is the fallback. Row fields: `b` = back rate,
   * `bs` = back bet-size cap, `min`/`max` = stake range, `gstatus` OPEN|SUSPENDED.
   *
   *   sid  1     -> Small          sid 18..31 -> Total 4..17
   *   sid  2     -> Big            sid 32..46 -> Combination (1&2 … 5&6)
   *   sid  3     -> Any Triple     sid 47..52 -> Single 1..6
   *   sid  4/5   -> Odd / Even
   *   sid  6..11 -> Double 1..6
   *   sid 12..17 -> Triple 1..6
   */
  private mapMarket(rows: any[]): void {
    if (!Array.isArray(rows) || !rows.length) return;
    const norm = (s: any) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
    const natOf = (r: any) => norm(r?.nat ?? r?.nation ?? r?.slidingtext);
    const mapped = new Set<number>();
    const apply = (target: any, sid: number, ...names: string[]) => {
      if (!target) return;
      const wanted = names.map(norm);
      const row = rows.find((r: any) => Number(r?.sid) === sid) || rows.find((r: any) => wanted.includes(natOf(r)));
      if (!row) return;
      mapped.add(sid);
      // carry the feed identity so placed bets are keyed to the backend / result
      target.sid = row.sid;
      target.betfor = row.nat;
      target.rate = this.removeDecimal(row.b ?? row.rate ?? row.odds ?? target.rate);
      target.gstatus = String(row.gstatus ?? row.status ?? '1');
      target.min = row.min ?? this.min;
      target.max = row.max ?? this.max;
      target.bs = row.bs ?? row.max ?? '';
    };

    apply(this.smallBig[0], 1, 'Small');
    apply(this.smallBig[1], 2, 'Big');
    apply(this.anyTriple, 3, 'Any Triple');
    apply(this.oddEven[0], 4, 'Odd');
    apply(this.oddEven[1], 5, 'Even');
    this.doubles.forEach((s, i) => apply(s, 6 + i, 'Double ' + s.n));
    this.triples.forEach((s, i) => apply(s, 12 + i, 'Triple ' + s.n));
    this.sums.forEach((s, i) => apply(s, 18 + i, 'Total ' + s.n)); // sums[] is n = 4..17
    this.combos.forEach((c, i) => apply(c, 32 + i, `Combination ${c.a} and ${c.b}`)); // combos[] is 1&2,1&3,…,5&6
    this.singles.forEach((s, i) => apply(s, 47 + i, 'Single ' + s.n));

    const total = 5 + this.doubles.length + this.triples.length + this.sums.length + this.combos.length + this.singles.length;
    if (mapped.size < total) {
      console.warn(`[${this.CODE}] mapMarket: only ${mapped.size}/${total} board items mapped from ${rows.length} rows`);
    }
  }

  bet(content: any, item: any) {
    this.showbetform = true;
    this.betFor = item.betfor ?? item.label;   // feed `nat` — what the backend/result settle against
    this.odds = item.rate;
    this.betType = 'back';
    this.oddsType = item.oddstype;
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
  calcProfit() {
    this.profit = this.stake ? Math.round(this.stake * this.odds * 100) / 100 : 0;
  }

  submitbet() {
    this.placeLoader = true;
    const dt = {
      roundid: this.roundId, matchcode: this.CODE, matchname: this.NAME,
      betfor: this.betFor, bettype: 'back', oddstype: this.oddsType,
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

  getopenbet() {
    this.userauth.getCasinoOpenBet(this.CODE, this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.bookMap = {};
        (this.mybets || []).forEach((b: any) => {
          this.bookMap[b.oddsType] = (this.bookMap[b.oddsType] || 0) + b.stake;
        });
      },
      error: (e) => console.log(e),
    });
  }

  open(content: any) {
    this.modalService.open(content, { size: 'lg' });
  }
  openResult(content: any, rid: any) {
    this.loader = true;
    this.match_service.getResult(rid).subscribe({
      next: (winnerdata: any) => {
        this.loader = false;
        this.modalService.open(content, { size: 'xl' });
        const r = winnerdata['data']?.[0] || {};
        this.tempRaw = r;
        this.temprId = rid;
        // `cards` is a comma list of the 3 dice ("1,2,5")
        this.tempCardsRaw = String(r.cards ?? r.card ?? r.desc ?? '').trim();
        this.tempCards = this.tempCardsRaw
          .split(',')
          .map((c: string) => parseInt(c, 10))
          .filter((n: number) => n >= 1 && n <= 6);
        const sum = this.tempCards.reduce((a: number, b: number) => a + b, 0);
        this.tempTotal = (r.win ?? '') !== '' ? r.win : (sum || '');
      },
      error: () => (this.loader = false),
    });
  }

  /** DD/MM/YYYY HH:MM:SS decoded from the trailing YYMMDDHHMMSS of a round id. */
  matchTime(rid: any): string {
    const s = String(rid ?? '').replace(/\D/g, '').slice(-12);
    if (s.length < 12) return '';
    return `${s.slice(4, 6)}/${s.slice(2, 4)}/20${s.slice(0, 2)} ${s.slice(6, 8)}:${s.slice(8, 10)}:${s.slice(10, 12)}`;
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

  /**
   * A box is suspended when the round is closed or its `gstatus` is not an active
   * token (`'1'` / `'OPEN'` / `'ACTIVE'` / `'TRUE'`). Feed uses `'OPEN'` / `'SUSPENDED'`.
   */
  isSuspended(item: any): boolean {
    if (!this.roundOpen) return true;
    const g = String(item?.gstatus ?? '').trim().toUpperCase();
    return !(g === '1' || g === 'OPEN' || g === 'ACTIVE' || g === 'TRUE');
  }

  /**
   * Last-10 strip helpers. `casinolast10` payload (confirmed) is
   * `data.res[] = { mid, win }` where `win` is the winning 3-dice TOTAL (3-18).
   * Colour: Small (<=10) / Big (>=11); totals 3 and 18 are guaranteed triples.
   */
  resultTotal(item: any): number | null {
    const n = parseInt(String(item?.win ?? item?.total ?? item?.result ?? '').trim(), 10);
    return n >= 3 && n <= 18 ? n : null;
  }
  resultText(item: any): string {
    const n = this.resultTotal(item);
    return n !== null ? String(n) : (String(item?.win ?? item?.result ?? '').trim() || 'R');
  }
  resultClass(item: any): string {
    const n = this.resultTotal(item);
    if (n === 3 || n === 18) return 'result-d';
    if (n === null) return 'result-b';
    return n <= 10 ? 'result-a' : 'result-b';
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
