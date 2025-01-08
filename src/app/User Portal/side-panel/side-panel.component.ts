import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { User } from '../../Models/user';
import { AuthService } from '../../Services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../Services/user.service';
import { MeetingService } from '../../Services/meeting.service';
import Swal from 'sweetalert2';

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
  activeTab$: BehaviorSubject<string> = new BehaviorSubject('General');
  private authService = inject(AuthService);
  private meetingService = inject(MeetingService);
  items: MenuItem[] = [];
  private groupId: string | null = null;

  constructor(private breakpointObserver: BreakpointObserver, private router: Router, private userService: UserService, private route: ActivatedRoute) {
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
    return this.router.url.includes(route);
  }

  onTabChange(event: any): void {
    const tabLabel = event.tab.textLabel;
    this.activeTab$.next(tabLabel);
  }

  logout(): void {
    localStorage.removeItem('hasLoggedIn');
    this.authService.logout();
  }

  isGroupRoute(): boolean {
    const url = this.router.url;
    const groupRouteRegex = /^\/user\/[a-zA-Z0-9]+\/group\/[a-zA-Z0-9]+$/;
    return groupRouteRegex.test(url); 
  }

  async openMeeting() {
    if (this.userData?.uid) {
      try {
        Swal.fire({
          title: 'Starting Meeting...',
          html: 'Please wait while we set things up.',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(null),
        });

        const urlSegments = this.router.url.split('/').filter(segment => segment.length > 0);
        this.groupId = urlSegments.length > 0 ? urlSegments[urlSegments.length - 1] : null;

        const callId = await this.meetingService.createMeeting(
          this.groupId!,
          this.userData?.uid!,
          this.userData.fullName,
          this.userData.profilePicUrl
        );
        await this.meetingService.joinMeeting(callId, this.userData.uid, this.userData.fullName);

        this.router.navigate(['/meeting', this.userData?.uid, this.groupId, callId]);

        Swal.close();
      } catch (error) {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Failed to Start Meeting',
          text: 'An error occurred while starting the meeting. Please try again.',
        });
      }
    }
  }
}
