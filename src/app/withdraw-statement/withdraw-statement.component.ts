import { SidebarComponent } from '../sidebar/sidebar.component';
import { Component } from "@angular/core";
import { UserauthService } from "../services/userauth.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
declare var $: any;

@Component({
  selector: "app-withdraw-statement",
  standalone: true,
  imports: [SidebarComponent, 
    HeaderComponent,
    FooterComponent,
    CommonModule,
    FormsModule,
  ],
  templateUrl: "./withdraw-statement.component.html",
  styleUrl: "./withdraw-statement.component.css",
})
export class WithdrawStatementComponent {
  selectedItem = "all";
  loader = false;
  from_date = "";
  to_date = "";
  statement: any = [];
  baseURL = "";
  selectedImage = "";
  constructor(
    private userService: UserauthService,
    private modalService: NgbModal,
  ) {
    this.baseURL = this.userService.getBaseURL();
  }

  ngOnInit(): void {
    this.to_date = this.getCurrentDate();
    this.from_date = this.getOneWeekAgoDate();
  }

  ngAfterViewInit(): void {
    $(".datepicker#from_date")
      .datepicker({
        format: "yyyy-mm-dd",
        orientation: "bottom auto",
        startDate: this.getOneMonthAgoDate(),
        endDate: this.getCurrentDate(),
        autoclose: true,
      })
      .datepicker("setDate", this.from_date);
    $(".datepicker#to_date")
      .datepicker({
        format: "yyyy-mm-dd",
        orientation: "bottom auto",
        endDate: this.getCurrentDate(),
        autoclose: true,
      })
      .datepicker("setDate", this.to_date);
  }

  getDepositStatement() {
    const formData = {
      fromdate: $(".datepicker#from_date").val(),
      todate: $(".datepicker#to_date").val(),
      transaction_type: "WITHDRAW",
      status: this.selectedItem,
    };
    this.userService.getDWStatement(formData).subscribe({
      next: (res) => {
        this.statement = res;
      },
      error: (e) => {
        console.log(e);
      },
    });
  }

  open(content: any, image: string) {
    this.selectedImage = image;
    this.modalService.open(content, { size: "md" });
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  getCurrentDate() {
    return this.formatDate(new Date());
  }
  getOneWeekAgoDate(): string {
    return this.formatDate(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }
  getOneMonthAgoDate(): string {
    var currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - 1);
    return this.formatDate(currentDate);
  }
  formatDate(dateString: any) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Adding 1 to month because it's zero-indexed
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
