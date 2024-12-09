import { Component, inject } from '@angular/core';
import { AuthService } from './Services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
  
export class AppComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
