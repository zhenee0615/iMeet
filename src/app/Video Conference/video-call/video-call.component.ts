// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { collection, onSnapshot, addDoc } from 'firebase/firestore';

// @Component({
//   selector: 'app-video-call',
//   standalone:false,
//   templateUrl: './video-call.component.html',
//   styleUrls: ['./video-call.component.scss']
// })
// export class VideoCallComponent implements OnInit {
//   localStream!: MediaStream;
//   remoteStream!: MediaStream;
//   peerConnection!: RTCPeerConnection;
//   signalingServer!: WebSocket;
//   roomId!: string;

//   iceServers = {
//     iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
//   };

//   constructor(private route: ActivatedRoute) {}

//   ngOnInit(): void {
//     this.roomId = this.route.snapshot.paramMap.get('roomId')!;
//     if (this.roomId) {
//       this.initializeSignaling();
//       this.getMedia();
//     }
//   }

//   async initializeSignaling() {
//     this.listenForSignalingMessages();
//   }

//   // initializeSignalingServer() {
//   //   this.signalingServer = new WebSocket(`ws://localhost:8080?roomId=${this.roomId}`);

//   //   this.signalingServer.onopen = () => {
//   //     console.log('WebSocket connected');
//   //   };

//   //   this.signalingServer.onmessage = (event) => {
//   //     console.log('Received signaling message:', event.data);
//   //     this.handleSignalingMessage(event.data);
//   //   };

//   //   this.signalingServer.onerror = (error) => {
//   //     console.error('WebSocket error:', error);
//   //   };

//   //   this.signalingServer.onclose = () => {
//   //     console.log('WebSocket connection closed');
//   //   };
//   // }
//   listenForSignalingMessages() {
//     const signalingRef = collection(this.firestore, `meetings/${this.roomId}/signaling`);
//     onSnapshot(signalingRef, (snapshot) => {
//       snapshot.docChanges().forEach((change) => {
//         const data = change.doc.data();
//         if (data.type === 'answer') {
//           this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
//         } else if (data.type === 'candidate') {
//           this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
//         }
//       });
//     });
//   }

//   async createOffer() {
//     const offer = await this.peerConnection.createOffer();
//     await this.peerConnection.setLocalDescription(offer);

//     const signalingRef = collection(this.firestore, `meetings/${this.roomId}/signaling`);
//     await addDoc(signalingRef, { type: 'offer', sdp: offer });
//   }


//   async getMedia() {
//     try {
//       this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
//       localVideo.srcObject = this.localStream;

//       this.setupPeerConnection();
//     } catch (error) {
//       console.error('Error accessing media devices:', error);
//     }
//   }

//   setupPeerConnection() {
//     this.peerConnection = new RTCPeerConnection(this.iceServers);

//     this.localStream.getTracks().forEach((track) => {
//       this.peerConnection.addTrack(track, this.localStream);
//     });

//     this.peerConnection.ontrack = (event) => {
//       if (!this.remoteStream) {
//         this.remoteStream = new MediaStream();
//         const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
//         remoteVideo.srcObject = this.remoteStream;
//       }
//       this.remoteStream.addTrack(event.track);
//     };

//     this.peerConnection.onicecandidate = (event) => {
//       if (event.candidate) {
//         this.signalingServer.send(
//           JSON.stringify({ type: 'candidate', candidate: event.candidate })
//         );
//       }
//     };
//   }

//   async handleSignalingMessage(message: string) {
//     const data = JSON.parse(message);

//     if (data.type === 'offer') {
//       console.log('Received offer');
//       await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
//       const answer = await this.peerConnection.createAnswer();
//       await this.peerConnection.setLocalDescription(answer);

//       this.signalingServer.send(
//         JSON.stringify({ type: 'answer', sdp: this.peerConnection.localDescription })
//       );
//     } else if (data.type === 'answer') {
//       console.log('Received answer');
//       await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
//     } else if (data.type === 'candidate') {
//       console.log('Received ICE candidate');
//       this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
//     }
//   }
// }
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, AfterViewInit } from '@angular/core';
import { SignalingService } from '../../Services/signaling.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-video-call',
  standalone:false,
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss']
})
export class VideoCallComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  pc!: RTCPeerConnection;
  localStream!: MediaStream;
  roomId!: string;

  constructor(private signaling: SignalingService, private route: ActivatedRoute) {}

  async ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('roomId')!;
    this.setupListeners();
    // Connect signaling AFTER view is init to ensure no timing issues
    await this.setupLocalMedia();
    await this.setupPeerConnection();
    this.signaling.connect(this.roomId);
  }

  ngOnDestroy() {
    if (this.pc) this.pc.close();
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
  }

  private setupListeners() {
    this.signaling.messages$.subscribe(async (msg: any) => {
      if (msg.payload && msg.payload.roomId === this.roomId) {
        switch (msg.type) {
          case 'joined':
            // If this user is the initiator, create an offer
            if (msg.payload.isInitiator) {
              const offer = await this.pc.createOffer();
              await this.pc.setLocalDescription(offer);
              this.signaling.sendOffer(offer, this.roomId);
            }
            break;
          case 'offer':
            await this.handleOffer(msg.payload.offer);
            break;
          case 'answer':
            await this.pc.setRemoteDescription(new RTCSessionDescription(msg.payload.answer));
            break;
          case 'candidate':
            if (msg.payload.candidate) {
              await this.pc.addIceCandidate(new RTCIceCandidate(msg.payload.candidate));
            }
            break;
        }
      }
    });
  }

  private async setupLocalMedia() {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.localVideo.nativeElement.srcObject = this.localStream;
    await this.localVideo.nativeElement.play();
  }

  private async setupPeerConnection() {
    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    this.localStream.getTracks().forEach(track => this.pc.addTrack(track, this.localStream));

    this.pc.ontrack = (event) => {
      const [stream] = event.streams;
      this.remoteVideo.nativeElement.srcObject = stream;
      this.remoteVideo.nativeElement.play();
    };

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.signaling.sendCandidate(event.candidate, this.roomId);
      }
    };
  }

  private async handleOffer(offer: RTCSessionDescriptionInit) {
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    this.signaling.sendAnswer(answer, this.roomId);
  }
}
