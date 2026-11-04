import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserauthService } from '../services/userauth.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-changepassword',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './changepassword.component.html',
  styleUrl: './changepassword.component.css'
})
export class ChangepasswordComponent implements OnInit {
  requirederr: any = { current_password: "", new_password: "", confirm_password: "" };
  formValid = true;
  constructor(private userauth: UserauthService, private toastr: ToastrService) { }

  ngOnInit(): void {

  }
  changepass(values: any) {
    this.requirederr = { current_password: "", new_password: "", confirm_password: "" };

    //current password validation
    if (!values.current_password) {
      this.formValid = false;
      this.requirederr.current_password = 'Current Password is required.';
    } else if (values.current_password && values.current_password.length < 3) {
      this.formValid = false;
      this.requirederr.current_password = 'Current Password must be at least 3 character long.';
    } else {
      this.formValid = true;
    }

    //new password validation
    if (!values.new_password) {
      this.formValid = false;
      this.requirederr.new_password = 'New Password is required.';
    } else if (values.new_password && values.new_password.length < 3) {
      this.formValid = false;
      this.requirederr.new_password = 'New Password must be at least 3 character long.';
    } else if (!this.isStrongPassword(values.new_password)) {
      this.formValid = false;
      this.requirederr.new_password = 'The password must contain at least: 1 uppercase letter, 1 lowercase letter, and 1 number.';
    } else {
      this.formValid = true;
    }

    //confirm password validation
    if (!values.confirm_password) {
      this.formValid = false;
      this.requirederr.confirm_password = 'Confirmation Password is required.';
    } else if (values.confirm_password !== values.new_password) {
      this.formValid = false;
      this.requirederr.confirm_password = 'New Password Confirmation does not match';
    } else {
      this.formValid = true;
    }

    if (this.formValid) {
      this.userauth.changeUserPass(values).subscribe({
        next: (res: any) => {
          if (res.status == 'success') {
            this.toastr.success(res.message, '', {
              timeOut: 3000,
              positionClass: 'toast-top-center',
              closeButton: true,
            });
            this.userauth.logOut();
          }
        },
        error: (e) => {
          this.toastr.error(e.error.message, '', {
            timeOut: 3000,
            positionClass: 'toast-top-center',
            closeButton: true,
          });
        }
      })
    }

  }
  clearErr(type: any) {
    this.requirederr[type] = '';
  }
  isStrongPassword(password: string): boolean {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return strongPasswordRegex.test(password);
  }

}
