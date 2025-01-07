import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../Services/user.service';
import { User } from '../../Models/user';
import { Subscription } from 'rxjs';
import { GroupDialogComponent } from '../Dashboard/group-dialog/group-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ProfileDialogComponent } from '../Profile/profile-dialog/profile-dialog.component';

interface Header {
  imgSrc: string;
  title: string;
  buttonTitle: string;
  route: string;
  onclick: () => void;
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
              onclick: this.createAndJoinGroup.bind(this)
            },
            {
              imgSrc: 'calendar_icon_hover.png',
              title: 'Calendar',
              buttonTitle: 'Schedule Meeting',
              route: `/user/${this.userData.uid}/schedule`,
              onclick: this.editProfile.bind(this)
            },
            {
              imgSrc: 'profile_icon_hover.png',
              title: 'Profile',
              buttonTitle: 'Edit Profile',
              route: `/user/${this.userData.uid}/profile`,
              onclick: this.editProfile.bind(this)
            },
          ];
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  constructor(private router: Router, private userService: UserService, private dialog: MatDialog) { }
  
  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }

  createAndJoinGroup() {
    const dialogRef = this.dialog.open(GroupDialogComponent, {
      width: '400px'
    });
  }

  editProfile() {
    const dialogRef = this.dialog.open(ProfileDialogComponent, {
      width: '500px',
      minHeight: 'auto',
      height : 'auto',
      data: { ...this.userData }
    });

    dialogRef.afterClosed().subscribe((updatedUser: User | undefined) => {
      if (updatedUser) {
        this.userData = updatedUser;
      }
    });
  }
}
