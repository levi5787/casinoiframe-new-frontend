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
 * MATKA MARKET (`worli3`)  —  page container class `worli matka`
 * -----------------------------------------------------------------------------
 * Structure mirrors the live d247 DOM (scraped):
 *   .casino-header
 *   .matka-tabs > ul.nav-pills > li ×N  (timed markets, name + countdown + date)
 *   .casino-title-header-mobile
 *   .casino-video (+ .matka-coins chip bar + flip clock)
 *   .casino-detail
 *     .nav.nav-pills  (bet-type tabs: Jodi/Single/Pana/SP/DP/Trio/Cycle/Motor SP/
 *                      56 Charts/64 Charts/ABR/Common SP/Common DP/Color DP)
 *     .casino-box.tab-content
 *       .fade.jodi.tab-pane   → .casino-table-full-box > .worlibox > .worli-full
 *                                > .worli-box-row ×10 > .worli-odd-box.back ×10  (0-0 … 9-9)
 *       .fade.single.tab-pane → .worlibox > .worli-left (1..5 ×2) + .worli-right (Line1/Line2/Odd/Even)
 *       .fade.sp/.dp/.chart56/.chart64 …  → .worlibox > .worli-left + .worli-right ("SP ALL" etc.)
 *   .casino-last-result-title / .casino-last-results
 *
 * DESIGN PHASE — MOCK markets/odds; `// TODO(data)` marks the socket wiring.
 */
@Component({
  selector: 'app-worli3',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './worli3.component.html',
  styleUrl: './worli3.component.css',
})
export class Worli3Component implements OnInit, OnDestroy {
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
  results: any = [];
  mybets: any = [];
  mybooks: any = [];

  // ---- matka model (MOCK) ----
  markets: { key: string; name: string; closeAt: number; date: string }[] = [];
  activeMarket = '';

  betTypes = [
    { key: 'jodi', label: 'Jodi' }, { key: 'single', label: 'Single' }, { key: 'pana', label: 'Pana' },
    { key: 'sp', label: 'SP' }, { key: 'dp', label: 'DP' }, { key: 'trio', label: 'Trio' },
    { key: 'cycle', label: 'Cycle' }, { key: 'motorsp', label: 'Motor SP' },
    { key: 'chart56', label: '56 Charts' }, { key: 'chart64', label: '64 Charts' }, { key: 'abr', label: 'ABR' },
    { key: 'commonsp', label: 'Common SP' }, { key: 'commondp', label: 'Common DP' }, { key: 'colordp', label: 'Color DP' },
  ];
  activeBetType = 'jodi';

  coins = [25, 50, 100, 200, 500, 1000];
  selectedCoin: number | null = null;

  jodiRows: string[][] = (() => {
    const rows: string[][] = [];
    for (let a = 0; a <= 9; a++) { rows.push(Array.from({ length: 10 }, (_, b) => `${a}-${b}`)); }
    return rows;
  })();
  singleDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  cart: { market: string; betType: string; number: string; amount: number }[] = [];

  private timer: any;
  protected readonly CODE = 'worli3';
  protected readonly NAME = 'Matka Market';

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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=WORLI3_CHANNEL'); // TODO(data)
    this.loadMock();
    // TODO(data): socket_service.casinodata('Casino', this.CODE) → markets + close
    // times + per-tab odds; casinolast10 → results.
    this.timer = setInterval(() => {}, 1000); // drives countdown() re-eval
    this.placeBetButton();
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    this.socket_service.leavaAllRooms;
  }

  protected loadMock() {
    this.data = { mock: true };
    this.roundId = '000000000000';
    const now = Date.now();
    const names = ['Asia Open', 'Asia Close', 'Taj Open', 'Taj Close', 'Gulf Open', 'Gulf Close',
      'Diamond Open', 'Diamond Close', 'World Open', 'World Close', 'Lords Open', 'Lords Close', 'Riga Open', 'Riga Close'];
    this.markets = names.map((n, i) => ({
      key: n.toLowerCase().replace(/\s+/g, '_'),
      name: n,
      closeAt: now + (i + 1) * 3600 * 1000,
      date: new Date(now + (i + 1) * 3600 * 1000).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }),
    }));
    this.activeMarket = this.markets[0].key;
    this.results = ['46', '89', '124', '379', '05', '68'].map((v, i) => ({ mid: 'm' + i, val: v }));
  }

  countdown(m: { closeAt: number }) {
    const s = Math.max(0, Math.floor((m.closeAt - Date.now()) / 1000));
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const mm = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${h}:${mm}:${ss}`;
  }

  setMarket(k: string) { this.activeMarket = k; }
  setBetType(k: string) { this.activeBetType = k; }
  selectCoin(v: number) { this.selectedCoin = this.selectedCoin === v ? null : v; }

  pickNumber(num: string) {
    if (!this.selectedCoin) { this.displayToast('Select a coin amount first', 'failed'); return; }
    this.cart.push({ market: this.activeMarket, betType: this.activeBetType, number: num, amount: this.selectedCoin });
  }
  removeCart(i: number) { this.cart.splice(i, 1); }
  clearCart() { this.cart = []; }
  get cartTotal() { return this.cart.reduce((a, c) => a + c.amount, 0); }

  submitCart() {
    if (!this.cart.length) return;
    this.placeLoader = true;
    const dt = {
      roundid: this.roundId, matchcode: this.CODE, matchname: this.NAME,
      bets: this.cart.map((c) => ({ market: c.market, betType: c.betType, number: c.number, stake: c.amount })),
    }; // TODO(data): confirm matka batch-bet endpoint
    this.userauth.placeCasinoBet(dt).subscribe({
      next: (res: any) => { this.placeLoader = false; this.displayToast(res.message, res.status); this.clearCart(); this.getopenbet(); this.userauth.getUserBalance(); },
      error: (e) => { this.placeLoader = false; this.displayToast(e.error?.message || 'Bet failed', 'failed'); },
    });
  }

  getopenbet() {
    this.userauth.getCasinoOpenBet(this.CODE, this.roundId).subscribe({
      next: (res: any) => { this.mybets = res.openbets; this.mybooks = res.books; },
      error: (e) => console.log(e),
    });
  }

  open(content: any) { this.modalService.open(content, { size: 'lg' }); }
  openResult(content: any, rid: any) {
    this.loader = true;
    this.match_service.getResult(rid).subscribe({
      next: () => { this.loader = false; this.modalService.open(content, { size: 'xl' }); },
      error: () => (this.loader = false),
    });
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
