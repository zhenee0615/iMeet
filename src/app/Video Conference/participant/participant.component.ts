import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { StreamVideoParticipant } from '@stream-io/video-client';
import { MeetingService } from '../../Services/meeting.service';

@Component({
  selector: 'app-participant',
  standalone: false,
  
  templateUrl: './participant.component.html',
  styleUrl: './participant.component.scss'
})

// export class ParticipantComponent implements AfterViewInit {
//   @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
//   @ViewChild('audioElement') audioElement!: ElementRef<HTMLAudioElement>;
//   @Input() participant!: StreamVideoParticipant;

//   ngAfterViewInit(): void {
//     console.log('Participant video stream:', this.participant.videoStream);
//     console.log('Participant audio stream:', this.participant.audioStream);

//     const videoStream = this.participant.videoStream;
//     if (videoStream) {
//       this.videoElement.nativeElement.srcObject = videoStream;
//       this.videoElement.nativeElement.play().catch(error => {
//         console.error('Error playing video:', error);
//       });
//     }

//     const audioStream = this.participant.audioStream;
//     if (audioStream) {
//       this.audioElement.nativeElement.srcObject = audioStream;
//       this.audioElement.nativeElement.play().catch(error => {
//         console.error('Error playing audio:', error);
//       });
//     }
//   }

//   // ngOnChanges(changes: SimpleChanges): void {
//   //   if (changes['participant'] && this.isViewInitialized) {
//   //     this.updateStreams();
//   //   }
//   // }

//   // updateStreams(): void {
//   //   if (this.participant.videoStream) {
//   //     this.videoElement.nativeElement.srcObject = this.participant.videoStream;
//   //     this.videoElement.nativeElement.play().catch(error => {
//   //       console.error('Error playing video:', error);
//   //     });
//   //   } else {
//   //     console.warn('Participant videoStream is undefined:', this.participant);
//   //   }

//   //   if (this.participant.audioStream) {
//   //     this.audioElement.nativeElement.srcObject = this.participant.audioStream;
//   //     this.audioElement.nativeElement.play().catch(error => {
//   //       console.error('Error playing audio:', error);
//   //     });
//   //   } else {
//   //     console.warn('Participant audioStream is undefined:', this.participant);
//   //   }
//   // }

//   ngOnDestroy(): void {
//     const videoElement = this.videoElement.nativeElement;
//     const videoStream = videoElement.srcObject as MediaStream;
//     if (videoStream) {
//       videoStream.getTracks().forEach((track) => track.stop());
//       videoElement.srcObject = null;
//     }

//     const audioElement = this.audioElement.nativeElement;
//     const audioStream = audioElement.srcObject as MediaStream;
//     if (audioStream) {
//       audioStream.getTracks().forEach((track) => track.stop());
//       audioElement.srcObject = null;
//     }
//   }
// }
export class ParticipantComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('audioElement') audioElement!: ElementRef<HTMLAudioElement>;
  @Input() participant!: StreamVideoParticipant;

  // We keep track of the unbind function references so we can clean them up
  private unbindVideoElement?: () => void;
  private unbindAudioElement?: () => void;

  constructor(private meetingService: MeetingService) {}

  ngAfterViewInit(): void {
    // Retrieve the current call
    const call = this.meetingService.call();
    if (!call) {
      console.error('No active call found in meetingService');
      return;
    }

    // Bind the <video> element to this participant
    this.unbindVideoElement = call.bindVideoElement(
      this.videoElement.nativeElement,
      this.participant.sessionId,
      'videoTrack', 
    );

    // Bind the <audio> element to this participant
    this.unbindAudioElement = call.bindAudioElement(
      this.audioElement.nativeElement,
      this.participant.sessionId,
    );
  }

  ngOnDestroy(): void {
    // Unbind/cleanup your video/audio track bindings
    if (this.unbindVideoElement) {
      this.unbindVideoElement();
    }
    if (this.unbindAudioElement) {
      this.unbindAudioElement();
    }
  }
}
