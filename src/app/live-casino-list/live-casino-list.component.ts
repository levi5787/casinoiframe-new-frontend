import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { MatchService } from '../services/match.service';
import { CommonModule } from '@angular/common';
import { MmenutabComponent } from "../mmenutab/mmenutab.component";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

interface LiveCasinoGame {
  game_id: string;
  game_name: string;
  category: string;
  category_normalized: string;
  provider_name: string;
  sub_provider_name: string;
  url_thumb: string | null;
  game_code: string;
}

// Providers/categories not in these lists fall back to alphabetical order,
// with "Other/Misc" always sorted last — see sortWithPriority().
const PROVIDER_SORT_ORDER = ['Evolution Gaming', 'Creedroomz', 'Mac88 Gaming', 'MAC Excite', 'Jacktop Gaming'];
const CATEGORY_SORT_ORDER = ['Lobby', 'Popular', 'Roulette', 'Blackjack', 'Baccarat', 'Dragon Tiger', 'Sic Bo', 'Poker', 'Teenpatti', 'Game Shows', 'Dice', 'Lottery', 'Andar Bahar', '32 Cards', 'Lucky 7', 'Worli Matka'];

function sortWithPriority(values: string[], priority: string[]): string[] {
  return [...values].sort((a, b) => {
    const ai = priority.indexOf(a);
    const bi = priority.indexOf(b);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? priority.length : ai) - (bi === -1 ? priority.length : bi);
    if (a === 'Other/Misc') return 1;
    if (b === 'Other/Misc') return -1;
    return a.localeCompare(b);
  });
}

@Component({
  selector: 'app-live-casino-list',
  standalone: true,
  imports: [SidebarComponent, FormsModule, CommonModule, HeaderComponent, FooterComponent, MmenutabComponent],
  templateUrl: './live-casino-list.component.html',
  styleUrl: './live-casino-list.component.css'
})
export class LiveCasinoListComponent {
  casinoListTab = ""; loader = true;
  Id = "";

  allGames: LiveCasinoGame[] = [];
  navItems: { name: string; id: string }[] = [];
  subNavsData: Record<string, { name: string; id: string }[]> = {};
  subNavItems: { name: string; id: string }[] = [];

  activeIndex = 0;
  subActiveIndex = 0;

  showIframe = false;
  iframeLoading = false;
  iframeUrl: SafeResourceUrl | null = null;
  selectedGameName = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private matchService: MatchService,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.Id = params['id'] || '';
    });

    this.matchService.getLiveCasinoGames().subscribe({
      next: (res: any) => {
        this.allGames = res?.data || [];
        this.buildNav();
        this.loader = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loader = false;
        this.cdr.detectChanges();
      }
    });
  }

  private buildNav() {
    const byProvider = new Map<string, LiveCasinoGame[]>();
    for (const game of this.allGames) {
      const key = game.sub_provider_name;
      if (!byProvider.has(key)) byProvider.set(key, []);
      byProvider.get(key)!.push(game);
    }

    const providerNames = sortWithPriority([...byProvider.keys()], PROVIDER_SORT_ORDER);
    this.navItems = providerNames.map(name => ({ name, id: name }));

    this.subNavsData = {};
    for (const [providerName, games] of byProvider.entries()) {
      const categories = sortWithPriority([...new Set(games.map(g => g.category_normalized))], CATEGORY_SORT_ORDER);
      this.subNavsData[providerName] = categories.map(name => ({ name, id: name }));
    }

    const requestedIndex = this.Id ? this.navItems.findIndex(f => f.id === this.Id) : -1;
    this.activeIndex = requestedIndex !== -1 ? requestedIndex : 0;
    this.subActiveIndex = 0;
    this.subNavItems = this.subNavsData[this.navItems[this.activeIndex]?.id] || [];
  }

  getGamesForActiveTab(): LiveCasinoGame[] {
    const providerId = this.navItems[this.activeIndex]?.id;
    const categoryId = this.subNavItems[this.subActiveIndex]?.id;
    if (!providerId || !categoryId) return [];
    return this.allGames.filter(g => g.sub_provider_name === providerId && g.category_normalized === categoryId);
  }

  ClickTab(name: any) {
    if (this.casinoListTab == name) {
      this.casinoListTab = "";
    }
    this.casinoListTab = name;
  }

  selectTab(index: number, event: Event): void {
    this.loader = true;
    setTimeout(() => {
      this.loader = false;
    }, 500);

    this.activeIndex = index;
    event.preventDefault();

    const navPills = document.getElementById('slot-tab');
    const activeLink = navPills?.children[index];

    if (activeLink && navPills) {
      const navRect = navPills.getBoundingClientRect();
      const activeRect = activeLink.getBoundingClientRect();

      // Calculate the horizontal scroll needed to center the active item
      const offset = activeRect.left - navRect.left - (navRect.width / 2) + (activeRect.width / 2);
      navPills.scrollBy({ left: offset, behavior: 'smooth' });
    }
    this.subNavItems = this.subNavsData[this.navItems[this.activeIndex].id] || [];
    this.subActiveIndex = 0;
  }

  selectSubTab(index: number, event: Event): void {
    this.subActiveIndex = index;
    event.preventDefault();

    const navPills = document.getElementById('casino-sub-tab');
    this.loader = true;
    setTimeout(() => {
      this.loader = false;
    }, 500);

    const activeLink = navPills?.children[index];

    if (activeLink && navPills) {
      const navRect = navPills.getBoundingClientRect();
      const activeRect = activeLink.getBoundingClientRect();

      // Calculate the horizontal scroll needed to center the active item
      const offset = activeRect.left - navRect.left - (navRect.width / 2) + (activeRect.width / 2);
      navPills.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }

  openGame(game: LiveCasinoGame): void {
    this.selectedGameName = game.game_name;
    this.iframeUrl = null;
    this.iframeLoading = true;
    this.showIframe = true;

    let platform = 'desktop';
    if (window.innerWidth <= 768) {
      platform = 'mobile';
    }

    this.matchService.getGameUrl({ gameId: game.game_id, platformId: platform }).subscribe({
      next: (res: any) => {
        if (res?.data?.url) {
          this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.data.url);
        } else {
          this.failGameLoad(res?.data?.error || 'Failed to load game. Please try again later.');
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.failGameLoad(err?.error?.message || 'Failed to load game. Please try again later.');
        this.cdr.detectChanges();
      }
    });
  }

  onIframeLoad(): void {
    this.iframeLoading = false;
  }

  closeIframe(): void {
    this.showIframe = false;
    this.iframeLoading = false;
    this.iframeUrl = null;
    this.selectedGameName = '';
  }

  private failGameLoad(message: string): void {
    this.iframeLoading = false;
    this.showIframe = false;
    this.toastr.error(message, '', {
      timeOut: 3000,
      positionClass: 'toast-top-center',
      closeButton: true,
    });
  }

  tabScroll(type: string) {
    const navPills = document.getElementById('casino-sub-tab');
    if (navPills) {
      let offsett = 300
      if (type == 'right') {
        offsett = offsett * -1
      }
      navPills.scrollBy({ left: offsett, behavior: 'smooth' });
    }
  }
}
