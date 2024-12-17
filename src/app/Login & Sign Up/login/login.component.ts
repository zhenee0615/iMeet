import { Component, inject } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { User } from '../../Models/user';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from '../../Services/notification.service';

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
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  loginForm: FormGroup;
  signUpForm: FormGroup;
  user: User | null = null;
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  constructor(
    private router: Router, 
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
      this.notificationService.showNotification("Email and password are required. Please try again.", 'error-snackbar');
      return;
    }
    try {
      await firstValueFrom(this.authService.login(email, password));
      await new Promise(resolve => setTimeout(resolve, 300));

      const user = await firstValueFrom(this.userService.getUserSignal());

      if (user) {
        await this.router.navigate(['/user', user.uid]);
        window.location.reload();
      } else {
        this.notificationService.showNotification("Unable to retrieve user data. Please try logging in again.", 'error-snackbar');
      }
    } catch (error) {
      this.notificationService.showNotification("Invalid email or password. Please try again.", 'error-snackbar');
    }
  };

  async resetPassword() {
    const { email } = this.loginForm.value;
    if (email) {
      try {
        await this.authService.resetPassword(email);
        this.notificationService.showNotification("A password reset email have been sent to your inbox.", 'success-snackbar');
      } catch (err: any) {
        this.notificationService.showNotification("An error occured, please try again later.", 'error-snackbar');
      }
    } else {
      this.notificationService.showNotification("Please enter your email to reset the password.", 'error-snackbar');
    }
  }

  onSignUp() {
    if (this.validateForm()) {
      const { fullName, email, password } = this.signUpForm.value;
      this.authService.register(email, fullName, password).subscribe({
        next: (uid) => {
          const userData = { ...this.signUpForm.value, uid };
          this.userService.createUser(userData);
          this.notificationService.showNotification("You have successfully sign up an account.", 'success-snackbar');
          this.userService.clearUser();
          this.toggleMode();
        }, 
        error: (error) => {
          if (error.code === 'auth/email-already-in-use') {
            this.notificationService.showNotification("This email have been used. Please try another.", 'error-snackbar');
          } else {
            this.notificationService.showNotification("An error occurred during sign-up. Please try again.", 'error-snackbar');
          }
        }
      });
    }
  }

  toggleMode() {
    this.isSignUpMode = !this.isSignUpMode;
    this.clearForm();
  }

  validateForm(): boolean {
    if (this.isSignUpMode) {
      const { fullName, email, password, confirmPassword, gender, contactNumber } = this.signUpForm.value
      if (!fullName || !email || !password || !confirmPassword || !gender || !contactNumber) {
        this.notificationService.showNotification("All fields are required. Please fill in all fields.", 'error-snackbar');
        return false;
      }

      if (!this.validateEmail()) {
        this.notificationService.showNotification("Invalid email format. Please enter a valid email.", 'error-snackbar');
        return false;
      }

      if (!this.validatePassword()) {
        this.notificationService.showNotification("Password must be at least 6 characters, include at least 1 uppercase letter, 1 lowercase letter, 1 digit and 1 special symbol.", 'error-snackbar');
        return false;
      }

      if (!this.validateConfirmPassword()) {
        this.notificationService.showNotification("Passwords do not match. Please try again.", 'error-snackbar');
        return false;
      }

      if (!this.validateContactNumber()) {
        this.notificationService.showNotification("Contact number must contain only digits.", 'error-snackbar');
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

