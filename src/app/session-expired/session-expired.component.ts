import { Component } from '@angular/core';

@Component({
  selector: 'app-session-expired',
  standalone: true,
  template: `
    <div class="session-expired">
      <h4>Session invalid or expired</h4>
      <p>Please reload the game from the site.</p>
    </div>
  `,
  styles: [`
    .session-expired { min-height: 100vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center; text-align: center; padding: 20px; }
  `]
})
export class SessionExpiredComponent { }
