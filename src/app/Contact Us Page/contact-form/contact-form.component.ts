import { Component, inject } from '@angular/core';
import emailjs, { EmailJSResponseStatus } from '@emailjs/browser';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

@Component({
  selector: 'app-contact-form',
  standalone: false,
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
})
  
export class ContactFormComponent {
  form: ContactForm = {
    name: '',
    email: '',
    message: '',
  };
  
  constructor(private dialog: MatDialog) {}

  Submit() {
    emailjs
      .send('service_8ost6he', 'template_m4h6xj4', { ...this.form }, {
        publicKey: 'GkBgHVn_qm6w4aeXX',
      });
  }
}
