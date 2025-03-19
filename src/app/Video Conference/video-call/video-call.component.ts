import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Call, StreamVideoParticipant } from '@stream-io/video-client';
import { MeetingService } from '../../Services/meeting.service';
import { filter, firstValueFrom, Observable, Subscription } from 'rxjs';
import { Router, ActivatedRoute, NavigationStart } from '@angular/router';
import Swal from 'sweetalert2';
import { GroupService } from '../../Services/group.service';
import { Group } from '../../Models/group';

@Component({
  selector: 'app-video-call',
  standalone: false,
  templateUrl: './video-call.component.html',
  styleUrl: './video-call.component.scss'
})

export class VideoCallComponent implements OnDestroy, OnInit {
  @Input({ required: true }) call!: Call;
  participants$!: Observable<StreamVideoParticipant[]>;
  participantsStatus$!: Observable<{ [key: string]: { isCameraOn: boolean, isMicOn: boolean } }>;
  private durationIntervalId!: ReturnType<typeof setInterval>;
  private meetingService = inject(MeetingService);
  private groupService = inject(GroupService);
  private callSubscription!: Subscription;
  private groupSubscription!: Subscription;
  private meetingSubscription!: Subscription;
  private routerEventsSubscription!: Subscription;
  groupId: string | null = null;
  uid: string | null = null;
  meetingStartTime?: Date;
  micOn = false;
  cameraOn = false;
  groupName = ''; 
  meetingDuration = '';

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.callSubscription = this.meetingService.call$.subscribe(call => {
      if (call) {
        this.call = call;
        this.participants$ = this.call.state.participants$;
        this.participantsStatus$ = this.meetingService.getParticipantsStatus$(call.id);
      } else {
        console.error('No active call found.');
      }
    });

    this.groupId = this.route.snapshot.paramMap.get('groupId');
    if (this.groupId) {
      this.groupSubscription = this.groupService
        .getGroupById(this.groupId)
        .subscribe((group: Group) => {
          this.groupName = group.groupName;
        });

      this.meetingSubscription = this.meetingService
        .getOngoingMeetings$(this.groupId)
        .subscribe(async (meetings) => {
          if (meetings && meetings.length > 0) {
            const localCallId = this.call?.id;
            const myMeeting = meetings.find((m) => m.callId === localCallId);

            if (myMeeting) {
              this.meetingStartTime = myMeeting.createdAt?.toDate
                ? myMeeting.createdAt.toDate()
                : new Date(myMeeting.createdAt);
              if (this.durationIntervalId) {
                clearInterval(this.durationIntervalId);
              }
              this.durationIntervalId = setInterval(() => {
                this.updateDuration();
              }, 1000);
            }
          }
        });
    }

    this.routerEventsSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(async () => {
        await this.cleanupMeeting();
      });
  }

  private updateDuration() {
    if (!this.meetingStartTime) {
      this.meetingDuration = '00:00:00';
      return;
    }
    const diffMs = new Date().getTime() - this.meetingStartTime.getTime();
    this.meetingDuration = this.formatDuration(diffMs);
  }

  private formatDuration(diffMs: number): string {
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const hh = hours < 10 ? '0' + hours : hours;
    const mm = mins < 10 ? '0' + mins : mins;
    const ss = secs < 10 ? '0' + secs : secs;
    return `${hh}:${mm}:${ss}`;
  }

  toggleMicrophone() {
    if (!this.call) return;
    this.uid = this.route.snapshot.paramMap.get('uid');
    if (this.call.microphone.enabled) {
      this.call.microphone.disable();
      this.micOn = false;
      this.meetingService.updateParticipantStatus(this.call.id, this.uid!, this.cameraOn, false);
    } else {
      this.call.microphone.enable();
      this.micOn = true;
      this.meetingService.updateParticipantStatus(this.call.id, this.uid!, this.cameraOn, true);
    }
  }

  async toggleCamera() {
    this.uid = this.route.snapshot.paramMap.get('uid');
    if (!this.call || !this.call.id || !this.uid) { console.log(!this.call, this.call.id, this.uid); return}

    if (this.call.camera.enabled) {
      await this.call.camera.disable();
      console.log("1");
      this.cameraOn = false;
    } else {
      console.log("2");
      await this.call.camera.enable();
      this.cameraOn = true;
    }

    await this.meetingService.updateParticipantStatus(this.call.id, this.uid, this.cameraOn, this.micOn);
  }

  async leaveCall() {
    this.groupId = this.route.snapshot.paramMap.get('groupId');
    this.uid = this.route.snapshot.paramMap.get('uid');
    if (this.call) {
      await this.call.leave();

      const participants = await firstValueFrom(this.meetingService.getParticipantsStatus$(this.call.id));
      if (Object.keys(participants).length <= 1) {
        await this.meetingService.deleteMeetingFromGroup(this.groupId!, this.call.id);
      }
      
      Swal.fire({
        title: 'Leaving Meeting...',
        didOpen: () => Swal.showLoading(null),
        allowOutsideClick: false,
        timer: 2000
      }).then(() => {
        this.router.navigate([`/user/${this.uid}/group/${this.groupId}`]);
      });
    }
  }

  private async cleanupMeeting() {
    this.groupId = this.route.snapshot.paramMap.get('groupId');
    this.uid = this.route.snapshot.paramMap.get('uid');
    if (this.call) {
      await this.call.leave();

      const participants = await firstValueFrom(this.meetingService.getParticipantsStatus$(this.call.id));
      if (Object.keys(participants).length <= 1) {
        await this.meetingService.deleteMeetingFromGroup(this.groupId!, this.call.id);
      }
    }
  }

  trackBySessionId(_: number, participant: StreamVideoParticipant) {
    return participant.sessionId;
  }

  ngOnDestroy(): void {
    if (this.call && this.call.id && this.uid) {
      this.meetingService.removeParticipant(this.call.id, this.uid).catch((err) => console.error(err));
    }
    if (this.callSubscription) {
      this.callSubscription.unsubscribe();
    }
    if (this.groupSubscription) {
      this.groupSubscription.unsubscribe();
    }
    if (this.meetingSubscription) {
      this.meetingSubscription.unsubscribe();
    }
    if (this.durationIntervalId) {
      clearInterval(this.durationIntervalId);
    }
  }
}
