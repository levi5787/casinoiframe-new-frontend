import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MatchService } from '../services/match.service';
import { CommonModule } from '@angular/common';
import { MmenutabComponent } from '../mmenutab/mmenutab.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

interface FantasyGame {
  game_id: string;
  game_name: string;
  sub_provider_name: string;
  url_thumb: string | null;
}

@Component({
  selector: 'app-fantasy-list',
  standalone: true,
  imports: [FormsModule, MmenutabComponent, HeaderComponent, FooterComponent, CommonModule, SidebarComponent],
  templateUrl: './fantasy-list.component.html',
  styleUrl: './fantasy-list.component.css'
})
export class FantasyListComponent {
  loader = true;

  allGames: FantasyGame[] = [];
  navItems: { name: string; id: string }[] = [];
  activeIndex = 0;

  showIframe = false;
  iframeLoading = false;
  iframeUrl: SafeResourceUrl | null = null;
  selectedGameName = '';

  constructor(
    private cdr: ChangeDetectorRef,
    private matchService: MatchService,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.matchService.getFantasyGames().subscribe({
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
    const providerNames = [...new Set(this.allGames.map(g => g.sub_provider_name))].sort((a, b) => a.localeCompare(b));
    this.navItems = providerNames.map(name => ({ name, id: name }));
    this.activeIndex = 0;
  }

  getGamesForActiveTab(): FantasyGame[] {
    const providerId = this.navItems[this.activeIndex]?.id;
    if (!providerId) return [];
    return this.allGames.filter(g => g.sub_provider_name === providerId);
  }

  ClickTab(index: number, event: Event) {
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
  }

  tabScroll(type: string) {
    const navPills = document.getElementById('slot-tab');
    if (navPills) {
      let offsett = 300
      if (type == 'right') {
        offsett = offsett * -1
      }
      navPills.scrollBy({ left: offsett, behavior: 'smooth' });
    }
  }

  openGame(game: FantasyGame): void {
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
}
