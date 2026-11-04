import { Component, ChangeDetectorRef, inject, ViewChild } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MatchService } from '../services/match.service';
import { UserauthService } from '../services/userauth.service';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MmenutabComponent } from "../mmenutab/mmenutab.component";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, HeaderComponent, RouterLink, FooterComponent, SidebarComponent, CommonModule, MmenutabComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  getmatches: any; // setInterval varibale.
  cricketMatches: any = []; footballMatches: any = []; tennisMatches: any = []; basketballMatches: any = []; volleyballMatches: any = [];
  tabletennisMatches: any = []; futsalMatches: any = []; egamesMatches: any = []; esoccerMatches: any = []; kabaddiMatches: any = [];
  snookerMatches: any = []; badmintonMatches: any = []; horseraceMatches: any = []; greyhoundMatches: any = [];
  //cricketTab=true;footballTab=false;tennisTab=false;
  activeHorseTab: any; activeGreyhoundTab: any;
  @ViewChild('homebanner') homeBanner: any;
  imgURL = "https://backend.betexch999.com/uploads/banner.png"

  navItems = [
    //{ name: 'Politics', icon: 'icon-40' },
    { name: 'Cricket', icon: 'icon-4' },
    { name: 'Politics', icon: 'icon-40' },
    { name: 'Football', icon: 'icon-1' },
    { name: 'Tennis', icon: 'icon-2' },
    { name: 'Esoccer', icon: 'icon-68' },
    { name: 'Horse Racing', icon: 'icon-10' },
    { name: 'Greyhound Racing', icon: 'icon-65' },
    { name: 'Table Tennis', icon: 'icon-8' },
    { name: 'Basketball', icon: 'icon-15' },
    { name: 'Boxing', icon: 'icon-6' },
    { name: 'Mixed Martial Arts', icon: 'icon-3' },
    { name: 'American Football', icon: 'icon-58' },
    { name: 'Volleyball', icon: 'icon-18' },
    { name: 'Badminton', icon: 'icon-22' },
    { name: 'Snooker', icon: 'icon-59' },
    { name: 'Ice Hockey', icon: 'icon-19' },
    { name: 'E Games', icon: 'icon-11' },
    { name: 'Futsal', icon: 'icon-9' },
    { name: 'Handball', icon: 'icon-39' },
    { name: 'Motor Sports', icon: 'icon-52' },
    { name: 'Kabaddi', icon: 'icon-66' }
  ];
  activeIndex = 0; highlightMatches: any = []
  constructor(
    private match_service: MatchService,
    private userauth: UserauthService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private toastr:ToastrService
  ) { }

  ngOnInit(): void {
    this.getmatch()
    this.getmatches = setInterval(() => {
      this.getmatch()
      if (this.userauth.getToken() == null) {
        clearInterval(this.getmatches);
      }
    }, 5000);
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.cdr.detectChanges();
      this.openBanner();
    }, 300);
  }
  openBanner() {
    let purl = this.userauth.getPreviousUrl();
    //console.log(purl)
    if (purl == "/login") {
      //this.modalService.open(this.homeBanner, { size: 'xl' });
      this.openModal(this.homeBanner)
    }
  }
  openModal(content: any) {
    this.modalService.open(content, { size: 'lg' });
  }

  ngOnDestroy() {
    clearInterval(this.getmatches);
  }
  getmatch() {
    if (this.navItems[this.activeIndex].name == "Cricket") {
      this.match_service.getCricketMatches().subscribe({
        next: (res) => {
          this.cricketMatches = res;
          this.cricketMatches.map((obj: any) => { obj.name = obj.eventName.split(' / ')[0], obj.time = obj.eventName.split(' / ')[1] })
          //console.log(this.cricketMatches)
          this.highlightMatches = this.cricketMatches.filter((f: any) => f.vir == '1' /*&& f.beventId.startsWith('3')*/ /*&& f.gameId.length != 8*/).slice(0, 5)
        }, error: (e) => console.log(e)
      })
    } else if (this.navItems[this.activeIndex].name == "Football") {
      this.match_service.getSoccerMatches().subscribe({
        next: (res) => {
          this.footballMatches = res;
          this.footballMatches.forEach((item: any) => {
            item.section.sort((a: any, b: any) => a.sno - b.sno)
          });
        }, error: (e) => console.log(e)
      })
    } else if (this.navItems[this.activeIndex].name == "Tennis") {
      this.match_service.getTennisMatches().subscribe({
        next: (res) => {
          this.tennisMatches = res;
          this.tennisMatches.forEach((item: any) => {
            item.section.sort((a: any, b: any) => a.sno - b.sno)
          });
        }, error: (e) => console.log(e)
      })
    }
    else if (this.navItems[this.activeIndex].name == "basketball") {
      this.match_service.getBasketballMatches().subscribe({
        next: (res) => {
          this.basketballMatches = res;
          this.basketballMatches.forEach((item: any) => {
            item.section.sort((a: any, b: any) => a.sno - b.sno)
          });
        }, error: (e) => console.log(e)
      })
    } else if (this.navItems[this.activeIndex].name == "volleyball") {
      this.match_service.getVolleyballMatches().subscribe({
        next: (res) => {
          this.volleyballMatches = res;
          this.volleyballMatches.forEach((item: any) => {
            item.section.sort((a: any, b: any) => a.sno - b.sno)
          });
        }, error: (e) => console.log(e)
      })
    } else if (this.navItems[this.activeIndex].name == "table-tennis") {
      this.match_service.getTabletennisMatches().subscribe({
        next: (res) => {
          this.tabletennisMatches = res;
          this.tabletennisMatches.forEach((item: any) => {
            item.section.sort((a: any, b: any) => a.sno - b.sno)
          });
        }, error: (e) => console.log(e)
      })
    } else if (this.navItems[this.activeIndex].name == "futsal") {
      this.match_service.getFutsalMatches().subscribe({
        next: (res) => {
          this.futsalMatches = res;
          this.futsalMatches.forEach((item: any) => {
            item.section.sort((a: any, b: any) => a.sno - b.sno)
          });
        }, error: (e) => console.log(e)
      })
    } else if (this.navItems[this.activeIndex].name == "egames") {
      this.match_service.getEgamesMatches().subscribe({
        next: (res) => {
          this.egamesMatches = res;
          this.egamesMatches.forEach((item: any) => {
            item.section.sort((a: any, b: any) => a.sno - b.sno)
          });
          //console.log(res);
        }, error: (e) => console.log(e)
      })
    } else if (this.navItems[this.activeIndex].name == "esoccer") {
      this.match_service.getEsoccerMatches().subscribe({
        next: (res) => {
          this.esoccerMatches = res;
          this.esoccerMatches.forEach((item: any) => {
            item.section.sort((a: any, b: any) => a.sno - b.sno)
          });
          //console.log(res);
        }, error: (e) => console.log(e)
      })
    } else if (this.navItems[this.activeIndex].name == "Kabaddi") {
      this.match_service.getKabaddiMatches().subscribe({
        next: (res) => {
          this.kabaddiMatches = res;
          this.kabaddiMatches.forEach((item: any) => {
            item.section.sort((a: any, b: any) => a.sno - b.sno)
          });
          //console.log(this.kabaddiMatches);
        }, error: (e) => console.log(e)
      })
    }
    else if (this.navItems[this.activeIndex].name == "badminton") {
      this.match_service.getBadmintonMatches().subscribe({
        next: (res) => {
          this.badmintonMatches = res;
          this.badmintonMatches.forEach((item: any) => {
            item.section.sort((a: any, b: any) => a.sno - b.sno)
          });
          //console.log(res);
        }, error: (e) => console.log(e)
      })
    }
    else if (this.navItems[this.activeIndex].name == "snooker") {
      this.match_service.getSnookerMatches().subscribe({
        next: (res) => {
          this.snookerMatches = res;
          this.snookerMatches.forEach((item: any) => {
            item.section.sort((a: any, b: any) => a.sno - b.sno)
          });
          //console.log(res);
        }, error: (e) => console.log(e)
      })
    }
    else if (this.navItems[this.activeIndex].name == "Horse Racing") {
      this.match_service.getHorceraceMatches().subscribe({
        next: (res) => {
          this.horseraceMatches = res;
          //console.log(this.horseraceMatches);
          if (!this.activeHorseTab) {
            this.activeHorseTab = this.horseraceMatches.find((f: any) => f.cname == this.horseraceMatches[0]?.cname);
          }
        }, error: (e) => console.log(e)
      })
    }
    else if (this.navItems[this.activeIndex].name == "Greyhound Racing") {
      this.match_service.getGrayhoundMatches().subscribe({
        next: (res) => {
          this.greyhoundMatches = res;
          if (!this.activeGreyhoundTab) {
            this.activeGreyhoundTab = this.greyhoundMatches.find((f: any) => f.cname == this.greyhoundMatches[0]?.cname);
          }
          //console.log(res);
        }, error: (e) => console.log(e)
      })
    }
  }

  getback1(odds: any) {
    const item = odds.find((item: any) => item.oname === 'back1' || item.oname === 'BACK1');
    return item.odds;
  }
  getlay1(odds: any) {
    const item = odds.find((item: any) => item.oname === 'lay1' || item.oname === 'LAY1');
    return item.odds;
  }

  trackByFunc(index: number, item: any) {
    return item.gameId;
  }
  trackByFunc2(index: number, item: any) {
    return item.gmid;
  }
  getRaceEvent(name: any) {
    this.activeHorseTab = this.horseraceMatches.find((f: any) => f.cname == name);
    this.activeGreyhoundTab = this.greyhoundMatches.find((f: any) => f.cname == name);
    //console.log(this.activeHorseTab)
  }

  selectTab(index: number, event: Event): void {
    this.activeIndex = index;
    event.preventDefault();

    const navPills = document.getElementById('navPills');
    const activeLink = navPills?.children[index];

    if (activeLink && navPills) {
      const navRect = navPills.getBoundingClientRect();
      const activeRect = activeLink.getBoundingClientRect();

      // Calculate the horizontal scroll needed to center the active item
      const offset = activeRect.left - navRect.left - (navRect.width / 2) + (activeRect.width / 2);
      navPills.scrollBy({ left: offset, behavior: 'smooth' });
    }
    this.getmatch();
  }
  commingSoon(){
    this.toastr.info('Comming Soon.', '', {
      timeOut: 3000,
      positionClass: 'toast-top-center',
      closeButton: true,
    });
  }
}
