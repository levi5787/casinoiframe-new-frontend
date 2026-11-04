import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { MmenutabComponent } from "../mmenutab/mmenutab.component";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-casino-list',
  standalone: true,
  imports: [FormsModule, RouterLink, HeaderComponent, CommonModule, MmenutabComponent],
  templateUrl: './casino-list.component.html',
  styleUrl: './casino-list.component.css'
})
export class CasinoListComponent {

  casinoListTab = ""; loader=true;
  Id = "";
  token = "";
  navItems = [
    { name: 'All Casino', id: '35' },
    { name: 'Roulette', id: '31' },
    { name: 'Teenpatti', id: '20' },
    { name: 'Poker', id: '21' },
    { name: 'Baccarat', id: '22' },
    { name: 'Dragon Tiger', id: '23' },
    { name: '32 Cards', id: '24' },
    { name: 'Andar Bahar', id: '26' },
    { name: 'Lucky 7', id: '27' },
    { name: '3 Card Judgement', id: '28' },
    { name: 'Casino War', id: '29' },
    { name: 'Worli', id: '30' },
    { name: 'Sports', id: '34' },
    { name: 'Bollywood', id: '32' },
    { name: 'Lottery', id: '33' },
    { name: 'Queen', id: '40' },
    { name: 'Race', id: '41' },
    { name: 'Others', id: '73' }
  ];
  activeIndex = 0;
  
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cdr:ChangeDetectorRef,
    private toastr:ToastrService
    ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      // Lobby is opened as /casino/lobby/:token; game links carry the same token.
      this.token = params['token'] || sessionStorage.getItem('token') || "";
      if (params['id']) {
        this.Id = params['id'];
        this.activeIndex = this.navItems.findIndex((f: any) => f.id == this.Id)
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.loader = false;
      this.cdr.detectChanges();
    }, 500);
  }

  ClickTab(name: any) {
    if (this.casinoListTab == name) {
      this.casinoListTab = "";
    }
    this.casinoListTab = name;
  }

  selectTab(index: number, event: Event): void {
    this.loader=true;
    setTimeout(() => {
      this.loader = false;
    }, 500);
    this.activeIndex = index;
    event.preventDefault();

    const navPills = document.getElementById('casino-sub-tab');
    const activeLink = navPills?.children[index];

    if (activeLink && navPills) {
      const navRect = navPills.getBoundingClientRect();
      const activeRect = activeLink.getBoundingClientRect();

      // Calculate the horizontal scroll needed to center the active item
      const offset = activeRect.left - navRect.left - (navRect.width / 2) + (activeRect.width / 2);
      navPills.scrollBy({ left: offset, behavior: 'smooth' });
    }
    //this.router.navigateByUrl(this.router.url.replace(this.Id, this.navItems[index].id));
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
  commingSoon(){
    this.toastr.info('Comming Soon.', '', {
      timeOut: 3000,
      positionClass: 'toast-top-center',
      closeButton: true,
    });
  }
}
