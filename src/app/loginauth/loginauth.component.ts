import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UserauthService } from '../services/userauth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-loginauth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loginauth.component.html',
  styleUrl: './loginauth.component.css'
})
export class LoginauthComponent {
  pin: any = []
  constructor(private auth: UserauthService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  move(e: any, p: any, c: any, n: any) {
    //console.log(e)
    let length = c.value.length;
    let maxLength = c.getAttribute('maxLength');
    if (length == maxLength) {
      if (n !== '') {
        n.focus();
      }
    }
    if (e.key == 'Backspace') {
      if (p !== '') {
        p.focus();
      }
    }
    if (this.pin.length == 6) {
      const concatenatedNumber = parseInt(this.pin.join(''), 10);
      if (concatenatedNumber.toString().length == 6) {
        this.validatePin(concatenatedNumber)
      }
    }
  }

  validatePin(pin: any) {
    let username = localStorage.getItem("username");
    this.auth.validateSecurityCode({ code: pin, username }).subscribe({
      next: (res: any) => {
        this.auth.setToken(res.token, true);
        this.router.navigate(['home']);
      }, error: (e) => {
        this.displayToast('error', e.error.message)
      }
    })
  }

  displayToast(type: string, message: string) {
    if (type == 'success') {
      this.toastr.success(message, '', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        closeButton: true,
      });
    } else {
      this.toastr.error(message, '', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        closeButton: true,
      });
    }
  }

}
