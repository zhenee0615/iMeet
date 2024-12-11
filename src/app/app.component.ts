import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from './Services/auth.service';
import { onAuthStateChanged } from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
  
export class AppComponent {
  authService = inject(AuthService);
  isLoggedIn: boolean = false;

  constructor(private _route: ActivatedRoute) {
    this._route.url.subscribe(url => {
        // Your action/function will go here
    });
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
    }
    console.log(this.isLoggedIn)
    // this.isLoggedIn = !!storedUser;
    // console.log(this.isLoggedIn);
  }

  logout(): void {
    this.authService.logout();
  }
}
