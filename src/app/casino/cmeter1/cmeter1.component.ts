import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
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
 * 1 CARD METER (`cmeter1`)
 * -----------------------------------------------------------------------------
 * Binary table: one card each is dealt to Fighter A and Fighter B (per the
 * in-app Rules), you back whichever fighter you think has the higher card.
 * Layout mirrors the shared casino-table shell (see teen20 / war). Only the
 * board markup (`.one-card-meter .meter-btns`) is game-specific; its CSS already
 * ships in src/styles.css. Live-wired; see subscribeLiveData().
 */
@Component({
  selector: 'app-cmeter1',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './cmeter1.component.html',
  styleUrl: './cmeter1.component.css',
})
export class Cmeter1Component implements OnInit, OnDestroy {
  // ---- shell state (identical across every casino table) -------------------
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

  // ---- bet slip ----------------------------------------------------------
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

  // ---- result modal ----------------------------------------------------------
  temprId = '';
  tempMatchTime = '';
  tempWinner: any = '';
  tempCards: any = [];

  // ---- game-specific board state -------------------------------------------
  // one card each, per the in-app Rules ("1 card each will be dealt to both the fighters")
  cardA = '/img/cards-new/1.png';
  cardB = '/img/cards-new/1.png';
  fighterA = { rate: '0', gstatus: '1', min: 100, max: 100000, sid: 1 };
  fighterB = { rate: '0', gstatus: '1', min: 100, max: 100000, sid: 2 };
  fighterABook: any = [];
  fighterBBook: any = [];
  /** raw stake-at-risk per oddsType (FighterA/FighterB) — the real per-selection book is
   *  a single back-only Fancy prop with no cross-selection netting (see backend), so this
   *  mirrors the same simple stake-summary overlay used elsewhere for that shape of bet. */
  bookMap: { [k: string]: number } = {};

  private readonly CODE = 'cmeter1';
  private readonly NAME = '1 Card Meter';

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
    // video — id is table-specific; confirm against backend.
    this.cvideoURL = this.match_service.getCasinoVideo();
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(
      this.cvideoURL + '?id=3018', // TODO(data): real channel id
    );

    this.subscribeLiveData();
    this.placeBetButton();
  }

  ngOnDestroy() {
    this.socket_service.leavaAllRooms();
  }

  /**
   * Confirmed feed shape (console-verified): flat `data` = { mid, lt, card (2 cards,
   * index 0 -> Fighter A, index 1 -> Fighter B — confirmed live: they fill in that
   * order; undealt = "1"), gtype:"cmeter1", sub: [
   *   sid 1/2  nat:"Fighter A"/"Fighter B"  subtype "cmeter1"  etype "Fancy" (back only, no "l")
   * ] }. `b` is NOT a normal decimal-odds value — per the in-app Rules, payout is a 1x-12x
   * multiplier of the point difference between the two cards (A=1..K=13), computed at
   * settlement, not shown pre-round; `b` just carries whatever the backend sends for the
   * bet payload's `odds` field. gstatus "OPEN"/"SUSPENDED". casinolast10 rows are
   * { mid, win: "1"|"2" } (1=A, 2=B).
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
      if (mid && this.roundId !== mid) {
        this.clearBooks(); this.mybets = [];
        this.roundId = mid;
        this.getopenbet();
      } else {
        this.roundId = mid || this.roundId;
      }

      const cards = String(d.card ?? '').split(',').map((c: string) => c.trim());
      this.cardA = '/img/cards-new/' + (cards[0] || '1') + '.png';
      this.cardB = '/img/cards-new/' + (cards[1] || '1') + '.png';

      const rows: any[] = d.sub || [];
      const bySid = (sid: number) => rows.find((r: any) => Number(r.sid) === sid);
      this.applyBackOnly(this.fighterA, bySid(1));
      this.applyBackOnly(this.fighterB, bySid(2));
    });

    this.socket_service.casinolast10('Last10', this.CODE).subscribe((raw: any) => {
      const list = raw?.data?.res ?? raw?.data ?? [];
      if (Array.isArray(list) && list.length) {
        // win: '1'=Fighter A, '2'=Fighter B, '3'=Tie (confirmed live via the result API)
        this.results = list.slice(0, 10).map((r: any) => ({ mid: r.mid, result: r.win === '1' ? 'A' : r.win === '2' ? 'B' : r.win === '3' ? 'T' : r.win }));
      }
    });

    setTimeout(() => { this.getopenbet(); setTimeout(() => this.getopenbet(), 2000); }, 1500);

    this.socket_service.updateCheck('User', this.userauth.getUsername()).subscribe((u: any) => {
      if (u?.update) { this.userauth.getUserBalance(); this.getopenbet(); }
    });
  }

  private applyBackOnly(target: any, row: any): void {
    if (!row) return;
    target.rate = row.b ?? target.rate;
    target.gstatus = String(row.gstatus ?? '1');
    target.min = row.min ?? target.min;
    target.max = row.bs ?? row.max ?? target.max;
    target.sid = row.sid ?? target.sid;
  }
  isSuspended(item: any): boolean {
    const g = String(item?.gstatus ?? '').trim().toUpperCase();
    return !(g === '1' || g === 'OPEN' || g === 'ACTIVE' || g === 'TRUE');
  }


  // ---- betting ------------------------------------------------------------
  betFighter(content: any, which: 'A' | 'B') {
    const f = which === 'A' ? this.fighterA : this.fighterB;
    this.openBetForm(content, 'Fighter ' + which, f.rate, 'back', f.sid, 'Fighter' + which, f.min, f.max);
  }
  openBetForm(content: any, betfor: string, odds: any, type: string, sid: number, oddstype: string, min: any, max: any) {
    this.showbetform = true;
    this.betFor = betfor;
    this.odds = odds;
    this.betType = type;
    this.oddsType = oddstype;
    this.sid = sid;
    this.min = min;
    this.max = max;
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
    // Preview only, using the capped rate (b=13 live) — real payout is stake times the
    // actual card-point gap (verified via result API, e.g. "Fighter A#2" -> stake*2),
    // recomputed at settlement; this is the same provisional-then-recomputed pattern as
    // sicbo's variable-payout bets.
    this.profit = this.stake ? Math.round((this.stake * (this.odds - 1)) * 100) / 100 : 0;
  }

  submitbet() {
    this.placeLoader = true;
    const dt = {
      roundid: this.roundId,
      matchcode: this.CODE,
      matchname: this.NAME,
      betfor: this.betFor,
      bettype: 'back',
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
        this.displayToast(e.error?.message || 'Bet failed', 'failed');
        this.modalService.dismissAll();
      },
    });
  }

  getopenbet() {
    this.userauth.getCasinoOpenBet(this.CODE, this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.mybooks.forEach((item: any) => {
          if (item.oddsType === 'FighterA') this.fighterABook = item.book;
          else if (item.oddsType === 'FighterB') this.fighterBBook = item.book;
        });
        this.bookMap = {};
        (this.mybets || []).forEach((b: any) => {
          // b.loss (not b.stake) already carries the worst-case point-gap-scaled
          // liability computed server-side (up to 12x stake, per the in-app Rules).
          this.bookMap[b.oddsType] = (this.bookMap[b.oddsType] || 0) + b.loss;
        });
        console.log(this.bookMap);
      },
      error: (e) => console.log(e),
    });
  }

  // ---- result modal ------------------------------------------------------
  open(content: any) {
    this.modalService.open(content, { size: 'lg' });
  }
  openResult(content: any, rid: any) {
    this.loader = true;
    this.match_service.getResult(rid).subscribe({
      next: (winnerdata: any) => {
        this.loader = false;
        this.modalService.open(content, { size: 'xl' });
        const r = winnerdata['data']?.[0];
        this.temprId = rid;
        this.tempMatchTime = this.matchTime(rid);
        const winMap: Record<string, string> = { '1': 'Fighter A', '2': 'Fighter B', '3': 'Tie' };
        this.tempWinner = String(r?.rdesc ?? '').split('#')[0] || winMap[r?.win] || r?.winnat || r?.win || '';
        this.tempCards = String(r?.card ?? r?.cards ?? '').split(',').map((c: string) => c.trim());
      },
      error: () => (this.loader = false),
    });
  }

  // Round id encodes its own timestamp (same scheme confirmed live for race2/dolidana) - the
  // vendor's own `mtime` string comes back in an inconsistent M/D/YYYY h:mm:ss AM/PM format,
  // so derive the display time from the id instead.
  matchTime(rid: any): string {
    const digits = String(rid ?? '').replace(/\D/g, '');
    const s = (digits.length > 15 ? digits.slice(0, 15) : digits).slice(-12);
    if (s.length < 12) return '';
    return `${s.slice(4, 6)}/${s.slice(2, 4)}/20${s.slice(0, 2)} ${s.slice(6, 8)}:${s.slice(8, 10)}:${s.slice(10, 12)}`;
  }

  private cardPoint(code: string): number {
    const m = String(code || '').match(/^(10|[2-9]|[AJQK])/);
    if (!m) return 0;
    const r = m[1];
    if (r === 'A') return 1;
    if (r === 'J') return 11;
    if (r === 'Q') return 12;
    if (r === 'K') return 13;
    return parseInt(r, 10);
  }
  /** point difference per the in-app Rules (Ace=1..King=13; payout is this many times the stake) */
  get resultPoints(): number {
    return Math.abs(this.cardPoint(this.tempCards[0]) - this.cardPoint(this.tempCards[1]));
  }

  // ---- flip clock (shared verbatim) ------------------------------------------
  updateClock(time: number) {
    if (time < 10) {
      this.cfirstnum = 0;
      this.clastnum = time;
    } else {
      const s = time.toString();
      this.cfirstnum = parseInt(s.charAt(0));
      this.clastnum = parseInt(s.charAt(1));
    }
    this.flipsecond = true;
    setTimeout(() => this.flipNumber(), 500);
  }
  flipNumber() {
    this.flipfirst = false;
    this.flipsecond = false;
  }

  clearBooks() {
    this.mybooks = [];
    this.fighterABook = [];
    this.fighterBBook = [];
    this.bookMap = {};
  }

  // ---- misc shared helpers ------------------------------------------------
  trackByFunc(index: number, item: any) {
    return item.sid;
  }
  trackByMid(index: number, item: any) {
    return item.mid;
  }
  twoDecimal(num: number) {
    return num ? num.toFixed(2) : 0.0;
  }
  gameTabClicked() {
    this.bettab = false;
    this.gametab = true;
  }
  betTabClicked() {
    this.bettab = true;
    this.gametab = false;
  }
  displayToast(msg: any, type: any) {
    const opts = { timeOut: 3000, positionClass: 'toast-top-center', closeButton: true };
    type === 'success' ? this.toastr.success(msg, '', opts) : this.toastr.error(msg, '', opts);
  }
  placeBetButton() {
    this.userauth.getButtons().subscribe({
      next: (res: any) => (this.placebetButton = res.casinobutton),
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
        this.modalService.open(content, { size: 'md' });
      },
      error: (e) => console.log(e),
    });
  }
  updateButtons() {
    this.userauth.updateButtons(this.userButtons).subscribe({
      next: (res: any) => {
        this.displayToast(res.message, 'success');
        this.modalService.dismissAll();
      },
      error: (e) => {
        this.displayToast(e.error?.message || 'Update failed', 'failed');
        this.modalService.dismissAll();
      },
    });
  }
}
