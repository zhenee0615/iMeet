import { inject, Injectable, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { User } from '../Models/user';
import { sendPasswordResetEmail } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
  
export class AuthService {
  currentUser: User | null = null;
  userList: User[] = [];
  private userService = inject(UserService);
  firebaseAuth = inject(Auth);

  constructor(private router: Router) {
    onAuthStateChanged(this.firebaseAuth, (firebaseUser) => {
      if (firebaseUser) {
        this.userService.getUsers().subscribe((data: any[]) => {
          this.userList = data;
          this.currentUser = this.userList.find(user => user.uid === firebaseUser.uid) || null;

          if (this.currentUser) 
            this.userService.setUser(this.currentUser);
        });
      } else {
        this.userService.clearUser();
      }
    });
  }

  register(email: string, fullName: string, password: string): Observable<string> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password).then(
      async response => {
        await updateProfile(response.user, { displayName: fullName });
        return response.user.uid;
      }
    );
    return from(promise);
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password).then(() => {});
    return from(promise);
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth).then(() => {
      this.router.navigateByUrl('/').then(() => {
        window.location.reload();
      });
    });
    return from(promise);
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.firebaseAuth, email);
    } catch (error) {
    }
  }
}
