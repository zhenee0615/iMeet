import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, doc, docData, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from '../Models/user.interface';

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

  async createUser(data: any): Promise<void> {
    const userCollection = collection(this.firestore, this.collectionName);
    const { password, confirmPassword, ...userWithoutPassword } = data;
    await addDoc(userCollection, userWithoutPassword);
  }

  getUserById(id: string): Observable<any> {
    const userDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    return docData(userDoc, { idField: "id"})
  }

  async updateUser(id: string, data: any): Promise<void> {
    const userDoc = doc(this.firestore, this.collectionName);
    await updateDoc(userDoc, data);
  }

  // private async deleteItem(id: string): Promise<void> {

  // }
}
