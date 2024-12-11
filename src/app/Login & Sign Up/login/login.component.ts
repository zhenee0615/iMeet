import { Component, inject, signal } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LoginStatusComponent } from '../login-status/login-status.component';
import { AuthService } from '../../Services/auth.service';
import { User } from '../../Models/user.interface';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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
  hidePassword = true;
  hideConfirmPassword = true;
  loginForm: FormGroup;
  signUpForm: FormGroup;
  private userService = inject(UserService);
  private authService = inject(AuthService);

  constructor(
    private router: Router, 
    private dialog: MatDialog,
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6)
      ]),
    });

    this.signUpForm = new FormGroup({
      fullName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/
        ),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required]),
      contactNumber: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+$/),
      ]),
    });

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
    const { email, password } = this.loginForm.value;
    if (!this.email || !this.password) {
      this.showLoginStatus('Login Failed', 'Email and password are required. Please try again!');
      return;
    }
    this.authService.login(email, password).subscribe({
      next: () => {
        const dialogRef = this.showLoginStatus('Login Successful', 'You have successfully logged in!');
        dialogRef.afterClosed().subscribe(() => {
          this.router.navigateByUrl('/').then(() => {
            window.location.reload();
          });
        });
      },
      error: () => {
        this.showLoginStatus('Login Failed', 'Invalid email or password. Please try again!');
      }
    });
  };

  async resetPassword() {
    const { email } = this.loginForm.value;
    if (email) {
      try {
        await this.authService.resetPassword(email);
        this.showLoginStatus('Email Sent', 'A password reset email have been sent. Please check your inbox. ');
      } catch(err: any){
        this.showLoginStatus('Error', 'An error occured, please try again later. ');
      }
    } else {
      this.showLoginStatus('Error', 'Please enter your email to reset the password. ');
    }
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

  onSignUp() {
    if (this.validateForm()) {
      const { fullName, email, password } = this.signUpForm.value
      this.authService.register(email, fullName, password).subscribe({
        next: () => {
          this.userService.createUser(this.signUpForm.value);
          this.showLoginStatus('Sign Up Successful', 'You have successfully sign up an account!');
          this.signUpForm.reset(); 
        }, 
        error: () => {
          this.showLoginStatus('Sign Up Failed', 'An error occurred during sign-up. Please try again.');
        }
      });
    }
    this.toggleMode();
  }

  toggleMode() {
    this.isSignUpMode = !this.isSignUpMode;
    this.clearForm();
  }

  validateForm(): boolean {
    if (this.isSignUpMode) {
      const { fullName, email, password, confirmPassword, gender, contactNumber } = this.signUpForm.value
      if (!fullName || !email || !password || !confirmPassword || !gender || !contactNumber) {
        this.showLoginStatus('Validation Error', 'All fields are required. Please fill in all fields.');
        return false;
      }

      if (!this.validateEmail()) {
        this.showLoginStatus('Validation Error', 'Invalid email format. Please enter a valid email.');
        return false;
      }

      if (!this.validatePassword()) {
        this.showLoginStatus(
          'Validation Error',
          'Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special symbol.'
        );
        return false;
      }

      if (!this.validateConfirmPassword()) {
        this.showLoginStatus('Validation Error', 'Passwords do not match. Please try again.');
        return false;
      }

      if (!this.validateContactNumber()) {
        this.showLoginStatus('Validation Error', 'Contact number must contain only digits.');
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

  getEmail() {
    return this.loginForm.get('email');
  }

  getPassword() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}

