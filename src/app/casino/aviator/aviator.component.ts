import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { io, Socket } from 'socket.io-client';
import { ToastrService } from 'ngx-toastr';
import { UserauthService } from '../../services/userauth.service';
import { ShortNumberPipe } from '../../pipes/short-number.pipe';
import { environment } from '../../../environments/environment';

interface BetData {
  player: string;
  betAmount: string;
  multiplier?: string;
  winAmount?: string;
  isWin?: boolean;
  panel?: number;
  status: string;
  canCashout?: boolean;
}

interface MultiplierHistory {
  value: string;
  color: 'purple' | 'red' | 'blue';
}

@Component({
  selector: 'app-aviator',
  standalone: true,
  imports: [CommonModule, FormsModule, ShortNumberPipe],
  templateUrl: './aviator.component.html',
  styleUrl: './aviator.component.css'
})
export class AviatorComponent {

  @ViewChild('planeElement', { static: true }) planeElement!: ElementRef;

  isLoading = false;

  //private socket!: Socket;
  private gameSocket!: Socket;      // Central game engine
  private siteSocket!: Socket;
  // private readonly SOCKET_URL = 'https://aviatorsocket.bet1ex.com';
  private readonly SOCKET_URL = environment.socketURI;
  private readonly SITE_SOCKET_URL = environment.backendURI;
  protected readonly Math = Math;
  historyCollapse = false;
  isSticky = false; sidebarTopOffset = 124; gametab = true; bettab = false;

  // Audio
  private audioTakeOff = new Audio();
  private audioMain = new Audio();
  private audioFlyAway = new Audio();
  private audioCashout = new Audio();
  private audioCancel = new Audio();

  // Game state
  currentMultiplier: number = 1.00;
  targetMultiplier: number = 1.00;
  serverMultiplier: number = 1.00; //   Exact server value for cashout
  gameStatus: string = '';
  gameInitialized: boolean = false;
  dotPositions: number[] = [];
  socketStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected'; //   Connection state
  timeLeft: number = 0;

  // UI state
  activeTab: string = 'bet';
  activeBetsTab: string = 'all';
  activeTab1: string = 'bet';
  activeTab2: string = 'bet';
  autoBetEnabled1: boolean = false;
  autoBetEnabled2: boolean = false;
  autoBetRounds1: number = 10;
  autoBetRounds2: number = 10;
  autoCashoutEnabled1: boolean = false;
  autoCashoutEnabled2: boolean = false;
  autoCashoutMultiplier1: number = 1.01;
  autoCashoutMultiplier2: number = 1.01;
  showSecondBetPanel: boolean = true;
  showAutoPlayModal: boolean = false;

  currentRoundTotalBets: number = 0;
  currentRoundRemainingBets: number = 0;
  currentRoundTotalWin: number = 0;

  // Animation state
  strokeDashArray = '1000';
  trailOffset = 1000;
  planeX = 0;
  planeY = 400;
  maxX = 940; // Default safe max X
  planeRotation = 0;

  // RAF
  private animationLoopId: number | null = null;
  private lastUpdateTime = 0;

  // Bets
  panel1ActiveBet: BetData | null = null;
  panel2ActiveBet: BetData | null = null;

  // History
  multiplierHistory: MultiplierHistory[] = [];
  betsData: BetData[] = [];

  // Quick bets
  quickBetAmounts: number[] = [100, 500, 1000];

  lastClickedAmount: number | null = null;
  betAmount: number = 100;
  balance: number = 0; //   Will fetch from backend
  currency: string = 'INR';
  isCrashing: boolean = false;
  crashVelocityX: number = 0;
  crashVelocityY: number = 0;

  constructor(private user: UserauthService, private toastr: ToastrService) {
    this.preloadAudio();
  }

  soundEnabled: boolean = localStorage.getItem('soundEnabled') !== 'false';

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isSticky = (window.pageYOffset >= this.sidebarTopOffset);
    //console.log(this.sidebarTopOffset)
  }

  @HostListener('window:resize', [])
  onResize() {
    this.updatePlaneBounds();
  }

  updatePlaneBounds() {
    const isDesktop = window.innerWidth >= 640;
    const planeWidth = isDesktop ? 120 : 200;
    const padding = 50;
    this.maxX = 1000 - planeWidth-padding;
  }


  ngOnInit(): void {
    this.updatePlaneBounds();
    this.connectGameSocket();
    this.connectSiteSocket();
    this.startAnimationLoop();
    this.getGameHistory();
  }

  displayToast(msg: any, type: any) {
    if (type == "success") {
      this.toastr.success(msg, '', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        closeButton: true,
      });
    } else {
      this.toastr.error(msg, '', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        closeButton: true,
      });
    }
  }

  private preloadAudio() {
    this.audioTakeOff.src = '/audio/take_off.mp3';
    this.audioMain.src = '/audio/main.wav';
    this.audioFlyAway.src = '/audio/flew_away.mp3';
    this.audioCashout.src = '/audio/cashout.mp3';
    this.audioCancel.src = '/audio/cancel.mp3';

    this.audioMain.loop = true;

    [this.audioTakeOff, this.audioMain, this.audioFlyAway, this.audioCashout, this.audioCancel].forEach(audio => audio.load());
  }

  private connectGameSocket(): void {
    this.socketStatus = 'connecting';
    const authToken = localStorage.getItem('token');
    this.gameSocket = io(this.SOCKET_URL, {
      transports: ['websocket'],
      query: { token: authToken }
    });

    this.gameSocket.on('connect', () => {
      console.log('Connected to server:', this.gameSocket.id);
      this.socketStatus = 'connected';
      this.gameSocket.emit('join_aviator', 'aviator');
    });

    this.gameSocket.on('aviator:gameState', (data: any) => {
      this.gameStatus = data.phase;
      this.targetMultiplier = data.multiplier;
      this.serverMultiplier = data.multiplier;
      this.timeLeft = data.timeLeft || 0;
      if (data.phase === 'betting' || data.phase === 'takeoff') {
        this.isCrashing = false;
        this.isLoading = true;
        // Optionally reset plane position
        this.planeX = -1000;
        this.planeY = 400;
      } else {
        this.isLoading = false
      }
      if (data.gameHistory && Array.isArray(data.gameHistory) && this.multiplierHistory.length === 0) {
        this.multiplierHistory = data.gameHistory.map((item: any) => ({
          value: `${parseFloat(item.crashPoint).toFixed(2)}x`,
          color: item.color
        }));
      }

      // if (data.activeBets && Array.isArray(data.activeBets)) {
      //   this.betsData = data.activeBets.map((b: any) => ({
      //     player: b.username,
      //     betAmount: b.amount.toString(),
      //     multiplier: b.cashoutMultiplier ? `${b.cashoutMultiplier.toFixed(2)}x` : '',
      //     winAmount: b.payout ? b.payout.toString() : '',
      //     isWin: b.status === 'cashed_out' || b.status === 'auto_cashed_out',
      //     panel: b.panel,
      //     status: b.status,
      //     canCashout: b.status === 'active' && this.gameStatus === 'flying'
      //   }));

      //   //   CRITICAL FIX: Get current user's username
      //   const currentUsername = this.user.getUsername();

      //   //   Filter bets by CURRENT USER for panel assignment
      //   this.panel1ActiveBet = this.betsData.find(b =>
      //     b.player === currentUsername &&
      //     b.panel === 1 &&
      //     b.status === 'active'
      //   ) || null;

      //   this.panel2ActiveBet = this.betsData.find(b =>
      //     b.player === currentUsername &&
      //     b.panel === 2 &&
      //     b.status === 'active'
      //   ) || null;
      // }

      //   Calculate stats AFTER updating bets
      this.currentRoundTotalBets = this.betsData.length;
      this.currentRoundRemainingBets = this.betsData.filter(b => b.status === 'active').length;
      this.currentRoundTotalWin = this.betsData
        .filter(b => b.isWin)
        .reduce((sum, b) => sum + parseFloat(b.winAmount || '0'), 0);

      if (this.gameStatus === 'crashed' && data.crashPoint) {
        const color = data.crashPoint >= 10 ? 'red' : data.crashPoint >= 2 ? 'blue' : 'purple';
        this.multiplierHistory.unshift({
          value: `${data.crashPoint.toFixed(2)}x`,
          color
        });
        if (this.multiplierHistory.length > 15) {
          this.multiplierHistory = this.multiplierHistory.slice(0, 15);
        }
        this.triggerCrashEffect();
      }

      this.gameInitialized = true;
    });

    this.gameSocket.on('aviator:playSound', (data: { sound: string }) => {
      switch (data.sound) {
        case 'take_off': this.playSound(this.audioTakeOff); break;
        case 'main_loop_start': this.playSound(this.audioMain); break;
        case 'main_loop_stop': this.audioMain.pause(); this.audioMain.currentTime = 0; break;
        case 'fly_away': this.playSound(this.audioFlyAway); break;
        default: console.warn('Unknown sound:', data.sound);
      }
    });

    this.gameSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.gameInitialized = false;
      this.socketStatus = 'disconnected';
    });

    this.gameSocket.on('connect_error', (err) => {
      console.error('🔌 Connection Error:', err.message);
      this.socketStatus = 'disconnected';
    });
  }

  private connectSiteSocket(): void {
    const authToken = localStorage.getItem('token');

    this.siteSocket = io(this.SITE_SOCKET_URL, {
      transports: ['websocket'],
      auth: { token: authToken }
    });

    this.siteSocket.on('connect', () => {
      console.log('Connected to Site');
      this.siteSocket.emit('join_aviator', 'aviator');
    });

    //  USER-SPECIFIC DATA
    this.siteSocket.on('myActiveBets', (bets: BetData[]) => {
      this.betsData = bets;
      //console.log(bets)
      this.panel1ActiveBet = bets.find(b => b.panel === 1) || null;
      this.panel2ActiveBet = bets.find(b => b.panel === 2) || null;
    });

    //  SOUNDS FROM YOUR BACKEND
    this.siteSocket.on('aviator:playSound', (data: { sound: string }) => {
      switch (data.sound) {
        case 'take_off': this.playSound(this.audioTakeOff); break;
        case 'main_loop_start': this.playSound(this.audioMain); break;
        case 'main_loop_stop': this.audioMain.pause(); this.audioMain.currentTime = 0; break;
        case 'fly_away': this.playSound(this.audioFlyAway); break;
        default: console.warn('Unknown sound:', data.sound);
      }
    });

    this.siteSocket.on('disconnect', () => {
      console.log('Disconnected from Site Backend');
    });
  }

  get formattedTimeLeft(): string {
    if (this.gameStatus !== 'betting' && this.gameStatus !== 'takeoff') {
      return '';
    }
    const seconds = Math.ceil(this.timeLeft / 1000);
    return seconds > 0 ? `${seconds}s` : '0s';
  }

  private playSound(audio: HTMLAudioElement) {
    if (!this.soundEnabled) return;
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch(err => console.warn('Audio play failed:', err));
  }

  toggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('soundEnabled', String(this.soundEnabled));

    if (!this.soundEnabled) {
      [this.audioTakeOff, this.audioMain, this.audioFlyAway, this.audioCashout, this.audioCancel]
        .forEach(audio => {
          audio.pause();
          audio.currentTime = 0;
        });
    }
  }

  private startAnimationLoop() {
    if (this.animationLoopId) return;
    this.lastUpdateTime = performance.now();
    this.animationLoop();
  }

  private animationLoop() {
    const now = performance.now();
    const delta = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    if (this.isCrashing) {
      // Fly away rapidly
      this.planeX += this.crashVelocityX * delta * 60; // Scale for smoothness
      this.planeY += this.crashVelocityY * delta * 60;

    } else {
      // Normal multiplier-based animation
      if (this.currentMultiplier !== this.targetMultiplier) {
        const speed = 80;
        const diff = this.targetMultiplier - this.currentMultiplier;
        this.currentMultiplier += diff * Math.min(delta * speed, 1);
        if (Math.abs(diff) < 0.01) this.currentMultiplier = this.targetMultiplier;
      }

      this.animatePlane();
    }

    this.animateTrail();
    this.animationLoopId = requestAnimationFrame(() => this.animationLoop());
  }

  private animatePlane(): void {
    const MAX_MULTIPLIER = 10;
    const progress = Math.min(this.currentMultiplier / MAX_MULTIPLIER, 1);

    if (progress <= 0.5) {
      const t = progress * 2;
      this.planeX = this.bezier(t, 0, 200, 500, 800);
      this.planeY = this.bezier(t, 400, 350, 200, 100);
    } else {
      const t = (progress - 0.5) * 2;
      this.planeX = this.bezier(t, 800, 900, 950, 1000);
      this.planeY = this.bezier(t, 100, 70, 50, 40);
    }

    this.planeX = Math.min(this.planeX, this.maxX);
    this.planeY = Math.max(this.planeY, 0);
    let dx, dy;
    if (progress <= 0.5) {
      const t = progress * 2;
      dx = this.bezierDerivative(t, 0, 200, 500, 800);
      dy = this.bezierDerivative(t, 400, 350, 200, 100);
    } else {
      const t = (progress - 0.5) * 2;
      dx = this.bezierDerivative(t, 800, 900, 950, 1000);
      dy = this.bezierDerivative(t, 100, 70, 50, 40);
    }

    // Calculate angle in degrees
    // Math.atan2(dy, dx) gives angle in radians.
    // We want 0 degrees to be flat right.
    // dy is positive downwards in SVG, so negative dy means going up.
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Hovering effect when at the end
    if (this.planeX >= this.maxX) {
      const bobAmount = 5;
      const bobSpeed = 0.005;
      this.planeY += Math.sin(performance.now() * bobSpeed) * bobAmount * 0.1; // Gentle bob

      // Slight rotation bob as well
      angle += Math.sin(performance.now() * bobSpeed) * 2;
    }

    this.planeRotation = angle;

    this.updateDotTrail();
  }

  private bezierDerivative(t: number, p0: number, p1: number, p2: number, p3: number): number {
    const u = 1 - t;
    return 3 * u * u * (p1 - p0) + 6 * u * t * (p2 - p1) + 3 * t * t * (p3 - p2);
  }


  get redOverlayOpacity(): number {
    return Math.min(this.currentMultiplier * 0.03, 0.6);
  }

  private animateTrail() {
    const targetOffset = 1000 - (Math.min(this.currentMultiplier / 100, 1) * 1000);
    const diff = targetOffset - this.trailOffset;
    if (Math.abs(diff) > 0.5) {
      this.trailOffset += diff * 0.9;
    } else {
      this.trailOffset = targetOffset;
    }
  }

  private updateDotTrail() {
    const maxDots = 20;
    const spacing = 5;
    this.dotPositions = [];

    for (let i = 0; i < maxDots; i++) {
      const pos = (this.currentMultiplier - (i * spacing / 100)) * 10;
      if (pos > 0) {
        this.dotPositions.push(pos);
      }
    }
  }

  private bezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;
    return uuu * p0 + 3 * uu * t * p1 + 3 * u * tt * p2 + ttt * p3;
  }

  private triggerCrashEffect() {
    this.isCrashing = true;
    const targetX = 1200; // Far right
    const targetY = -200; // Far top
    const distanceX = targetX - this.planeX;
    const distanceY = targetY - this.planeY;
    const speed = 15; // Pixels per frame — increase for faster escape

    this.crashVelocityX = distanceX * 0.05 * speed; // Smooth acceleration
    this.crashVelocityY = distanceY * 0.05 * speed;
    const svg = document.querySelector('.flight-path') as HTMLElement;
    if (svg) {
      svg.style.animation = 'shake 0.5s ease-in-out';
      setTimeout(() => svg.style.animation = '', 500);
    }

    const container = document.querySelector('.game-content');
    if (!container) return;

    const explosion = document.createElement('div');
    explosion.innerHTML = `
      <svg width="100" height="100" viewBox="0 0 100 100" style="position:absolute; z-index:10; pointer-events:none;">
        <circle cx="50" cy="50" r="5" fill="orange">
          <animate attributeName="r" values="5;40;0" dur="0.8s" fill="freeze" />
          <animate attributeName="opacity" values="1;0.5;0" dur="0.8s" fill="freeze" />
        </circle>
        <circle cx="50" cy="50" r="3" fill="red" style="transform:rotate(45deg);">
          <animate attributeName="r" values="3;30;0" dur="0.8s" fill="freeze" />
          <animate attributeName="opacity" values="1;0.3;0" dur="0.8s" fill="freeze" />
        </circle>
      </svg>
    `;
    explosion.style.position = 'absolute';
    explosion.style.left = `${this.planeX - 20}px`;
    explosion.style.top = `${this.planeY - 20}px`;
    container.appendChild(explosion);

    setTimeout(() => explosion.remove(), 1000);
  }

  get displayStatus(): string {
    return this.gameStatus === 'crashed' ? 'FLEW AWAY!' : '';
  }

  // === UI METHODS ===
  handlePanelAction(panel: number): void {
    const activeBet = panel === 1 ? this.panel1ActiveBet : this.panel2ActiveBet;
    if (activeBet && this.gameStatus === 'flying') {
      this.cashOut(panel);
    } else {
      this.placeBet(panel);
    }
  }

  placeBet(panel: number = 1) {
    const autoCashout = panel === 1
      ? (this.autoCashoutEnabled1 ? this.autoCashoutMultiplier1 : null)
      : (this.autoCashoutEnabled2 ? this.autoCashoutMultiplier2 : null);

    this.user.placebetAviator({ betAmount: this.betAmount, autoCashout, panel }).subscribe({
      next: (res: any) => {
        this.displayToast(res.message, res.status);

      },
      error: () => {
        this.toastr.error('Failed to place bet');
      }
    });
  }

  exitGame() {
    // TODO: Implement settings modal
  }

  cashOut(panel: number) {
    if (navigator.vibrate) navigator.vibrate(100); //   Haptic feedback

    if (panel === 1) this.panel1ActiveBet = null;
    else this.panel2ActiveBet = null;

    this.user.cashoutAviator({ panel, multiplier: this.serverMultiplier }).subscribe({
      next: (res: any) => {

        this.playSound(this.audioCashout);
        this.displayToast(res.message, res.status);

      },
      error: () => {
        this.toastr.error('Cashout failed. Please try again.');
        this.gameSocket.emit('join_aviator', 'aviator');
      }
    });
  }

  cancelBet(panel: number) {
    this.user.cancelbetAviator({ panel }).subscribe({
      next: (res: any) => {

        this.playSound(this.audioCancel);
        if (panel === 1) this.panel1ActiveBet = null;
        else this.panel2ActiveBet = null;
        this.displayToast(res.message, res.status);

      },
      error: () => this.toastr.error('Failed to cancel bet.')
    });
  }

  getGameHistory() {
    this.user.getGameHistory().subscribe({
      next: (res: any) => {
        this.multiplierHistory = res.slice(0, 30).map((item: any) => ({
          value: item.value,
          color: item.color
        }));
      },
      error: () => console.warn('Failed to load game history')
    });
  }

  //   Get X/Y for auto-cashout line
  getAutoCashoutX(multiplier: number): number {
    const MAX_MULTIPLIER = 10;
    const progress = Math.min(multiplier / MAX_MULTIPLIER, 1);
    if (progress <= 0.5) {
      const t = progress * 2;
      return this.bezier(t, 0, 200, 500, 800);
    } else {
      const t = (progress - 0.5) * 2;
      return this.bezier(t, 800, 900, 950, 1000);
    }
  }

  getAutoCashoutY(multiplier: number): number {
    const MAX_MULTIPLIER = 10;
    const progress = Math.min(multiplier / MAX_MULTIPLIER, 1);
    if (progress <= 0.5) {
      const t = progress * 2;
      return this.bezier(t, 400, 350, 200, 100);
    } else {
      const t = (progress - 0.5) * 2;
      return this.bezier(t, 100, 70, 50, 40);
    }
  }

  // === UTILS ===
  getPanelButtonText(panel: number): string {
    const activeBet = panel === 1 ? this.panel1ActiveBet : this.panel2ActiveBet;
    if (activeBet && this.gameStatus === 'flying') {
      const cashoutAmount = parseFloat(activeBet.betAmount) * this.currentMultiplier;
      return `Cash Out ${this.formatCurrency(cashoutAmount)} ${this.currency}`;
    }
    return `Bet ${this.formatCurrency(this.betAmount)} ${this.currency}`;
  }

  setBetAmount(amount: number): void {
    if (this.lastClickedAmount === amount) {
      this.betAmount += amount;
    } else {
      this.betAmount = amount;
      this.lastClickedAmount = amount;
    }
  }
  increaseBetAmount1(): void { this.betAmount += 25; }
  increaseBetAmount2(): void { this.betAmount += 25; }

  setActiveTab(tab: string, panel: number = 1): void {
    if (panel === 1) this.activeTab1 = tab;
    else this.activeTab2 = tab;
  }

  setBetsTab(tab: string): void { this.activeBetsTab = tab; }

  toggleAutoBet(panel: number): void {
    if (panel === 1) this.autoBetEnabled1 = !this.autoBetEnabled1;
    else this.autoBetEnabled2 = !this.autoBetEnabled2;
  }

  updateAutoBetRounds(rounds: number, panel: number): void {
    if (panel === 1) this.autoBetRounds1 = Math.max(1, Math.min(1000, rounds));
    else this.autoBetRounds2 = Math.max(1, Math.min(1000, rounds));
  }

  toggleAutoCashout(panel: number): void {
    if (panel === 1) this.autoCashoutEnabled1 = !this.autoCashoutEnabled1;
    else this.autoCashoutEnabled2 = !this.autoCashoutEnabled2;
  }

  updateAutoCashoutMultiplier(multiplier: number, panel: number): void {
    if (panel === 1) this.autoCashoutMultiplier1 = Math.max(1.01, Math.min(1000, multiplier));
    else this.autoCashoutMultiplier2 = Math.max(1.01, Math.min(1000, multiplier));
  }

  addBetPanel(): void { this.showSecondBetPanel = true; }
  removeBetPanel(): void { this.showSecondBetPanel = false; }
  openAutoPlayModal(): void { this.showAutoPlayModal = true; }
  closeAutoPlayModal(): void { this.showAutoPlayModal = false; }
  startAutoPlay(): void { this.closeAutoPlayModal(); }

  getMultiplierColor(value: string): string {
    const history = this.multiplierHistory.find(h => h.value === value);
    return history?.color || 'purple';
  }

  formatCurrency(amount: number): string { return amount.toFixed(2); }

  isPanelDisabled(panel: number): boolean {
    return this.gameStatus === 'crashed' || this.gameStatus === 'waiting';
  }

  isPanelInCashoutMode(panel: number): boolean {
    const activeBet = panel === 1 ? this.panel1ActiveBet : this.panel2ActiveBet;
    return !!activeBet && this.gameStatus === 'flying';
  }

  isAutoCashoutEnabled(panel: number): boolean {
    return panel === 1 ? this.autoCashoutEnabled1 : this.autoCashoutEnabled2;
  }

  getAutoCashoutMultiplier(panel: number): number {
    return panel === 1 ? this.autoCashoutMultiplier1 : this.autoCashoutMultiplier2;
  }

  shouldShowCancelBet(panel: number): boolean {
    const activeBet = panel === 1 ? this.panel1ActiveBet : this.panel2ActiveBet;
    return !!activeBet && this.gameStatus === 'betting';
  }

  //   Keyboard shortcut
  @HostListener('document:keydown.space', ['$event'])
  onSpaceKey(event: KeyboardEvent) {
    if (this.isPanelInCashoutMode(1)) {
      event.preventDefault();
      this.cashOut(1);
    }
  }

  ngOnDestroy(): void {
    if (this.gameSocket) this.gameSocket.disconnect();
    if (this.siteSocket) this.siteSocket.disconnect();
    if (this.animationLoopId) cancelAnimationFrame(this.animationLoopId);
  }

  showCollapse() {
    this.historyCollapse = true;
  }

  hideCollapse() {
    this.historyCollapse = false;
  }

  gameTabClicked() {
    this.bettab = false;
    this.gametab = true;
  }
  betTabClicked() {
    this.bettab = true;
    this.gametab = false;
  }



}
