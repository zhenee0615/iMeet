import { inject, Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, doc, docData, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../Models/user';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private collectionName = 'user';
  private userSignal: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  firestore: Firestore = inject(Firestore);
  notificationService = inject(NotificationService);
  
  constructor() { }

  getUsers(): Observable<any[]> {
    const userList = collection(this.firestore, this.collectionName);
    return collectionData(userList, { idField: "id"});
  }

  async createUser(data: any): Promise<void> {
    const userCollection = collection(this.firestore, this.collectionName);
    const { password, confirmPassword, ...userWithoutPassword } = data;
    await addDoc(userCollection, userWithoutPassword);
  }

  async getUserById(userId: string): Promise<any> {
    try {
      // Reference to the 'users' collection
      const userCollectionRef = collection(this.firestore, this.collectionName);
      
      // Query to find the document where uid matches
      const q = query(userCollectionRef, where('uid', '==', userId));

      // Execute the query
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Assuming uid is unique, take the first result
        const userDoc = querySnapshot.docs[0];
        const userData = { ...userDoc.data() } as User;
        return userData;
      }
    } catch (error) {
      this.notificationService.showNotification("Unable to retrieve user data. Please try logging in again.", 'error-snackbar');
    }
  }

  // async updateUser(id: string, data: any): Promise<void> {
  //   const userDoc = doc(this.firestore, this.collectionName);
  //   await updateDoc(userDoc, data);
  // }
  async updateUser(user: User): Promise<void> {
    const userCollectionRef = collection(this.firestore, 'user');
    const userQuery = query(userCollectionRef, where('uid', '==', user.uid));

    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.empty) {
      throw new Error(`No user found with UID: ${user.uid}`);
    }

    const userDocRef = querySnapshot.docs[0].ref; 
    await updateDoc(userDocRef, { ...user });
    this.setUser(user);
  }

  getUserSignal(): Observable<User | null> {
    return this.userSignal.asObservable();
  }

  getUser(): User | null {
    return this.userSignal.value;
  }

  setUser(user: User): void {
    this.userSignal.next(user);
  }

  clearUser(): void {
    this.userSignal.next(null);
  }

  // private async deleteItem(id: string): Promise<void> {

  // }
}
