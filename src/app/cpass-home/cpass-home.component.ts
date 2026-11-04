import { SidebarComponent } from '../sidebar/sidebar.component';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '../header/header.component';
import { ContainerComponent } from '../container/container.component';
import { UserauthService } from '../services/userauth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cpass-home',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule, RouterLink, RouterOutlet, HttpClientModule, HeaderComponent, ContainerComponent],
  templateUrl: './cpass-home.component.html',
  styleUrl: './cpass-home.component.css'
})
export class CpassHomeComponent implements OnInit {
  requirederr: any = { username: false, password: false };
  err = ''; msg = '';
  // values: any = { current_password: '', new_password: '', confirm_password: '' }
  constructor(private userauth: UserauthService, private toastr: ToastrService) { }

  ngOnInit(): void {

  }
   changepass(values:any) {
    this.err = "";
    this.requirederr = { current_password: false, new_password: false, confirm_password: false };
    
  //current password validation
    this.requirederr.current_password = [];
    if (!values.current_password) {
      this.requirederr.current_password.push('Current Password is required.');
    }else if (values.current_password && values.current_password.length < 3) {
      this.requirederr.current_password.push('Current Password must be at least 3 character long.');
    }
  //new password validation
    this.requirederr.new_password = [];
    if (!values.new_password) {
      this.requirederr.new_password.push('New Password is required.');
    }else if (values.new_password && values.new_password.length < 3) {
      this.requirederr.new_password.push('New Password must be at least 3 character long.');
    } 
    else if (!this.isStrongPassword(values.new_password)) {
      this.requirederr.new_password.push(
        'The password must contain at least: 1 uppercase letter, 1 lowercase letter, and 1 number.'
      );
    }
    //confirm password validation
    this.requirederr.confirm_password = [];
    if (!values.confirm_password) {
      this.requirederr.confirm_password.push('Confirmation Password is required.');
    }else if(values.confirm_password!==values.new_password){
      this.requirederr.confirm_password.push('New Password Confirmation does not match');
    }
    else if(!this.isStrongPassword(values.confirm_password)) {
      this.requirederr.new_password.push(
        'The password must contain at least: 1 uppercase letter, 1 lowercase letter, and 1 number.'
      );
    }
    if (values.new_password != '' && values.confirm_password != '' && values.current_password != '') {
      if (values.new_password == values.confirm_password) {
        this.userauth.changeUserPass(values).subscribe({
          next: (res: any) => {
            console.log("password changed")
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
      } else {
        this.err = 'New password and confirm password didn\'t match';
        
      }
    } else {
      this.err = 'Fields can\'t be empty';
    
    }
  }
  clearErr(type: string) {
    this.requirederr[type] = false;
  }
  isStrongPassword(password: string): boolean {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return strongPasswordRegex.test(password);
  }
}
