import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { GroupService } from '../../../Services/group.service';
import { UserService } from '../../../Services/user.service';
import { User } from '../../../Models/user';
import { NotificationService } from '../../../Services/notification.service';

@Component({
  selector: 'app-group-dialog',
  standalone: false,
  templateUrl: './group-dialog.component.html',
  styleUrl: './group-dialog.component.scss'
})
  
export class GroupDialogComponent {
  groupForm: FormGroup;
  action: string = '';
  groupName: string = '';
  groupId: string = '';
  userData: User | null = null;
  notificationService = inject(NotificationService);
  userService = inject(UserService);
  groupService = inject(GroupService);

  constructor(
    private dialogRef: MatDialogRef<GroupDialogComponent>
  ) {
    this.groupForm = new FormGroup({
      action: new FormControl('create', [Validators.required]),
      groupName: new FormControl('', [Validators.required]),
      groupId: new FormControl('', [Validators.required])
    });
    this.groupForm.get('action')?.valueChanges.subscribe((action) => {
      if (action === 'create') {
        this.groupForm.get('groupId')?.reset();
        this.groupForm.get('groupName')?.setValidators([Validators.required]);
        this.groupForm.get('groupId')?.clearValidators();
      } else if (action === 'join') {
        this.groupForm.get('groupName')?.reset();
        this.groupForm.get('groupId')?.setValidators([Validators.required]);
        this.groupForm.get('groupName')?.clearValidators();
      }
      this.groupForm.get('groupName')?.updateValueAndValidity();
      this.groupForm.get('groupId')?.updateValueAndValidity();
    });
  }

  isFormValid(): boolean {
    const action = this.groupForm.get('action')?.value;

    if (action === 'create') {
      return this.groupForm.get('groupName')?.valid || false;
    } else if (action === 'join') {
      return this.groupForm.get('groupId')?.valid || false;
    }
    return false;
  }

  async onSubmit(): Promise<void> {
    const { action, groupName, groupId } = this.groupForm.value;
    this.userService.getUserSignal().subscribe((user) => {
      this.userData = user;
    });

    if (action === 'create' && groupName) {
      this.dialogRef.close();
      if (this.userData?.uid) {
        await this.groupService.createGroup(groupName, this.userData.uid);
        this.notificationService.showNotification(`You have created group \"${groupName}\"`, "success-snackbar");
      }
    } else if (action === 'join' && groupId) {
      if (this.userData?.uid) {
        await this.groupService.joinGroup(groupId, this.userData.uid);
      }
      this.dialogRef.close();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
