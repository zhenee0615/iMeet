import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../Models/user';
import { UserService } from '../../../Services/user.service';
import { NotificationService } from '../../../Services/notification.service';
import { FaceDetectionService } from '../../../Services/face-detection.service';

@Component({
  selector: 'app-profile-dialog',
  standalone: false,
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.scss']
})
export class ProfileDialogComponent {
  profilePicUrl: string = "";
  profileForm: FormGroup;
  userService = inject(UserService);
  notificationService = inject(NotificationService);
  private faceDetectionService = inject(FaceDetectionService);

  constructor(
    @Inject(MAT_DIALOG_DATA) public userData: User,
    private dialogRef: MatDialogRef<ProfileDialogComponent>
  ) {
    this.profilePicUrl = this.userData.profilePicUrl;
    this.profileForm = new FormGroup({
      fullName: new FormControl(userData.fullName || '', Validators.required),
      email: new FormControl(userData.email || '', [
        Validators.required,
        Validators.email
      ]),
      gender: new FormControl(userData.gender || '', Validators.required),
      contactNumber: new FormControl(userData.contactNumber || '', [
        Validators.required,
        Validators.pattern(/^\d+$/)
      ])
    });
    this.faceDetectionService.loadFaceApiScript();
  }

  async onFileSelected(event: Event): Promise<void> {
    this.profilePicUrl = await this.faceDetectionService.onFileSelected(event);
  }

  async onSave(): Promise<void> {
    if (this.validateForm()) {
      const updatedUser: User = { uid: this.userData.uid, profilePicUrl: this.profilePicUrl ,...this.profileForm.value };

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
    const { fullName, email, gender, contactNumber } = this.profileForm.value;

    if (!fullName || !email || !gender || !contactNumber) {
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

    if (!this.validateContactNumber(contactNumber)) {
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
