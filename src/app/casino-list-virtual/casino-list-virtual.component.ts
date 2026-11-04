import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { MmenutabComponent } from "../mmenutab/mmenutab.component";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-casino-list-virtual',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent, FooterComponent, CommonModule, RouterLink, MmenutabComponent],
  templateUrl: './casino-list-virtual.component.html',
  styleUrl: './casino-list-virtual.component.css'
})
export class CasinoListVirtualComponent {
  casinoListTab = ""; loader=true;
  Id = "";
  navItems = [
    { name: 'All Casino', id: '82' },
    { name: 'Teenpatti', id: '79' },
    { name: 'Dragon Tiger', id: '80' },
    { name: 'Lucky 7', id: '81' },
    { name: 'Bollywood', id: '91' },
    { name: 'Others', id: '96' }
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
