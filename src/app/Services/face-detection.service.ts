import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

declare const faceapi: any;

@Injectable({
  providedIn: 'root'
})
export class FaceDetectionService {
  profilePicUrl: string = "";
  constructor() { }

  async loadFaceApiScript(): Promise<void> {
    if (document.querySelector('script[src="https://cdn.jsdelivr.net/npm/face-api.js/dist/face-api.min.js"]')) {
      return; 
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/face-api.js/dist/face-api.min.js';
      script.onload = () => {
        this.loadFaceApiModels().then(resolve).catch(reject);
      };
      script.onerror = () => reject('Failed to load face-api.js script');
      document.body.appendChild(script);
    });
  }

  async loadFaceApiModels() {
    await Promise.all([
      await faceapi.loadSsdMobilenetv1Model('/FaceDetectionModel'),
      await faceapi.loadFaceLandmarkModel('/FaceDetectionModel'),
      await faceapi.loadFaceRecognitionModel('/FaceDetectionModel'),
      await faceapi.loadFaceExpressionModel('/FaceDetectionModel')
    ]);
  }

  async onFileSelected(event: Event): Promise<string> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          const imageDataUrl = reader.result as string;

          Swal.fire({
            title: 'Verifying face...',
            text: 'Please wait while we process the image.',
            didOpen: () => Swal.showLoading(null),
            allowOutsideClick: false,
          });

          try {
            const faceDetected = await this.detectFace(imageDataUrl);

            if (faceDetected) {
              Swal.close();
              Swal.fire({
                icon: 'success',
                title: 'Face Detected',
                text: 'Profile picture uploaded successfully!',
                timer: 2000,
                showConfirmButton: false,
              });
              resolve(imageDataUrl); 
            } else {
              reject('No face detected');
            }
          } catch (error) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'An error occurred while processing the image. Please try again.',
            });
            reject(error);
          }
        };

        reader.onerror = () => reject('Error reading file');
        reader.readAsDataURL(file);
      });
      reader.readAsDataURL(file);
    }
    return this.profilePicUrl
  }

  async detectFace(imageDataUrl: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const img = new Image();
        img.src = imageDataUrl;

        img.onload = async () => {
          
          const detections = await faceapi
            .detectAllFaces(img)
            .withFaceLandmarks()
            .withFaceExpressions();

          if (detections.length === 1) {
            resolve(true);
          } else if (detections.length > 1) {
            Swal.fire({
              icon: 'error',
              title: 'Multiple Faces Detected',
              text: 'Please upload an image with only one face visible.',
            });
            resolve(false);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'No Face Detected',
              text: 'Please upload an image with a clear face.',
            });
            resolve(false);
          }
        };

        img.onerror = () => reject('Error loading image');
      } catch (error) {
        reject(error);
      }
    });
  }
}
