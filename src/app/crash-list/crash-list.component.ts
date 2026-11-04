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

interface CrashGame {
  game_id: string;
  game_name: string;
  url_thumb: string | null;
}

// Grid order: games are grouped by whichever keyword (checked in this order)
// appears first in their name — e.g. all Aviator-named games before all
// JetX-named games — with everything matching no keyword sorted last. To
// change the priority later, just reorder/add/remove entries here; nothing
// else needs to change.
const CRASH_SORT_KEYWORDS = ['aviator', 'jetx'];

function sortByKeywordPriority(games: CrashGame[], keywords: string[]): CrashGame[] {
  const priorityOf = (game: CrashGame) => {
    const name = game.game_name.toLowerCase();
    const idx = keywords.findIndex(k => name.includes(k));
    return idx === -1 ? keywords.length : idx;
  };
  return [...games].sort((a, b) => priorityOf(a) - priorityOf(b));
}

// Unlike live-casino-list/slot-list/virtual-list/fantasy-list, this page has
// no provider tabs — just a flat grid of every Crash Games-category game.
@Component({
  selector: 'app-crash-list',
  standalone: true,
  imports: [FormsModule, MmenutabComponent, HeaderComponent, FooterComponent, CommonModule, SidebarComponent],
  templateUrl: './crash-list.component.html',
  styleUrl: './crash-list.component.css'
})
export class CrashListComponent {
  loader = true;
  games: CrashGame[] = [];

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
    this.matchService.getCrashGames().subscribe({
      next: (res: any) => {
        this.games = sortByKeywordPriority(res?.data || [], CRASH_SORT_KEYWORDS);
        this.loader = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loader = false;
        this.cdr.detectChanges();
      }
    });
  }

  openGame(game: CrashGame): void {
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
