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
 * Note Number (`notenum`)
 * -----------------------------------------------------------------------------
 * Live-wired; see subscribeLiveData(). Confirmed feed shape (console-verified):
 * flat `data` = { mid, lt, card (6 slots, dealt one at a time, undealt="1"),
 * gtype:"notenum", sub: [ rows for whichever card position is CURRENTLY next
 * to be dealt — nat:"Odd Card <N>"/"Even Card <N>"/"Black Card <N>"/"Red Card
 * <N>"/"Low Card <N>"/"High Card <N>" (subtype odd/even/black/red/low/high,
 * back+lay), plus two FIXED rows nat:"Baccarat 1"/"Baccarat 2" (subtype bacc,
 * back-only, cover cards 1-3 / 4-6 regardless of active position), plus one
 * row subtype:"card" whose own `odds[]` is the 10-way "guess the exact rank"
 * sub-market (nat:"Card A".."Card 10", each own sid via `ssid`, back-only,
 * rate 9 flat) ]. Deck is 80 cards / 2 decks, Ace-10 only (no J/Q/K) per
 * in-app Rules. Each row carries its OWN gstatus (like teensin, not a single
 * global gate like ab3/ab4) — Baccarat rows go SUSPENDED once their 3-card
 * group is fully dealt while later positions are still open.
 */
@Component({
  selector: 'app-notenum',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './notenum.component.html',
  styleUrl: './notenum.component.css',
})
export class NotenumComponent implements OnInit, OnDestroy {
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
  tempWinner: any = '';
  tempMatchTime: any = '';
  tempCards: any = [];

  /** raw sub[] rows for the currently-active card position, as sent live */
  sub: any[] = [];
  cards: string[] = new Array(6).fill('1');

  bookMap: { [k: string]: number } = {};

  protected readonly CODE = 'notenum';
  protected readonly NAME = 'Note Number';

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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3013');
    this.subscribeLiveData();
    this.placeBetButton();
  }

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
        this.mybets = []; this.mybooks = []; this.bookMap = {};
        this.roundId = mid;
        this.getopenbet();
      } else {
        this.roundId = mid || this.roundId;
      }

      const cards = String(d.card ?? '').split(',').map((c: string) => c.trim());
      for (let i = 0; i < 6; i++) this.cards[i] = cards[i] || '1';

      this.sub = d.sub || this.sub;
    });

    this.socket_service.casinolast10('Last10', this.CODE).subscribe((raw: any) => {
      const list = raw?.data?.res ?? raw?.data ?? [];
      if (Array.isArray(list) && list.length) this.results = list.slice(0, 10);
    });

    setTimeout(() => { this.getopenbet(); setTimeout(() => this.getopenbet(), 2000); }, 1500);

    this.socket_service.updateCheck('User', this.userauth.getUsername()).subscribe((u: any) => {
      if (u?.update) { this.userauth.getUserBalance(); this.getopenbet(); }
    });
  }

  ngOnDestroy() {
    this.socket_service.leavaAllRooms();
  }

  /** which position (1-6) is currently biddable = count of dealt cards + 1 */
  get activePosition(): number {
    return this.cards.filter((c) => c && c !== '1').length + 1;
  }
  row(subtype: string): any {
    return this.sub.find((x) => x.subtype === subtype) || { b: 0, l: 0, gstatus: 'SUSPENDED', min: 100, max: 50000, nat: '' };
  }
  baccRow(n: 1 | 2): any {
    return this.sub.find((x) => x.subtype === 'bacc' && x.nat === 'Baccarat ' + n) || { b: 0, gstatus: 'SUSPENDED', min: 100, max: 50000, nat: 'Baccarat ' + n };
  }
  get cardGuessOdds(): any[] {
    return this.row('card').odds || [];
  }
  isSuspended(row: any): boolean {
    const g = String(row?.gstatus ?? '').trim().toUpperCase();
    return !(g === '1' || g === 'OPEN' || g === 'ACTIVE' || g === 'TRUE');
  }
  cardImg(code: string) { return './img/cards-new/' + (code || '1') + '.png'; }

  /**
   * Odd/Even, Black/Red, and Low/High are netted 2-way per position (and Baccarat 1/2
   * netted across the whole round) in casino_controller.js's notenum placebet branch —
   * both sides of each pair now share one oddsType, computed the same way here as there.
   */
  private static computeOddsType(nat: string): string {
    const oe = nat.match(/^(Odd|Even) Card (\d+)$/);
    if (oe) return 'OddEven Card ' + oe[2];
    const rb = nat.match(/^(Black|Red) Card (\d+)$/);
    if (rb) return 'RedBlack Card ' + rb[2];
    const lh = nat.match(/^(Low|High) Card (\d+)$/);
    if (lh) return 'LowHigh Card ' + lh[2];
    if (/^Baccarat (1|2)$/.test(nat)) return 'Baccarat';
    return nat;
  }

  bet(content: any, row: any, type: 'back' | 'lay' = 'back') {
    if (this.isSuspended(row)) { this.displayToast('Betting is suspended', 'failed'); return; }
    this.showbetform = true;
    this.betFor = row.nat;
    this.odds = type === 'lay' ? row.l : row.b;
    this.betType = type;
    this.oddsType = NotenumComponent.computeOddsType(row.nat);
    this.sid = row.ssid || row.sid || 0;
    this.min = row.min || 100;
    this.max = row.max || 50000;
    this.stake = null;
    this.profit = 0;
    this.loss = 0;
    if (window.innerWidth < 1100) this.modalService.open(content);
  }
  /**
   * The 10-way "guess the exact rank" market is nested under the outer `card` row's
   * `odds[]` (see cardGuessOdds) — those entries carry no gstatus of their own (the
   * outer row's gstatus gates all 10 together) and no position ("Card 5", not "which
   * position"), unlike every other market here where `row.nat` already includes the
   * position (e.g. "Odd Card 2") since it's read straight off the live sub[] row. Both
   * need fixing here: settlement can't otherwise tell which of the 6 dealt cards a
   * guess was about.
   */
  betCardGuess(content: any, g: any) {
    const outer = this.row('card');
    if (this.isSuspended(outer)) { this.displayToast('Betting is suspended', 'failed'); return; }
    this.showbetform = true;
    this.betFor = g.nat + ' #' + this.activePosition;
    this.odds = g.b;
    this.betType = 'back';
    // Card A..Card 10 are one 10-way netted market PER POSITION (see
    // casino_controller.js's notenum branch) — share one oddsType per position, not
    // per exact rank, so all 10 bets on this deal land in the same book.
    this.oddsType = 'CardGuess #' + this.activePosition;
    this.sid = g.ssid || 0;
    this.min = outer.min || 100;
    this.max = outer.max || 50000;
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

  getopenbet() {
    this.userauth.getCasinoOpenBet(this.CODE, this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        // Always read the book straight from the backend (casino_controller.js's notenum
        // placebet branch), never recompute from raw bets client-side. Odd/Even, Black/
        // Red, Low/High, and Baccarat 1/2 are netted 2-way and now SHARE one oddsType per
        // related pair, so keying by oddsType (as before) would collapse both sides into
        // one number — key by each myBook entry's own selectionName instead, same generic
        // loop as teensin.
        this.bookMap = {};
        (this.mybooks || []).forEach((bk: any) => {
          (bk.book || []).forEach((entry: any) => {
            if (entry?.selectionName) this.bookMap[entry.selectionName] = entry.amount;
          });
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
        const r = winnerdata['data']?.[0];
        this.temprId = rid;
        this.tempWinner = r?.win || '';
        this.tempMatchTime = r?.mtime || winnerdata?.mtime || '';
        this.tempCards = String(r?.cards ?? r?.card ?? '').split(',').map((c: string) => c.trim());
      },
      error: () => (this.loader = false),
    });
  }

  /** rank helpers per in-app Rules: A=1, 2-10 face value; suit Heart/Diamond=Red, Spade/Club=Black */
  private cardRankNum(code: string): number {
    const m = String(code || '').match(/^(10|[2-9]|A)/);
    if (!m) return 0;
    return m[1] === 'A' ? 1 : parseInt(m[1], 10);
  }
  private cardSuit(code: string): string {
    const m = String(code || '').match(/(SS|HH|DD|CC)$/);
    return m ? m[1] : '';
  }
  private isRed(code: string): boolean { return this.cardSuit(code) === 'HH' || this.cardSuit(code) === 'DD'; }
  /** baccarat point value per Rules: A=1..9=face, 10=0 */
  private baccPoint(code: string): number { const n = this.cardRankNum(code); return n === 10 ? 0 : n; }

  get resultDealtCards(): string[] { return this.tempCards.filter((c: string) => c && c !== '1'); }
  get resultOddEven(): string { return this.resultDealtCards.map((c) => (this.cardRankNum(c) % 2 === 0 ? 'Even' : 'Odd')).join(' '); }
  get resultRedBlack(): string { return this.resultDealtCards.map((c) => (this.isRed(c) ? 'Red' : 'Black')).join(' '); }
  get resultLowHigh(): string { return this.resultDealtCards.map((c) => (this.cardRankNum(c) <= 5 ? 'Low' : 'High')).join(' '); }
  get resultCardNums(): string { return this.resultDealtCards.map((c) => this.cardRankNum(c)).join(' '); }
  get resultBacc1(): number { return this.tempCards.slice(0, 3).filter((c: string) => c && c !== '1').reduce((s: number, c: string) => s + this.baccPoint(c), 0) % 10; }
  get resultBacc2(): number { return this.tempCards.slice(3, 6).filter((c: string) => c && c !== '1').reduce((s: number, c: string) => s + this.baccPoint(c), 0) % 10; }
  get resultBaccarat(): string {
    if (this.resultDealtCards.length < 6) return '';
    const b1 = this.resultBacc1, b2 = this.resultBacc2;
    const winner = b1 === b2 ? 'Tie' : (b1 > b2 ? 'Baccarat 1' : 'Baccarat 2');
    return winner + ' (B1: ' + b1 + ' | B2: ' + b2 + ')';
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

  trackByFunc(index: number, item: any) { return item.sid ?? item.ssid ?? index; }
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
