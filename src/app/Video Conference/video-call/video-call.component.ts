import { Component, inject, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Call, StreamVideoParticipant } from '@stream-io/video-client';
import { MeetingService } from '../../Services/meeting.service';
import { Observable, Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-video-call',
  standalone: false,
  
  templateUrl: './video-call.component.html',
  styleUrl: './video-call.component.scss'
})

export class VideoCallComponent implements OnDestroy, OnInit {
  @Input({ required: true }) call!: Call;
  participants$!: Observable<StreamVideoParticipant[]>;
  private meetingService = inject(MeetingService);
  private callSubscription!: Subscription;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.callSubscription = this.meetingService.call$.subscribe(call => {
      if (call) {
        this.call = call;
        this.participants$ = this.call.state.participants$;
        console.log('Subscribed to participants:', this.participants$);
      } else {
        console.error('No active call found.');
      }
    });
  }

  toggleMicrophone() {
    if (this.call) {
      this.call.microphone.toggle();
    }
  }

  toggleCamera() {
    if (this.call) {
      this.call.camera.toggle();
    }
  }

  leaveCall() {
    if (this.call) {
      this.call.leave();
      this.meetingService.leaveMeeting();
      this.router.navigate(['/']); // Navigate away after leaving
    }
  }

  trackBySessionId(_: number, participant: StreamVideoParticipant) {
    return participant.sessionId;
  }

  ngOnDestroy(): void {
    this.leaveCall();
    if (this.callSubscription) {
      this.callSubscription.unsubscribe();
    }
  }
}
