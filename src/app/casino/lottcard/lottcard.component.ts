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
 * LOTTERY (`lottcard`)
 * -----------------------------------------------------------------------------
 * Card-lottery: pick card faces A..10 in Single / Double / Tripple mode, build
 * a bet cart (Repeat / Clear / Remove), 3 cards are drawn. Board CSS ships in
 * src/styles.css / responsive.css (`.lottery-*`). Live-wired; see subscribeLiveData().
 */
@Component({
  selector: 'app-lottcard',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './lottcard.component.html',
  styleUrl: './lottcard.component.css',
})
export class LottcardComponent implements OnInit, OnDestroy {
  gametab = true; rulesTab:any='rules'
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
  tempMatchTime = '';
  tempWinner: any = '';
  tempCards: any = [];

  /** face codes A..10 (0), rendered via /img/cards-new/<face>.png (not suited). */
  faces = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  mode: 'single' | 'double' | 'tripple' = 'single';
  picked: string[] = [];
  /** faces of the bet currently open in the sidebar/mobile bet-slip, for the ball-icon display */
  betCards: string[] = [];
  cart: { mode: string; cards: string[]; amount: number }[] = [];
  lastCart: { mode: string; cards: string[]; amount: number }[] = [];

  /** drawn cards for the round (t1[0].C1/C2/C3); '1' = not yet drawn */
  drawnCards: string[] = ['1', '1', '1'];
  /** sid/rate/gstatus per mode — sid 1/2/3 = Single/Double/Triple (console-verified) */
  modeBets = {
    single: { sid: 1, rate: '0', gstatus: '1', min: 10, max: 20000 },
    double: { sid: 2, rate: '0', gstatus: '1', min: 10, max: 5000 },
    tripple: { sid: 3, rate: '0', gstatus: '1', min: 10, max: 3000 },
  };

  private readonly modeSize = { single: 1, double: 2, tripple: 3 } as const;

  protected readonly CODE = 'lottcard';
  protected readonly NAME = 'Lottery';

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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3014'); // TODO(data)
    this.subscribeLiveData();
    this.placeBetButton();
  }

  ngOnDestroy() {
    this.socket_service.leavaAllRooms();
  }

  /**
   * Confirmed feed shape (console-verified) — the OLDER t1/t2 convention, distinct
   * from the flat+sub[] shape used by newer tables: flat `data` = {
   *   t1: [{ mid, autotime, remark, gtype:"lottcard", C1, C2, C3 }],  // drawn cards, "1" = undrawn
   *   t2: [{ mid, nat:"Single"|"Double"|"Triple", sid:"1"|"2"|"3", rate, gstatus, min, max }]
   * }. gstatus "1" = open (confirmed live: rate 9.5/95/900 match the in-app Payout tab exactly).
   * casinolast10 rows are { mid, result:"D1 D2 D3" } (space-separated digits, no res wrapper).
   */
  private subscribeLiveData(): void {
    this.socket_service.casinodata('Casino', this.CODE).subscribe((raw: any) => {
      const d = raw?.data;
      const t1 = d?.t1?.[0];
      if (!t1) return;
      this.data = d;

      const at = parseInt(String(t1.autotime ?? '0'), 10) || 0;
      if (this.beforeNum !== at) this.updateClock(at);
      this.beforeNum = at;
      this.autotime = at;

      const mid = t1.mid ?? '';
      if (mid && this.roundId !== mid) {
        this.mybets = []; this.mybooks = [];
        this.roundId = mid;
        this.getopenbet();
      } else {
        this.roundId = mid || this.roundId;
      }

      this.drawnCards = [t1.C1, t1.C2, t1.C3].map((c: any) => (c ? String(c) : '1'));

      const t2: any[] = d?.t2 || [];
      const bySid = (sid: string) => t2.find((r: any) => String(r.sid) === sid);
      const applyMode = (target: any, row: any) => {
        if (!row) return;
        target.rate = row.rate ?? target.rate;
        target.gstatus = String(row.gstatus ?? '1');
        target.min = row.min ?? target.min;
        target.max = row.max ?? target.max;
      };
      applyMode(this.modeBets.single, bySid('1'));
      applyMode(this.modeBets.double, bySid('2'));
      applyMode(this.modeBets.tripple, bySid('3'));
    });

    this.socket_service.casinolast10('Last10', this.CODE).subscribe((raw: any) => {
      const list = raw?.data ?? [];
      if (Array.isArray(list) && list.length) {
        // `result` is double-space-separated ("3  4  3", confirmed live) — split on
        // any run of whitespace, not a literal single space, or empty tokens leak in.
        this.results = list.slice(0, 10).map((r: any) => ({ mid: r.mid, digits: String(r.result ?? '').trim().split(/\s+/).filter(Boolean) }));
      }
    });

    setTimeout(() => { this.getopenbet(); setTimeout(() => this.getopenbet(), 2000); }, 1500);

    this.socket_service.updateCheck('User', this.userauth.getUsername()).subscribe((u: any) => {
      if (u?.update) { this.userauth.getUserBalance(); this.getopenbet(); }
    });
  }

  isSelected(f: string): boolean {
    return this.picked.includes(f);
  }
  isSuspended(item: any): boolean {
    const g = String(item?.gstatus ?? '').trim().toUpperCase();
    return !(g === '1' || g === 'OPEN' || g === 'ACTIVE' || g === 'TRUE');
  }

  faceImg(f: string) {
    return '/img/cards-new/' + (f || '1') + '.png';
  }
  setMode(m: 'single' | 'double' | 'tripple') {
    this.mode = m;
    // Switching tabs abandons any in-progress pick — also drop the leftover bet-for
    // panel from whatever was last selected, so nothing stale lingers on screen.
    this.resetPick();
  }
  pick(f: string, content: any) {
    // Per the in-app Rules/Payout tab, Double covers 00-99 and Triple 000-999 — i.e. the
    // same face CAN repeat across positions (e.g. "11", "55"), so picks are appended in
    // click order (position 1, 2, 3...) rather than de-duplicated by face value. A wrong
    // pick can still be discarded via `resetPick()`.
    const need = this.modeSize[this.mode];
    const startingFresh = this.picked.length === 0;
    if (this.picked.length < need) this.picked.push(f);
    // Show/update the bet-for panel on every pick, not just once the full selection is
    // in — Double/Tripple should display "DOUBLE [3]" right after the first card and grow
    // from there, matching Single's immediate-display behavior.
    this.updateBetPreview(startingFresh, content);
    if (this.picked.length === need) this.finalizePick();
  }
  private updateBetPreview(startingFresh: boolean, content: any) {
    const m = this.modeBets[this.mode];
    this.showbetform = true;
    this.betCards = [...this.picked];
    this.betFor = this.mode.toUpperCase() + ' [' + this.picked.join(',') + ']';
    this.betType = 'back';
    this.oddsType = this.mode;
    this.odds = m.rate;
    this.sid = m.sid;
    this.min = m.min;
    this.max = m.max;
    if (startingFresh) {
      this.stake = null;
      this.profit = 0;
      this.loss = 0;
      // Single needs exactly one tap, so that tap also completes the pick — safe to pop
      // the bet-slip modal straight away. Double/Tripple need 2-3 taps: opening the modal
      // here would hide the grid behind it before the rest of the digits are picked, so
      // those modes stay on the inline balls/Clear/Placebet row instead (openMobileBetSlip()).
      if (this.mode === 'single' && window.innerWidth < 1100) this.modalService.open(content);
    }
  }
  /** Double/Tripple mobile flow: the inline "Placebet" button under the grid opens the
   * stake modal once the full selection is made (see updateBetPreview() for why Single
   * doesn't need this). */
  openMobileBetSlip(content: any) {
    if (this.pickComplete) this.modalService.open(content);
  }
  private finalizePick() {
    this.cart.push({ mode: this.mode, cards: [...this.picked], amount: 0 });
    this.picked = [];
  }
  /** Selection isn't complete yet (e.g. only 1 of 2 Double cards picked) — block submit. */
  get pickComplete(): boolean {
    return this.betCards.length === this.modeSize[this.mode];
  }
  resetPick() {
    this.picked = [];
    this.betCards = [];
    this.hideBetPlace();
  }
  removeCart(i: number) {
    this.cart.splice(i, 1);
  }
  clearCart() {
    this.lastCart = [...this.cart];
    this.cart = [];
  }
  repeatCart() {
    if (this.lastCart.length) this.cart = this.lastCart.map((c) => ({ ...c, cards: [...c.cards] }));
  }
  get modeCount() {
    return this.cart.filter((c) => c.mode === this.mode).length;
  }
  /** confirmed live (d247): ball{N}.png where N = 1-indexed position in `faces` (A=1..10=10) */
  ballImg(f: string): string {
    const i = this.faces.indexOf(f) + 1;
    return 'https://g1ver.sprintstaticdata.com/v107/static/front/img/lottery/ball' + (i || 1) + '.png';
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
        const r = winnerdata['data']?.[0];
        this.temprId = rid;
        this.tempMatchTime = r?.mtime || winnerdata?.mtime || '';
        this.tempCards = String(r?.cards ?? '').split(',').map((c: string) => c.trim()).filter((c: string) => c);
      },
      error: () => (this.loader = false),
    });
  }

  /** face-to-digit mapping confirmed by the in-app Rules tab: A->1, 2-9->same, 10->0 */
  private static readonly FACE_DIGIT: Record<string, string> = { A: '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '0' };
  private cardFace(code: string): string {
    const m = String(code || '').match(/^(10|[2-9]|[AJQK])/);
    return m ? m[1] : '';
  }
  get resultDigits(): string {
    return this.tempCards.map((c: string) => LottcardComponent.FACE_DIGIT[this.cardFace(c)] ?? '').join(' ');
  }

  /** "Single"/"Double"/"Tripple" label for the My Bet box, from a bet's oddsType. */
  betModeLabel(oddsType: string): string {
    return oddsType === 'single' ? 'Single' : oddsType === 'double' ? 'Double' : 'Tripple';
  }
  /** selectionName "SINGLE [3,4]" -> concatenated digits "34" (A->1, 10->0) for the My Bet box. */
  betDigits(selectionName: string): string {
    const m = String(selectionName || '').match(/\[([^\]]*)\]/);
    if (!m) return '';
    return m[1].split(',').map((f) => LottcardComponent.FACE_DIGIT[f.trim()] ?? f.trim()).join('');
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

  changeRuleTab(name:any) {
    this.rulesTab = name;
  }
}
