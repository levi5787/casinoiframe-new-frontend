import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { UserauthService } from '../services/userauth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Component({
  selector: 'app-activity-logs',
  standalone: true,
  imports: [FormsModule, CommonModule,HeaderComponent, FooterComponent, SidebarComponent],
  templateUrl: './activity-logs.component.html',
  styleUrl: './activity-logs.component.css'
})
export class ActivityLogsComponent {
  loader=false;
  from_date = ""; to_date = ""; selectedItem = ""; logs:any = [];
  totalLogs = 0; totalPage = 0; page = 1; offset = 10; goPage = 1; searchString = ""
  constructor(
    private user_auth: UserauthService, 
    private modalService: NgbModal,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.to_date = this.getCurrentDate();
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
    $('.datepicker#to_date').datepicker({
      format: 'yyyy-mm-dd',
      orientation: "bottom auto",
      endDate: this.getCurrentDate(),
      autoclose: true
    }).datepicker('setDate', this.to_date);
  }

  typeChanged() {
    this.logs = [];
    this.totalLogs = 0; this.totalPage = 0; this.page = 1; this.goPage = 1;
  }

  getActivityLog() {
    this.logs = [];
    if (!this.selectedItem){
      this.toastr.error('Select Log Type!', '', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        closeButton: true,
      });
      return;
    };
    let dt = {
      from_date: $('.datepicker#from_date').val(),
      to_date: $('.datepicker#to_date').val(),
      type: this.selectedItem,
      page: this.page,
      offset: this.offset,
      searchString: this.searchString
    };
    this.loader=true;
    this.user_auth.getactivitylog(dt).subscribe({
      next: (res: any) => {
        this.loader=false;
        //console.log(res)
        this.logs = res.data;
        this.totalLogs = res.total
        this.totalPage = Math.ceil(res.total / this.offset)
      }, error: (e) => {
        this.loader=false;
        console.log(e)
      }
    })
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

  pageChange(type: string) {
    if (type == 'next') {
      if (this.page >= this.totalPage) return;
      this.page += 1;
    } else if (type == 'previous') {
      if (this.page <= 1) return;
      this.page -= 1;
    } else if (type == 'first') {
      if (this.page <= 1) return;
      this.page = 1;
    } else if (type == 'last') {
      if (this.page >= this.totalPage) return;
      this.page = this.totalPage;
    }
    this.goPage = this.page;
    this.getActivityLog();
  }

  offsetChange() {
    this.page = this.goPage = 1;
    this.getActivityLog();
  }

  goToPage() {
    if (this.goPage == this.page) return;
    if (this.goPage >= 1 && this.goPage <= this.totalPage) {
      this.page = this.goPage;
      this.getActivityLog();
    }
  }
}
