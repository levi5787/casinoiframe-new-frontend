import { SidebarComponent } from '../sidebar/sidebar.component';
import { Component, OnInit } from "@angular/core";
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { UserauthService } from "../services/userauth.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-withdraw",
  standalone: true,
  imports: [SidebarComponent, 
    HeaderComponent,
    FooterComponent,
    CommonModule,
    FormsModule,
  ],
  templateUrl: "./withdraw.component.html",
  styleUrl: "./withdraw.component.css",
})
export class WithdrawComponent implements OnInit {
  banks: any = [];
  amount: number = 0;
  amountErr = "";
  selectedBank = "";
  payment_method = "Bank Transfer";
  baseURL = "";
  selectedImage = "";

  constructor(
    private userService: UserauthService,
    private modalService: NgbModal,
    private toastr: ToastrService,
  ) {
    this.baseURL = this.userService.getBaseURL();
  }

  ngOnInit(): void {
    this.getBanks();
  }

  getBanks() {
    this.userService.getBanks().subscribe({
      next: (res) => {
        this.banks = res;
      },
      error: (e) => {
        console.log(e);
      },
    });
  }

  open(content: any) {
    this.modalService.open(content, { size: "md" });
  }

  openSS(content: any, image: string) {
    this.selectedImage = image;
    this.modalService.open(content, { size: "md" });
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  addBank(formValue: any, qrFileInput: HTMLInputElement, bankForm: any) {
    const formData = new FormData();

    // Append form values
    formData.append("payment_method", formValue.payment_method);
    formData.append("bank_name", formValue.bank_name || "");
    formData.append("account_name", formValue.account_name || "");
    formData.append("account_number", formValue.account_number || "");
    formData.append("ifsc_code", formValue.ifsc_code || "");
    formData.append("other_info", formValue.other_info || "");

    // Append QR file if selected
    const qrFile = qrFileInput.files?.[0];
    if (qrFile) {
      formData.append("image", qrFile);
    }
    const obj: any = {};
    formData.forEach((value, key) => (obj[key] = value));

    this.userService.addBank(formData).subscribe({
      next: (res: any) => {
        this.getBanks();
        this.showMessage("success", res.message);
        this.closeModal();
        bankForm.resetForm();
        qrFileInput.value = "";
      },
      error: (e) => {
        this.showMessage("error", e.error.message);
      },
    });
  }

  deleteBank(_id: any) {
    this.userService.deleteBank({ _id }).subscribe({
      next: (res: any) => {
        this.getBanks();
        this.showMessage("success", res.message);
        this.closeModal();
      },
      error: (e) => {
        this.showMessage("error", e.error.message);
      },
    });
  }

  withdrawSubmit(values: any) {
    this.amountErr = "";
    if (!values.bankId) {
      this.amountErr = "Select bank!";
      return;
    }
    if (!this.amount) {
      this.amountErr = "Amount is required!";
      return;
    }
    values.transaction_type = "WITHDRAW";
    this.userService.userWithdraw(values).subscribe({
      next: (res: any) => {
        this.showMessage("success", res.message);
        this.amount = 0;
        this.selectedBank = "";
      },
      error: (e) => {
        this.showMessage("error", e.error.message);
      },
    });
  }

  checkAmount() {
    if (!this.amount) {
      this.amountErr = "Amount is required!";
    } else {
      this.amountErr = "";
    }
  }

  showMessage(type: string, message: string) {
    if (type == "success") {
      this.toastr.success(message, "", {
        timeOut: 3000,
        positionClass: "toast-top-center",
        closeButton: true,
      });
    } else {
      this.toastr.error(message, "", {
        timeOut: 3000,
        positionClass: "toast-top-center",
        closeButton: true,
      });
    }
  }
}
