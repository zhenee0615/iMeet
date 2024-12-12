import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from './Services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
  
export class AppComponent {
  authService = inject(AuthService);
  isLoggedIn: boolean = false;

  constructor() {
    const storedUser = localStorage.getItem('currentUser');
    // if (storedUser) {
    //   this.isLoggedIn = true;
    // } else {
    //   this.isLoggedIn = false;
    // }
    this.isLoggedIn = !!storedUser;
    // console.log(this.isLoggedIn);
  }

  logout(): void {
    this.authService.logout();
  }
}
