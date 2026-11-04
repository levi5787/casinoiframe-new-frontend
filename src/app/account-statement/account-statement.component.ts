import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { UserauthService } from '../services/userauth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
declare var $: any;

@Component({
  selector: 'app-account-statement',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent, FooterComponent, SidebarComponent],
  templateUrl: './account-statement.component.html',
  styleUrl: './account-statement.component.css'
})
export class AccountStatementComponent {
  selectedItem = "1"; loader=false;
  statement: any = []; statementDetail: any = []; fancyOddsTypes = ["Fancy", "Fancy1", "Meter", "Khado", "OddEven", "Cricket Casino"];
  from_date = ""; to_date = ""; selectedSportId = ""; selectedEventId = ""; selectedRoundId = ""; selectedOddsType = ""; selectedFName = "";
  sportNames: any = {
    '1': 'Football', '2': 'Tennis', '4': 'Cricket', '15': 'Basketball', '8': 'Table Tennis', '9': 'Futsal',
    '11': 'Egames', '18': 'Volleyball', '50': 'Binary', '68': 'Esoccer', '66': 'Kabaddi', '22': 'Badminton',
    '59': 'Snooker', '10': 'Horse Racing', '65': 'Greyhound Racing'
  }

  stmtvalues: any = {}; stmtdetailtotal = 0;
  totalStatement = 0; totalPage = 0; page = 1; offset = 10; goPage = 1; searchString = ""
  constructor(private user_auth: UserauthService, private modalService: NgbModal) { }

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

  open(content: any, values: any) {
    this.stmtvalues = values;
    this.selectedSportId = values.sportId, this.selectedEventId = values.eventId; this.selectedOddsType = values.oddsType;
    let dt: any = []
    if (this.selectedSportId == '6') {
      this.selectedRoundId = values.roundId
      dt = { eventId: this.selectedEventId, roundId: this.selectedRoundId, oddsType: this.selectedOddsType, matchType: "matched" }
    } else {
      dt = { eventId: this.selectedEventId, oddsType: this.selectedOddsType, matchType: "matched" }
    }
    if (this.fancyOddsTypes.includes(this.selectedOddsType)) {
      this.selectedFName = values.fancyName
      dt.fancyName = this.selectedFName
    }
    this.user_auth.getstatementdetail(dt).subscribe((res) => {
      this.statementDetail = res;
      this.stmtdetailtotal = this.statementDetail.reduce((acc: any, cur: any) => {
        if (cur.betstatus == 'won') {
          acc += cur.profit
        } else if (cur.betstatus == 'loss') {
          acc -= cur.loss
        }
        return acc;
      }, 0)
    })
    this.modalService.open(content, { size: 'xl' });
  }
  closeModal() {
    this.statementDetail = [];
    this.modalService.dismissAll();
  }

  getStatement() {
    this.loader=true;
    this.statement = [];
    if (!this.selectedItem) return;
    let dt = {
      from_date: $('.datepicker#from_date').val(),
      to_date: $('.datepicker#to_date').val(),
      type: this.selectedItem,
      page: this.page,
      offset: this.offset,
      searchString: this.searchString
    };
    this.user_auth.getuserstatement(dt).subscribe({
      next: (res: any) => {
        this.loader=false;
        this.statement = res.data;
        this.totalStatement = res.total
        this.totalPage = Math.ceil(res.total / this.offset)
      }, error: (e) => {
        this.loader=false;
        console.log(e)
      }
    })
  }

  getDetails(matchtype: any) {
    let dt: any = []
    if (this.selectedSportId == '6') {
      dt = { eventId: this.selectedEventId, roundId: this.selectedRoundId, oddsType: this.selectedOddsType, matchType: matchtype.target.value }
    } else {
      dt = { eventId: this.selectedEventId, oddsType: this.selectedOddsType, matchType: matchtype.target.value }
    }
    if (this.fancyOddsTypes.includes(this.selectedOddsType)) {
      dt.fancyName = this.selectedFName
    }
    this.user_auth.getstatementdetail(dt).subscribe((res) => {
      this.statementDetail = res;
      this.stmtdetailtotal = this.statementDetail.reduce((acc: any, cur: any) => {
        if (cur.betstatus == 'won') {
          acc += cur.profit
        } else if (cur.betstatus == 'loss') {
          acc -= cur.loss
        }
        return acc;
      }, 0)
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
    this.getStatement();
  }

  offsetChange() {
    this.page = this.goPage = 1;
    this.getStatement();
  }

  goToPage() {
    if (this.goPage == this.page) return;
    if (this.goPage >= 1 && this.goPage <= this.totalPage) {
      this.page = this.goPage;
      this.getStatement();
    }
  }
}
