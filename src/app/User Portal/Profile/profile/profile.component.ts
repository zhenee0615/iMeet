import { Component } from '@angular/core';
import { UserService } from '../../../Services/user.service';
import { User } from '../../../Models/user';

@Component({
  selector: 'app-profile',
  standalone: false,
  
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  user: User | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUserSignal().subscribe((user) => {
      if (user) {
        this.user = user;
      }
    });
  }
}
