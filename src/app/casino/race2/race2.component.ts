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
 * RACE TO 2ND (`race2`)
 * -----------------------------------------------------------------------------
 * Four runners (Player A/B/C/D), each a Back/Lay odds row. One card per runner.
 * Sibling: race20 / race17. Live-wired; see subscribeLiveData().
 */
@Component({
  selector: 'app-race2',
  standalone: true,
  imports: [FormsModule, CommonModule, ShortNumberPipe],
  templateUrl: './race2.component.html',
  styleUrl: './race2.component.css',
})
export class Race2Component implements OnInit, OnDestroy {
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

  /** one entry per runner — MOCK odds, replace via feed */
  players = [
    { key: 'A', label: 'Player A', card: '/img/cards/1.png', back: '0', lay: '0', gstatus: '1', min: 100, max: 100000, sid: 1, book: 0 },
    { key: 'B', label: 'Player B', card: '/img/cards/1.png', back: '0', lay: '0', gstatus: '1', min: 100, max: 100000, sid: 2, book: 0 },
    { key: 'C', label: 'Player C', card: '/img/cards/1.png', back: '0', lay: '0', gstatus: '1', min: 100, max: 100000, sid: 3, book: 0 },
    { key: 'D', label: 'Player D', card: '/img/cards/1.png', back: '0', lay: '0', gstatus: '1', min: 100, max: 100000, sid: 4, book: 0 },
  ];

  private readonly CODE = 'race2';
  private readonly NAME = 'Race To 2nd';

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
    this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.cvideoURL + '?id=3017'); // TODO(data)

    this.subscribeLiveData();
    this.placeBetButton();
  }

  ngOnDestroy() {
    this.socket_service.leavaAllRooms();
  }

  /**
   * Confirmed feed shape (console-verified): flat `data` = { mid, lt, card (4 cards,
   * one per runner in order A,B,C,D — no interleaving, just 4 simultaneous draws),
   * gtype:"race2", sub: [
   *   sid 1-4  nat:"Player A".."Player D"  subtype "race2"  etype "match" (back+lay)
   * ] }. gstatus is "OPEN"/"SUSPENDED". casinolast10 rows are { mid, win: "1".."4" } (1=A..4=D).
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
        this.mybets = []; this.mybooks = []; this.players.forEach((p) => (p.book = 0));
        this.roundId = mid;
        this.getopenbet();
      } else {
        this.roundId = mid || this.roundId;
      }

      const cards = String(d.card ?? '').split(',').map((c: string) => c.trim());
      this.players.forEach((p, i) => (p.card = '/img/cards-new/' + (cards[i] || '1') + '.png'));

      const rows: any[] = d.sub || [];
      const bySid = (sid: number) => rows.find((r: any) => Number(r.sid) === sid);
      this.players.forEach((p, i) => this.applyBackLay(p, bySid(i + 1)));
    });

    this.socket_service.casinolast10('Last10', this.CODE).subscribe((raw: any) => {
      const list = raw?.data?.res ?? raw?.data ?? [];
      if (Array.isArray(list) && list.length) {
        const winMap: Record<string, string> = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
        this.results = list.slice(0, 10).map((r: any) => ({ mid: r.mid, result: winMap[r.win] ?? r.win }));
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
    // standard back formula, confirmed against live decimal back/lay prices (e.g. b=3.15).
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
        this.players.forEach((p) => (p.book = 0));
        const winnerRow = (this.mybooks || []).find((item: any) => item.oddsType === 'Winner');
        (winnerRow?.book || []).forEach((entry: any) => {
          const p = this.players.find((x) => x.label === entry.selectionName);
          if (p) p.book = entry.amount;
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
        this.tempMatchTime = this.matchTime(rid);
        const winMap: Record<string, string> = { '1': 'Player A', '2': 'Player B', '3': 'Player C', '4': 'Player D' };
        this.tempWinner = winMap[r?.win] ?? r?.win ?? '';
        this.tempCards = String(r?.card ?? r?.cards ?? '').split(',').map((c: string) => c.trim());
      },
      error: () => (this.loader = false),
    });
  }

  // Round id encodes its own timestamp (confirmed live: rid "151260917223224" -> "17/09/2026
  // 22:32:24") - the vendor's own `mtime` string comes back in an inconsistent M/D/YYYY
  // h:mm:ss AM/PM format, so derive the display time from the id instead.
  matchTime(rid: any): string {
    const digits = String(rid ?? '').replace(/\D/g, '');
    const s = (digits.length > 15 ? digits.slice(0, 15) : digits).slice(-12);
    if (s.length < 12) return '';
    return `${s.slice(4, 6)}/${s.slice(2, 4)}/20${s.slice(0, 2)} ${s.slice(6, 8)}:${s.slice(8, 10)}:${s.slice(10, 12)}`;
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
