import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, getDocs, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private collectionName = 'user';
  
  constructor(private firestore: Firestore) { }

  getUsers(): Observable<any[]> {
    const userList = collection(this.firestore, this.collectionName);
    return collectionData(userList, { idField: "id"});
  }

  // async checkUser(email: string, password: string): Promise<user | null> {
  //   const userCollection = collection(this.firestore, this.collectionName);
  //   const q = query(userCollection, where('email', '==', email), where('password', '==', password));
  //   const querySnapshot = await getDocs(q);

  //   if (!querySnapshot.empty) {
  //     return querySnapshot.docs[0].data() as user; // Return the user data
  //   }
  //   return null; // No matching user
  // }
}
