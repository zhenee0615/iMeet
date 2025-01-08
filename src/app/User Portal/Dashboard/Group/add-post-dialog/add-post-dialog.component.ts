import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PostService } from '../../../../Services/post.service';
import { ref, uploadBytes, getDownloadURL, Storage } from '@angular/fire/storage';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-post-dialog',
  standalone: false,
  templateUrl: './add-post-dialog.component.html',
  styleUrl: './add-post-dialog.component.scss'
})
  
export class AddPostDialogComponent {
  postForm: FormGroup;
  selectedFiles: File[] = [];
  uploadUrls: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<AddPostDialogComponent>,
    private postService: PostService,
    @Inject(MAT_DIALOG_DATA) public data: { groupId: string; userId: string },
    private storage: Storage
  ) {
    this.postForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      content: new FormControl('', [Validators.required]),
      attachments: new FormControl('')
    });
  }

  async submitPost() {
    if (this.postForm.valid) {
      try {
        Swal.fire({
          title: 'Uploading...',
          text: 'Please wait while the files are uploading.',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(null),
        });

        const newPost = {
          title: this.postForm.get('title')?.value,
          content: this.postForm.get('content')?.value,
          dateCreated: new Date(),
          groupId: this.data?.groupId || 'unknown_group',
          userId: this.data?.userId || 'unknown_user',
        };

        if (this.selectedFiles) {
          const attachments = await this.uploadFiles();
          await this.postService.addPost(newPost, attachments);
        }

        Swal.close();
        this.dialogRef.close(newPost); 
      } catch (error) {
        
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles.push(...Array.from(input.files));
      Swal.fire({
        icon: 'success',
        title: 'File uploaded',
        text: 'File uploaded successfully!',
        timer: 1000,
        showConfirmButton: false,
      });
      return
    }
    Swal.fire({
      title: 'Error!',
      text: "An error occured, please try again.",
      icon: 'error',
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).classList.add('dragover');
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.remove('dragover');
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).classList.remove('dragover');

    if (event.dataTransfer?.files) {
      this.selectedFiles.push(...Array.from(event.dataTransfer.files));
    }
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  triggerFileInput(fileInput: HTMLInputElement, event: Event): void {
    event.preventDefault();
    fileInput.click();
  }
  
  async uploadFiles(): Promise<{ name: string; url: string }[]> {
    const uploadedFiles = await Promise.all(
      this.selectedFiles.map(async (file) => {
        const filePath = `attachments/${Date.now()}_${file.name}`;
        const storageRef = ref(this.storage, filePath);

        const uploadResult = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(uploadResult.ref);

        return { name: file.name, url: downloadURL };
      })
    );

    return uploadedFiles; 
  }
}
