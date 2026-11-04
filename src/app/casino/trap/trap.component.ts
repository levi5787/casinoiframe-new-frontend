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
 * The Trap (`trap`)
 * -----------------------------------------------------------------------------
 * A/B card-total game: cards are dealt one at a time, alternating sides, and
 * scores build until one side lands on 13-15 (trapped, loses) or clears 15
 * (wins). Main Back/Lay per side, plus a single active per-card High/Low and
 * JQK side bet. Live-wired; see subscribeLiveData().
 */
@Component({
  selector: 'app-trap',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './trap.component.html',
  styleUrl: './trap.component.css',
})
export class TrapComponent implements OnInit {
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
  tempMainDesc = '';
  tempSevenDesc = '';
  tempPictureDesc = '';

  /** running score per side — points: A=1, 2-10=face, J=11, Q=12, K=13. Cards dealt
   * interleaved: index 0,2,4,... -> Player A; 1,3,5,... -> Player B (confirmed by the
   * in-app Rules copy: "First card ... from side A, next card ... from side B"). */
  playerA = { label: 'Player A', back: '0', lay: '0', gstatus: '1', sid: 1, min: 100, max: 500000, book: 0, total: 0, cards: [] as string[] };
  playerB = { label: 'Player B', back: '0', lay: '0', gstatus: '1', sid: 2, min: 100, max: 500000, book: 0, total: 0, cards: [] as string[] };

  /** the one currently-active (next-to-be-revealed) card position's High/Low + JQK side bets */
  activeHighLow = { sid: 0, card: 0, gstatus: '1', min: 100, max: 100000, low: { sid: 0, rate: '0' }, high: { sid: 0, rate: '0' } };
  activeJQK = { sid: 0, card: 0, gstatus: '1', min: 100, max: 100000, rate: '0', lay: '0' };

  protected readonly CODE = 'trap';
  protected readonly NAME = 'The Trap';

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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3011'); // TODO(data)
    this.subscribeLiveData();
    this.placeBetButton();
  }

  ngOnDestroy() {
    this.socket_service.leavaAllRooms;
  }

  /**
   * Confirmed feed shape (console-verified): flat `data` = { mid, lt, card (up to 14
   * cards dealt interleaved — even index -> A, odd index -> B — undealt = "1"),
   * gtype:"trap", remark (rules marquee text), sub: [
   *   sid 1/2   nat:"Player A"/"Player B"   subtype "trap"    etype "Match" (Main, back+lay)
   *   sid 3-16  nat:"Card 1".."Card 14"     subtype "highlow" etype "Fancy" — nested
   *             odds:[{nat:"High",sid:1},{nat:"Low",sid:2}], back only (l always 0). Every
   *             position is always present in the array (even suspended ones carry the
   *             odds array, just with b=0) — "active" position = gstatus "OPEN", not
   *             odds.length (unlike teen6's suit/oddeven groups).
   *   sid 17-30 nat:"Card 1".."Card 14"     subtype "jqk"     etype "Fancy1" — nested
   *             odds:[{nat:"JQK",sid:3}], back+lay. Same "active by gstatus" rule.
   * ] }. casinolast10 rows are { mid, win: "1"|"2" } (1=A, 2=B).
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
      // roundId must be updated BEFORE getopenbet(), otherwise it re-fetches the previous round's books
      if (mid && this.roundId !== mid) { this.mybets = []; this.mybooks = []; this.roundId = mid; this.getopenbet(); }
      this.roundId = mid || this.roundId;

      const cards = String(d.card ?? '').split(',').map((c: string) => c.trim());
      const cardImg = (c: string) => '/img/cards-new/' + (c || '1') + '.png';
      // index-based split (not filter-based) so undealt "1"s don't shift which side a card belongs to
      const dealtACards: string[] = [];
      const dealtBCards: string[] = [];
      cards.forEach((c, i) => {
        if (!c || c === '1') return;
        (i % 2 === 0 ? dealtACards : dealtBCards).push(c);
      });
      this.playerA.cards = dealtACards.map(cardImg);
      this.playerB.cards = dealtBCards.map(cardImg);
      this.playerA.total = dealtACards.reduce((s, c) => s + this.pointValue(c), 0);
      this.playerB.total = dealtBCards.reduce((s, c) => s + this.pointValue(c), 0);

      const rows: any[] = d.sub || [];
      const bySid = (sid: number) => rows.find((r: any) => Number(r.sid) === sid);
      this.applyBackLay(this.playerA, bySid(1));
      this.applyBackLay(this.playerB, bySid(2));

      const isOpen = (r: any) => String(r?.gstatus ?? '').toUpperCase() === 'OPEN';
      const activeHL = rows.find((r: any) => r.subtype === 'highlow' && isOpen(r));
      if (activeHL) {
        this.activeHighLow.sid = activeHL.sid;
        this.activeHighLow.card = parseInt(String(activeHL.nat ?? '').replace(/\D/g, ''), 10) || 0;
        this.activeHighLow.gstatus = String(activeHL.gstatus ?? '1');
        this.activeHighLow.min = activeHL.min ?? this.activeHighLow.min;
        this.activeHighLow.max = activeHL.bs ?? activeHL.max ?? this.activeHighLow.max;
        const high = (activeHL.odds || []).find((o: any) => o.nat === 'High');
        const low = (activeHL.odds || []).find((o: any) => o.nat === 'Low');
        if (high) { this.activeHighLow.high.rate = String(high.b ?? this.activeHighLow.high.rate); this.activeHighLow.high.sid = high.sid; }
        if (low) { this.activeHighLow.low.rate = String(low.b ?? this.activeHighLow.low.rate); this.activeHighLow.low.sid = low.sid; }
      } else {
        this.activeHighLow.sid = 0; this.activeHighLow.card = 0; this.activeHighLow.gstatus = 'SUSPENDED';
      }

      const activeJQK = rows.find((r: any) => r.subtype === 'jqk' && isOpen(r));
      if (activeJQK) {
        this.activeJQK.sid = activeJQK.sid;
        this.activeJQK.card = parseInt(String(activeJQK.nat ?? '').replace(/\D/g, ''), 10) || 0;
        this.activeJQK.gstatus = String(activeJQK.gstatus ?? '1');
        this.activeJQK.min = activeJQK.min ?? this.activeJQK.min;
        this.activeJQK.max = activeJQK.bs ?? activeJQK.max ?? this.activeJQK.max;
        const jqk = (activeJQK.odds || [])[0];
        if (jqk) this.activeJQK.rate = String(jqk.b ?? this.activeJQK.rate);
        if (jqk) this.activeJQK.lay = String(jqk.l ?? this.activeJQK.lay);
      } else {
        this.activeJQK.sid = 0; this.activeJQK.card = 0; this.activeJQK.gstatus = 'SUSPENDED';
      }
    });

    this.socket_service.casinolast10('Last10', this.CODE).subscribe((raw: any) => {
      const list = raw?.data?.res ?? raw?.data ?? [];
      if (Array.isArray(list) && list.length) {
        this.results = list.slice(0, 10).map((r: any) => ({ mid: r.mid, result: r.win === '1' ? 'A' : r.win === '2' ? 'B' : r.win }));
      }
    });

    setTimeout(() => { this.getopenbet(); setTimeout(() => this.getopenbet(), 2000); }, 1500);

    this.socket_service.updateCheck('User', this.userauth.getUsername()).subscribe((u: any) => {
      if (u?.update) { this.userauth.getUserBalance(); this.getopenbet(); }
    });
  }

  /** Ace=1, 2-10 face value, J=11, Q=12, K=13 (per the in-app Rules text). */
  private pointValue(code: string): number {
    const m = String(code || '').match(/^(10|[2-9]|[AJQK])/);
    if (!m) return 0;
    const r = m[1];
    if (r === 'A') return 1;
    if (r === 'J') return 11;
    if (r === 'Q') return 12;
    if (r === 'K') return 13;
    return parseInt(r, 10);
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
  isSuspended(item: any): boolean {
    const g = String(item?.gstatus ?? '').trim().toUpperCase();
    return !(g === '1' || g === 'OPEN' || g === 'ACTIVE' || g === 'TRUE');
  }

  betPlayer(content: any, p: any, type: 'back' | 'lay') {
    this.openBetForm(content, p.label, type === 'back' ? p.back : p.lay, type, p.sid, 'Winner', p.min, p.max);
  }
  betHighLow(content: any, side: 'high' | 'low') {
    const sel = this.activeHighLow[side];
    this.openBetForm(content, 'Card ' + this.activeHighLow.card + ' ' + (side === 'high' ? 'High' : 'Low'),
      sel.rate, 'back', this.activeHighLow.sid, 'Card' + this.activeHighLow.card + 'HighLow', this.activeHighLow.min, this.activeHighLow.max);
  }
  betJQK(content: any, type: 'back' | 'lay' = 'back') {
    this.openBetForm(content, 'Card ' + this.activeJQK.card + ' JQK', type === 'back' ? this.activeJQK.rate : this.activeJQK.lay,
      type, this.activeJQK.sid, 'Card' + this.activeJQK.card + 'JQK', this.activeJQK.min, this.activeJQK.max);
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

  /** Main (PlayerA/PlayerB), CardNHighLow and CardNJQK are all netted 2-way books, so
   * `book` is always a [{selectionName,amount}] array here - no independent-prop shape
   * exists for trap. */
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
  /**
   * `/casino/getresult/:roundid` returns `t1.rdesc`, a `#`-joined string with the 3 result-modal
   * rows already computed by the vendor, e.g. "Player A  (A:17, B:4)#Low,Low,High#No,No,Yes"
   * (Main/Seven/Picture Card — confirmed live, including the double space after "Player A").
   * Card field is `t1.card` (singular), not `cards`.
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
        // keep undealt "1" placeholders in place so the A/B interleave below stays correct
        this.tempCards = String(r?.card ?? r?.cards ?? '').split(',').map((c: string) => c.trim());
        const parts = String(r?.rdesc ?? '').split('#');
        this.tempMainDesc = parts[0] || '';
        this.tempSevenDesc = parts[1] || '';
        this.tempPictureDesc = parts[2] || '';
      },
      error: () => (this.loader = false),
    });
  }

  /** result modal: same interleave as the live table (even index -> A, odd index -> B) */
  get resultCardsA(): string[] { return this.tempCards.filter((c: string, i: number) => i % 2 === 0 && c && c !== '1'); }
  get resultCardsB(): string[] { return this.tempCards.filter((c: string, i: number) => i % 2 === 1 && c && c !== '1'); }
  get resultTotalA(): number { return this.resultCardsA.reduce((s, c) => s + this.pointValue(c), 0); }
  get resultTotalB(): number { return this.resultCardsB.reduce((s, c) => s + this.pointValue(c), 0); }

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
