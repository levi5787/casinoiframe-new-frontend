import { SidebarComponent } from '../sidebar/sidebar.component';
import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { UserauthService } from '../services/userauth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-secure-auth',
  standalone: true,
  imports: [SidebarComponent, FormsModule, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './secure-auth.component.html',
  styleUrl: './secure-auth.component.css'
})
export class SecureAuthComponent {
  activeTab = ""; password: string = ""; connectionId: string = ""; secAuthStatus = false;
  pin: any = []; openCodeBox = false; randomNum = 123456;

  constructor(private auth: UserauthService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.getSecurityAuthStatus()
  }

  clickTab(name: any) {
    if (name == 'usingmobile') {
      this.randomNum = Math.floor(100000 + Math.random() * 900000);
      //this.displayToast('success', 'Successfully Auth Allow.');
    }
    this.activeTab = name;
  }

  getSecurityAuthStatus() {
    this.auth.secAuthStatus().subscribe({
      next: (res: any) => {
        this.secAuthStatus = res.twoStepAuth;
        //console.log(this.secAuthStatus)
      }, error: (e) => console.log(e)
    })
  }

  getConnectionId() {
    if (!this.password) {
      this.displayToast('error', 'code is empty.')
      return;
    }
    this.auth.getConnectionId({ password: this.password }).subscribe({
      next: (res: any) => {
        //console.log(res)
        this.connectionId = res.connectionId;
      },
      error: (e) => {
        console.log(e)
        this.displayToast('error', e.error.message)
      }
    })
  }

  disableClick() {
    this.openCodeBox = true;
    this.auth.disableSecAuth().subscribe({
      next: (res: any) => {
        this.displayToast('success', res.message)
      }, error: (e) => {
        console.log(e)
        this.displayToast('error', e.error.message)
      }
    })
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
        this.disableSecAuth(concatenatedNumber)
      }
    }
  }

  disableSecAuth(pin: any) {
    this.auth.validateDisableSecAuth({ code: pin }).subscribe({
      next: (res: any) => {
        this.displayToast('success', res.message)
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
