import { Component, TemplateRef, ViewChild } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { MatchService } from '../services/match.service';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-mac88',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, SidebarComponent],
  templateUrl: './mac88.component.html',
  styleUrl: './mac88.component.css'
})
export class Mac88Component {
  gameId = '';
  iframeURL: any = '';
  isLoading = false;
  errorText = '';
  constructor(
    private matchService: MatchService,
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.gameId = params['gameId'] || '';
      if (this.gameId) {
        this.getGameUrl();
      }
    });
  }

  getGameUrl() {
    this.isLoading = true;
    let platform = 'desktop';
    if (window.innerWidth <= 768) {
      platform = 'mobile';
    }
    this.matchService.getGameUrl({ gameId: this.gameId, platformId: platform }).subscribe({
      next: (res: any) => {
        if (res?.data?.url) {
          // this.modalService.open(this.confirmbox, {
          //   backdrop: 'static',
          //   keyboard: false,
          // })
          this.iframeURL = this.sanitizer.bypassSecurityTrustResourceUrl(res.data.url);
        } else {
          this.errorText = res.data.error || 'Failed to load game. Please try again later.';
          this.isLoading = false;
        }
      },
      error: (err: any) => {
        console.error('Error fetching game URL:', err);
        this.isLoading = false;
        this.errorText = err?.error?.message || 'Failed to load game. Please try again later.';
        this.toastr.error(this.errorText, '', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          closeButton: true,
        });
      }
    })
  }

  onIframeLoad(): void {
    this.isLoading = false;
  }

}
