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
 * TEENPATTI POISON 20-20 (`poison20`)
 * -----------------------------------------------------------------------------
 * A POISON card is dealt, then Player A / Player B Back-Lay, plus a side grid:
 * Even / Odd / Red / Black and per-suit "Poison" rows.
 * Sibling: teen / one-card-one-day. Live-wired; see subscribeLiveData().
 */
@Component({
  selector: 'app-poison20',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './poison20.component.html',
  styleUrl: './poison20.component.css',
})
export class Poison20Component implements OnInit {
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
  tempWinnerDesc = '';
  tempOddEvenDesc = '';
  tempColorDesc = '';
  tempSuitDesc = '';

  poisonCard = '/img/cards-new/1.png';
  playerA = { label: 'Player A', cards: ['/img/cards-new/1.png', '/img/cards-new/1.png', '/img/cards-new/1.png'], back: '0', lay: '0', gstatus: '1', sid: 1, book: 0, min: 100, max: 100000 };
  playerB = { label: 'Player B', cards: ['/img/cards-new/1.png', '/img/cards-new/1.png', '/img/cards-new/1.png'], back: '0', lay: '0', gstatus: '1', sid: 2, book: 0, min: 100, max: 100000 };

  /** side grid — sid/nat/order confirmed live (console-verified) */
  sideBets = [
    { key: 'Even', label: 'Even', rate: '0', gstatus: '1', sid: 3 },
    { key: 'Odd', label: 'Odd', rate: '0', gstatus: '1', sid: 4 },
    { key: 'Red', label: 'Red', rate: '0', gstatus: '1', sid: 5, img: '/img/icons/heart.png' },
    { key: 'Black', label: 'Black', rate: '0', gstatus: '1', sid: 6, img: '/img/icons/spade.png' },
  ];
  suitBets = [
    { key: 'PoisonSpade', label: 'Poison ♠', rate: '0', gstatus: '1', sid: 7, img: '/img/icons/spade.png' },
    { key: 'PoisonHeart', label: 'Poison ♥', rate: '0', gstatus: '1', sid: 8, img: '/img/icons/heart.png' },
    { key: 'PoisonDiamond', label: 'Poison ♦', rate: '0', gstatus: '1', sid: 9, img: '/img/icons/diamond.png' },
    { key: 'PoisonClub', label: 'Poison ♣', rate: '0', gstatus: '1', sid: 10, img: '/img/icons/club.png' },
  ];
  protected readonly CODE = 'poison20';
  protected readonly NAME = 'Teenpatti Poison 20-20';

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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3098'); // TODO(data)
    this.subscribeLiveData();
    this.placeBetButton();
  }

  ngOnDestroy() {
    this.socket_service.leavaAllRooms;
  }

  /**
   * Confirmed feed shape (console-verified): flat `data` = { mid, lt, card (7
   * cards: index 0 is the Poison card, indices 1-6 are dealt interleaved
   * C1,C3,C5 -> Player A / C2,C4,C6 -> Player B, same interleave as
   * teen32/teen6/teen62; undealt = "1"), gtype:"poison20", sub: [
   *   sid 1/2  nat:"Player A"/"Player B"                    subtype "poison20"  (Main, back+lay)
   *   sid 3/4  nat:"Poison Even"/"Poison Odd"                subtype "poison20o" (back only)
   *   sid 5/6  nat:"Poison Red"/"Poison Black"               subtype "poison20r" (back only)
   *   sid 7-10 nat:"Poison Spade"/"Heart"/"Diamond"/"Club"   subtype "poison20c" (back only)
   * ] }. gstatus is "OPEN"/"SUSPENDED".
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
      const cardImg = (c: string) => '/img/cards-new/' + (c || '1') + '.png';
      this.poisonCard = cardImg(cards[0]);
      this.playerA.cards = [1, 3, 5].map((i) => cardImg(cards[i]));
      this.playerB.cards = [2, 4, 6].map((i) => cardImg(cards[i]));

      const rows: any[] = d.sub || [];
      const bySid = (sid: number) => rows.find((r: any) => Number(r.sid) === sid);
      this.applyBackLay(this.playerA, bySid(1));
      this.applyBackLay(this.playerB, bySid(2));
      this.sideBets.forEach((s, i) => this.applyBackOnly(s, bySid(3 + i)));
      this.suitBets.forEach((s, i) => this.applyBackOnly(s, bySid(7 + i)));
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


  betPlayer(content: any, p: any, type: 'back' | 'lay') {
    this.openBetForm(content, p.label, type === 'back' ? p.back : p.lay, type, p.sid, 'Winner', p.min, p.max);
  }
  betSide(content: any, s: any) {
    this.openBetForm(content, s.label, s.rate, 'back', s.sid, s.key, s.min ?? 100, s.max ?? 100000);
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

  /**
   * Player A/Player B are independent 2-way netted books (own oddsType per side, see
   * subscribeLiveData's comment) -> `book` is a [{selectionName,amount}] array there.
   * Even/Odd/Red/Black/Poison-suit are independent back-only props -> `book` is a plain
   * positive exposure number there, shown negated as a liability (matches dolidana's
   * established convention for this same book shape).
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
   * `/casino/getresult/:roundid` returns `t1.rdesc`, a `#`-joined string with the 4 result-modal
   * rows already computed by the vendor, e.g. "Player A#Odd#Red#Diamond" (Winner/Odd-Even/Color/
   * Suit of the Poison card — confirmed live). Card field is `t1.card` (singular), not `cards`.
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
        // keep undealt "1" placeholders in place so card positions (poison card + A/B split) stay correct
        this.tempCards = String(r?.card ?? r?.cards ?? '').split(',').map((c: string) => c.trim());
        const parts = String(r?.rdesc ?? '').split('#');
        this.tempWinnerDesc = parts[0] || '';
        this.tempOddEvenDesc = parts[1] || '';
        this.tempColorDesc = parts[2] || '';
        this.tempSuitDesc = parts[3] || '';
      },
      error: () => (this.loader = false),
    });
  }

  /** result modal: index 0 is the Poison card; the rest are dealt interleaved (C1,C3,C5 -> A / C2,C4,C6 -> B) */
  get resultPoisonCard(): string { return this.tempCards[0] || '1'; }
  get resultCardsA(): string[] { return [1, 3, 5].map((i) => this.tempCards[i] || '1'); }
  get resultCardsB(): string[] { return [2, 4, 6].map((i) => this.tempCards[i] || '1'); }

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
