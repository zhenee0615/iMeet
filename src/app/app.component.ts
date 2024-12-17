import { Component, OnInit } from '@angular/core';
import { User } from './Models/user';
import { UserService } from './Services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit {
  user: User | null = null;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.userService.getUserSignal().subscribe(() => {
      this.user = this.userService.getUser()!;
    });
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }
}
