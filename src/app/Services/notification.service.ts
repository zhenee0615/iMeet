import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar'; 

@Injectable({
  providedIn: 'root'
})
  
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}
  showNotification(message: string, panelClass: string = 'default-snackbar', action: string = '') {
    this.snackBar.open(message, action, {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [panelClass],
    });
  }
}