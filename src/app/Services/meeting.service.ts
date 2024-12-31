import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, query, setDoc, where } from '@angular/fire/firestore';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { StreamVideoClient, Call } from '@stream-io/video-client';
import { SignJWT } from 'jose';
import { v4 as uuidv4 } from 'uuid';

interface Meeting {
  callId: string;
  hostId: string;
  isOngoing: boolean;
  createdAt: any;
}

@Injectable({ providedIn: 'root' })
export class MeetingService {
  private ongoingMeetingsSubject = new BehaviorSubject<Meeting[]>([]);
  callSubject = new BehaviorSubject<Call | undefined>(undefined);
  ongoingMeetings$ = this.ongoingMeetingsSubject.asObservable();
  private firestore = inject(Firestore);
  private client!: StreamVideoClient;
  call$ = this.callSubject.asObservable();

  call(): Call | undefined {
    return this.callSubject.getValue();
  }

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

  async createMeeting(groupId: string, userId: string, fullName: string, pic: string): Promise<string> {
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
      user: { id: userId, name: fullName, image: pic },
      token,
    });

    const call = this.client.call('default', callId);
    await call.getOrCreate({
      data: {
        members: [{ user_id: userId, role: 'admin' }]
      },
    });
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
    await call.camera.enable();
    await call.microphone.enable();
    const participantDocRef = doc(this.firestore, `calls/${callId}/participants/${userId}`);
    await setDoc(participantDocRef, {
      isCameraOn: true,
      isMicOn: true,
      userId: userId,
      fullName: fullName,
    });
    this.callSubject.next(call);
  }

  leaveMeeting(): void {
    const currentCall = this.callSubject.getValue();
    if (currentCall) {
      currentCall.leave();
      this.callSubject.next(undefined);
    }
  }

  updateParticipantStatus(callId: string, userId: string, isCameraOn: boolean, isMicOn: boolean) {
    const participantDocRef = doc(this.firestore, `calls/${callId}/participants/${userId}`);
    return setDoc(participantDocRef, { isCameraOn, isMicOn }, { merge: true });
  }

  removeParticipant(callId: string, userId: string) {
    const participantDocRef = doc(this.firestore, `calls/${callId}/participants/${userId}`);
    return deleteDoc(participantDocRef);
  }

  getParticipantsStatus$(callId: string): Observable<{ [key: string]: { isCameraOn: boolean, isMicOn: boolean } }> {
    const participantsCollectionRef = collection(this.firestore, `calls/${callId}/participants`);
    return collectionData(participantsCollectionRef).pipe(
      map((data: any) => data.reduce((acc: any, participant: any) => {
        acc[participant.userId] = {
          isCameraOn: participant.isCameraOn,
          isMicOn: participant.isMicOn,
        };
        return acc;
      }, {}))
    );
  }
}
