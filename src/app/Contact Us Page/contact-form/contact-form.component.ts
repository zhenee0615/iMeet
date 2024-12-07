import { Component } from '@angular/core';
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
      })
      .then(
        (response: EmailJSResponseStatus) => {
          console.log('SUCCESS!', response.status, response.text);

          this.dialog.open(DialogComponent, {
            data: { status: 'success' },
            width: '300px',
            height: '200px',
          });

          // Clear the form on success
          this.form = {
            name: '',
            email: '',
            message: '',
          };
        },
        (error) => {
          console.error('FAILED...', error);

          this.dialog.open(DialogComponent, {
            data: { status: 'failure' },
            width: '300px',
            height: '200px',
          });
        }
      );
  }
}
