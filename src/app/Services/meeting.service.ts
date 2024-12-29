import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, doc, Firestore, query, where } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { StreamVideoClient, Call } from '@stream-io/video-client';
import { SignJWT } from 'jose';
import { v4 as uuidv4 } from 'uuid';

export interface Meeting {
  roomId: string;
}

@Injectable({ providedIn: 'root' })
export class MeetingService {
  private ongoingMeetingsSubject = new BehaviorSubject<Meeting[]>([]);
  callSubject = new BehaviorSubject<Call | undefined>(undefined);
  ongoingMeetings$ = this.ongoingMeetingsSubject.asObservable();
  private firestore = inject(Firestore);
  private client!: StreamVideoClient;
  call$ = this.callSubject.asObservable();
  private roomIdSubject = new BehaviorSubject<string | null>(null);
  roomId$ = this.roomIdSubject.asObservable();
  // private peerConnection!: RTCPeerConnection;

  getOngoingMeetings$(groupId: string): Observable<Meeting[]> {
    const meetingCollectionRef = collection(this.firestore, `groups/${groupId}/meetings`);
    const ongoingMeetingQuery = query(meetingCollectionRef, where('isOngoing', '==', true));
    return collectionData<Meeting>(ongoingMeetingQuery, { idField: 'id' });
  }

  generateUserToken(userId: string): Promise<string> {
    const secretKey = new TextEncoder().encode('xrbzf7tgauhbzr2u7mewp74krgb3djse2zw589awp38gbx7anvvrfgp343vdm877');
    const token = new SignJWT({ user_id: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .sign(secretKey);
    console.log("token", token);
    return token;
  }

  async createMeeting(groupId: string, userId: string, fullName: string): Promise<string> {
    const callId = uuidv4();
    const groupRef = doc(this.firestore, `groups/${groupId}`);
    const meetingsCollection = collection(groupRef, 'meetings');

    await addDoc(meetingsCollection, {
      callId,
      hostId: userId,
      isOngoing: true,
      createdAt: new Date(),
    });
    const token = await this.generateUserToken(userId);
    this.client = StreamVideoClient.getOrCreateInstance({
      apiKey: 'zrwqew8gkfrb',
      user: { id: userId, name: fullName },
      token,
    });

    const call = this.client.call('default', callId);
    await call.getOrCreate({
      data: {
        members: [{ user_id: userId, role: 'admin' }]
      },
    });
    // this.setupPeerConnection();
    this.callSubject.next(call);
    return callId;
  }

  async joinMeeting(callId: string, userId: string, fullName: string): Promise<void> {
    const token = await this.generateUserToken(userId);

    this.client = StreamVideoClient.getOrCreateInstance({
      apiKey: 'zrwqew8gkfrb',
      user: { id: userId, name: fullName },
      token,
    });

    const call = this.client.call('default', callId);

    await call.join({
      create: false,
      data: {
        settings_override: {
          audio: { mic_default_on: true, default_device: "speaker" },
          video: { camera_default_on: true,
            target_resolution: { width: 640, height: 480 } },
        },
      },
    });
    // this.setupPeerConnection();
    await call.camera.enable();
    await call.microphone.enable();
    this.callSubject.next(call);
  }

  leaveMeeting(): void {
    const currentCall = this.callSubject.getValue();
    if (currentCall) {
      currentCall.leave();
      this.callSubject.next(undefined);
    }
    // this.closePeerConnection();
  }

  // private setupPeerConnection(): void {
  //   const rtcConfig = {
  //     iceServers: [
  //       { urls: 'stun:stun.l.google.com:19302' },
  //       { urls: 'stun:stun1.l.google.com:19302' },
  //     ],
  //   };

  //   this.peerConnection = new RTCPeerConnection(rtcConfig);

  //   this.peerConnection.onicecandidate = (event) => {
  //     if (event.candidate) {
  //       console.log("New ICE candidate: ", event.candidate);
  //     }
  //   };

  //   this.peerConnection.onconnectionstatechange = () => {
  //     console.log("Connection state: ", this.peerConnection.connectionState);
  //   };
  // }

  // private closePeerConnection(): void {
  //   if (this.peerConnection) {
  //     this.peerConnection.close();
  //     console.log("Peer connection closed");
  //   }
  // }
}
