import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../Services/user.service';
import { User } from '../../Models/user.interface';
import { Subscription } from 'rxjs';

interface Header {
  imgSrc: string;
  title: string;
  buttonTitle: string;
  route: string;
}

@Component({
  selector: 'app-user-header',
  standalone: false,
  
  templateUrl: './user-header.component.html',
  styleUrl: './user-header.component.scss'
})
export class UserHeaderComponent implements OnInit, OnDestroy {
  userData: User | null = null;
  header: Header[] = [];
  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.subscription.add(
      this.userService.getUserSignal().subscribe((user) => {
        this.userData = user;
        if (this.userData) {
          this.header = [
            {
              imgSrc: 'group_icon_hover.png',
              title: 'Group',
              buttonTitle: 'Join or Create Group',
              route: `/user/${this.userData.uid}/group`,
            },
            {
              imgSrc: 'calendar_icon_hover.png',
              title: 'Calendar',
              buttonTitle: 'Schedule Meeting',
              route: `/user/${this.userData.uid}/schedule`,
            },
            {
              imgSrc: 'profile_icon_hover.png',
              title: 'Profile',
              buttonTitle: 'Edit Profile',
              route: `/user/${this.userData.uid}/profile`,
            },
          ];
        }
      })
    );

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  constructor(private router: Router, private userService: UserService) { }
  
  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }
}
