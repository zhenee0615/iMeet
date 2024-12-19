import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDocs, addDoc, updateDoc, query, where, serverTimestamp } from '@angular/fire/firestore';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  private firestore = inject(Firestore);
  private userService = inject(UserService);

  constructor() {}

  async fetchOngoingMeetings(groupId: string): Promise<any[]> {
    try {
      const meetingCollectionRef = collection(this.firestore, `groups/${groupId}/meetings`);
      const ongoingMeetingQuery = query(meetingCollectionRef, where('isOngoing', '==', true));
      const ongoingMeetingSnapshot = await getDocs(ongoingMeetingQuery);

      return ongoingMeetingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching ongoing meetings:', error);
      return [];
    }
  }

  async fetchHostName(hostId: string): Promise<string> {
    const userData = await this.userService.getUserById(hostId);
    return userData?.fullName;
  }

  async openMeeting(groupId: string, hostId: string): Promise<string> {
    const meetingCollectionRef = collection(this.firestore, `groups/${groupId}/meetings`);
    const newRoomId = Math.random().toString(36).substr(2, 9);

    await addDoc(meetingCollectionRef, {
      isOngoing: true,
      roomId: newRoomId,
      startTime: serverTimestamp(),
      hostId: hostId,
    });

    return newRoomId;
  }

  async endMeeting(groupId: string, roomId: string): Promise<void> {
    const meetingDocRef = doc(this.firestore, `groups/${groupId}/meetings/${roomId}`);
    await updateDoc(meetingDocRef, {
      isOngoing: false,
      endTime: serverTimestamp(),
    });
  }

  // async fetchMeetingHistory(groupId: string): Promise<any[]> {
  //   const meetingCollectionRef = collection(this.firestore, `groups/${groupId}/meeting`);
  //   const meetingSnapshot = await getDocs(meetingCollectionRef);

  //   return meetingSnapshot.docs
  //     .map(doc => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }))
  //     .filter(meeting => !meeting.isOngoing);
  // }
}
