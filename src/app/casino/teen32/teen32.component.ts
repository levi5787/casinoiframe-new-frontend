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
 * INSTANT TEENPATTI 2.0 (`teen32`)
 * -----------------------------------------------------------------------------
 * Minimal A/B teenpatti: Player A / Player B, "Main" Back/Lay only. 3 cards/side.
 * Sibling: instant-teenpatti (teen3) / teen. Live-wired; see subscribeLiveData().
 */
@Component({
  selector: 'app-teen32',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './teen32.component.html',
  styleUrl: './teen32.component.css',
})
export class Teen32Component implements OnInit {
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

  playerA = { label: 'Player A', cards: ['/img/cards/1.png', '/img/cards/1.png', '/img/cards/1.png'], back: '0', lay: '0', gstatus: '1', min: 100, max: 100000, sid: 1, book: 0 };
  playerB = { label: 'Player B', cards: ['/img/cards/1.png', '/img/cards/1.png', '/img/cards/1.png'], back: '0', lay: '0', gstatus: '1', min: 100, max: 100000, sid: 2, book: 0 };

  private readonly CODE = 'teen32';
  private readonly NAME = 'Instant Teenpatti 2.0';

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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3095'); // TODO(data)

    this.subscribeLiveData();
    this.placeBetButton();
  }

  ngOnDestroy() {
    this.socket_service.leavaAllRooms;
  }

  /**
   * Confirmed feed shape (console-verified): flat `data` = { mid, lt, card (6 cards,
   * dealt interleaved C1,C3,C5 -> A / C2,C4,C6 -> B, same as teen41/teen62), gtype:"teen32", sub: [
   *   { sid:1, nat:"Player A", subtype:"teen32", etype:"match", b, l, bs, ls, min, max, gstatus },
   *   { sid:2, nat:"Player B", ... }
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

      // cards are dealt interleaved: C1,C3,C5 -> Player A, C2,C4,C6 -> Player B (same as teen41/teen62)
      const cards = String(d.card ?? '').split(',').map((c: string) => c.trim());
      const cardImg = (c: string) => '/img/cards-new/' + (c || '1') + '.png';
      this.playerA.cards = [cards[0], cards[2], cards[4]].map(cardImg);
      this.playerB.cards = [cards[1], cards[3], cards[5]].map(cardImg);

      const mid = d.mid ?? '';
      if (mid && this.roundId !== mid) {
        this.mybets = []; this.mybooks = []; this.playerA.book = 0; this.playerB.book = 0;
        this.getopenbet();
      }
      this.roundId = mid || this.roundId;

      const rows: any[] = d.sub || [];
      const rowA = rows.find((r: any) => Number(r.sid) === 1);
      const rowB = rows.find((r: any) => Number(r.sid) === 2);
      this.applyPlayerRow(this.playerA, rowA);
      this.applyPlayerRow(this.playerB, rowB);
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

  private applyPlayerRow(target: any, row: any): void {
    if (!row) return;
    target.back = row.b ?? target.back;
    target.lay = row.l ?? target.lay;
    target.gstatus = String(row.gstatus ?? '1');
    target.min = row.min ?? target.min;
    target.max = row.bs ?? row.max ?? target.max;
  }

  isSuspended(item: any): boolean {
    const g = String(item?.gstatus ?? '').trim().toUpperCase();
    return !(g === '1' || g === 'OPEN' || g === 'ACTIVE' || g === 'TRUE');
  }

  openBetForm(content: any, p: any, type: 'back' | 'lay') {
    this.showbetform = true;
    this.betFor = p.label;
    this.odds = type === 'back' ? p.back : p.lay;
    this.betType = type;
    this.oddsType = 'Winner';
    this.sid = p.sid;
    this.min = p.min;
    this.max = p.max;
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
        const winnerRow = (this.mybooks || []).find((b: any) => b.oddsType === 'Winner');
        const wb = winnerRow?.book || [];
        this.playerA.book = wb.find((r: any) => r.selectionName === 'Player A')?.amount ?? 0;
        this.playerB.book = wb.find((r: any) => r.selectionName === 'Player B')?.amount ?? 0;
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
