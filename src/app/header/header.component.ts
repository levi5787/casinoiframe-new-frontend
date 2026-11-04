import { Component, inject, Input, signal, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserauthService } from '../services/userauth.service';
import { SocketService } from '../services/socket.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatchService } from '../services/match.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  showbalance = true; showexp = true;
  iframeMode = true; // casino iframe: hide sports/account menus
  token: string | null = "";
  isSearchInputShow: boolean = false;
  isAccountClicked: boolean = false;
  @Input() username!: string;
  @Input() dwstatus!: boolean;
  @Input() balance!: number;
  @Input() exposure!: number;
  getBandE: any;
  myMarket: any = []; userButtons: any = {};
  activeRuleTab = "football"; notice: any; setButtonTab = "game";
  constructor(
    private userauth: UserauthService,
    private socket_service: SocketService,
    private modalService: NgbModal,
    private router: Router,
    private match: MatchService,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.username = this.userauth.getUsername();
    this.dwstatus = this.userauth.getUserDetails().dwstatus;
    this.token = this.userauth.getToken();
    this.userauth.getUserBalance(); this.getBalance(); this.getExposure();
    setTimeout(() => {
      this.getBalance(); this.getExposure();
    }, 1000);
    this.getBandE = setInterval(() => {
      this.userauth.getUserBalance();
      this.getBalance(); this.getExposure();
    }, 5 * 1000)
    this.getNotice();
    // this.socket_service.updateCheck('User',this.username).subscribe((data:any)=>{
    //   if(data.update){
    //     this.userauth.getUserBalance();
    //   }
    // })

  }
  ngOnDestroy() {
    if (this.getBandE) {
      clearInterval(this.getBandE);
    }
  }

  openButtons(content: any) {
    this.userauth.getButtons().subscribe({
      next: (res) => {
        this.userButtons = res;
        this.modalService.open(content, { size: 'md' });
      }, error: (e) => {
        console.log(e)
      }
    })
  }

  updateButtons() {
    this.userauth.updateButtons(this.userButtons).subscribe({
      next: (res: any) => {
        this.toastr.success(res.message, '', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          closeButton: true,
        });
        this.modalService.dismissAll();
      }, error: (e) => {
        this.toastr.error(e.error.message, '', {
          timeOut: 3000,
          positionClass: 'toast-top-center',
          closeButton: true,
        });
        this.modalService.dismissAll();
      }
    })
  }

  openMarket(content: any) {
    this.modalService.open(content, { size: 'lg' });
    this.getmyMarket();
  }

  getBalance() {
    this.balance = this.userauth.getBalance()
  }

  getExposure() {
    this.exposure = this.userauth.getExposure()
  }

  getmyMarket() {
    this.userauth.getmymarket().subscribe({
      next: (res) => {
        this.myMarket = res;
        //console.log(this.myMarket);
      }, error: (e) => console.log(e)
    })
  }
  accountClicked() {
    this.isAccountClicked = !this.isAccountClicked
  }
  searchInputShow() {
    this.isSearchInputShow = !this.isSearchInputShow
  }
  balanceClicked() {
    this.showbalance = !this.showbalance;
  }
  expClicked() {
    this.showexp = !this.showexp;
  }
  logout() {
    this.userauth.logOut();
  }
  twoDecimal(num: number) {
    if (num) return num.toFixed(2);
    return 0.00;
  }
  getlink(sportName: any, sportId: any, mType: any, eventId: any) {
    let link = `/game-details/${sportId}/${eventId}`;
    this.modalService.dismissAll();
    //this.router.navigate([link])
    window.location.href = link;
  }

  ruleTab(name: any) {
    this.activeRuleTab = name;
    //console.log(this.activeRuleTab)
  }

  getNotice() {
    this.match.getNotice().subscribe({
      next: (res) => {
        this.notice = res;
        //console.log(this.notice);
      }, error: (e) => console.log(e)
    })
  }

  @ViewChild('desktopDropdownRef') desktopDropdownRef?: ElementRef<HTMLElement>;
  @ViewChild('mobileDropdownRef') mobileDropdownRef?: ElementRef<HTMLElement>;

  isDropdownOpen = false;
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.isDropdownMOpen = false;
    }
  }
  isDropdownMOpen = false;
  toggleMDropdown() {
    this.isDropdownMOpen = !this.isDropdownMOpen;
    if (this.isDropdownMOpen) {
      this.isDropdownOpen = false;
    }
  }

  closeDropdownOnItemClick(event: MouseEvent, isMobile: boolean) {
    const target = event.target as HTMLElement | null;
    if (target?.closest('.form-check')) {
      return;
    }
    if (target?.closest('.dropdown-item')) {
      if (isMobile) {
        this.isDropdownMOpen = false;
      } else {
        this.isDropdownOpen = false;
      }
    }
  }

  @HostListener('document:click', ['$event'])
  @HostListener('document:touchstart', ['$event'])
  onDocumentClickOrTouch(event: Event) {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (this.isDropdownOpen && !this.desktopDropdownRef?.nativeElement.contains(target)) {
      this.isDropdownOpen = false;
    }
    if (this.isDropdownMOpen && !this.mobileDropdownRef?.nativeElement.contains(target)) {
      this.isDropdownMOpen = false;
    }
  }

  isSearchOpen = false;
  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
  }
  isMSearchOpen = false;
  toggleMSearch() {
    this.isMSearchOpen = !this.isMSearchOpen;
  }
  clickSetButton(name: any) {
    this.setButtonTab = name
  }

  open(content: any) {
    this.modalService.open(content, { size: 'xl' });
  }

  ruleslisttab = "Football";
  ClickTab(name: any) {
    if (this.ruleslisttab == name) {
      this.ruleslisttab = "";
    }
    this.ruleslisttab = name;
  }

}
