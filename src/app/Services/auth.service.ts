import { inject, Injectable, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile, user } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { User } from '../Models/user.interface';
import { sendPasswordResetEmail } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
  
export class AuthService {
  loggedIn: boolean = false;
  firebaseAuth = inject(Auth);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<User | null | undefined>(undefined);
  loading = signal<boolean>(true);

  constructor() {
    onAuthStateChanged(this.firebaseAuth, (user) => {
      if (user) {
        this.currentUserSig.set({
          email: user.email!,
          fullName: user.displayName || '',
          gender: '',
          phoneNumber: user.phoneNumber || '',
          uid: user.uid,
        });
      } else {
        this.currentUserSig.set(null);
      }
      this.loading.set(false);
    });
  }

  register(
    email: string,
    fullName: string,
    password: string
  ): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password).then(
      response => {
        updateProfile(response.user, { displayName: fullName });
      }
    );
    return from(promise)
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password).then((response) => {
      const user = response.user;

      if (user) {
        this.currentUserSig.set({
          email: user.email!,
          fullName: user.displayName || '',
          gender: '',
          phoneNumber: user.phoneNumber || '',
          uid: user.uid,
        });
      } else {
        this.currentUserSig.set(null);
      }
    });
    return from(promise);
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth);
    this.currentUserSig.set(null);
    return from(promise);
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.firebaseAuth, email);
      console.log('Password reset email sent');
    } catch (error) {
      console.error('Error sending password reset email:', error);
    }
  }
}
