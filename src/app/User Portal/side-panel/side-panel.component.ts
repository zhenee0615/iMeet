import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { User } from '../../Models/user';
import { AuthService } from '../../Services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { UserService } from '../../Services/user.service';
import { MeetingService } from '../../Services/meeting.service';
import { VideoCallComponent } from '../../Video Conference/video-call/video-call.component';
import { SignalingService } from '../../Services/signaling.service';

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
  showUserHeader: boolean = false;
  userData: User | null = null;
  activeTab$: BehaviorSubject<string> = new BehaviorSubject('General');
  authService = inject(AuthService);
  private meetingService = inject(MeetingService);
  private signalingService = inject(SignalingService);
  items: MenuItem[] = [];
  private userDataSubject = new BehaviorSubject<User | null>(null);
  userData$ = this.userDataSubject.asObservable();
  videoCallComponent!: VideoCallComponent;
  pc!: RTCPeerConnection;


  constructor(private breakpointObserver: BreakpointObserver, private router: Router, private userService: UserService, private signaling: SignalingService) {
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

  // async openMeeting() {
  //   const newRoomId = await this.meetingService.openMeeting(this.router.url.split('/')[4], this.userData?.uid!);
  //   this.router.navigate(['/meeting', newRoomId]);
  // }
  async openMeeting() {
    const newRoomId = await this.meetingService.openMeeting(this.router.url.split('/')[4], this.userData?.uid!);
    // this.signalingService.connect(newRoomId);
    this.meetingService.startMeeting(newRoomId);
    this.router.navigate(['/meeting', newRoomId]);
  }
}
