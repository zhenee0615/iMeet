import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from './Services/auth.service';
import { onAuthStateChanged } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
  
export class AppComponent implements OnInit {
  authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.currentUserSig();
  }

  logout(): void {
    this.authService.logout();
  }
}
