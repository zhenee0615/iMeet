import { inject, Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../Models/user.interface';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private collectionName = 'user';
  private userSignal: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  firestore: Firestore = inject(Firestore);
  
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

  // async getUserById(id: string): Promise<Observable<any>> {
  //   const userDoc = doc(this.firestore, `${this.collectionName}/${id}`);
  //   return docData(userDoc, { idField: id})
  // }

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
