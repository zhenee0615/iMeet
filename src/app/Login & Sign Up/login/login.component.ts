import { Component, inject } from '@angular/core';
import { UserService } from '../../Services/user.service';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { User } from '../../Models/user';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from '../../Services/notification.service';
import { FaceDetectionService } from '../../Services/face-detection.service';
import Swal from 'sweetalert2';

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
  siteKey: string = '6LeIE60qAAAAAKsDC4jNe4hrjS5JvUNxhqNGns-6';
  profilePicUrl: string = "profile_signup_icon.png";
  isSignUpMode: boolean = false; 
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  loginForm: FormGroup;
  signUpForm: FormGroup;
  user: User | null = null;
  recaptchaResponse: string | null = null;
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private faceDetectionService = inject(FaceDetectionService);
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
      recaptcha: new FormControl('', [Validators.required])
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
    
    this.faceDetectionService.loadFaceApiScript();
  }

  async onFileSelected(event: Event): Promise<void> {
    this.profilePicUrl = await this.faceDetectionService.onFileSelected(event);
  }

  handleCaptchaSuccess(response: string): void {
    this.recaptchaResponse = response;
  }

  handleCaptchaError(error: any): void {
    Swal.fire({
        title: 'Error!',
        text: error,
        icon: 'error',
      });
    this.recaptchaResponse = null;
  }

  handleCaptchaExpire(): void {
    Swal.fire({
      title: 'Error!',
      text: 'Captcha expired.',
      icon: 'error',
    });
    this.recaptchaResponse = null;
  }

  onSubmit() {
    if (this.isSignUpMode) {
      this.onSignUp();
    } else {
      this.onLogin();
    }
  }

  async onLogin() {
    const { email, password, recaptcha } = this.loginForm.value;
    if (!this.email || !this.password) {
      this.notificationService.showNotification("Email and password are required. Please try again.", 'error-snackbar');
      return;
    } else if (!this.recaptchaResponse) {
      Swal.fire({
        title: 'Error!',
        text: 'Please solve the reCAPTCHA.',
        icon: 'error',
      });
      return;
    }
    try {
      await firstValueFrom(this.authService.login(email, password));

      await new Promise(resolve => setTimeout(resolve, 300));

      const user = await firstValueFrom(this.userService.getUserSignal());

      if (user) {
        Swal.fire({
          title: 'Login Successful',
          text: 'You have successfully login to your account',
          icon: 'success',
          timer: 2000
        });
        await this.router.navigate(['/user', user.uid]);
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

  async onSignUp() {
    if (this.validateForm()) {
      const { fullName, email, password } = this.signUpForm.value;
      
      try {
        this.authService.register(email, fullName, password).subscribe({
          next: async (uid) => {
            const profileUrl = await this.userService.uploadProfileImageToStorage(this.profilePicUrl); 
            const userData = {
              ...this.signUpForm.value,
              uid,
              profilePicUrl: profileUrl,
            };

            await this.userService.createUser(userData);
            this.notificationService.showNotification("You have successfully signed up.", 'success-snackbar');
            this.userService.clearUser();
            this.toggleMode();
          },
          error: (error) => {
            if (error.code === 'auth/email-already-in-use') {
              this.notificationService.showNotification("This email is already in use.", 'error-snackbar');
            } else {
              this.notificationService.showNotification("An error occurred during sign-up.", 'error-snackbar');
            }
          },
        });
      } catch (error) {
        this.notificationService.showNotification("Failed to upload profile image.", 'error-snackbar');
      }
    }
  }

  toggleMode() {
    this.isSignUpMode = !this.isSignUpMode;
    if (this.isSignUpMode) {
      this.signUpForm.reset();
      this.profilePicUrl = 'profile_signup_icon.png';
    } else {
      this.loginForm.reset();
    }
  }

  validateForm(): boolean {
    if (this.isSignUpMode) {
      const { fullName, email, password, confirmPassword, gender, contactNumber } = this.signUpForm.value;

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

      if (this.profilePicUrl === 'profile_signup_icon.png') {
        this.notificationService.showNotification("Please upload your profile picture.", 'error-snackbar');
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

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}

