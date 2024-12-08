import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { user } from '../../Models/user.model';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {
  userList: user[] = [];
  private userService = inject(UserService);

  constructor() {
    this.userService.getUsers().subscribe((data: any[]) => {
      console.log('Fetched users:', data);
      this.userList = data;
    });
  }

  onSubmit() {
    // console.log(this.userList);
  }
}
