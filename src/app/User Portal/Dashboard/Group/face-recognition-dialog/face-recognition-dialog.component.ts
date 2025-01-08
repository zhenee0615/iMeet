import { Component, ElementRef, Inject, OnDestroy, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-face-recognition-dialog',
  standalone: false,
  templateUrl: './face-recognition-dialog.component.html',
  styleUrls: ['./face-recognition-dialog.component.scss'],
})
export class FaceRecognitionDialogComponent implements OnDestroy {
  @ViewChild('video', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  videoStream: MediaStream | null = null;
  showUserDetails = false;

  constructor(
    private dialogRef: MatDialogRef<FaceRecognitionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userDetails: any }
  ) {}

  ngOnDestroy(): void {
    this.stopVideo();
  }

  toggleCamera(): void {
    if (this.videoStream) {
      this.stopVideo();
    } else {
      this.startVideo();
    }
  }

  startVideo(): void {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        this.videoStream = stream;
        this.videoElement.nativeElement.srcObject = stream;
      })
      .catch((err) => {
        Swal.fire({
          title: 'Error!',
          text: 'Unable to access the camera. Please check your settings.',
          icon: 'error',
        });
      });
  }

  stopVideo(): void {
    this.videoStream?.getTracks().forEach((track) => track.stop());
    this.videoStream = null;
  }

  async captureAndVerify(): Promise<void> {
    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Failed to get canvas context!');
      return;
    }

    const cropWidth = 480;
    const cropHeight = 480;
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const startX = (video.videoWidth - cropWidth) / 2;
    const startY = (video.videoHeight - cropHeight) / 2;
    ctx.drawImage(video, startX, startY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    const base64Image = canvas.toDataURL('image/png').split(',')[1];

    Swal.fire({
      title: 'Verifying...',
      html: '<div class="spinner"></div>',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(null),
    });

    try {
      const response = await fetch('http://localhost:5001/face_recognition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_data: base64Image,
          profile_image_url: this.data.userDetails.profilePicUrl,
        }),
      });

      const resultJson = await response.json();
      Swal.close();
      if (resultJson.error) {
        Swal.fire({
          title: 'Failed!',
          text: resultJson.error,
          icon: 'error',
        });
      } else if (resultJson.match) {
        this.toggleCamera();
        Swal.fire({
          title: 'Success!',
          text: 'Identity verified successfully.',
          icon: 'success',
        }).then(() => {
          this.showUserDetails = true;
        });
      } else if (!resultJson.match) {
        Swal.fire({
          title: 'Verification Failed',
          text: "Detected unauthorised person...Not allowed to enter this meeting!",
          icon: 'error',
        });
      } 
    } catch (err) {
      Swal.close();
      console.error('Error during face verification:', err);
      Swal.fire({
        title: 'Error!',
        text: 'An error occurred during verification. Please try again later.',
        icon: 'error',
      });
    }
  }

  enterMeeting(): void {
    this.dialogRef.close({ success: true });
  }
}