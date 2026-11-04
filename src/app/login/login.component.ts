import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserauthService } from '../services/userauth.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterOutlet, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  requirederr: any = { username: false, password: false }; loader = true; loginLoad = false;
  constructor(private userauth: UserauthService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
    if (this.userauth.authStatus()) {
      this.router.navigate(['/home'])
    }
  }
  demoLogin() {
    this.loginuser({ username: 'Demo', password: 'User@123' })
  }

  loginuser(values: any) {
    this.requirederr = { username: false, password: false };
    if (!values.username) {
      this.requirederr.username = true;
    }
    if (!values.password) {
      this.requirederr.password = true;
      return;
    }
    if (values.username != '' && values.password != '') {
      this.loginLoad = true;
      this.userauth.loginuser(values).subscribe({
        next: (res: any) => {
          this.loginLoad = false;
          if (res.status == 'success') {
            if (res.secAuth) {
              localStorage.setItem("username", values.username);
              this.router.navigate(['loginauth/2']);
              return;
            }
            this.userauth.setToken(res.token, true);
            if (res.firstpass) {
              localStorage.setItem("first", 'true');
              setTimeout(() => {
              this.router.navigate(['changepasswordlogin']);
              }, 1000);
            } else {
              localStorage.removeItem("first")
              this.router.navigate(['home']);
            }
          }
        },
        error: (e) => {
          this.loginLoad = false;
          if (e.error?.maintenance) {
            this.toastr.error(e.error.message, '', {
              timeOut: 3000,
              positionClass: 'toast-top-center',
              closeButton: true,
            });
          } else {
            this.toastr.error(e.error.message, '', {
              timeOut: 3000,
              positionClass: 'toast-top-center',
              closeButton: true,
            });
          }
        }
      })
    }
  }

  clearErr(type: string) {
    this.requirederr[type] = false;
  }

  showMsg() {
    this.toastr.error('We are planning to have scheduled maintenance till 10:30 PM (IST)', '', {
      timeOut: 3000,
      positionClass: 'toast-top-center',
      closeButton: true,
    });
  }

}
