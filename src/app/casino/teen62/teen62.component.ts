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
 * V VIP TEENPATTI 1-DAY (`teen62`)
 * -----------------------------------------------------------------------------
 * A/B teenpatti: Main Back/Lay + Consecutive Back/Lay per side, then a
 * Card 1..Card 6 tab strip, each card an Odd / Even bet. 3 cards / side.
 * Sibling: teen41 / teen. Live-wired; see subscribeLiveData().
 */
@Component({
  selector: 'app-teen62',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './teen62.component.html',
  styleUrl: './teen62.component.css',
})
export class Teen62Component implements OnInit {
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
  tempMatchTime = '';
  tempWinner: any = '';
  tempCards: any = [];

  activeCardTab = 1;
  cardTabs = [1, 2, 3, 4, 5, 6];

  playerA = {
    label: 'Player A', cards: ['/img/cards/1.png', '/img/cards/1.png', '/img/cards/1.png'],
    main: { back: '0', lay: '0', gstatus: '1', sid: 1, min: 0, max: 0 },
    consec: { back: '0', lay: '0', gstatus: '1', sid: 17, min: 0, max: 0 }, book: 0,
    suits: ['Spade', 'Diamond', 'Club', 'Heart'].map((s) => ({ key: s, label: s, rate: '0', gstatus: '1', sid: 0, min: 0, max: 0 })),
  };
  playerB = {
    label: 'Player B', cards: ['/img/cards/1.png', '/img/cards/1.png', '/img/cards/1.png'],
    main: { back: '0', lay: '0', gstatus: '1', sid: 2, min: 0, max: 0 },
    consec: { back: '0', lay: '0', gstatus: '1', sid: 18, min: 0, max: 0 }, book: 0,
    suits: ['Spade', 'Diamond', 'Club', 'Heart'].map((s) => ({ key: s, label: s, rate: '0', gstatus: '1', sid: 0, min: 0, max: 0 })),
  };
  /** per-card odd/even — sid = OUTER row sid (bet identity is sid + betfor "Odd"/"Even"); index 0..5 = Card 1..6 */
  cardOddEven = Array.from({ length: 6 }, (_, i) => ({
    card: i + 1, sid: 0, gstatus: '1', min: 0, max: 0,
    odd: { rate: '0' }, even: { rate: '0' },
  }));

  private readonly CODE = 'teen62';
  private readonly NAME = 'V VIP Teenpatti 1-Day';

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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3094'); // TODO(data)
    this.subscribeLiveData();
    this.placeBetButton();
  }

  ngOnDestroy() {
    this.socket_service.leavaAllRooms;
  }

  /**
   * Confirmed feed shape (console-verified): flat `data` = { mid, lt, card (6 cards,
   * 3/side; undealt slots are "1"), gtype:"teen62", sub: [
   *   sid 1/2  nat:"Player A"/"Player B"                     subtype "teen"   etype "match"  (Main, back+lay)
   *   sid 3-6  nat:"Player A Spade/Diamond/Club/Heart"        subtype "suita"  etype "match"  (back only)
   *   sid 7-10 nat:"Player B Spade/Diamond/Club/Heart"        subtype "suitb"  etype "match"  (back only)
   *   sid 11-16 nat:"Card 1".."Card 6"                        subtype "oddeven" etype "fancy" —
   *     the row's own b/l are unused (0); the real prices are nested in row.odds[]:
   *     [{nat:"Odd",sid:1,b},{nat:"Even",sid:2,b}]. Bet identity = outer row.sid + inner nat
   *     (inner sid/sno repeat across cards, so they alone don't identify which card).
   *   sid 17/18 nat:"Player A"/"Player B"                     subtype "con"    etype "fancy1" (Consecutive; back+lay)
   * ] }. gstatus is "OPEN"/"SUSPENDED". Rules text in-app confirms "con" = Consecutive cards bet.
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

      const cards = String(d.card ?? '').split(',').map((c: string) => c.trim());
      const cardImg = (c: string) => '/img/cards-new/' + (c || '1') + '.png';
      // cards are dealt interleaved: C1,C3,C5 -> Player A, C2,C4,C6 -> Player B
      this.playerA.cards = [cards[0], cards[2], cards[4]].map(cardImg);
      this.playerB.cards = [cards[1], cards[3], cards[5]].map(cardImg);

      const mid = d.mid ?? '';
      if (mid && this.roundId !== mid) {
        this.mybets = []; this.mybooks = [];
        this.getopenbet();
      }
      this.roundId = mid || this.roundId;

      const rows: any[] = d.sub || [];
      const bySid = (sid: number) => rows.find((r: any) => Number(r.sid) === sid);

      this.applyBackLay(this.playerA.main, bySid(1));
      this.applyBackLay(this.playerB.main, bySid(2));
      this.applyBackLay(this.playerA.consec, bySid(17));
      this.applyBackLay(this.playerB.consec, bySid(18));

      this.playerA.suits.forEach((s, i) => this.applyBackOnly(s, bySid(3 + i)));
      this.playerB.suits.forEach((s, i) => this.applyBackOnly(s, bySid(7 + i)));

      this.cardOddEven.forEach((c, i) => {
        const row = bySid(11 + i);
        if (!row) return;
        c.sid = row.sid;
        c.gstatus = String(row.gstatus ?? '1');
        c.min = row.min ?? c.min;
        c.max = row.bs ?? row.max ?? c.max;
        const oddRow = (row.odds || []).find((o: any) => o.nat === 'Odd');
        const evenRow = (row.odds || []).find((o: any) => o.nat === 'Even');
        if (oddRow) c.odd.rate = String(oddRow.b ?? c.odd.rate);
        if (evenRow) c.even.rate = String(evenRow.b ?? c.even.rate);
      });
    });

    this.socket_service.casinolast10('Last10', this.CODE).subscribe((raw: any) => {
      const list = raw?.data?.res ?? raw?.data ?? [];
      const winMap: Record<string, string> = { '1': 'A', '2': 'B' };
      if (Array.isArray(list) && list.length) this.results = list.slice(0, 10).map((r: any) => ({ mid: r.mid, result: winMap[r.win] ?? r.win }));
    });

    setTimeout(() => { this.getopenbet(); setTimeout(() => this.getopenbet(), 2000); }, 1500);

    this.socket_service.updateCheck('User', this.userauth.getUsername()).subscribe((u: any) => {
      if (u?.update) { this.userauth.getUserBalance(); this.getopenbet(); }
    });
  }

  private applyBackLay(target: any, row: any): void {
    if (!row) return;
    target.back = row.b ?? target.back;
    target.lay = row.l ?? target.lay;
    target.gstatus = String(row.gstatus ?? '1');
    target.min = row.min ?? target.min;
    target.max = row.bs ?? row.max ?? target.max;
    target.sid = row.sid ?? target.sid;
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


  clickCardTab(n: number) {
    this.activeCardTab = n;
  }
  get activeCard() {
    return this.cardOddEven[this.activeCardTab - 1];
  }

  openBetForm(content: any, betfor: string, odds: any, type: 'back' | 'lay', sid: number, oddstype: string, min = 100, max = 100000) {
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

  bookAmount(oddsType: string, selectionName: string): number {
    const row = (this.mybooks || []).find((b: any) => b.oddsType === oddsType);
    const entry = row?.book?.find?.((m: any) => m.selectionName === selectionName);
    return entry ? entry.amount : 0;
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
        this.tempWinner = r?.rdesc || r?.win || '';
        // keep undealt "1" placeholders in place so card positions (and the A/B split below) stay correct
        this.tempCards = String(r?.cards ?? r?.card ?? '').split(',').map((c: string) => c.trim());
      },
      error: () => (this.loader = false),
    });
  }

  /** result modal: cards are dealt interleaved, same as the live table (C1,C3,C5 -> A / C2,C4,C6 -> B) */
  get resultCardsA(): string[] { return [0, 2, 4].map((i) => this.tempCards[i] || '1'); }
  get resultCardsB(): string[] { return [1, 3, 5].map((i) => this.tempCards[i] || '1'); }

  private static readonly RANK_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  private static readonly ODD_RANKS = ['A', '3', '5', '7', '9', 'J', 'K'];
  private cardRank(code: string): string {
    const m = String(code || '').match(/^(10|[2-9]|[AJQK])/);
    return m ? m[1] : '';
  }
  private isOddCard(code: string): boolean {
    return Teen62Component.ODD_RANKS.includes(this.cardRank(code));
  }
  /** per-card Odd/Even, in dealt order (Card 1..Card 6) */
  get resultOddEven(): string[] {
    return (this.tempCards as string[]).map((c) => (this.isOddCard(c) ? 'Odd' : 'Even'));
  }
  /** two or more of a player's 3 cards fall on adjacent ranks (K-A counts as adjacent, per the rules) */
  private hasConsecutive(cards: string[]): boolean {
    const values = cards
      .map((c) => Teen62Component.RANK_ORDER.indexOf(this.cardRank(c)) + 1)
      .filter((v) => v > 0)
      .sort((a, b) => a - b);
    for (let i = 0; i < values.length - 1; i++) if (values[i + 1] - values[i] === 1) return true;
    return values.includes(1) && values.includes(13);
  }
  get consecutiveA(): boolean { return this.hasConsecutive(this.resultCardsA); }
  get consecutiveB(): boolean { return this.hasConsecutive(this.resultCardsB); }

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
