import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
          text: 'Failed to access camera.',
          icon: 'error',
        });
      });
  }

  stopVideo(): void {
    this.videoStream?.getTracks().forEach((track) => track.stop());
    this.videoStream = null;
  }

  captureAndVerify(): void {
    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Failed to get canvas context!');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL('image/png').split(',')[1];

    Swal.fire({
      title: 'Verifying...',
      html: '<div class="spinner"></div>',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    fetch('https://imeet-face-recognition.onrender.com/face_recognition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_data: base64Image,
        profile_image_url: this.data.userDetails.profilePicUrl,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        Swal.close();

        if (response.match) {
          Swal.fire({
            title: 'Success!',
            text: 'Identity verified successfully.',
            icon: 'success',
          }).then(() => {
            this.showUserDetails = true;
          });
        } else if (response.error) {
          Swal.fire({
            title: 'Verification Failed',
            text: response.error,
            icon: 'error',
          });
        } else {
          Swal.fire({
            title: 'Failed!',
            text: 'Face verification failed. Please try again.',
            icon: 'error',
          });
        }
      })
      .catch((err) => {
        Swal.close();
        console.error('Error during face verification:', err);
        Swal.fire({
          title: 'Error!',
          text: 'An error occurred during verification. Please try again later.',
          icon: 'error',
        });
      });
  }

  enterMeeting(): void {
    this.dialogRef.close({ success: true });
  }
}