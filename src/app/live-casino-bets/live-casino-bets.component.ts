import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { UserauthService } from '../services/userauth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
declare var $: any;

@Component({
  selector: 'app-live-casino-bets',
  standalone: true,
  imports: [FormsModule, HeaderComponent, FooterComponent, SidebarComponent],
  templateUrl: './live-casino-bets.component.html',
  styleUrl: './live-casino-bets.component.css'
})
export class LiveCasinoBetsComponent {
  from_date = ""; selectedItem = "";
  constructor(private user_auth: UserauthService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.from_date = this.getOneWeekAgoDate();
  }

  ngAfterViewInit(): void {
    $('.datepicker#from_date').datepicker({
      format: 'yyyy-mm-dd',
      orientation: "bottom auto",
      startDate: this.getOneMonthAgoDate(),
      endDate: this.getCurrentDate(),
      autoclose: true
    }).datepicker('setDate', this.from_date);
  }

  getCurrentDate() {
    return this.formatDate(new Date())
  }
  getOneWeekAgoDate(): string {
    return this.formatDate(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }
  getOneMonthAgoDate(): string {
    var currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - 1);
    return this.formatDate(currentDate)
  }
  formatDate(dateString: any) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 to month because it's zero-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
