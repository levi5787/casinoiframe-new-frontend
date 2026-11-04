import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserauthService } from '../services/userauth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() username!: string;
  @Input() balance!: number;
  @Input() exposure!: number;
  token: string | null = '';
  myMarket: any = [];
  private getBandE: any;

  constructor(
    private userauth: UserauthService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.username = this.userauth.getUsername();
    this.token = this.userauth.getToken();
    this.userauth.getUserBalance();
    this.refresh();
    setTimeout(() => this.refresh(), 1000);
    this.getBandE = setInterval(() => {
      this.userauth.getUserBalance();
      this.refresh();
    }, 5 * 1000);
  }

  ngOnDestroy() {
    if (this.getBandE) {
      clearInterval(this.getBandE);
    }
  }

  private refresh() {
    this.balance = this.userauth.getBalance();
    this.exposure = this.userauth.getExposure();
  }

  openMarket(content: any) {
    this.modalService.open(content, { size: 'lg' });
    this.userauth.getmymarket().subscribe({
      next: (res) => this.myMarket = res,
      error: (e) => console.log(e)
    });
  }

  twoDecimal(num: number) {
    if (num) return num.toFixed(2);
    return '0.00';
  }

  getlink(sportName: any, sportId: any, mType: any, eventId: any) {
    this.modalService.dismissAll();
    window.location.href = `/game-details/${sportId}/${eventId}`;
  }
}
