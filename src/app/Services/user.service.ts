import { inject, Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../Models/user';
import { NotificationService } from './notification.service';
import { getDownloadURL, getStorage, ref, uploadString, StorageReference, deleteObject } from 'firebase/storage';
import { User as FirebaseUser } from 'firebase/auth'; 
import { getAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private collectionName = 'users';
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

  async uploadProfileImageToStorage(imgUrl: string): Promise<string> {
    const storage = getStorage();
    const fileName = `profile_pics/${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const storageRef = ref(storage, fileName);

    const uploadResult = await uploadString(storageRef, imgUrl, 'data_url');
    return await getDownloadURL(uploadResult.ref);
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const userCollectionRef = collection(this.firestore, this.collectionName);
      const q = query(userCollectionRef, where('uid', '==', userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = { ...userDoc.data() } as User;
        return userData;
      } else {
        return null
      }
    } catch (error) {
      this.notificationService.showNotification("Unable to retrieve user data. Please try logging in again.", 'error-snackbar');
      return null
    }
  }

  async updateUser(user: User): Promise<void> {
    const userCollectionRef = collection(this.firestore, this.collectionName);
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

  getStorageRefFromUrl(fileUrl: string): StorageReference {
    const storage = getStorage();
    const filePath = decodeURIComponent(fileUrl.split('/o/')[1].split('?')[0]);
    return ref(storage, filePath);
  }

  async deleteProfileImageFromStorage(storageRef: StorageReference): Promise<void> {
    await deleteObject(storageRef);
  }

  getCurrentFirebaseUser(): FirebaseUser | null {
    return getAuth().currentUser;
  }
}
