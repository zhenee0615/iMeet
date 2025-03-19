import { AfterViewInit, Component, ElementRef, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StreamVideoParticipant } from '@stream-io/video-client';
import { MeetingService } from '../../Services/meeting.service';
import { Observable, Subscription } from 'rxjs';
import { UserService } from '../../Services/user.service';

@Component({
  selector: 'app-participant',
  standalone: false,
  
  templateUrl: './participant.component.html',
  styleUrl: './participant.component.scss'
})

export class ParticipantComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('audioElement') audioElement!: ElementRef<HTMLAudioElement>;
  @Input() participant!: StreamVideoParticipant;
  @Input() participantStatus$!: Observable<{ [key: string]: { isCameraOn: boolean, isMicOn: boolean } }>;
  @Input() totalParticipants!: number;
  private userSubscription?: Subscription;
  private statusSubscription!: Subscription;
  private userService = inject(UserService);
  randomColor: string = '';
  profilePicUrl: string = '';
  cameraOn = false;
  micOn = false;

  private unbindVideoElement?: () => void;
  private unbindAudioElement?: () => void;

  constructor(private meetingService: MeetingService) { }
  
  ngOnInit(): void {
    const userId = this.participant.userId; 
    if (userId) {
      this.userService.getUserById(userId)
        .then(user => {
          if (user?.profilePicUrl) {
            this.profilePicUrl = user.profilePicUrl;
          }
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
        });
    }
    this.randomColor = this.generateRandomColorWithContrast('#3e3e3e');

    this.statusSubscription = this.participantStatus$.subscribe(status => {
      if (status[this.participant.userId]) {
        this.cameraOn = status[this.participant.userId].isCameraOn;
        this.micOn = status[this.participant.userId].isMicOn;
      }
    });
  }

  ngAfterViewInit(): void {
    const call = this.meetingService.call();
    if (!call) {
      console.error('No active call found in meetingService');
      return;
    }

    this.unbindVideoElement = call.bindVideoElement(
      this.videoElement.nativeElement,
      this.participant.sessionId,
      'videoTrack', 
    );

    this.unbindAudioElement = call.bindAudioElement(
      this.audioElement.nativeElement,
      this.participant.sessionId,
    );
  }

  ngOnDestroy(): void {
    if (this.unbindVideoElement) {
      this.unbindVideoElement();
    }
    if (this.unbindAudioElement) {
      this.unbindAudioElement();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.statusSubscription) {
      this.statusSubscription?.unsubscribe();

    }
  }

  isMicOn(participant: StreamVideoParticipant): boolean {
    return this.micOn ?? false; 
  }

  isCameraOn(participant: StreamVideoParticipant): boolean {
    return this.cameraOn ?? false;
  }

  generateRandomColorWithContrast(backgroundColor: string): string {
    const bgColor = parseInt(backgroundColor.replace('#', ''), 16);
    const bgRed = (bgColor >> 16) & 0xff;
    const bgGreen = (bgColor >> 8) & 0xff;
    const bgBlue = bgColor & 0xff;

    let randomColor: string;
    let contrast: number;

    do {
      const red = Math.floor(Math.random() * 150);
      const green = Math.floor(Math.random() * 150);
      const blue = Math.floor(Math.random() * 150);

      randomColor = `#${red.toString(16).padStart(2, '0')}${green
        .toString(16)
        .padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;

      contrast =
        Math.abs((0.299 * red + 0.587 * green + 0.114 * blue) - (0.299 * bgRed + 0.587 * bgGreen + 0.114 * bgBlue));
    } while (contrast < 30);

    return randomColor;
  }
}
