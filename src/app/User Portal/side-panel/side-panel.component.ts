import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { User } from '../../Models/user.interface';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';

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
  hoveredIndex: number = -1;
  isHandset$: Observable<boolean>;
  userData: User | null = null;
  authService = inject(AuthService);
  items: MenuItem[] = [];
  

  constructor(private breakpointObserver: BreakpointObserver, private router: Router) {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay()
    );
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.userData = JSON.parse(storedUser);
    }
    this.items = [
      {
        name: 'Dashboard',
        route: `/user/${this.userData?.uid}/dashboard`,
        defaultImage: 'dashboard_icon.png',
        activeImage: 'dashboard_icon_hover.png',
      },
      {
        name: 'Calendar',
        route: `/user/${this.userData?.uid}/schedule`,
        defaultImage: 'calendar_icon.png',
        activeImage: 'calendar_icon_hover.png',
      },
      {
        name: 'Profile',
        route: `/user/${this.userData?.uid}/profile`,
        defaultImage: 'profile_icon.png',
        activeImage: 'profile_icon_hover.png',
      },
    ];
  }  

  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }

  logout(): void {
    this.authService.logout();
  }
}
