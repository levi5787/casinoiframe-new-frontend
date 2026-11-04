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
 * UNIQUE TEENPATTI (`teenunique`)
 * -----------------------------------------------------------------------------
 * Six candidate cards sit face-down on the table; the player picks any 3 while
 * betting is OPEN (all 6 still show as undealt "1"), and the other 3 auto-form
 * the "opponent" hand. Cards are dealt (revealed) only after betting closes.
 * Single back-only "Placebet" market (confirmed live: b~1.98 decimal odds, no
 * nat/sid field — bet identity is the row's `sr`).
 *
 * The vendor's result API gives NO per-round winner signal at all (rdesc is
 * always the literal "Won") — the backend (casinoresult.js) computes each
 * bet's own win/lose itself from the real dealt cards. `betfor` sent to the
 * backend is the chosen combo key, e.g. "1,3,6" (sorted ascending card
 * positions); `oddstype` is the canonical pair key "<combo>|<complement>"
 * (both sorted) — computed identically here and re-validated server-side.
 */
@Component({
  selector: 'app-teenunique',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './teenunique.component.html',
  styleUrl: './teenunique.component.css',
})
export class TeenuniqueComponent implements OnInit {
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
  tempCards: any = [];
  tempDate: any ='';

  /** 6 candidate cards (index 1..6), all "1" (undealt/back) until betting closes. */
  candidates = [1, 2, 3, 4, 5, 6].map((i) => ({ i, code: '1' }));
  selected: number[] = [];

  /** the single "your 3 picked cards" market. */
  mainBet = { rate: '0', sid: 0, gstatus: '1', min: 100, max: 100000 };

  protected readonly CODE = 'teenunique';
  protected readonly NAME = 'Unique Teenpatti';

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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3096'); // TODO(data)
    this.subscribeLiveData();
    this.placeBetButton();
  }

  /**
   * Confirmed feed shape (live-verified): flat `data` = { mid, lt, card (6 cards, dealt one
   * at a time after betting closes, undealt = "1"), gtype:"teenunique", sub: [
   *   { b, l:0, sr, gstatus:"OPEN"/"SUSPENDED", min, max, bs, subtype:"teenunique", etype:"fancy" }
   * ] }. That single row is `mainBet` above — it's the whole market (one back-only bet on your
   * 3-card selection beating the auto-formed opponent hand). Confirmed OPEN live: b~1.98
   * decimal odds, no nat/sid field — bet identity is the row's `sr`.
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
        this.selected = []; this.mybets = []; this.mybooks = [];
        this.getopenbet();
      }
      this.roundId = mid || this.roundId;

      const cards = String(d.card ?? '').split(',').map((c: string) => c.trim());
      this.candidates.forEach((c, i) => (c.code = cards[i] || '1'));

      const row = (d.sub || [])[0];
      if (row) {
        this.mainBet.rate = row.b ?? this.mainBet.rate;
        this.mainBet.gstatus = String(row.gstatus ?? '1');
        this.mainBet.sid = row.sr ?? this.mainBet.sid;
        this.mainBet.min = row.min ?? this.mainBet.min;
        this.mainBet.max = row.bs ?? row.max ?? this.mainBet.max;
      }
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
    this.socket_service.leavaAllRooms;
  }

  cardImg(code: string) {
    return '/img/cards-new/' + (code || '1') + '.png';
  }
  ballImg(i: number) {
    return '/img/sequence/s' + i + '-icon.png';
  }
  toggleCard(i: number) {
    const idx = this.selected.indexOf(i);
    if (idx > -1) this.selected.splice(idx, 1);
    else if (this.selected.length < 3) this.selected.push(i);
    else { this.displayToast('Pick exactly 3 cards', 'failed'); return; }
    this.syncBetForm();
  }
  isSelected(i: number) {
    return this.selected.includes(i);
  }
  clearSelection() {
    this.selected = [];
    this.hideBetPlace();
  }
  get selectedSorted(): number[] {
    return [...this.selected].sort((a, b) => a - b);
  }
  isSuspended(item: any): boolean {
    const g = String(item?.gstatus ?? '').trim().toUpperCase();
    return !(g === '1' || g === 'OPEN' || g === 'ACTIVE' || g === 'TRUE');
  }

  /** matches casino_controller.js's teenunique validation exactly - both sides must agree. */
  private comboKeyFor(positions: number[]): string {
    return [...positions].sort((a, b) => a - b).join(',');
  }
  private groupKeyFor(positions: number[]): string {
    const comboKey = this.comboKeyFor(positions);
    const complementKey = [1, 2, 3, 4, 5, 6].filter((n) => !positions.includes(n)).join(',');
    return [comboKey, complementKey].sort().join('|');
  }
  /** "1,3,6" -> [1,3,6] (used by the My Bet row to show Your Card / Dealer Card ball icons) */
  comboPositions(selectionName: string): number[] {
    return String(selectionName || '').split(',').map((s) => parseInt(s, 10)).filter((n) => !isNaN(n));
  }
  complementPositions(selectionName: string): number[] {
    const chosen = this.comboPositions(selectionName);
    return [1, 2, 3, 4, 5, 6].filter((n) => !chosen.includes(n));
  }
  formatCombo(selectionName: string): string {
    return this.comboPositions(selectionName).join('');
  }

  /**
   * Desktop: the sidebar place-bet box should appear (and stay in sync) as soon as the user
   * starts picking cards, not only once all 3 are chosen and "Placebet" is pressed - so this
   * runs from toggleCard() on every selection change. oddsType (the complementary pair key)
   * only resolves once exactly 3 cards are chosen, since it depends on the complement too.
   */
  private syncBetForm(): void {
    if (!this.selected.length) { this.hideBetPlace(); return; }
    this.showbetform = true;
    this.betFor = this.comboKeyFor(this.selected);
    this.oddsType = this.selected.length === 3 ? this.groupKeyFor(this.selected) : '';
    this.odds = this.mainBet.rate;
    this.betType = 'back';
    this.sid = this.mainBet.sid;
    this.min = this.mainBet.min;
    this.max = this.mainBet.max;
    this.stake = null;
    this.profit = 0;
    this.loss = 0;
  }

  /** Mobile: "Placebet" button opens the bet-slip modal (desktop already shows it live via syncBetForm). */
  placeBet(content: any) {
    if (this.selected.length !== 3) {
      this.displayToast('Select 3 cards first', 'failed');
      return;
    }
    if (this.isSuspended(this.mainBet)) {
      this.displayToast('Betting is suspended', 'failed');
      return;
    }
    this.syncBetForm();
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
        //console.log(winnerdata)
        this.loader = false;
        this.modalService.open(content, { size: 'xl' });
        const r = winnerdata['data']?.[0];
        this.temprId = rid;
        this.tempDate = winnerdata['data']?.[0].mtime;
        this.tempWinner = r?.win || '';
        this.tempCards = (r?.card || '').split(',').filter((c: string) => c && c !== '1');
        //console.log(this.tempCards)
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
