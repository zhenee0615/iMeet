import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, getDocs, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
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
    await call.camera.disable();
    await call.microphone.disable();
    this.callSubject.next(call);
    return callId;
  }

  async deleteMeetingFromGroup(groupId: string, callId: string): Promise<void> {
    const meetingsCollectionRef = collection(this.firestore, `groups/${groupId}/meetings`);
    const q = query(meetingsCollectionRef, where('callId', '==', callId));

    try {
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return;
      }

      for (const docSnapshot of querySnapshot.docs) {
        const docRef = doc(this.firestore, `groups/${groupId}/meetings/${docSnapshot.id}`);
        await deleteDoc(docRef);
      }
    } catch (error) {
      console.error('Error removing meeting:', error);
    }
  }

  // async joinMeeting(callId: string, userId: string, fullName: string): Promise<void> {
  //   const token = await this.generateUserToken(userId);

  //   this.client = StreamVideoClient.getOrCreateInstance({
  //     apiKey: 'zrwqew8gkfrb',
  //     user: { id: userId, name: fullName },
  //     token,
  //   });

  //   const call = this.client.call('default', callId);

  //   await call.join({
  //     create: false,
  //     data: {
  //       settings_override: {
  //         audio: { mic_default_on: true, default_device: "speaker" },
  //         video: { camera_default_on: true,
  //           target_resolution: { width: 640, height: 480 } },
  //       },
  //     },
  //   });
  //   await call.camera.enable();
  //   await call.microphone.enable();
  //   const participantDocRef = doc(this.firestore, `calls/${callId}/participants/${userId}`);
  //   await setDoc(participantDocRef, {
  //     isCameraOn: true,
  //     isMicOn: true,
  //     userId: userId,
  //     fullName: fullName,
  //   });
  //   this.callSubject.next(call);
  // }
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
          audio: { mic_default_on: false, default_device: "speaker" },
          video: {
            camera_default_on: false,
            target_resolution: { width: 640, height: 480 },
          },
        },
      },
    });
    await call.camera.disable();
    await call.microphone.disable();

    const participantCollectionRef = collection(this.firestore, 'participants');
    await addDoc(participantCollectionRef, {
      isCameraOn: false,
      isMicOn: false,
      userId: userId,
      callId: callId,
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

  async updateParticipantStatus(callId: string, userId: string, isCameraOn: boolean, isMicOn: boolean) {
    const participantsCollection = collection(this.firestore, 'participants');
    const q = query(participantsCollection, where('callId', '==', callId), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const participantDocRef = querySnapshot.docs[0].ref;
      await updateDoc(participantDocRef, { isCameraOn, isMicOn });
    } else {
      throw new Error(`Participant with userId: ${userId} and callId: ${callId} not found.`);
    }
  }

  async removeParticipant(callId: string, userId: string): Promise<void> {
    const participantsCollection = collection(this.firestore, 'participants');
    const q = query(participantsCollection, where('callId', '==', callId), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const participantDocRef = querySnapshot.docs[0].ref; 
      await deleteDoc(participantDocRef); 
    } else {
      throw new Error(`Participant with userId: ${userId} and callId: ${callId} not found.`);
    }
  }

  getParticipantsStatus$(callId: string): Observable<{ [key: string]: { isCameraOn: boolean, isMicOn: boolean } }> {
    const participantsCollectionRef = collection(this.firestore, 'participants');
    const q = query(participantsCollectionRef, where('callId', '==', callId));
    
    return collectionData(q).pipe(
      map((data: any[]) =>
        data.reduce((acc: { [key: string]: { isCameraOn: boolean, isMicOn: boolean } }, participant: any) => {
          acc[participant.userId] = {
            isCameraOn: participant.isCameraOn,
            isMicOn: participant.isMicOn,
          };
          return acc;
        }, {})
      )
    );
  }
}
