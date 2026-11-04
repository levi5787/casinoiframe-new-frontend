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
 * Doli Dana (`dolidana`)
 * -----------------------------------------------------------------------------
 * Board is a generic `groups` model:
 *   groups[] = { title, items: [{ label, rate, lay?, sid, oddstype, gstatus }] }
 * flattened to `itemMap` (oddstype -> item) in ngOnInit. Live wiring:
 * casinodata('Casino','dolidana') -> data.sub[] mapped onto items by `sid`
 * (see mapMarket); casinolast10 -> results; getResult -> result modal.
 */
@Component({
  selector: 'app-dolidana',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './dolidana.component.html',
  styleUrl: './dolidana.component.css',
})
export class DolidanaComponent implements OnInit {
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
  /** the currently-active sub-round id (every market except Player A/B), shown in the header
   * since that's the round most bets are actually placed against - see mapMarket(). */
  subRoundId = '';
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
  /** the specific market's own round id (main id for Player A/B, current sub-round id for
   * every other market) - NOT the same as `roundId`, which stays the main id throughout. */
  betRoundId = '';
  odds: any = 0;
  stake: any = null;
  profit = 0;
  loss = 0;
  sid = 0;
  min: any = 0;
  max: any = 0;

  temprId = '';
  tempCards: any[] = [];    // the 2 dice values [d1,d2]
  tempDescRows: { label: string; value: string }[] = [];

  d1 = 0;                   // live drawn dice from t1
  d2 = 0;

  dice = (n: number) => `/img/dice/${n}.png`;

  /** oddstype -> board item, flattened from `groups` (filled in ngOnInit). */
  itemMap: { [k: string]: any } = {};
  allItems: any[] = [];

  /** board structure; item.rate/lay/gstatus/min/max/bs are set per round from data.sub[] */
  groups: any[] = [
  {
    "title": "Players",
    "items": [
      {
        "label": "Player A",
        "rate": "1.98",
        "oddstype": "PlayerA",
        "sid": 1
      },
      {
        "label": "Player B",
        "rate": "1.98",
        "oddstype": "PlayerB",
        "sid": 2
      }
    ]
  },
  {
    "title": "Pair / Odd / Even",
    "items": [
      {
        "label": "Any Pair",
        "rate": "3.5",
        "oddstype": "AnyPair",
        "sid": 3
      },
      {
        "label": "Odd",
        "rate": "1.9",
        "oddstype": "Odd",
        "sid": 4
      },
      {
        "label": "Even",
        "rate": "1.9",
        "oddstype": "Even",
        "sid": 5
      }
    ]
  },
  {
    "title": "Seven",
    "items": [
      {
        "label": "< 7",
        "rate": "2.0",
        "oddstype": "Under7",
        "sid": 6
      },
      {
        "label": "7",
        "rate": "5.0",
        "oddstype": "Seven",
        "sid": 7
      },
      {
        "label": "> 7",
        "rate": "2.0",
        "oddstype": "Over7",
        "sid": 8
      }
    ]
  },
  {
    "title": "Particular Pair",
    "items": [
      {
        "label": "1-1 Pair",
        "rate": "30",
        "oddstype": "Pair11",
        "sid": 11
      },
      {
        "label": "2-2 Pair",
        "rate": "30",
        "oddstype": "Pair22",
        "sid": 12
      },
      {
        "label": "3-3 Pair",
        "rate": "30",
        "oddstype": "Pair33",
        "sid": 13
      },
      {
        "label": "4-4 Pair",
        "rate": "30",
        "oddstype": "Pair44",
        "sid": 14
      },
      {
        "label": "5-5 Pair",
        "rate": "30",
        "oddstype": "Pair55",
        "sid": 15
      },
      {
        "label": "6-6 Pair",
        "rate": "30",
        "oddstype": "Pair66",
        "sid": 16
      }
    ]
  },
  {
    "title": "Sum Total",
    "items": [
      {
        "label": "Sum 2",
        "rate": "60",
        "oddstype": "Sum2",
        "sid": 22
      },
      {
        "label": "Sum 3",
        "rate": "30",
        "oddstype": "Sum3",
        "sid": 23
      },
      {
        "label": "Sum 4",
        "rate": "18",
        "oddstype": "Sum4",
        "sid": 24
      },
      {
        "label": "Sum 5",
        "rate": "12",
        "oddstype": "Sum5",
        "sid": 25
      },
      {
        "label": "Sum 6",
        "rate": "8",
        "oddstype": "Sum6",
        "sid": 26
      },
      {
        "label": "Sum 7",
        "rate": "6",
        "oddstype": "Sum7",
        "sid": 27
      },
      {
        "label": "Sum 8",
        "rate": "8",
        "oddstype": "Sum8",
        "sid": 28
      },
      {
        "label": "Sum 9",
        "rate": "12",
        "oddstype": "Sum9",
        "sid": 29
      },
      {
        "label": "Sum 10",
        "rate": "18",
        "oddstype": "Sum10",
        "sid": 30
      },
      {
        "label": "Sum 11",
        "rate": "30",
        "oddstype": "Sum11",
        "sid": 31
      },
      {
        "label": "Sum 12",
        "rate": "60",
        "oddstype": "Sum12",
        "sid": 32
      }
    ]
  }
];

  bookMap: { [k: string]: number } = {};

  protected readonly CODE = 'dolidana';
  protected readonly NAME = 'Doli Dana';

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
    this.groups.forEach((g) => (g.items || []).forEach((it: any) => {
      it.gstatus = it.gstatus ?? '1';
      this.itemMap[it.oddstype] = it;
      this.allItems.push(it);
    }));
    this.cvideoURL = this.match_service.getCasinoVideo();
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3091'); // TODO(data): real video channel id
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

  roundOpen = true; // round-level betting state from t1 (false => whole board locks)

  /**
   * A box is suspended when the round is closed OR its own gstatus is not one of
   * the active tokens (`'1'` / `'OPEN'` / `'ACTIVE'` / `'TRUE'`).
   */
  isSuspended(item: any): boolean {
    if (!this.roundOpen) return true;
    if (!Number(item?.rate)) return true; // no price (b == 0) => not bettable
    const g = String(item?.gstatus ?? '').trim().toUpperCase();
    return !(g === '1' || g === 'OPEN' || g === 'ACTIVE' || g === 'TRUE');
  }

  /**
   * Live feed wiring (mirrors sicbo):
   *  - casinodata('Casino', CODE)  -> round meta + data.sub[] -> mapMarket()
   *  - casinolast10('Last10', CODE) -> this.results (last-10 strip)
   *  - updateCheck('User', username) -> balance + open-bet refresh
   */
  private subscribeLiveData(): void {
    this.socket_service.casinodata('Casino', this.CODE).subscribe((raw: any) => {
      const d = raw?.data;
      if (!d) return;
      const t1 = Array.isArray(d.t1) ? d.t1[0] : d;
      const rows: any[] = d.t2 || d.sub || [];

      this.data = d;

      const rg = String(t1?.gstatus ?? t1?.status ?? '').trim().toUpperCase();
      this.roundOpen = rg === '' || !['SUSPENDED', 'SUSPEND', 'CLOSE', 'CLOSED', '0', 'FALSE', 'NO'].includes(rg);

      const at = parseInt(String(t1?.autotime ?? t1?.lt ?? d?.lt ?? '0'), 10) || 0;
      if (this.beforeNum !== at) this.updateClock(at);
      this.beforeNum = at;
      this.autotime = at;

      // dice: feed sends `card` as a comma list ("3,5") once the round resolves
      const dc = String(t1?.card ?? t1?.C1 ?? '').split(',').map((n: string) => parseInt(n, 10));
      this.d1 = dc[0] >= 1 && dc[0] <= 6 ? dc[0] : 0;
      this.d2 = dc[1] >= 1 && dc[1] <= 6 ? dc[1] : (parseInt(String(t1?.C2 ?? 0), 10) || 0);

      const mid = t1?.mid ?? d?.mid ?? '';
      // every Fancy row shares the same live sub-round `mid` at any moment (confirmed live).
      const newSubRoundId = rows.find((r: any) => r?.subtype && r.subtype !== 'main')?.mid;

      const mainChanged = !!mid && this.roundId !== mid;
      // a sub-round change is only meaningful (and only needs its own clear) when the main
      // round *didn't* also just change - a fresh main round's first sub-round isn't a
      // "change" from the (about to be reset) previous one, it's the initial value.
      const subChanged = !mainChanged && !!newSubRoundId && !!this.subRoundId && this.subRoundId !== newSubRoundId;

      this.roundId = mid || this.roundId;
      if (newSubRoundId) this.subRoundId = newSubRoundId;
      this.mapMarket(rows);

      // The just-concluded round's (main or sub) bets/books go stale - clear and refetch so
      // the display doesn't keep showing them. Set `this.roundId`/`subRoundId` to their NEW
      // values first (above) so the refetch below already filters against the right ids.
      if (mainChanged || subChanged) {
        this.bookMap = {};
        this.mybets = [];
        this.mybooks = [];
        this.getopenbet();
      }
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
   * Best-effort map of live market rows onto `groups[].items[]`, keyed by
   * selection name (`nat` / `nation`). TODO(data): tighten once the console dump
   * confirms the exact strings — unmatched rows are logged.
   */
  /**
   * Map the live `sub[]` rows (see sample in git history) onto `groups[].items[]`.
   * Primary key is `sid` (stable: 1=PlayerA … 25=Less than 7); `nat` is the
   * fallback. Field notes: `b` = back rate, `l` = lay rate, `bs` = back bet-size
   * cap (shown as volume), `min`/`max` = stake range, `gstatus` OPEN|SUSPENDED.
   */
  private mapMarket(rows: any[]): void {
    if (!Array.isArray(rows) || !rows.length) return;
    const norm = (s: any) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
    const natOf = (r: any) => norm(r?.nat ?? r?.nation ?? r?.slidingtext);
    const mapped = new Set<string>();

    const apply = (target: any, sid: number, ...names: string[]) => {
      if (!target) return;
      const wanted = names.map(norm);
      const row = rows.find((r: any) => Number(r?.sid) === sid) || rows.find((r: any) => wanted.includes(natOf(r)));
      if (!row) return;
      mapped.add(target.oddstype);
      // carry the feed identity so placed bets are keyed to the backend / result
      target.sid = row.sid;
      target.betfor = row.nat;
      // Doli Dana has a main round (Player A/B) made of several sub-rounds (every other
      // market) that keep re-rolling until a decisive dice pair ends the main round - each
      // row's own `mid` is already the correct id to bet against (main id for sid 1/2, the
      // live sub-round id for everything else), confirmed live: sid1/2's `mid` equals the
      // top-level `data.mid`, while every Fancy row's `mid` is `data.mid` + a 3-digit suffix
      // that changes every roll. Always send the row's own `mid`, never the component's
      // `this.roundId` (main id only, used for round-change bookkeeping / getopenbet).
      target.roundId = row.mid ?? target.roundId;
      target.rate = this.removeDecimal(row.b ?? row.rate ?? row.odds ?? target.rate);
      target.lay = this.removeDecimal(row.l ?? row.lay ?? 0);
      target.gstatus = String(row.gstatus ?? row.status ?? '1');
      target.min = row.min ?? this.min;
      target.max = row.max ?? this.max;
      target.bs = row.bs ?? row.max ?? '';        // back bet-size cap → volume display
    };

    apply(this.itemMap['PlayerA'], 1, 'Player A');
    apply(this.itemMap['PlayerB'], 2, 'Player B');
    apply(this.itemMap['AnyPair'], 3, 'Any Pair');
    for (let n = 1; n <= 6; n++) apply(this.itemMap['Pair' + n + n], 3 + n, `${n}-${n} Pair`);
    for (let s = 2; s <= 12; s++) apply(this.itemMap['Sum' + s], 8 + s, 'Sum Total ' + s);
    apply(this.itemMap['Odd'], 21, 'Odd');
    apply(this.itemMap['Even'], 22, 'Even');
    apply(this.itemMap['Seven'], 23, 'Lucky 7');
    apply(this.itemMap['Over7'], 24, 'Greater than 7', '> 7');
    apply(this.itemMap['Under7'], 25, 'Less than 7', '< 7');

    const missed = this.allItems.filter((it) => !mapped.has(it.oddstype)).map((it) => it.oddstype);
    if (missed.length) console.warn(`[${this.CODE}] board items NOT mapped (${missed.length}):`, missed);
  }

  /**
   * DD/MM/YYYY HH:MM:SS decoded from the trailing YYMMDDHHMMSS of a round id. A sub-round id
   * is the 15-digit main id + a 3-digit sub-round suffix (e.g. "193260916114023" (main) vs
   * "193260916114023004" (its 4th sub-round), confirmed live) - `slice(-12)` on the raw digits
   * would grab the wrong window once that suffix is appended (shifting the whole timestamp
   * left), so always truncate to the 15-digit main id first, then take its trailing 12.
   */
  matchTime(rid: any): string {
    const digits = String(rid ?? '').replace(/\D/g, '');
    const s = (digits.length > 15 ? digits.slice(0, 15) : digits).slice(-12);
    if (s.length < 12) return '';
    return `${s.slice(4, 6)}/${s.slice(2, 4)}/20${s.slice(0, 2)} ${s.slice(6, 8)}:${s.slice(8, 10)}:${s.slice(10, 12)}`;
  }

  get pairItems(): any[] { return this.groups.find((g) => g.title === 'Particular Pair')?.items ?? []; }
  get sumItems(): any[] { return this.groups.find((g) => g.title === 'Sum Total')?.items ?? []; }

  bet(content: any, item: any, type: 'back' | 'lay' = 'back') {
    this.showbetform = true;
    this.betFor = item.betfor ?? item.label;   // feed `nat` — what the backend/result settle against
    this.odds = type === 'lay' ? (item.lay ?? item.rate) : item.rate;
    this.betType = type;
    this.oddsType = item.oddstype || item.betfor || item.label;
    this.betRoundId = item.roundId || this.roundId;
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
    this.profit = this.stake ? Math.round(this.stake * (this.odds - 1) * 100) / 100 : 0;
  }

  submitbet() {
    this.placeLoader = true;
    const dt = {
      roundid: this.betRoundId || this.roundId, matchcode: this.CODE, matchname: this.NAME,
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
   * Backend keys Book.oddsType by the real feed `nat` string (e.g. "Player A",
   * "Sum Total 7"), while this board's own `itemMap` keys are internal shorthand
   * ("PlayerA", "Sum7") — translate real name -> internal key via each item's
   * live-bound `betfor` so the existing `bookMap[...]` template lookups keep working.
   *
   * `getCasinoOpenBet` prefix-matches for dolidana (see the backend's `getopenbet`), so its
   * response can include a stale, not-yet-settled Fancy bet/book from an EARLIER sub-round
   * within the same main round - the settlement poller runs every ~10s and can lag behind the
   * live round transition seen here. Filter to only the current main round (`this.roundId`,
   * the Winner market) and the current sub round (`this.subRoundId`, every Fancy market) so a
   * concluded sub-round's bet/book disappears immediately instead of waiting on that poll.
   */
  getopenbet() {
    this.userauth.getCasinoOpenBet(this.CODE, this.roundId).subscribe({
      next: (res: any) => {
        // String()-normalize both sides: the live feed's top-level `mid` (source of
        // `this.roundId`) arrives as a JSON *number*, while each row's own `mid` (source of
        // `betRoundId`/Bet.roundId, and of `this.subRoundId`) arrives as a *string* - a strict
        // `===` between them silently never matched the Winner market, hiding Player A/B's
        // book and bet entirely once this filter was added.
        const keepRoundId = (rid: any) =>
          String(rid) === String(this.roundId) || (!!this.subRoundId && String(rid) === String(this.subRoundId));
        this.mybets = (res.openbets || []).filter((b: any) => keepRoundId(b.roundId));
        this.mybooks = (res.books || []).filter((bk: any) => keepRoundId(bk.roundId));
        this.bookMap = {};
        const nameToKey: { [name: string]: string } = {};
        Object.keys(this.itemMap).forEach((k) => {
          const bf = this.itemMap[k]?.betfor;
          if (bf) nameToKey[bf] = k;
        });
        this.mybooks.forEach((bk: any) => {
          if (bk.oddsType === 'Winner' && Array.isArray(bk.book)) {
            // Player A / Player B: netted 2-way book, use the signed amount as-is.
            bk.book.forEach((row: any) => {
              this.bookMap[nameToKey[row.selectionName] || row.selectionName] = row.amount;
            });
          } else if (typeof bk.book === 'number') {
            // independent Fancy prop: backend exposure is a positive stake number;
            // show it as a liability (negative/red) under the same tile, matching
            // the reference site's convention.
            this.bookMap[nameToKey[bk.oddsType] || bk.oddsType] = -bk.book;
          }
        });
      },
      error: (e) => console.log(e),
    });
  }

  open(content: any) {
    this.modalService.open(content, { size: 'lg' });
  }
  private static readonly MAIN_DESC_LABELS = ['Turn', 'Win'];
  private static readonly SUB_DESC_LABELS = ['Turn', 'Any Pair', 'Particular Pair', 'Sum Total', 'Odd/Even', 'Lucky 7'];

  /**
   * `/casino/getresult/:roundid` gives `t1.rdesc`, a `#`-joined string whose shape depends on
   * whether `rid` is a main round id or a sub-round id (see the round-id split documented on
   * `mapMarket()`/`betRoundId` above):
   *   main id (2 segments) -> "Player A#Player B"                    = [Turn, Win]
   *   sub id  (6 segments) -> "Player A#No#-#6#Even#Less than 7"     = [Turn, Any Pair,
   *                            Particular Pair, Sum Total, Odd/Even, Lucky 7]
   * confirmed live against real rounds of both shapes, matching user-supplied reference DOMs
   * for each exactly — trust rdesc directly rather than re-deriving these from the dice.
   */
  openResult(content: any, rid: any) {
    this.loader = true;
    this.match_service.getResult(rid).subscribe({
      next: (winnerdata: any) => {
        this.loader = false;
        this.modalService.open(content, { size: 'xl' });
        const r = winnerdata['data']?.[0] || {};
        this.temprId = rid;
        this.tempCards = String(r.card ?? r.cards ?? '').trim()
          .split(',')
          .map((c: string) => parseInt(c, 10))
          .filter((n: number) => n >= 1 && n <= 6);
        const parts = String(r.rdesc ?? '').split('#').map((s: string) => s.trim());
        const labels = parts.length <= 2 ? DolidanaComponent.MAIN_DESC_LABELS : DolidanaComponent.SUB_DESC_LABELS;
        this.tempDescRows = labels.map((label, i) => ({ label, value: parts[i] ?? '' }));
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
