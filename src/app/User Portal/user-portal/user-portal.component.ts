import { Component, inject, OnInit } from '@angular/core';
import { NotificationService } from '../../Services/notification.service';

@Component({
  selector: 'app-user-portal',
  standalone: false,
  
  templateUrl: './user-portal.component.html',
  styleUrl: './user-portal.component.scss'
})
  
export class UserPortalComponent implements OnInit{

  ngOnInit(): void {
    if (!localStorage.getItem('hasLoggedIn')) {
      localStorage.setItem('hasLoggedIn', 'true');
    }
  }
}
