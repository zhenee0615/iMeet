import { Component, inject } from '@angular/core';
import emailjs, { EmailJSResponseStatus } from '@emailjs/browser';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import Swal from 'sweetalert2';
import { NgForm } from '@angular/forms';

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
  
  Submit(contactForm: NgForm) {
    try {
      emailjs
        .send('service_8ost6he', 'template_m4h6xj4', { ...this.form }, {
          publicKey: 'GkBgHVn_qm6w4aeXX',
        })
      contactForm.resetForm();

      Swal.fire({
        icon: 'success',
        title: 'Feedback sent',
        text: 'Your feedback have been sent to our team. We will review it as soon as possible.',
        showConfirmButton: true,
      });
    } catch {
      Swal.fire({
        title: 'Error!',
        text: "An error occured, please try again.",
        icon: 'error',
      });
    }
  }
}
