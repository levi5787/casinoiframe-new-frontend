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
declare const $: any;

/**
 * Andar Bahar 50 Cards (`ab3`)
 * -----------------------------------------------------------------------------
 * Live-wired; see subscribeLiveData(). Confirmed feed shape (console-verified):
 * flat `data` = { mid, lt, ft, card (50 slots, dealt one at a time, undealt="1"),
 * gtype:"ab3", sub:[{ sid, nat:"Card <N>", b, sr (1-indexed position of the next
 * biddable card), gstatus:"OPEN"/"SUSPENDED", min, max }], child:[26 rows: sid
 * 1-13 "Andar A".."Andar K", sid 21-33 "Bahar A".."Bahar K", each {b, l}] }.
 * Per in-app Rules: cards alternate starting with Bahar (position 1=Bahar,
 * 2=Andar, 3=Bahar, ...), so side = position odd ? Bahar : Andar. The single
 * `sub[0]` row gates the whole board (OPEN/SUSPENDED) for the currently-open
 * card position; `child[]` rows carry the per-rank back rate for each side.
 */
@Component({
  selector: 'app-ab3',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './ab3.component.html',
  styleUrl: './ab3.component.css',
})
export class Ab3Component implements OnInit, OnDestroy {
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

  private readonly RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  /** 13 ranks per side; sid 1-13 = Andar A..K, sid 21-33 = Bahar A..K (confirmed live). */
  andarItems: any[] = this.RANKS.map((r, i) => ({ rank: r, sid: i + 1, img: './img/andar_bahar/' + (i + 1) + '.jpg', rate: 0, lay: 0, label: 'Andar ' + r, oddstype: 'Andar ' + r }));
  baharItems: any[] = this.RANKS.map((r, i) => ({ rank: r, sid: i + 21, img: './img/andar_bahar/' + (i + 1) + '.jpg', rate: 0, lay: 0, label: 'Bahar ' + r, oddstype: 'Bahar ' + r }));

  /** the single global gating row (sub[0]): OPEN/SUSPENDED for whichever card is next */
  mainRow: any = { gstatus: 'SUSPENDED', min: 100, max: 100000, sr: 0, nat: '' };
  cards: string[] = new Array(50).fill('1');

  bookMap: { [k: string]: number } = {};

  protected readonly CODE = 'ab3';
  protected readonly NAME = 'Andar Bahar 50 Cards';

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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3015');
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
        this.resetSlider('.ab3-andar-slider');
        this.resetSlider('.ab3-bahar-slider');
      } else {
        this.roundId = mid || this.roundId;
      }

      this.cards = String(d.card ?? '').split(',').map((c: string) => c.trim());
      this.updateSlider('.ab3-andar-slider', this.andarCards);
      this.updateSlider('.ab3-bahar-slider', this.baharCards);

      const row = (d.sub || [])[0];
      if (row) {
        this.mainRow.gstatus = String(row.gstatus ?? 'SUSPENDED');
        this.mainRow.sr = row.sr ?? this.mainRow.sr;
        this.mainRow.nat = row.nat ?? this.mainRow.nat;
        this.mainRow.min = row.min ?? this.mainRow.min;
        this.mainRow.max = row.max ?? this.mainRow.max;
      }

      (d.child || []).forEach((c: any) => {
        const list = c.sid < 20 ? this.andarItems : this.baharItems;
        const item = list.find((x) => x.sid === c.sid);
        if (item) {
          item.rate = c.b ?? item.rate;
          item.lay = c.l ?? item.lay;
          item.oddstype = c.nat ?? item.oddstype;
        }
      });
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
    this.resetSlider('.ab3-andar-slider');
    this.resetSlider('.ab3-bahar-slider');
  }

  /** real scrollable slick carousel — same pattern already proven working in ab2.component.ts */
  private updateSlider(selector: string, cardsList: string[]): void {
    const $el = $(selector);
    if (!$el.length) return;
    if (!$el.hasClass('slick-initialized')) {
      $el.slick({ slidesToShow: 3, slidesToScroll: 3, infinite: false });
    }
    cardsList.forEach((code, i) => {
      const src = this.cardImg(code);
      if ($el.find('img[src="' + src + '"]').length === 0) {
        $el.slick('slickAdd', '<div><img src="' + src + '"></div>');
        $el.slick('slickGoTo', i);
      }
    });
  }
  private resetSlider(selector: string): void {
    const $el = $(selector);
    if ($el.length && $el.hasClass('slick-initialized')) {
      $el.slick('unslick');
      $el.empty();
    }
  }

  /** brief global freeze while the current card is being revealed (mainRow.gstatus toggling) */
  private globallySuspended(): boolean {
    const g = String(this.mainRow?.gstatus ?? '').trim().toUpperCase();
    return !(g === '1' || g === 'OPEN' || g === 'ACTIVE' || g === 'TRUE');
  }
  /**
   * per-item suspension (confirmed live): each rank's own `b` rate goes to 0
   * either when that whole side isn't the next side to be dealt (all 13 items
   * zero together — confirmed via live polling: Andar goes 0/13 exactly when
   * nextSide==='Andar'), or individually once that specific rank has already
   * been dealt on that side this round. Both are already reflected by the
   * live rate itself, so reading it directly captures both.
   */
  isSuspended(item: any): boolean {
    if (this.globallySuspended()) return true;
    return !(Number(item?.rate) > 0);
  }
  /** container-level side lock (confirmed live: reference HTML puts suspended-box on .andar-box/.bahar-box, not per-cell) */
  get andarSideSuspended(): boolean { return this.globallySuspended() || this.andarItems.every((i) => !(Number(i.rate) > 0)); }
  get baharSideSuspended(): boolean { return this.globallySuspended() || this.baharItems.every((i) => !(Number(i.rate) > 0)); }

  /** dealt cards, position 1-indexed: odd=Bahar, even=Andar (per in-app Rules) */
  get baharCards(): string[] { return this.cards.filter((c, i) => c !== '1' && (i + 1) % 2 === 1); }
  get andarCards(): string[] { return this.cards.filter((c, i) => c !== '1' && (i + 1) % 2 === 0); }
  get nextSide(): string { return this.mainRow.sr % 2 === 1 ? 'Bahar' : 'Andar'; }
  cardImg(code: string) { return './img/cards-new/' + (code || '1') + '.png'; }
  /** confirmed live (reference site): a locked box's rank icon swaps to the "0" placeholder */
  rankImg(item: any): string { return this.isSuspended(item) ? './img/andar_bahar/0.jpg' : item.img; }

  /**
   * Per the in-app Rules + live confirmation (child[].b drops to 0 for ALL 13 Andar
   * ranks exactly while an Andar card is imminent, never for Bahar): Andar is only
   * ever bettable as a LOOKAHEAD on the next Andar position (one step past whatever
   * position is currently gated); Bahar is bettable both on its own imminent card
   * ("self" — discounted payout on cards 1-32/33-45 per the Rules) and, during the
   * preceding Andar turn, as a lookahead on the following Bahar card (full payout).
   * The target position + which of these two cases it is must travel with the bet
   * (settlement can't otherwise tell which of the 50 dealt cards it was about, or
   * which payout rate applies), so both are encoded into betFor/oddsType.
   */
  bet(content: any, item: any, type: 'back' | 'lay' = 'back') {
    if (this.isSuspended(item)) { this.displayToast('Betting is suspended', 'failed'); return; }
    const currentPos = this.mainRow.sr || 0;
    const isBahar = String(item.label).startsWith('Bahar');
    const isBaharSelf = isBahar && currentPos % 2 === 1;
    const targetPos = isBahar ? (isBaharSelf ? currentPos : currentPos + 1) : currentPos + 1;
    const suffix = isBahar && !isBaharSelf ? 'L' : '';
    this.showbetform = true;
    this.betFor = item.label + ' #' + targetPos + suffix;
    this.odds = type === 'lay' ? (item.lay ?? item.rate) : item.rate;
    this.betType = type;
    this.oddsType = this.betFor; // one-shot single prop per target position, no cross-selection netting
    this.sid = item.sid || 0;
    this.min = this.mainRow.min || 100;
    this.max = this.mainRow.max || 100000;
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
    // `b`/`l` are payout RATIOS here (confirmed: b is flat 1 = "100% of stake", matching
    // the in-app Rules' default "payout will be 100% of your bet amount"), not decimal
    // odds — profit = stake * rate, not stake * (rate - 1).
    this.profit = this.stake ? Math.round(this.stake * this.odds * 100) / 100 : 0;
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
        setTimeout(() => {
          this.initResultSlider('.ab3-andar-result-slider', this.resultAndarCards);
          this.initResultSlider('.ab3-bahar-result-slider', this.resultBaharCards);
        });
      },
      error: () => (this.loader = false),
    });
  }

  /** result-modal card lists, position 1-indexed: even=Andar, odd=Bahar (per in-app Rules) */
  get resultAndarCards(): { pos: number; code: string }[] {
    return this.tempCards
      .map((code: string, i: number) => ({ pos: i + 1, code }))
      .filter((c: any) => c.code && c.code !== '1' && c.pos % 2 === 0);
  }
  get resultBaharCards(): { pos: number; code: string }[] {
    return this.tempCards
      .map((code: string, i: number) => ({ pos: i + 1, code }))
      .filter((c: any) => c.code && c.code !== '1' && c.pos % 2 === 1);
  }
  /** one-shot result slider — same responsive slidesToShow steps proven in ab2.component.ts openResult() */
  private initResultSlider(selector: string, list: { pos: number; code: string }[]): void {
    const $el = $(selector);
    if (!$el.length) return;
    if ($el.hasClass('slick-initialized')) $el.slick('unslick');
    $el.empty();
    $el.slick({
      slidesToShow: 12, slidesToScroll: 12, infinite: false,
      responsive: [
        { breakpoint: 1024, settings: { slidesToShow: 8, slidesToScroll: 8 } },
        { breakpoint: 990, settings: { slidesToShow: 5, slidesToScroll: 5 } },
        { breakpoint: 480, settings: { slidesToShow: 3, slidesToScroll: 3 } },
      ],
    });
    list.forEach((c) => {
      $el.slick('slickAdd', '<div><div class="text-center">' + c.pos + '</div><img src="' + this.cardImg(c.code) + '"></div>');
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
