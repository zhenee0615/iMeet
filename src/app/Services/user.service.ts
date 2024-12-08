import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';

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
}
