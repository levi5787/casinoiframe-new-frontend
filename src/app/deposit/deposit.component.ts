import { Component, ElementRef, QueryList, ViewChildren } from "@angular/core";
import { FooterComponent } from "../footer/footer.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { HeaderComponent } from "../header/header.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { UserauthService } from "../services/userauth.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-deposit",
  standalone: true,
  imports: [
    FooterComponent,
    SidebarComponent,
    HeaderComponent,
    CommonModule,
    FormsModule,
  ],
  templateUrl: "./deposit.component.html",
  styleUrl: "./deposit.component.css",
})
export class DepositComponent {
  amount: number = 0;
  amountErr = "";
  parentBanks: any = [];
  baseURL = "";
  selectedImage = "";
  @ViewChildren("fileInput") fileInputs!: QueryList<ElementRef>;
  constructor(
    private userService: UserauthService,
    private modalService: NgbModal,
    private toastr: ToastrService,
  ) {
    this.baseURL = this.userService.getBaseURL();
  }

  ngOnInit(): void {
    this.getParentBanks();
  }

  onFileSelected(event: Event, bankIndex: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Show image preview
      const reader = new FileReader();
      reader.onload = () =>
        (this.parentBanks[bankIndex].imageUrl = reader.result);
      reader.readAsDataURL(file);

      this.parentBanks[bankIndex].selectedFile = file;
    }
  }

  removeImage(bankIndex: number): void {
    this.parentBanks[bankIndex].imageUrl = null;
    this.parentBanks[bankIndex].selectedFile = null;
    // Reset file input field
    const fileInput = this.fileInputs.toArray()[bankIndex].nativeElement;
    fileInput.value = "";
  }

  getParentBanks() {
    this.userService.getParentBank().subscribe({
      next: (res: any) => {
        this.parentBanks = res.map((mm: any) => ({
          ...mm,
          imageUrl: null,
          selectedFile: null,
        }));
      },
      error: (e: any) => {
        console.log(e);
      },
    });
  }

  setAmount(amount: number) {
    this.amount += amount;
  }

  increaseAmount() {
    if (this.amount < 100) {
      this.amount = 100;
    } else {
      this.amount += 10;
    }
    this.amountErr = "";
  }

  decreaseAmount() {
    if (this.amount <= 100) {
      this.amount = 100;
    } else {
      this.amount -= 10;
    }
    this.amountErr = "";
  }

  checkAmount() {
    if (!this.amount) {
      this.amountErr = "Amount is required!";
    } else {
      this.amountErr = "";
    }
  }

  uploadImage(bankIndex: number): void {
    const bank = this.parentBanks[bankIndex];
    if (!bank.selectedFile || !this.amount) return;

    const formData = new FormData();
    formData.append("image", bank.selectedFile);
    formData.append("bankId", String(bank._id));
    formData.append("amount", String(this.amount));
    formData.append("transaction_type", "DEPOSIT");

    this.userService.userDeposit(formData).subscribe({
      next: (res: any) => {
        this.showMessage("success", res.message);
        this.amount = 0;
        this.removeImage(bankIndex);
      },
      error: (e: any) => {
        this.showMessage("error", e.error.message);
      },
    });
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

  openSS(content: any, image: string) {
    this.selectedImage = image;
    this.modalService.open(content, { size: "md" });
  }

  closeModal() {
    this.modalService.dismissAll();
  }
}
