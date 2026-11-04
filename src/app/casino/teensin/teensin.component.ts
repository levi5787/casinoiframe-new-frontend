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
 * 29 Card Baccarat (`teensin`)
 * -----------------------------------------------------------------------------
 * Live-wired; see subscribeLiveData(). Confirmed feed shape (console-verified):
 * flat `data` = { mid, lt, card (6 slots, dealt one at a time, undealt="1"),
 * gtype:"teensin", sub: [ 9 rows, EACH with its OWN gstatus (unlike ab3/ab4's
 * single global gate) — sid1/2="Player A"/"Player B" (the Winner market, rate
 * ~1.98), sid3/4="High Card A"/"High Card B", sid5/6="Pair A"/"Pair B",
 * sid7/8="Color Plus A"/"Color Plus B", sid9="Lucky 9" (single row, back AND
 * lay via b/l) ] }. Deck is the special 29-card set (ranks 2-9, one 9 only)
 * per in-app Rules. Card order: dealt-so-far samples only ever showed 0-2
 * cards filled (this game's reveal window is very short, `ft` observed as low
 * as 3s), so the exact per-index Player A/B assignment beyond "card 1 is
 * dealt first" could not be independently re-confirmed against a settled
 * result. Using the same interleaved convention (c1,c3,c5=A / c2,c4,c6=B)
 * already confirmed live for every other teenpatti-family game in this
 * codebase (teen41/62/32/6, poison, trap) — flagged here in case a future
 * live check of a real result payload shows otherwise.
 */
@Component({
  selector: 'app-teensin',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './teensin.component.html',
  styleUrl: './teensin.component.css',
})
export class TeensinComponent implements OnInit, OnDestroy {
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

  /** confirmed live sids: 1/2=Winner A/B, 3/4=HighCard A/B, 5/6=Pair A/B, 7/8=ColorPlus A/B, 9=Lucky9 */
  sub: any[] = [];
  cards: string[] = new Array(6).fill('1');

  bookMap: { [k: string]: number } = {};

  protected readonly CODE = 'teensin';
  protected readonly NAME = '29 Card Baccarat';

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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3012');
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
      //console.log(this.results)
    });

    setTimeout(() => { this.getopenbet(); setTimeout(() => this.getopenbet(), 2000); }, 1500);

    this.socket_service.updateCheck('User', this.userauth.getUsername()).subscribe((u: any) => {
      if (u?.update) { this.userauth.getUserBalance(); this.getopenbet(); }
    });
  }

  ngOnDestroy() {
    this.socket_service.leavaAllRooms();
  }

  row(sid: number): any {
    return this.sub.find((x) => x.sid === sid) || { b: 0, l: 0, gstatus: 'SUSPENDED', min: 100, max: 500000, nat: '' };
  }
  isSuspended(row: any): boolean {
    const g = String(row?.gstatus ?? '').trim().toUpperCase();
    return !(g === '1' || g === 'OPEN' || g === 'ACTIVE' || g === 'TRUE');
  }
  cardImg(code: string) { return './img/cards-new/' + (code || '1') + '.png'; }

  /** interleaved per confirmed convention across sibling teenpatti-family games (see header comment) */
  get playerACards(): string[] { return [this.cards[0], this.cards[2], this.cards[4]].filter((c) => c && c !== '1'); }
  get playerBCards(): string[] { return [this.cards[1], this.cards[3], this.cards[5]].filter((c) => c && c !== '1'); }

  /**
   * Player A/B (Winner) and High Card A/B are genuine mutually-exclusive comparisons
   * (per the in-app Rules: exactly one side wins, or both tie and stakes are refunded)
   * so they share one netted oddsType each, matching the established Winner-market
   * convention (teen6/dolidana/aaa) — unlike Pair/Color Plus, which are independent
   * per-side propositions that really can both (or neither) trigger in the same round.
   */
  private static readonly ODDSTYPE_MAP: Record<string, string> = {
    'Player A': 'Winner', 'Player B': 'Winner',
    'High Card A': 'HighCard', 'High Card B': 'HighCard',
  };
  bet(content: any, row: any, type: 'back' | 'lay' = 'back') {
    if (this.isSuspended(row)) { this.displayToast('Betting is suspended', 'failed'); return; }
    this.showbetform = true;
    this.betFor = row.nat;
    this.odds = type === 'lay' ? row.l : row.b;
    this.betType = type;
    this.oddsType = TeensinComponent.ODDSTYPE_MAP[row.nat] || row.nat;
    this.sid = row.sid || 0;
    this.min = row.min || 100;
    this.max = row.max || 500000;
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
        // Always read the book straight from the backend (casino_controller.js's teensin
        // placebet branch), never recompute it from raw bets client-side — the backend
        // already applies the right rule per market: Winner/HighCard are netted 2-way
        // (each side's real position, since they're mutually exclusive), Lucky 9 is
        // netted 2-way too (it allows back+lay at independent odds, so a stake sum would
        // be meaningless), and Pair/Color Plus (independent, back-only, no complementary
        // side) just carry accumulated stake. Every shape is the same
        // [{selectionName, amount}, ...] array, so one generic loop covers all of them.
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
        //console.log(winnerdata)
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

  /** point value: rank 2-9 face value; sum of 3 cards, last digit = baccarat value (per in-app Rules) */
  private cardRank(code: string): number {
    const m = String(code || '').match(/^(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }
  private baccaratValue(cards: string[]): number {
    const sum = cards.reduce((s, c) => s + this.cardRank(c), 0);
    return sum % 10;
  }
  private hasTrio(cards: string[]): boolean {
    const ranks = cards.map((c) => this.cardRank(c));
    return ranks.length === 3 && ranks[0] === ranks[1] && ranks[1] === ranks[2];
  }
  private hasPair(cards: string[]): boolean {
    const ranks = cards.map((c) => this.cardRank(c));
    return ranks.length >= 2 && new Set(ranks).size < ranks.length;
  }
  private cardSuit(code: string): string {
    const m = String(code || '').match(/(SS|HH|DD|CC)$/);
    return m ? m[1] : '';
  }
  /** Color Plus label per in-app Rules priority: Straight Flush(30x) > Trio(20x) > Flush(5x) > Straight(2x) */
  private colorPlusLabel(cards: string[]): string {
    if (cards.length !== 3) return '';
    const ranks = cards.map((c) => this.cardRank(c)).sort((x, y) => x - y);
    const suits = cards.map((c) => this.cardSuit(c));
    const isFlush = suits.every((s) => s === suits[0]);
    const isSeq = ranks[1] === ranks[0] + 1 && ranks[2] === ranks[1] + 1;
    if (this.hasTrio(cards)) return 'Trio';
    if (isSeq && isFlush) return 'Straight Flush';
    if (isFlush) return 'Flush';
    if (isSeq) return 'Straight';
    return '';
  }
  get resultCardsA(): string[] { return [this.tempCards[0], this.tempCards[2], this.tempCards[4]].filter((c: string) => c && c !== '1'); }
  get resultCardsB(): string[] { return [this.tempCards[1], this.tempCards[3], this.tempCards[5]].filter((c: string) => c && c !== '1'); }
  get resultValueA(): number { return this.baccaratValue(this.resultCardsA); }
  get resultValueB(): number { return this.baccaratValue(this.resultCardsB); }
  get resultWinnerLabel(): string {
    const a = this.resultCardsA, b = this.resultCardsB;
    if (a.length < 3 || b.length < 3) return '';
    const trioA = this.hasTrio(a), trioB = this.hasTrio(b);
    if (trioA !== trioB) return trioA ? 'Player A' : 'Player B';
    const va = this.resultValueA, vb = this.resultValueB;
    if (va !== vb) return va > vb ? 'Player A' : 'Player B';
    return 'Tie';
  }
  get resultHighCard(): string {
    const a = this.resultCardsA, b = this.resultCardsB;
    if (a.length < 3 || b.length < 3) return '';
    const maxA = Math.max(...a.map((c) => this.cardRank(c)));
    const maxB = Math.max(...b.map((c) => this.cardRank(c)));
    if (maxA === maxB) return '-';
    return maxA > maxB ? 'Player A' : 'Player B';
  }
  get resultPair(): string {
    const a = this.hasPair(this.resultCardsA), b = this.hasPair(this.resultCardsB);
    if (a && b) return 'Both';
    if (a) return 'Player A';
    if (b) return 'Player B';
    return '-';
  }
  get resultColorPlus(): string {
    const a = this.colorPlusLabel(this.resultCardsA), b = this.colorPlusLabel(this.resultCardsB);
    if (a && b) return 'A: ' + a + ' | B: ' + b;
    if (a) return 'Player A (' + a + ')';
    if (b) return 'Player B (' + b + ')';
    return '-';
  }
  get resultLucky9(): string {
    const all = [...this.resultCardsA, ...this.resultCardsB];
    return all.some((c) => this.cardRank(c) === 9) ? 'Yes' : 'No';
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
