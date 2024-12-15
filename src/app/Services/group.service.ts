import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, doc, docData, Firestore, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { Group } from '../Models/group';
import { NotificationService } from './notification.service';
import { map, mergeAll, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  groups: Group[] = [];
  notificationService = inject(NotificationService)
  constructor(private firestore: Firestore) {
    
  }

  async createGroup(groupName: string, adminId: string): Promise<void> {
    const groupCollection = collection(this.firestore, 'groups');
    const newGroup = {
      groupName: groupName,
      admin: adminId,
      dateCreated: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      groupId: ''
    };

    const groupDocRef = await addDoc(groupCollection, newGroup);
    const groupId = groupDocRef.id;
    await updateDoc(groupDocRef, { groupId });
    const groupMemberCollection = collection(this.firestore, 'group_members');
    const groupMember = {
      groupId: groupId,
      uid: adminId,
      dateJoined: new Date().toLocaleDateString('en-GB').replace(/\//g, '-')
    }
    await addDoc(groupMemberCollection, groupMember)
  }

  async joinGroup(groupId: string, userId: string): Promise<void> {
    // const groupDocRef = query(
    //   collection(this.firestore, 'groups'),
    //   where('groupId', '==', groupId)
    // );
    const groupDocRef = doc(this.firestore, 'groups', groupId);
    const groupSnapshot = await getDoc(groupDocRef);
    console.log(groupSnapshot)

    if (!groupSnapshot.exists()) {
      // Group does not exist
      this.notificationService.showNotification("This group does not exist. Please try another.", "error-snackbar");
      return;
    }

    // Check if the user has already joined the group
    const groupMembersQuery = query(
      collection(this.firestore, 'group_members'),
      where('groupId', '==', groupId),
      where('uid', '==', userId)
    );
    const groupMembersSnapshot = await getDocs(groupMembersQuery);

    if (!groupMembersSnapshot.empty) {
      this.notificationService.showNotification("You have already joined this group.", "error-snackbar");
      return;
    }

    const groupMembersCollection = collection(this.firestore, 'group_members');
    const groupMember = {
      groupId: groupId,
      uid: userId,
      dateJoined: new Date().toLocaleDateString('en-GB').replace(/\//g, '-')
    };

    await addDoc(groupMembersCollection, groupMember);
    this.notificationService.showNotification("You have successfully joined the group.", "success-snackbar");
  }

  // getGroupsJoinedByUser(userId: string): Observable<Group[]> {
  //   const groupMembershipQuery = query(
  //     collection(this.firestore, 'group_members'),
  //     where('uid', '==', userId)
  //   );

  //   // const membershipSnapshot = await getDocs(groupMembershipQuery);
  //   // const groupIds = membershipSnapshot.docs.map((doc) => doc.data()['groupId']);

  //   // const groups: Group[] = [];
  //   // for (const groupId of groupIds) {
  //   //   const groupDocRef = doc(this.firestore, 'groups', groupId);
  //   //   const groupSnapshot = await getDoc(groupDocRef);

  //   //   if (groupSnapshot.exists()) {
  //   //     const groupData = groupSnapshot.data();
  //   //     groups.push({
  //   //       groupId: groupSnapshot.id,
  //   //       groupName: groupData['groupName'],
  //   //       admin: groupData['admin'],
  //   //       dateCreated: groupData['dateCreated'],
  //   //     });
  //   //   }
  //   // }
  //   // return groups;

  //   return collectionData(groupMembershipQuery, { idField: 'id' }).pipe(
  //     // Map each groupId to the actual group details
  //     map((memberships: any[]) =>
  //       memberships.map((membership) => {
  //         const groupDocRef = doc(this.firestore, 'groups', membership.groupId);
  //         return docData(groupDocRef, { idField: 'id' }).pipe(
  //           map((groupData: any) => ({
  //             groupId: groupData.id,
  //             groupName: groupData.groupName,
  //             admin: groupData.admin,
  //             dateCreated: groupData.dateCreated,
  //           }))
  //         );
  //       })
  //     ),
  //     // Flatten the array of Observables into a single Observable of Group[]
  //     mergeAll()
  //   );
  // }
  getGroupsJoinedByUser(userId: string): Observable<Group[]> {
    const groupMembershipQuery = query(
      collection(this.firestore, 'group_members'),
      where('uid', '==', userId)
    );

    return collectionData(groupMembershipQuery, { idField: 'id' }).pipe(
      map((memberships: any[]) => memberships.map((membership) => membership.groupId)),
      map(async (groupIds: string[]) => {
        const groups: Group[] = [];
        for (const groupId of groupIds) {
          const groupDocRef = doc(this.firestore, 'groups', groupId);
          const groupSnapshot = await getDoc(groupDocRef);
          if (groupSnapshot.exists()) {
            const groupData = groupSnapshot.data();
            groups.push({
              groupId: groupSnapshot.id,
              groupName: groupData['groupName'],
              admin: groupData['admin'],
              dateCreated: groupData['dateCreated'],
            });
          }
        }
        return groups;
      }),
      mergeAll()
    );
  }
}