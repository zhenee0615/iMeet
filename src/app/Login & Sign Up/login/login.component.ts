import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LoginStatusComponent } from '../login-status/login-status.component';
import { AuthService } from '../../Services/auth.service';
import { User } from '../../Models/user.interface';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {
  userList: User[] = [];
  email: string = '';
  password: string = '';
  fullName: string = '';
  confirmPassword: string = '';
  gender: string = '';
  contactNumber: string = '';
  errorMessage: string = '';
  isSignUpMode: boolean = false; 
  private userService = inject(UserService);
  private authService = inject(AuthService);

  constructor(
    private router: Router, 
    private dialog: MatDialog
  ) {
    this.userService.getUsers().subscribe((data: any[]) => {
      console.log('Fetched users:', data);
      this.userList = data;
    });
  }

  onSubmit() {
    if (this.isSignUpMode) {
      this.onSignUp();
    } else {
      this.onLogin();
    }
  }

  async onLogin() {
    if (!this.email || !this.password) {
      this.showLoginStatus('Login Failed', 'Email and password are required. Please try again!');
      return;
    }
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.showLoginStatus('Login Successful', 'You have successfully logged in!');
        this.router.navigateByUrl('/');
      }
    })

    // try {
    //   const user = await this.userService.checkUser(this.email, this.password);
    //   if (user) {
    //     const dialogRef = this.showLoginStatus('Login Successful', 'You have successfully logged in!');
    //     dialogRef.afterClosed().subscribe(() => {
    //       this.router.navigate(['/']);
    //     });
    //   } else {
    //     const dialogRef = this.showLoginStatus('Login Failed', 'Incorrect email or password. Please try again!');
    //     dialogRef.afterClosed().subscribe(() => {
    //       this.email = '';
    //       this.password = '';
    //     });
    
    //   }
    // } catch (error) {
    //   this.errorMessage = 'An error occurred. Please try again.';
    // }
  }

  showLoginStatus(title: string, message: string) {
    return this.dialog.open(LoginStatusComponent, {
      width: '400px',
      data: {
        title: title,
        message: message,
      },
    });
  }

  onForgotPassword() {

  }

  onGoogleLogin() {

  }

  onSignUp() {
    if (this.validateForm()) {
      this.authService.register(this.email, this.fullName, this.password).subscribe(() => {
        this.router.navigateByUrl('/');
      });
      console.log("done");
    }
  }

  toggleMode() {
    this.isSignUpMode = !this.isSignUpMode;
    this.clearForm();
  }

  validateForm(): boolean {
    if (this.isSignUpMode) {
      if (!this.fullName || !this.email || !this.password || !this.confirmPassword || !this.gender || !this.contactNumber) {
        this.showLoginStatus('Validation Failed', 'All fields are required. Please fill in all fields.');
        return false;
      }
      if (!this.validateEmail()) {
        this.showLoginStatus('Validation Failed', 'Invalid email format. Please enter a valid email.');
        return false;
      }
      if (!this.validatePassword()) {
        this.showLoginStatus(
          'Validation Failed',
          'Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special symbol.'
        );
        return false;
      }
      if (!this.validateConfirmPassword()) {
        this.showLoginStatus('Validation Failed', 'Passwords do not match. Please try again.');
        return false;
      }
      if (!this.validateContactNumber()) {
        this.showLoginStatus('Validation Failed', 'Contact number must contain only digits.');
        return false;
      }
    }
    return true;
  }

  validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  validatePassword(): boolean {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/;
    return passwordRegex.test(this.password);
  }

  validateConfirmPassword(): boolean {
    return this.password === this.confirmPassword;
  }

  validateContactNumber(): boolean {
    return /^\d+$/.test(this.contactNumber);
  }

  clearForm() {
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.fullName = '';
    this.gender = '';
    this.contactNumber = '';
  }
}
