import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from './Services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
  
export class AppComponent implements OnInit {
  authService = inject(AuthService);

  ngOnInit(): void {
    console.log("hi");
    this.authService.user$.subscribe((user: any) => {
      if (user) {
        this.authService.currentUserSig.set(
          {
            email: user.email!,
            fullName: user.fullName!,
            password: user.password!,
            gender: user.gender!,
            phoneNumber: user.phoneNumber
          }
        );
      } else {
        this.authService.currentUserSig.set(null);
      }
      console.log(this.authService.currentUserSig());
    })
  }

  logout(): void {
    this.authService.logout();
  }
}
