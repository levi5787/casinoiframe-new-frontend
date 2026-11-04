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
 * TEENPATTI 2.0 (`teen6`)
 * -----------------------------------------------------------------------------
 * A/B teenpatti with: Main Back/Lay per side, Under 21 / Over 22 per side,
 * suit bets (spade/heart/club/diamond) and Odd / Even. 3 cards / side.
 * Sibling: teen9 / teen8 / teen. Live-wired; see subscribeLiveData().
 */
@Component({
  selector: 'app-teen6',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './teen6.component.html',
  styleUrl: './teen6.component.css',
})
export class Teen6Component implements OnInit, OnDestroy {
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
  winnerBook: any = [];

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
  tempCards: any = [];

  playerA = {
    label: 'Player A', cards: ['/img/cards/1.png', '/img/cards/1.png', '/img/cards/1.png'],
    main: { back: '0', lay: '0', gstatus: '1', sid: 1, min: 50, max: 200000 },
    under21: { rate: '0', gstatus: '1', sid: 9, min: 100, max: 50000 }, over22: { rate: '0', gstatus: '1', sid: 10, min: 100, max: 50000 },
    book: 0, min: 100, max: 100000,
  };
  playerB = {
    label: 'Player B', cards: ['/img/cards/1.png', '/img/cards/1.png', '/img/cards/1.png'],
    main: { back: '0', lay: '0', gstatus: '1', sid: 2, min: 50, max: 200000 },
    under21: { rate: '0', gstatus: '1', sid: 11, min: 100, max: 50000 }, over22: { rate: '0', gstatus: '1', sid: 12, min: 100, max: 50000 },
    book: 0, min: 100, max: 100000,
  };
  /**
   * These three "side bet" markets are per-card-position (Card 1..6), but only
   * ONE position is open for betting at a time — the next card about to be
   * revealed (confirmed live: exactly one "Card N" row per subtype carries a
   * non-empty `odds[]` at any moment, and it's the same N across all three
   * subtypes). So the UI shows one flat row per group, tracking whichever
   * position is currently active.
   */
  activeSuit: any = { sid: 0, card: 0, gstatus: '1', min: 100, max: 100000, options: [] as any[] };
  activeOddEven: any = { sid: 0, card: 0, gstatus: '1', min: 100, max: 100000, options: [] as any[] };
  activeCardVal: any = { sid: 0, card: 0, gstatus: '1', min: 100, max: 100000, options: [] as any[] };
  cardValueLabels = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  bookMap: { [k: string]: number } = {};

  private readonly CODE = 'teen6';
  private readonly NAME = 'Teenpatti 2.0';

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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3093'); // TODO(data)

    this.subscribeLiveData();
    this.placeBetButton();
  }

  ngOnDestroy() {
    this.socket_service.leavaAllRooms();
  }

  /**
   * Confirmed feed shape (console-verified): flat `data` = { mid, lt, card (6
   * cards, dealt interleaved C1,C3,C5 -> A / C2,C4,C6 -> B, undealt = "1"), gtype:"teen6", sub: [
   *   sid 1/2  nat:"Player A"/"Player B"                     subtype "teen6" etype "Match" (Main, back+lay)
   *   sid 3-8  nat:"Card 1".."Card 6"                        subtype "suit"    etype "Fancy" — nested
   *            odds:[{nat:"Spade"|"Diamond"|"Club"|"Heart", b, sid, sno}]; only ONE of the 6
   *            positions carries non-empty odds at a time (the next card to be revealed).
   *   sid 9-12 nat:"Player A/B Under 21"/"Over 22"            subtype "uo"      etype "Fancy" (back only)
   *   sid 13-18 nat:"Card 1".."Card 6"                        subtype "oddeven" etype "Fancy" — nested
   *            odds:[{nat:"Odd"|"Even", b, sid, sno}], same "only one active" rule.
   *   sid 19-24 nat:"Card 1".."Card 6"                        subtype "cards"   etype "Fancy" — nested
   *            odds:[{nat:"Card A".."Card K", b, sid, sno}] (13-way), same "only one active" rule.
   * ] }. Bet identity for the nested markets = outer row.sid + inner nat.
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

      // cards are dealt interleaved: C1,C3,C5 -> Player A, C2,C4,C6 -> Player B (same as teen32/teen41/teen62)
      const cards = String(d.card ?? '').split(',').map((c: string) => c.trim());
      const cardImg = (c: string) => '/img/cards-new/' + (c || '1') + '.png';
      this.playerA.cards = [0, 2, 4].map((i) => cardImg(cards[i]));
      this.playerB.cards = [1, 3, 5].map((i) => cardImg(cards[i]));

      const mid = d.mid ?? '';
      if (mid && this.roundId !== mid) {
        this.mybets = []; this.mybooks = []; this.winnerBook = []; this.bookMap = {};
        this.roundId = mid;
        this.getopenbet();
      } else {
        this.roundId = mid || this.roundId;
      }

      const rows: any[] = d.sub || [];
      const bySid = (sid: number) => rows.find((r: any) => Number(r.sid) === sid);
      const findActive = (subtype: string) => rows.find((r: any) => r.subtype === subtype && Array.isArray(r.odds) && r.odds.length > 0);

      this.applyBackLay(this.playerA.main, bySid(1));
      this.applyBackLay(this.playerB.main, bySid(2));
      this.applyBackOnly(this.playerA.under21, bySid(9));
      this.applyBackOnly(this.playerA.over22, bySid(10));
      this.applyBackOnly(this.playerB.under21, bySid(11));
      this.applyBackOnly(this.playerB.over22, bySid(12));

      this.applyActive(this.activeSuit, findActive('suit'));
      this.applyActive(this.activeOddEven, findActive('oddeven'));
      this.applyActive(this.activeCardVal, findActive('cards'));
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
    target.sid = row.sid ?? target.sid;
    target.min = row.min ?? target.min;
    target.max = row.bs ?? row.max ?? target.max;
  }
  /** Populate an "active card position" group (suit / oddeven / cards) from its live row. */
  private applyActive(target: any, row: any): void {
    if (!row) { target.sid = 0; target.card = 0; target.options = []; return; }
    target.sid = row.sid;
    target.card = parseInt(String(row.nat ?? '').replace(/\D/g, ''), 10) || 0;
    target.gstatus = String(row.gstatus ?? '1');
    target.min = row.min ?? target.min;
    target.max = row.bs ?? row.max ?? target.max;
    target.options = (row.odds || []).map((o: any) => ({ nat: o.nat, rate: String(o.b ?? '0') }));
  }
  /** Look up one nested selection's rate by its provider `nat` ("Spade", "Odd", "Card K", …). */
  rateOf(group: any, nat: string): string {
    return group?.options?.find((o: any) => o.nat === nat)?.rate ?? '0';
  }
  /** A card-position group is suspended when there's no active position, or its gstatus says so. */
  isGroupSuspended(group: any): boolean {
    if (!group?.sid) return true;
    return this.isSuspended(group);
  }
  isSuspended(item: any): boolean {
    const g = String(item?.gstatus ?? '').trim().toUpperCase();
    return !(g === '1' || g === 'OPEN' || g === 'ACTIVE' || g === 'TRUE');
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

  getopenbet() {
    this.userauth.getCasinoOpenBet(this.CODE, this.roundId).subscribe({
      next: (res: any) => {
        this.mybets = res.openbets;
        this.mybooks = res.books;
        this.bookMap = {};
        (this.mybets || []).forEach((b: any) => {
          this.bookMap[b.oddsType] = (this.bookMap[b.oddsType] || 0) + (b.betType === 'lay' ? -b.stake : b.stake);
        });
        const winnerRow = (this.mybooks || []).find((b: any) => b.oddsType === 'Winner');
        this.winnerBook = winnerRow?.book || [];
      },
      error: (e) => console.log(e),
    });
  }

  /** Net per-selection amount for a Card-position side market (suit/oddeven/value), from the
   *  `oddsType`-keyed book rows returned by getopenbet — used by the betting-option overlays. */
  bookAmount(oddsType: string, selectionName: string): number {
    const row = (this.mybooks || []).find((b: any) => b.oddsType === oddsType);
    const entry = row?.book?.find?.((m: any) => m.selectionName === selectionName);
    return entry ? entry.amount : 0;
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
        this.tempWinner = r?.rdesc.split('#');
        // keep undealt "1" placeholders in place so card positions (and the A/B split below) stay correct
        this.tempCards = String(r?.cards ?? r?.card ?? '').split(',').map((c: string) => c.trim());
      },
      error: () => (this.loader = false),
    });
  }

  /** result modal: cards are dealt interleaved, same as the live table (C1,C3,C5 -> A / C2,C4,C6 -> B) */
  get resultCardsA(): string[] { return [0, 2, 4].map((i) => this.tempCards[i] || '1'); }
  get resultCardsB(): string[] { return [1, 3, 5].map((i) => this.tempCards[i] || '1'); }

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
