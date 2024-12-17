import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../Models/user';
import { UserService } from '../../../Services/user.service';
import { NotificationService } from '../../../Services/notification.service';

@Component({
  selector: 'app-profile-dialog',
  standalone: false,
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.scss']
})
export class ProfileDialogComponent {
  profileForm: FormGroup;
  userService = inject(UserService);
  notificationService = inject(NotificationService);

  constructor(
    @Inject(MAT_DIALOG_DATA) public userData: User,
    private dialogRef: MatDialogRef<ProfileDialogComponent>
  ) {
    this.profileForm = new FormGroup({
      fullName: new FormControl(userData.fullName || '', Validators.required),
      email: new FormControl(userData.email || '', [
        Validators.required,
        Validators.email
      ]),
      gender: new FormControl(userData.gender || '', Validators.required),
      phoneNumber: new FormControl(userData.phoneNumber || '', [
        Validators.required,
        Validators.pattern(/^\d+$/)
      ])
    });
  }

  async onSave(): Promise<void> {
    if (this.validateForm()) {
      const updatedUser: User = { uid: this.userData.uid, ...this.profileForm.value };

      try {
        await this.userService.updateUser(updatedUser);
        this.dialogRef.close(updatedUser);
        this.notificationService.showNotification(
          "Successfully updated your profile details.",
          "success-snackbar"
        );
      } catch (error) {
        this.notificationService.showNotification(
          "An error occurred while updating your profile. Please try again.",
          "error-snackbar"
        );
      }
    }
  }

  validateForm(): boolean {
    const { fullName, email, gender, phoneNumber } = this.profileForm.value;

    if (!fullName || !email || !gender || !phoneNumber) {
      this.notificationService.showNotification(
        "All fields are required. Please fill in all fields.",
        "error-snackbar"
      );
      return false;
    }

    if (!this.validateEmail(email)) {
      this.notificationService.showNotification(
        "Invalid email format. Please enter a valid email.",
        "error-snackbar"
      );
      return false;
    }

    if (!this.validateContactNumber(phoneNumber)) {
      this.notificationService.showNotification(
        "Contact number must contain only digits.",
        "error-snackbar"
      );
      return false;
    }

    return true;
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateContactNumber(contactNumber: string): boolean {
    return /^\d+$/.test(contactNumber);
  }
}
