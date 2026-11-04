import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  isRacingSportsOpen = true;
  isOthersOpen = true;
  isSportsOpen = true;
  isHorseOpen = false;

  toggleHorse() {
    this.isHorseOpen = !this.isHorseOpen;
  }

  toggleRacingSports() {
    this.isRacingSportsOpen = !this.isRacingSportsOpen
  }

  toggleOthers() {
    this.isOthersOpen = !this.isOthersOpen
  }

  toggleAllSports() {
    this.isSportsOpen = !this.isSportsOpen
  }
}
