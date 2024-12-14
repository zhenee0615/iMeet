import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { User } from '../../Models/user.interface';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../Services/user.service';

interface MenuItem {
  name: string;
  route: string;
  defaultImage: string;
  activeImage: string;
}

@Component({
  selector: 'app-side-panel',
  standalone: false,
  templateUrl: './side-panel.component.html',
  styleUrl: './side-panel.component.scss'
})

export class SidePanelComponent {
  isHandset$: Observable<boolean>;
  userData: User | null = null;
  authService = inject(AuthService);
  items: MenuItem[] = [];

  constructor(private breakpointObserver: BreakpointObserver, private router: Router, private userService: UserService) {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay()
    );
  }

  ngOnInit() {
    this.userService.getUserSignal().subscribe((user) => {
      this.userData = user;
      if (this.userData) {
        this.items = [
          {
            name: 'Group',
            route: `/user/${this.userData.uid}/group`,
            defaultImage: 'group_icon.png',
            activeImage: 'group_icon_hover.png',
          },
          {
            name: 'Calendar',
            route: `/user/${this.userData.uid}/schedule`,
            defaultImage: 'calendar_icon.png',
            activeImage: 'calendar_icon_hover.png',
          },
          {
            name: 'Profile',
            route: `/user/${this.userData.uid}/profile`,
            defaultImage: 'profile_icon.png',
            activeImage: 'profile_icon_hover.png',
          },
        ];
      }
    });
  }

  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }

  logout(): void {
    localStorage.removeItem('hasLoggedIn');
    this.authService.logout();
  }
}
