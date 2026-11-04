import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserauthService } from '../services/userauth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  isMenuOpen = true;
  token: string | null = '';

  constructor(private userauth: UserauthService) {
    this.token = this.userauth.getToken();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
