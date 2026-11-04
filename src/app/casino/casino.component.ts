import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ContainerComponent } from '../container/container.component';

@Component({
  selector: 'app-casino',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterOutlet, HttpClientModule, HeaderComponent, FooterComponent, SidebarComponent, ContainerComponent],
  templateUrl: './casino.component.html',
  styleUrl: './casino.component.css'
})
export class CasinoComponent {

}
